import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.chat import Chat, Message
from app.models.user import User
from app.schemas.chat import (
    ChatCreate,
    ChatOut,
    ChatSummary,
    ChatUpdate,
    MessageCreate,
)
from app.services.assistant import generate_reply

logger = logging.getLogger("cura")

router = APIRouter(prefix="/chats", tags=["chats"])

DEFAULT_TITLE = "New chat"


def title_from_message(text: str) -> str:
    compact = " ".join(text.split())
    if len(compact) <= 48:
        return compact
    return compact[:45].strip() + "..."


def get_owned_chat(chat_id: uuid.UUID, db: Session, user: User) -> Chat:
    """Return the chat only if it belongs to this user. Otherwise 404,
    so nobody can find out whether someone else's chat exists."""
    chat = db.scalar(
        select(Chat).where(Chat.id == chat_id, Chat.user_id == user.id)
    )
    if chat is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Chat not found")
    return chat


@router.get("", response_model=list[ChatSummary])
def list_chats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.scalars(
        select(Chat)
        .where(Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
    ).all()


@router.post("", response_model=ChatSummary, status_code=status.HTTP_201_CREATED)
def create_chat(
    data: ChatCreate | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    title = (data.title.strip() if data and data.title else "") or DEFAULT_TITLE
    chat = Chat(user_id=current_user.id, title=title)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


@router.get("/{chat_id}", response_model=ChatOut)
def get_chat(
    chat_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_chat(chat_id, db, current_user)


@router.patch("/{chat_id}", response_model=ChatSummary)
def rename_chat(
    chat_id: uuid.UUID,
    data: ChatUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = get_owned_chat(chat_id, db, current_user)
    title = data.title.strip()
    if not title:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Title cannot be empty")
    chat.title = title
    db.commit()
    db.refresh(chat)
    return chat


@router.post("/{chat_id}/messages", response_model=ChatOut)
def send_message(
    chat_id: uuid.UUID,
    data: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = data.content.strip()
    if not content:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Message cannot be empty"
        )

    chat = get_owned_chat(chat_id, db, current_user)

    is_first_message = (
        db.scalar(
            select(func.count()).select_from(Message).where(Message.chat_id == chat.id)
        )
        == 0
    )

    # 1) Save the user's message first, so it is never lost if the AI fails
    now = datetime.now(timezone.utc)
    db.add(Message(chat_id=chat.id, role="user", content=content, created_at=now))
    if is_first_message and chat.title == DEFAULT_TITLE:
        chat.title = title_from_message(content)
    chat.updated_at = now
    db.commit()

    # 2) Ask the assistant for a reply
    history = [(m.role, m.content) for m in chat.messages]
    try:
        reply = generate_reply(history)
    except Exception:
        logger.exception("Assistant failed for chat %s", chat.id)
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "The assistant could not answer right now. Your message was saved.",
        )

    # 3) Save the reply (its own timestamp, so the order is always correct)
    reply_time = datetime.now(timezone.utc)
    db.add(
        Message(chat_id=chat.id, role="assistant", content=reply, created_at=reply_time)
    )
    chat.updated_at = reply_time
    db.commit()
    db.refresh(chat)
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    chat = get_owned_chat(chat_id, db, current_user)
    db.delete(chat)
    db.commit()
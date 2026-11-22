import logging
import time

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger("cura")

SYSTEM_PROMPT = """You are Cura AI, a friendly assistant that explains general health information in simple language.

Rules:
- You give educational information only. You do not diagnose conditions and you do not prescribe medicines or give medicine doses.
- Encourage the user to see a qualified doctor for anything personal, serious or that keeps getting worse.
- For emergencies (chest pain, trouble breathing, severe bleeding, signs of stroke, thoughts of self-harm), tell the user to contact local emergency services or a crisis helpline immediately.
- Keep answers short, clear and kind. Use simple words.
- Write plain text only. Do not use markdown symbols such as ** or # or backticks. For lists, put each item on its own line starting with a hyphen.
- Reply in the same language the user writes in (English, Hindi, or Hinglish).
- If the question is not about health or wellbeing, politely say you can only help with general health information."""

FALLBACK_REPLY = (
    "I couldn't put together a safe answer to that. Please rephrase your question, "
    "or speak with a qualified medical professional."
)

# Only the most recent messages are sent, to keep each request small and cheap
MAX_HISTORY_MESSAGES = 20

# Errors that usually go away if we try again or use another model
RETRYABLE_CODES = {429, 500, 502, 503, 504}
ATTEMPTS_PER_MODEL = 2
RETRY_WAIT_SECONDS = 1.5

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not settings.gemini_api_key:
            raise RuntimeError("GEMINI_API_KEY is not set in backend/.env")
        _client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(timeout=20000),  # 20 seconds
        )
    return _client


def _model_order() -> list[str]:
    models = [settings.gemini_model]
    fallback = settings.gemini_fallback_model
    if fallback and fallback not in models:
        models.append(fallback)
    return models


def generate_reply(history: list[tuple[str, str]]) -> str:
    """history is a list of (role, content), oldest first, ending with the
    user's latest message. Returns the assistant's reply text."""
    contents = [
        types.Content(
            role="user" if role == "user" else "model",
            parts=[types.Part.from_text(text=content)],
        )
        for role, content in history[-MAX_HISTORY_MESSAGES:]
    ]
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.4,
        max_output_tokens=1500,
    )
    client = _get_client()

    last_error: Exception | None = None
    for model in _model_order():
        for attempt in range(1, ATTEMPTS_PER_MODEL + 1):
            try:
                response = client.models.generate_content(
                    model=model, contents=contents, config=config
                )
            except Exception as error:  # noqa: BLE001
                last_error = error
                code = getattr(error, "code", None)
                logger.warning(
                    "Gemini model %s failed (attempt %s, code %s)", model, attempt, code
                )
                # No code means a network problem or timeout, which can be retried too
                retryable = code is None or code in RETRYABLE_CODES
                if retryable and attempt < ATTEMPTS_PER_MODEL:
                    time.sleep(RETRY_WAIT_SECONDS)
                    continue
                break  # try the next model

            text = (response.text or "").strip()
            if not text:
                logger.warning("Gemini model %s returned an empty reply", model)
                return FALLBACK_REPLY
            return text

    assert last_error is not None
    raise last_error
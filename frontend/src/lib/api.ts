const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "cura-access-token";

export type ApiUser = {
  id: string;
  email: string;
  full_name: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatDetail = ChatSummary & { messages: ChatMessage[] };

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ---------- Token storage ----------
   "Remember this device" ticked  -> localStorage (stays after browser closes)
   Not ticked                     -> sessionStorage (only this tab)       */

export function saveToken(token: string, remember: boolean) {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    /* storage blocked: user will have to sign in again next time */
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
}

/* ---------- Requests ---------- */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the server. Please check that the backend is running."
    );
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body?.detail)) {
        message = "Please check the details you entered.";
      }
    } catch {
      /* response was not JSON, keep the default message */
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

function authHeaders(token: string, json = false): HeadersInit {
  return json
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { Authorization: `Bearer ${token}` };
}

/* ---------- Auth ---------- */

export function signup(email: string, password: string, fullName?: string) {
  return request<ApiUser>("/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName?.trim() ? fullName.trim() : null,
    }),
  });
}

// The backend login expects form data, and calls the email field "username".
export async function login(email: string, password: string): Promise<string> {
  const body = new URLSearchParams({ username: email, password });
  const data = await request<{ access_token: string }>("/auth/login", {
    method: "POST",
    body,
  });
  return data.access_token;
}

export function fetchMe(token: string) {
  return request<ApiUser>("/auth/me", { headers: authHeaders(token) });
}

/* ---------- Chats ---------- */

export function listChats(token: string) {
  return request<ChatSummary[]>("/chats", { headers: authHeaders(token) });
}

export function createChat(token: string, title?: string) {
  return request<ChatSummary>("/chats", {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify({ title: title ?? null }),
  });
}

export function getChat(token: string, chatId: string) {
  return request<ChatDetail>(`/chats/${chatId}`, {
    headers: authHeaders(token),
  });
}

// Saves the user's message, asks Gemini, saves the reply, returns the whole chat.
export function sendChatMessage(token: string, chatId: string, content: string) {
  return request<ChatDetail>(`/chats/${chatId}/messages`, {
    method: "POST",
    headers: authHeaders(token, true),
    body: JSON.stringify({ content }),
  });
}
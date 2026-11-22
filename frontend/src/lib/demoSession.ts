export type DemoUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type DemoMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export type DemoChat = {
  id: string;
  title: string;
  updatedAt: string;
  messages: DemoMessage[];
};

export type DemoReport = {
  id: string;
  name: string;
  kind: string;
  addedAt: string;
};

export type DemoSettings = {
  appearance: "light" | "system";
  notifications: "important" | "none";
  safetyReminders: boolean;
};

export type DemoStore = {
  chats: DemoChat[];
  reports: DemoReport[];
  settings: DemoSettings;
};

const SESSION_KEY = "cura-demo-active-session";
const STORE_PREFIX = "cura-demo-user:";

export const DEMO_WELCOME: DemoMessage = {
  id: 1,
  role: "assistant",
  text: "Hello, I'm Cura AI. I can help you understand general health information, but my assistant is still being connected, so I can't answer questions just yet. I can't diagnose conditions or recommend treatment. If your symptoms are urgent, please contact local emergency services or a qualified medical professional.",
};

export function emptyDemoStore(): DemoStore {
  return {
    chats: [],
    reports: [],
    settings: {
      appearance: "light",
      notifications: "important",
      safetyReminders: true,
    },
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Guest";
  return local.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function demoUserId(email: string) {
  return `demo:${normalizeEmail(email)}`;
}

export function startDemoSession(input: {
  name?: string;
  email: string;
  isNewAccount: boolean;
}): DemoUser {
  const email = input.email.trim();
  const user: DemoUser = {
    id: demoUserId(email),
    name: input.name?.trim() || displayNameFromEmail(email),
    email,
    createdAt: new Date().toISOString(),
  };

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));

  if (input.isNewAccount || !localStorage.getItem(STORE_PREFIX + user.id)) {
    localStorage.setItem(STORE_PREFIX + user.id, JSON.stringify(emptyDemoStore()));
  }

  return user;
}

export function getActiveDemoSession(): DemoUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoUser;
    if (!parsed?.id || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearActiveDemoSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function loadDemoStore(userId: string): DemoStore {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + userId);
    if (!raw) return emptyDemoStore();
    const parsed = JSON.parse(raw) as DemoStore;
    return {
      chats: Array.isArray(parsed.chats) ? parsed.chats : [],
      reports: Array.isArray(parsed.reports) ? parsed.reports : [],
      settings: {
        appearance: parsed.settings?.appearance === "system" ? "system" : "light",
        notifications: parsed.settings?.notifications === "none" ? "none" : "important",
        safetyReminders: parsed.settings?.safetyReminders !== false,
      },
    };
  } catch {
    return emptyDemoStore();
  }
}

export function saveDemoStore(userId: string, store: DemoStore) {
  localStorage.setItem(STORE_PREFIX + userId, JSON.stringify(store));
}

export function firstName(user: DemoUser | null) {
  if (!user?.name) return "";
  return user.name.split(" ")[0];
}

export function initials(user: DemoUser | null) {
  if (!user?.name) return "CA";
  const parts = user.name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function titleFromMessage(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 48) return compact;
  return `${compact.slice(0, 45).trim()}...`;
}

export function formatChatTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
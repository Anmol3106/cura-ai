"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import GlassEffects from "@/components/GlassEffects";
import { DropStage, useDropTransition } from "@/components/DropTransition";
import {
  ApiError,
  clearToken,
  createChat,
  fetchMe,
  getChat,
  getToken,
  listChats,
  sendChatMessage,
  type ChatMessage,
  type ChatSummary,
} from "@/lib/api";
import {
  clearActiveDemoSession,
  emptyDemoStore,
  firstName,
  formatChatTime,
  initials,
  loadDemoStore,
  saveDemoStore,
  type DemoSettings,
  type DemoStore,
  type DemoUser,
} from "@/lib/demoSession";
import styles from "./dashboard.module.css";

type Section =
  | "home"
  | "chat"
  | "reports"
  | "plans"
  | "settings"
  | "profile"
  | "safety";

const MAIN_NAV = [
  { id: "home", label: "Dashboard", Icon: LayoutDashboard },
  { id: "chat", label: "Ask Cura", Icon: MessageSquare },
  { id: "reports", label: "Reports", Icon: FileText },
  { id: "plans", label: "Billing & Plans", Icon: CreditCard },
] as const;

const FOOTER_NAV = [
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile", label: "Profile", Icon: User },
  { id: "safety", label: "Safety", Icon: ShieldCheck },
] as const;

const TITLES: Record<Section, { title: string; sub: string }> = {
  home: { title: "", sub: "Your personal AI health companion." },
  chat: { title: "Ask Cura", sub: "Ask general health questions in simple language." },
  reports: { title: "Reports", sub: "Keep a list of your health reports in one place." },
  plans: { title: "Billing & Plans", sub: "Plans are proposed. Billing is not switched on yet." },
  settings: { title: "Settings", sub: "Choose how Cura AI looks and reminds you." },
  profile: { title: "Profile", sub: "Your account on this device." },
  safety: { title: "Safety", sub: "Please read how Cura AI should and should not be used." },
};

const SUGGESTIONS = [
  "What does a high cholesterol result usually mean?",
  "How much sleep do adults generally need?",
  "What are common causes of headaches?",
  "How can I prepare questions for my doctor?",
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    audience: "For trying out Cura AI.",
    features: ["General health questions", "Chats saved to your account", "Report list"],
    current: true,
  },
  {
    id: "plus",
    name: "Plus",
    price: "$9",
    audience: "For people who use Cura AI every week.",
    features: ["Longer chat history", "More report storage", "Priority replies"],
    current: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    audience: "For families and heavy users.",
    features: ["Everything in Plus", "Multiple profiles", "Early access to features"],
    current: false,
  },
];

const WELCOME =
  "Hello, I'm Cura AI. I can help you understand general health information. I can't diagnose conditions or recommend treatment. If your symptoms are urgent, please contact local emergency services or a qualified medical professional.";

const bubbleText = { whiteSpace: "pre-wrap" } as const;

function kindFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "PDF";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "Image";
  return "File";
}

function nameFromEmail(email: string) {
  const local = email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Guest";
  return local.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DashboardPage() {
  const router = useRouter();
  const transition = useDropTransition();

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [user, setUser] = useState<DemoUser | null>(null);
  const [store, setStore] = useState<DemoStore>(emptyDemoStore());
  const [section, setSection] = useState<Section>("home");

  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");

  const [consultText, setConsultText] = useState("");
  const [chatText, setChatText] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Ask the backend who is signed in. Every outcome ends the loading state:
  // success shows the dashboard, 401 goes to login, anything else shows an error.
  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    setLoadError("");
    fetchMe(token)
      .then((me) => {
        if (cancelled) return;
        const session: DemoUser = {
          id: me.id,
          name: me.full_name?.trim() || nameFromEmail(me.email),
          email: me.email,
          createdAt: "",
        };
        setUser(session);
        setStore(loadDemoStore(session.id));
        setReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          router.replace("/");
          return;
        }
        setLoadError(
          error instanceof Error
            ? error.message
            : "Could not open your workspace."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  // Load the saved chat list once the dashboard is ready
  useEffect(() => {
    if (!ready) return;
    const token = getToken();
    if (!token) return;
    listChats(token)
      .then(setChats)
      .catch(() => {
        /* the list just stays empty; chatting still works */
      });
  }, [ready]);

  // Keep the newest message in view
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, section]);

  function persist(next: DemoStore) {
    setStore(next);
    if (user) saveDemoStore(user.id, next);
  }

  function go(next: Section) {
    if (next === section) return;
    transition.trigger(() => setSection(next));
  }

  // Returns true when the login has expired and we are sending the user to sign in
  function handleAuthError(error: unknown) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken();
      router.replace("/");
      return true;
    }
    return false;
  }

  async function refreshChats(token: string) {
    try {
      setChats(await listChats(token));
    } catch {
      /* keep the old list */
    }
  }

  async function sendMessage(text: string, chatId: string | null) {
    const clean = text.trim();
    if (!clean || sending) return;
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }

    setSending(true);
    setChatError("");
    // Show the user's message straight away
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        role: "user",
        content: clean,
        created_at: new Date().toISOString(),
      },
    ]);

    let id = chatId;
    try {
      if (!id) {
        const created = await createChat(token);
        id = created.id;
        setActiveChatId(id);
      }
      const detail = await sendChatMessage(token, id, clean);
      setMessages(detail.messages);
      void refreshChats(token);
    } catch (error) {
      if (handleAuthError(error)) return;
      setChatError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
      if (id) {
        // The message may have been saved even if the reply failed
        try {
          const detail = await getChat(token, id);
          setMessages(detail.messages);
        } catch {
          /* keep what is on screen */
        }
      } else {
        setMessages((prev) => prev.filter((m) => !m.id.startsWith("local-")));
      }
    } finally {
      setSending(false);
    }
  }

  function handleConsult(text: string) {
    const clean = text.trim();
    if (!clean || sending) return;
    setConsultText("");
    setActiveChatId(null);
    setMessages([]);
    setChatError("");
    go("chat");
    void sendMessage(clean, null);
  }

  function handleChatSubmit(event: FormEvent) {
    event.preventDefault();
    const text = chatText;
    if (!text.trim() || sending) return;
    setChatText("");
    void sendMessage(text, activeChatId);
  }

  async function openChat(id: string) {
    const token = getToken();
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const detail = await getChat(token, id);
      setActiveChatId(id);
      setMessages(detail.messages);
      setChatError("");
      go("chat");
    } catch (error) {
      if (handleAuthError(error)) return;
      setChatError(
        error instanceof Error ? error.message : "Could not open this chat."
      );
    }
  }

  function startNewChat() {
    setActiveChatId(null);
    setMessages([]);
    setChatError("");
    go("chat");
  }

  function addReport(file: File | undefined) {
    if (!file) return;
    persist({
      ...store,
      reports: [
        {
          id: `report-${Date.now()}`,
          name: file.name,
          kind: kindFromName(file.name),
          addedAt: new Date().toISOString(),
        },
        ...store.reports,
      ],
    });
  }

  function updateSettings(patch: Partial<DemoSettings>) {
    persist({ ...store, settings: { ...store.settings, ...patch } });
  }

  function logout() {
    clearToken();
    clearActiveDemoSession();
    router.replace("/");
  }

  if (loadError) {
    return (
      <div className={styles.loading}>
        <div style={{ display: "grid", gap: "1rem", textAlign: "center", padding: "1rem" }}>
          <p>{loadError}</p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              className={styles.confirmLogout}
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </button>
            <button
              type="button"
              className={styles.confirmLogout}
              onClick={() => {
                clearToken();
                router.replace("/");
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!ready || !user) {
    return <div className={styles.loading}>Opening your workspace...</div>;
  }

  const today = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());
  const heading =
    section === "home"
      ? { title: `Hello, ${firstName(user) || "there"}`, sub: TITLES.home.sub }
      : TITLES[section];

  function renderHome() {
    return (
      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.consultPanel}`}>
          <textarea
            value={consultText}
            onChange={(e) => setConsultText(e.target.value)}
            placeholder="Ask a general health question..."
            aria-label="Ask a general health question"
          />
          <div>
            <span>General information only. Not medical advice.</span>
            <button
              type="button"
              onClick={() => handleConsult(consultText)}
              disabled={!consultText.trim() || sending}
            >
              Ask Cura
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </section>

        <div className={styles.suggested}>
          {SUGGESTIONS.map((text) => (
            <button
              key={text}
              type="button"
              disabled={sending}
              onClick={() => handleConsult(text)}
            >
              <span aria-hidden="true" />
              {text}
              <strong>
                <ArrowRight size={16} aria-hidden="true" />
              </strong>
            </button>
          ))}
        </div>

        <div className={styles.moduleGrid}>
          <article className={styles.moduleCard}>
            <div className={styles.moduleIcon}>
              <MessageSquare size={22} aria-hidden="true" />
            </div>
            <h2>Ask Cura</h2>
            <p>Ask questions about symptoms, terms or healthy habits in plain language.</p>
            <button type="button" onClick={startNewChat}>
              Start a chat <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
          <article className={styles.moduleCard}>
            <div className={styles.moduleIcon}>
              <FileText size={22} aria-hidden="true" />
            </div>
            <h2>Reports</h2>
            <p>Keep a list of your lab reports and prescriptions in one place.</p>
            <button type="button" onClick={() => go("reports")}>
              Open reports <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
          <article className={styles.moduleCard}>
            <div className={styles.moduleIcon}>
              <ShieldCheck size={22} aria-hidden="true" />
            </div>
            <h2>Safety</h2>
            <p>Learn what Cura AI can and cannot do, and when to see a doctor.</p>
            <button type="button" onClick={() => go("safety")}>
              Read safety notes <ArrowRight size={16} aria-hidden="true" />
            </button>
          </article>
        </div>

        <section className={`${styles.panel} ${styles.compactRecent}`}>
          <div className={styles.sectionHeader}>
            <h2>Recent chats</h2>
            <span>{chats.length} saved</span>
          </div>
          {chats.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No chats yet</p>
              <span>Your conversations will appear here once you ask something.</span>
              <button type="button" onClick={startNewChat}>
                Start your first chat
              </button>
            </div>
          ) : (
            <div className={styles.chatList}>
              {chats.slice(0, 4).map((chat) => (
                <article key={chat.id}>
                  <div>
                    <span>{formatChatTime(chat.updated_at)}</span>
                    <h3>{chat.title}</h3>
                  </div>
                  <button type="button" onClick={() => openChat(chat.id)}>
                    Open <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={`${styles.panel} ${styles.vitals}`}>
          <h2>Wellbeing snapshot</h2>
          <p className={styles.sampleNote}>Sample values for preview only.</p>
          <div className={styles.metricRow}>
            <span>Sleep</span>
            <strong>7.4 h</strong>
          </div>
          <div className={styles.metricRow}>
            <span>Steps</span>
            <strong>6,820</strong>
          </div>
          <svg viewBox="0 0 300 80" aria-hidden="true">
            <path d="M0 60 L50 45 L100 52 L150 30 L200 38 L250 18 L300 24" />
            <circle cx="250" cy="18" r="5" />
          </svg>
          <p>Connect devices later to see real trends here.</p>
        </section>
      </div>
    );
  }

  function renderChat() {
    return (
      <section className={`${styles.panel} ${styles.chatPanel}`}>
        <div className={styles.messages}>
          <div
            className={`${styles.message} ${styles.assistantMessage}`}
            style={bubbleText}
          >
            {WELCOME}
          </div>
          {messages.map((m) => (
            <div
              key={m.id}
              style={bubbleText}
              className={`${styles.message} ${
                m.role === "user" ? styles.userMessage : styles.assistantMessage
              }`}
            >
              {m.content}
            </div>
          ))}
          {sending && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              Cura AI is thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        {chatError && (
          <p className={styles.banner} role="alert" style={{ margin: "0 1.25rem" }}>
            {chatError}
          </p>
        )}
        <form className={styles.composer} onSubmit={handleChatSubmit}>
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            placeholder="Type your question..."
            aria-label="Type your question"
            disabled={sending}
            maxLength={4000}
          />
          <button type="submit" disabled={!chatText.trim() || sending}>
            Send
          </button>
        </form>
        <p className={styles.disclaimer}>
          Cura AI shares general information and cannot diagnose or treat conditions.
        </p>
      </section>
    );
  }

  function renderReports() {
    return (
      <section className={`${styles.panel} ${styles.reportPanel}`}>
        <p>Only the file name is saved on this device. The file itself is not uploaded.</p>
        <label className={styles.uploadBox}>
          <strong>Add a report</strong>
          <span>PDF or image files</span>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => {
              addReport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {store.reports.length > 0 && (
          <div className={styles.reportGrid}>
            {store.reports.map((r) => (
              <article key={r.id}>
                <span>{r.kind}</span>
                <h3>{r.name}</h3>
                <p>Added {formatChatTime(r.addedAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  function renderPlans() {
    return (
      <div>
        <p className={styles.plansIntro}>
          These plans are proposals. Billing is not switched on yet, so nothing can be purchased.
        </p>
        <div className={styles.planGrid}>
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={`${styles.planCard} ${plan.current ? styles.planCurrent : ""}`}
            >
              <div className={styles.planTop}>
                <span>{plan.name}</span>
                {plan.current && <span className={styles.planBadge}>Current plan</span>}
              </div>
              <div className={styles.priceRow}>
                <h2>{plan.price}</h2>
                <small>/ month</small>
              </div>
              <span className={styles.proposed}>Proposed pricing</span>
              <p className={styles.planAudience}>{plan.audience}</p>
              <ul className={styles.planFeatures}>
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={16} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <button type="button" disabled>
                {plan.current ? "Your current plan" : "Coming soon"}
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderSettings() {
    return (
      <section className={`${styles.panel} ${styles.settings}`}>
        <label>
          Appearance
          <select
            value={store.settings.appearance}
            onChange={(e) =>
              updateSettings({
                appearance: e.target.value === "system" ? "system" : "light",
              })
            }
          >
            <option value="light">Light</option>
            <option value="system">Follow system</option>
          </select>
        </label>
        <label>
          Notifications
          <select
            value={store.settings.notifications}
            onChange={(e) =>
              updateSettings({
                notifications: e.target.value === "none" ? "none" : "important",
              })
            }
          >
            <option value="important">Important only</option>
            <option value="none">None</option>
          </select>
        </label>
        <label className={styles.checkboxLine}>
          <input
            type="checkbox"
            checked={store.settings.safetyReminders}
            onChange={(e) => updateSettings({ safetyReminders: e.target.checked })}
          />
          Show safety reminders
        </label>
      </section>
    );
  }

  function renderProfile() {
    return (
      <section className={`${styles.panel} ${styles.profile}`}>
        <div className={styles.avatar}>{initials(user)}</div>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <span>Signed in on this device</span>
        </div>
      </section>
    );
  }

  function renderSafety() {
    return (
      <section className={`${styles.panel} ${styles.safety}`}>
        <h2>Using Cura AI safely</h2>
        <p>Cura AI gives general health information for learning. It is not a doctor.</p>
        <ul>
          <li>It cannot diagnose conditions or recommend treatment.</li>
          <li>Do not use it for emergencies. Contact local emergency services instead.</li>
          <li>Talk to a qualified medical professional before changing any medicine or care plan.</li>
          <li>Your chats are saved in your Cura AI account. Reports and settings stay on this device.</li>
        </ul>
      </section>
    );
  }

  const content: Record<Section, () => React.ReactNode> = {
    home: renderHome,
    chat: renderChat,
    reports: renderReports,
    plans: renderPlans,
    settings: renderSettings,
    profile: renderProfile,
    safety: renderSafety,
  };

  return (
    <>
      <div className="appBackdrop appBackdropDark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <GlassEffects />

      <div className={styles.shell} {...transition.captureProps}>
        <aside className={styles.sidebar} data-surface="dark">
          <div className={styles.brand}>
            <div className={styles.logoTile}>
              <Image
                className={styles.logoImg}
                src="/cura-logo.png"
                alt=""
                width={64}
                height={64}
              />
            </div>
            <div>
              <strong>Cura AI</strong>
              <span>AI health companion</span>
            </div>
          </div>

          <nav className={styles.nav} aria-label="Main">
            {MAIN_NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? styles.active : undefined}
                aria-current={section === id ? "page" : undefined}
                onClick={() => go(id)}
              >
                <span className={styles.navIcon}>
                  <Icon aria-hidden="true" />
                </span>
                {label}
              </button>
            ))}
          </nav>

          <div className={styles.sidebarFooter}>
            {FOOTER_NAV.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                className={section === id ? styles.active : undefined}
                aria-current={section === id ? "page" : undefined}
                onClick={() => go(id)}
              >
                <span className={styles.navIcon}>
                  <Icon aria-hidden="true" />
                </span>
                {label}
              </button>
            ))}
            <button type="button" className={styles.logout} onClick={() => setConfirmLogout(true)}>
              <span className={styles.navIcon}>
                <LogOut aria-hidden="true" />
              </span>
              Log out
            </button>
          </div>
        </aside>

        <main className={styles.workspace}>
          <DropStage transition={transition}>
            <div className={styles.topbar}>
              <div className={styles.securePill}>
                <span />
                Private preview
              </div>
              <div className={styles.datePill}>{today}</div>
              <button type="button" onClick={startNewChat}>
                New chat
              </button>
            </div>

            <div className={styles.hero}>
              <div>
                <p>Cura AI</p>
                <h1>{heading.title}</h1>
                <span>{heading.sub}</span>
              </div>
            </div>

            {content[section]()}
          </DropStage>
        </main>
      </div>

      {confirmLogout && (
        <div className={styles.modalBackdrop} onClick={() => setConfirmLogout(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="logout-title">Log out of Cura AI?</h2>
            <p>Your chats stay saved in your account.</p>
            <div>
              <button type="button" onClick={() => setConfirmLogout(false)}>
                Cancel
              </button>
              <button type="button" className={styles.confirmLogout} onClick={logout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
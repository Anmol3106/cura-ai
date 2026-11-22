"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Heart, Lock, Building2 } from "lucide-react";
import { login, saveToken, signup } from "@/lib/api";
import styles from "./AuthCard.module.css";

type View = "login" | "signup";
type Errors = Record<string, string>;

function CuraMark() {
  return (
    <Image
      className={styles.mark}
      src="/cura-logo.png"
      alt=""
      width={64}
      height={64}
      priority
    />
  );
}

export default function AuthCard() {
  const router = useRouter();
  const [view, setView] = useState<View>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  const title = view === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    view === "login"
      ? "Sign in to continue to your personal health companion."
      : "Set up your Cura AI workspace to start asking questions and organizing your reports.";

  const submitLabel = useMemo(
    () =>
      pending
        ? "Opening your workspace..."
        : view === "login"
          ? "Sign in"
          : "Create account",
    [pending, view]
  );

  function validate(form: HTMLFormElement) {
    const data = new FormData(form);
    const nextErrors: Errors = {};
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();

    if (view === "signup" && name.length < 2) {
      nextErrors.name = "Enter your full name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = event.currentTarget;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setStatus("");

    if (Object.keys(nextErrors).length > 0) return;

    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();

    setPending(true);
    try {
      if (view === "signup") {
        await signup(email, password, name);
      }
      const token = await login(email, password);
      saveToken(token, remember);
      setStatus(
        view === "signup"
          ? "Your workspace is ready. Taking you in..."
          : "Welcome back. Taking you in..."
      );
      router.push("/dashboard");
    } catch (error) {
      // Always stop the loading state when something fails
      setPending(false);
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  function changeView(nextView: View) {
    setView(nextView);
    setErrors({});
    setStatus("");
    setShowPassword(false);
  }

  return (
    <section className={styles.authShell} aria-labelledby="auth-title">
      <div className={styles.topline}>
        <span className={styles.statusDot} />
        Cura AI
      </div>

      <div className={styles.card}>
        <div className={styles.logoTile}>
          <CuraMark />
        </div>

        <p className={styles.eyebrow}>Your personal AI health companion</p>
        <h1 id="auth-title">{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.securityNote}>
          <span aria-hidden="true">
            <Lock size={14} strokeWidth={2.4} />
          </span>
          <p>
            <strong>Secure sign-in.</strong>
            <span>
              {" "}
              Your password is stored encrypted and your chats are saved to
              your account. Reports and settings stay on this device.
            </span>
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {view === "signup" && (
            <label className={styles.field}>
              <span>Full name</span>
              <input
                name="name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                placeholder="Your name"
              />
              {errors.name && (
                <em id="name-error" role="alert">
                  {errors.name}
                </em>
              )}
            </label>
          )}

          <label className={styles.field}>
            <span>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="you@example.com"
            />
            {errors.email && (
              <em id="email-error" role="alert">
                {errors.email}
              </em>
            )}
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <span className={styles.passwordRow}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={view === "login" ? "current-password" : "new-password"}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            {errors.password && (
              <em id="password-error" role="alert">
                {errors.password}
              </em>
            )}
          </label>

          <div className={styles.formMeta}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Remember this device</span>
            </label>
            {view === "login" && (
              <button
                type="button"
                onClick={() =>
                  setStatus("Password reset is not available yet.")
                }
              >
                Forgot password?
              </button>
            )}
          </div>

          <button type="submit" className={styles.primaryButton} disabled={pending}>
            {submitLabel}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </form>

        {status && (
          <p className={styles.notice} role="status">
            {status}
          </p>
        )}

        <div className={styles.divider}>
          <span />
          Or continue with
          <span />
        </div>

        <div className={styles.ssoStack}>
          <button
            type="button"
            onClick={() =>
              setStatus("Sign-in with Apple Health is not available yet.")
            }
          >
            <Heart size={18} />
            Apple Health
          </button>
          <button
            type="button"
            onClick={() =>
              setStatus("Single sign-on is not available yet.")
            }
          >
            <Building2 size={18} />
            Single sign-on
          </button>
        </div>

        <p className={styles.switchText}>
          {view === "login" ? "Don't have an account yet?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => changeView(view === "login" ? "signup" : "login")}
          >
            {view === "login" ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>

      <footer className={styles.authFooter}>
        <span>General health information</span>
        <span>Not a substitute for medical advice</span>
        <span>Your chats are saved to your account</span>
      </footer>
    </section>
  );
}
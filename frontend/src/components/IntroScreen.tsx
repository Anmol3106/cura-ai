"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./IntroScreen.module.css";

type Phase = "idle" | "activated" | "done";

const SEEN_KEY = "cura-intro-seen";

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked: intro just plays again next time */
  }
}

export default function IntroScreen() {
  const [phase, setPhase] = useState<Phase>("idle");
  const running = useRef(false);

  // If this tab already played the intro, never show it again (even after a remount).
  useLayoutEffect(() => {
    if (hasSeenIntro()) setPhase("done");
  }, []);

  useEffect(() => {
    if (phase !== "activated") return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const timer = window.setTimeout(
      () => setPhase("done"),
      reduceMotion ? 420 : 2500
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  function startIntro() {
    if (running.current || phase !== "idle") return;
    running.current = true;
    markIntroSeen();
    setPhase("activated");
  }

  return (
    <button
      type="button"
      className={`${styles.overlay} ${
        phase === "activated" ? styles.activated : ""
      }`}
      onClick={startIntro}
      disabled={phase !== "idle"}
      aria-label="Tap to login to Cura AI"
    >
      <span className={styles.glow} aria-hidden="true" />
      <span className={styles.glowInner} aria-hidden="true" />

      <span className={styles.droplets} aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </span>

      <span className={styles.stage}>
        <span className={styles.logoWrap} aria-hidden="true">
          <Image
            className={styles.logo}
            src="/cura-logo.png"
            alt=""
            width={240}
            height={240}
            priority
          />

          <span className={styles.mask}>
            <span className={styles.maskBand} />
            <span className={styles.maskFold} />
            <span className={styles.maskFold} />
          </span>
        </span>

        <span className={styles.hint}>Tap to Login</span>
      </span>
    </button>
  );
}
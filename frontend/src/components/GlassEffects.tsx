"use client";

import { useEffect } from "react";

const MAX_RIPPLES = 4;

export default function GlassEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--scroll", String(Math.round(window.scrollY)));
      });
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Element | null;
      const button = target?.closest("button, a, [role='button']");
      if (!button) return;
      if ((button as HTMLButtonElement).disabled) return;
      if (button.closest("[data-no-ripple]")) return;
      if (document.querySelectorAll(".glassRipple").length >= MAX_RIPPLES) return;

      const ripple = document.createElement("span");
      const onDark = Boolean(button.closest("[data-surface='dark']"));
      ripple.className = onDark ? "glassRipple glassRippleLight" : "glassRipple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 500);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown);
      cancelAnimationFrame(frame);
      document.querySelectorAll(".glassRipple").forEach((node) => node.remove());
    };
  }, []);

  return null;
}
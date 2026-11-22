"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import styles from "./DropTransition.module.css";

const LEAVE_MS = 180;
const REVEAL_MS = 800;
const POINTER_MAX_AGE_MS = 1500;

type DropRun = { id: number; x: number; y: number; r: number };
type PointerPoint = { x: number; y: number; t: number };
type Phase = "idle" | "leaving" | "reveal";

export type DropTransition = {
  stageRef: RefObject<HTMLDivElement | null>;
  run: DropRun | null;
  leaving: boolean;
  trigger: (apply: () => void) => void;
  captureProps: {
    onPointerDownCapture: (event: PointerEvent<HTMLElement>) => void;
    onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => void;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function useDropTransition(): DropTransition {
  const stageRef = useRef<HTMLDivElement>(null);
  const phase = useRef<Phase>("idle");
  const pending = useRef<(() => void) | null>(null);
  const counter = useRef(0);
  const pointer = useRef<PointerPoint | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [run, setRun] = useState<DropRun | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onPointerDownCapture = useCallback((event: PointerEvent<HTMLElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY, t: performance.now() };
  }, []);

  const onKeyDownCapture = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    pointer.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      t: performance.now(),
    };
  }, []);

  const trigger = useCallback((apply: () => void) => {
    const stage = stageRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!stage || reduceMotion) {
      apply();
      return;
    }

    // Old content is fading out: the latest click wins when it finishes.
    if (phase.current === "leaving") {
      pending.current = apply;
      return;
    }

    // Reveal already running: switch immediately, no second animation.
    if (phase.current === "reveal") {
      apply();
      return;
    }

    const rect = stage.getBoundingClientRect();
    const point = pointer.current;
    const fresh = point !== null && performance.now() - point.t < POINTER_MAX_AGE_MS;
    pointer.current = null;

    const pageX = fresh ? point.x : rect.left;
    const pageY = fresh ? point.y : rect.top + Math.min(window.innerHeight / 2, 260);

    // Only the part of the stage that is on screen needs the wave.
    // A full-page circle on a tall mobile page is what made it glitch.
    const visTop = Math.max(0, -rect.top);
    const visBottom = visTop + window.innerHeight;

    const x = clamp(pageX - rect.left, 0, rect.width);
    const y = clamp(pageY - rect.top, visTop, visBottom);
    const r =
      Math.ceil(
        Math.hypot(
          Math.max(x, rect.width - x),
          Math.max(y - visTop, visBottom - y)
        )
      ) + 4;

    phase.current = "leaving";
    pending.current = apply;
    setLeaving(true);

    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      pending.current?.();
      pending.current = null;
      phase.current = "reveal";
      counter.current += 1;
      setLeaving(false);
      setRun({ id: counter.current, x, y, r });

      timer.current = setTimeout(() => {
        phase.current = "idle";
        setRun(null);
      }, REVEAL_MS + 50);
    }, LEAVE_MS);
  }, []);

  return {
    stageRef,
    run,
    leaving,
    trigger,
    captureProps: { onPointerDownCapture, onKeyDownCapture },
  };
}

export function DropStage({
  transition,
  children,
}: {
  transition: DropTransition;
  children: ReactNode;
}) {
  const { stageRef, run, leaving } = transition;
  const vars = run
    ? ({ "--x": `${run.x}px`, "--y": `${run.y}px`, "--r": `${run.r}px` } as CSSProperties)
    : undefined;

  return (
    <div ref={stageRef} className={styles.stage} style={vars}>
      <div className={leaving ? styles.leaving : run ? styles.reveal : undefined}>
        {children}
      </div>
      {run && (
        <div key={run.id} className={styles.ripples} aria-hidden="true">
          <span className={styles.ring} />
          <span className={`${styles.ring} ${styles.ringTrail}`} />
        </div>
      )}
    </div>
  );
}
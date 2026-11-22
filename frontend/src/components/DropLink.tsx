"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import DropOverlay from "./DropOverlay";

type Props = { href: string; className?: string; children: ReactNode };

export default function DropLink({ href, className, children }: Props) {
  const router = useRouter();
  const [drop, setDrop] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (drop) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) {
      router.push(href);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setDrop({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    timer.current = setTimeout(() => router.push(href), 450);
  }

  return (
    <>
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
      {drop && <DropOverlay x={drop.x} y={drop.y} />}
    </>
  );
}
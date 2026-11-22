import styles from "./DropOverlay.module.css";

export default function DropOverlay({ x, y }: { x: number; y: number }) {
  return (
    <span
      className={styles.drop}
      style={{ left: x, top: y }}
      aria-hidden="true"
    />
  );
}
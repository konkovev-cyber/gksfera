"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import styles from "./CursorFollower.module.css";

/** Мягкий светящийся шарик вместо системного курсора.
    На десктопе (≥lg) — маленький тёплый круг с размытием и пружинной инерцией,
    на тач-устройствах скрыт. Не перетягивает, не мешает тексту, виден на любом фоне. */
export function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 180, damping: 22 });
  const springY = useSpring(y, { stiffness: 180, damping: 22 });

  useEffect(() => {
    const isDesktop =
      window.matchMedia("(min-width: 1024px) and (hover: hover)").matches;
    if (!isDesktop) return;

    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    document.addEventListener("mousemove", onMove);
    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMove);
    };
    // x и y — стабильные ссылки из useMotionValue: в зависимостях нужны только
    // чтобы линтер не считал эффект «висящим» на изменяемых значениях.
  }, [x, y]);

  return (
    <motion.div
      className={styles.dot}
      style={{ x: springX, y: springY }}
      aria-hidden="true"
    />
  );
}

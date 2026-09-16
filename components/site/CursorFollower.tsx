"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./CursorFollower.module.css";

/** Кастомный курсор-карандаш.
    На десктопе (≥lg) заменяет системный курсор на SVG-карандаш,
    который следует за мышкой с пружинной инерцией и наклоняется
    при движении. На тач-устройствах скрыт. */
export function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const vx = useMotionValue(0);
  const vy = useMotionValue(0);

  // Пружина для плавного следования
  const springX = useSpring(x, { stiffness: 140, damping: 16 });
  const springY = useSpring(y, { stiffness: 140, damping: 16 });

  // Наклон пропорционален скорости движения
  const rotate = useTransform(
    [vx, vy],
    ([vx, vy]) => {
      const speed = Math.sqrt(Number(vx) ** 2 + Number(vy) ** 2);
      const angle = Math.atan2(Number(vy), Number(vx)) * (180 / Math.PI);
      return Math.min(speed * 0.4, 18) * (angle > 0 ? 1 : -1);
    }
  );

  useEffect(() => {
    let lastX = -100;
    let lastY = -100;
    let lastTime = Date.now();

    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(now - lastTime, 1);
      vx.set((e.clientX - lastX) / dt * 100);
      vy.set((e.clientY - lastY) / dt * 100);
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
      x.set(e.clientX);
      y.set(e.clientY);
    };

    // Прячем нативный курсор только на десктопе
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    document.body.style.setProperty("cursor", "none");
    document.addEventListener("mousemove", onMove);

    // При выходе возвращаем нативный курсор
    return () => {
      document.body.style.removeProperty("cursor");
      document.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <motion.div
      className={styles.cursor}
      style={{ x: springX, y: springY, rotate }}
    >
      {/* Карандаш SVG */}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Корпус */}
        <rect x="3" y="3" width="8" height="16" rx="1.5" fill="currentColor" opacity="0.9" />
        {/* Грифель */}
        <path d="M3 19L11 19L9.5 15.5L3 19Z" fill="currentColor" opacity="0.6" />
        {/* Острие */}
        <path d="M9.5 15.5L11 19L12.5 16L9.5 15.5Z" fill="currentColor" />
        {/* Клипс */}
        <rect x="4.5" y="5" width="5" height="2" rx="0.5" fill="white" opacity="0.4" />
        {/* Боковая линия */}
        <rect x="10" y="3" width="3" height="16" rx="1" fill="currentColor" opacity="0.25" />
      </svg>
    </motion.div>
  );
}

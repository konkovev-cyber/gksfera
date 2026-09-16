"use client";

import { useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Плавающие SVG-декорации в CTA-секции — книга, карандаш, звезда.
    Здесь только декоративная анимация, контент не затрагивается. */
const SHAPES = [
  // Книга
  {
    id: "book",
    size: 52,
    opacity: 0.12,
    x: "6%",
    y: "15%",
    duration: 18,
    dx: 12,
    dy: -20,
    rotate: [-6, 6, -6],
    element: (
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="32" height="40" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 8v32c0 2-1 4-3 4H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M36 8c2 0 4 1 4 3v29c0 2-1 4-3 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="14" y1="20" x2="28" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="26" x2="24" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="32" x2="20" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  // Карандаш
  {
    id: "pencil",
    size: 48,
    opacity: 0.1,
    x: "88%",
    y: "8%",
    duration: 22,
    dx: -14,
    dy: 18,
    rotate: [8, -8, 8],
    element: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 38L14 32l20-20 6 6L14 38H8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M34 10L38 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 38l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="18" y1="22" x2="26" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  // Звезда-искра
  {
    id: "star",
    size: 36,
    opacity: 0.15,
    x: "82%",
    y: "70%",
    duration: 14,
    dx: -10,
    dy: -14,
    rotate: [-15, 15, -15],
    element: (
      <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 2L21.5 13.5H34L23.5 20.5L27 32L18 25L9 32L12.5 20.5L2 13.5H14.5L18 2Z"
          stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  // Чернильница / колпачок
  {
    id: "cap",
    size: 32,
    opacity: 0.1,
    x: "3%",
    y: "75%",
    duration: 20,
    dx: 8,
    dy: -12,
    rotate: [5, -5, 5],
    element: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 10h12v2H10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M10 12l2 16h8l2-16" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M13 28v2M19 28v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="20" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  // Линейка / катет
  {
    id: "ruler",
    size: 44,
    opacity: 0.09,
    x: "75%",
    y: "40%",
    duration: 26,
    dx: -18,
    dy: 10,
    rotate: [12, -12, 12],
    element: (
      <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="10" width="36" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <line x1="10" y1="10" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="10" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="22" y1="10" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="28" y1="10" x2="28" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="34" y1="10" x2="34" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function FloatingDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {SHAPES.map((s) => (
        <motion.div
          key={s.id}
          className="absolute text-brand-warm"
          style={{
            width: s.size,
            height: s.size,
            left: s.x,
            top: s.y,
            opacity: s.opacity,
            color: "currentColor",
          }}
          animate={{
            y: [0, s.dy, 0],
            x: [0, s.dx, 0],
            rotate: s.rotate,
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {s.element}
        </motion.div>
      ))}
    </div>
  );
}

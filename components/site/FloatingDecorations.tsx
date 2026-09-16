"use client";

import { motion } from "framer-motion";

/** Крупные эмодзи-декорации в CTA-секции.
    Простые читаемые символы вместо сложных SVG.
    Плавающий дрейф без наклона — мягко, не отвлекает. */
const SHAPES = [
  { id: "book",   emoji: "📖", size: 52, x: "4%",  y: "12%", duration: 20, dx: 14, dy: -18 },
  { id: "pencil",  emoji: "✏️", size: 48, x: "86%", y: "8%",  duration: 24, dx: -16, dy: 20 },
  { id: "star",   emoji: "⭐", size: 44, x: "80%", y: "68%", duration: 16, dx: -12, dy: -14 },
  { id: "pen",     emoji: "🖋️", size: 48, x: "2%",  y: "72%", duration: 22, dx: 10, dy: 14 },
  { id: "ruler",   emoji: "📏", size: 44, x: "74%", y: "38%", duration: 26, dx: -18, dy: 10 },
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
          className="absolute select-none leading-none"
          style={{
            fontSize: s.size,
            left: s.x,
            top: s.y,
            opacity: 0.2,
            filter: "drop-shadow(0 2px 8px hsl(var(--brand-warm) / 0.25))",
          }}
          animate={{ x: [0, s.dx, 0], y: [0, s.dy, 0] }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {s.emoji}
        </motion.div>
      ))}
    </div>
  );
}

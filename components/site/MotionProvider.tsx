"use client";

import { MotionConfig } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Глобальная настройка framer-motion:
 * reducedMotion="user" — уважает системную настройку «Уменьшить движение».
 * При включённой настройке анимации движения отключаются автоматически,
 * но контент всегда остаётся видимым (без ветвлений в рендере = без hydration mismatch).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

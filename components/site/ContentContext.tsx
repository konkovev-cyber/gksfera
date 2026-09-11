"use client";

import { createContext, useContext, type ReactNode } from "react";
import * as defaults from "@/data/site";
import type { SiteData } from "@/lib/content";

const Ctx = createContext<SiteData | null>(null);

export function ContentProvider({
  value,
  children,
}: {
  value: SiteData;
  children: ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Данные сайта: из админки (Supabase), если переданы провайдером,
 * иначе — статические значения по умолчанию из data/site.ts.
 */
export function useContent(): SiteData {
  return useContext(Ctx) ?? defaults;
}

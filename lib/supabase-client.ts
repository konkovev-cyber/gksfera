/**
 * Supabase-клиент для БРАУЗЕРА (anon key, с учётом RLS).
 * НЕ использовать в серверных Route Handlers и Server Components —
 * там использовать serviceClient() из lib/supabase-server.ts.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars missing — enrollment form will not save submissions.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

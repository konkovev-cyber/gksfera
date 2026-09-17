import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client with service_role key.
 * Bypasses RLS — использовать ТОЛЬКО в серверных контекстах (Route Handlers, Server Components).
 * НЕ импортировать в файлах с директивой "use client".
 */
export function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

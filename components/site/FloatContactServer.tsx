import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { FloatContact } from "./FloatContact";

/**
 * Серверная обёртка: подгружает данные из Supabase и оборачивает
 * FloatContact в ContentProvider. Добавлен в layout.tsx — работает
 * на всех страницах сайта без повторных запросов (Next.js дедуплицирует
 * fetch внутри одного запроса, unstable_cache — между ними).
 */
export async function FloatContactServer() {
  const { data } = await getContent();
  return (
    <ContentProvider value={data}>
      <FloatContact />
    </ContentProvider>
  );
}

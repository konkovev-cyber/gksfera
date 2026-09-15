import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/components/site/ContentContext";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { MarqueeLab } from "@/components/site/MarqueeLab";

/** Черновик для выбора ленты: в индекс не просим, из навигации не ссылается. */
export const metadata: Metadata = {
  title: "Ленты-кандидаты — черновик",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MarqueeLabPage() {
  const { data } = await getContent();

  return (
    <ContentProvider value={data}>
      <main className="min-h-screen overflow-x-clip bg-background text-foreground">
        <header className="container-max flex items-end justify-between gap-6 pt-10 pb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              черновик · после выбора удаляется
            </p>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold">
              Лента направлений: четыре кандидата
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Наводи курсор на каждую полосу — она наклоняется. Кнопка справа в
              полосе ставит на паузу. Кандидат «0» — то, что бегает в герое
              сейчас, чтобы было с чем сравнивать.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-muted-foreground">тема</span>
            <ThemeToggle />
          </div>
        </header>
        <MarqueeLab />
      </main>
    </ContentProvider>
  );
}

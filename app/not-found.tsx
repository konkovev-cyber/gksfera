import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p
          className="font-display font-extrabold text-[7rem] sm:text-[9rem] leading-none text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(135deg, hsl(32 85% 52%), hsl(178 45% 28%))" }}
        >
          404
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground mt-2">
          Кажется, эта страница улетела на орбиту
        </h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Такой страницы на сайте нет — возможно, она переехала или в адресе опечатка.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-md"
          >
            <Home className="w-4 h-4" /> На главную
          </Link>
          <Link
            href="/#programs"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full border-2 border-border bg-card font-semibold hover:border-brand-warm hover:text-brand-warm transition-colors"
          >
            <Compass className="w-4 h-4" /> Направления
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <p
          className="font-display font-extrabold text-[7rem] sm:text-[9rem] leading-none text-transparent bg-clip-text bg-brand-gradient-warm"
        >
          404
        </p>
        <h1 className="font-display font-bold text-2xl text-foreground mt-2">
          Кажется, эта страница улетела на орбиту
        </h1>
        <p className="text-foreground/70 mt-3 leading-relaxed">
          Такой страницы на сайте нет — возможно, она переехала или в адресе опечатка.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-cta h-12 px-6 font-semibold">
            <Home className="btn-arrow w-4 h-4" /> На главную
          </Link>
          <Link href="/#programs" className="btn-outline h-12 px-6 font-semibold">
            <Compass className="w-4 h-4" /> Направления
          </Link>
        </div>
      </div>
    </main>
  );
}

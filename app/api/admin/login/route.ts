import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { makeToken, sessionCookie } from "@/lib/admin-auth";

// Простой троттлер попыток входа по IP: режет брутфорс пароля.
// In-memory (per тёплый экземпляр) — достаточно для small-site угрозы.
const WINDOW_MS = 10 * 60_000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { n: number; reset: number }>();
function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.reset) {
    attempts.set(ip, { n: 1, reset: now + WINDOW_MS });
    return false;
  }
  a.n += 1;
  if (attempts.size > 1000) {
    attempts.forEach((v, k) => {
      if (now > v.reset) attempts.delete(k);
    });
  }
  return a.n > MAX_ATTEMPTS;
}
function clearAttempts(ip: string) {
  attempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (tooManyAttempts(ip)) {
    return NextResponse.json(
      { error: "Слишком много попыток входа. Подождите ~10 минут." },
      { status: 429 }
    );
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD не задан на сервере" },
      { status: 500 }
    );
  }
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const given = body?.password ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(password);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  clearAttempts(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(makeToken()));
  return res;
}

import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "sfera_admin";
const MAX_AGE_S = 60 * 60 * 24 * 7; // 7 дней

function secret(): string {
  const s =
    process.env.ADMIN_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!s) {
    // Молчаливый дефолт позволял подделать админ-cookie офлайн.
    throw new Error(
      "ADMIN_SECRET не задан: установите случайный секрет в переменных окружения (иначе сессии админки небезопасны).",
    );
  }
  return s;
}

export function makeToken(): string {
  const ts = String(Date.now());
  const sig = crypto.createHmac("sha256", secret()).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const [ts, sig] = token.split(".");
  if (!ts || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(ts).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Date.now() - Number(ts) < MAX_AGE_S * 1000;
}

export async function isAdmin(): Promise<boolean> {
  const store = cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

/** Возвращает 401-ответ, если запрос не от администратора; иначе null. */
export async function checkAdmin(): Promise<NextResponse | null> {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  };
}

export { COOKIE_NAME };

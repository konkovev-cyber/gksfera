import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { makeToken, sessionCookie } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
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
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(makeToken()));
  return res;
}

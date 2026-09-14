import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { syncVkNews } from "@/lib/vk-sync";

function timingEq(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Ежедневная автосинхронизация новостей из VK (Vercel Cron).
 * Vercel сам шлёт заголовок `Authorization: Bearer ${CRON_SECRET}`,
 * когда CRON_SECRET задан в переменных проекта. Без него эндпоинт
 * fail-CLOSED (500): не оставляем публичный триггер чужих VK-вызовов.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET не задан — синхронизация отключена" },
      { status: 500 },
    );
  }
  const auth = req.headers.get("authorization") ?? "";
  if (!timingEq(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await syncVkNews();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/news");
  return NextResponse.json({ ok: true, imported: result.imported, total: result.total });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncVkNews } from "@/lib/vk-sync";

/**
 * Ежедневная автосинхронизация новостей из VK (Vercel Cron).
 * График — в vercel.json. Если задан CRON_SECRET, запрос без
 * правильного Bearer-токена отклоняется.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await syncVkNews();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/news");
  return NextResponse.json({ ok: true, imported: result.imported, total: result.total });
}

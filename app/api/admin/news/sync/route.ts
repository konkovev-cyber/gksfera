import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { revalidateNews, syncPayload } from "@/lib/news-cache";
import { syncVkNews } from "@/lib/vk-sync";

export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as {
    domain?: string;
    count?: number;
  } | null;

  const result = await syncVkNews(body?.domain, body?.count);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error?.includes("VK API") ? 400 : 500 });
  }

  // Обновляем и ленту, и архив, и карту сайта: синхронизация меняет десятки записей.
  revalidateNews();
  return NextResponse.json(syncPayload(result));
}

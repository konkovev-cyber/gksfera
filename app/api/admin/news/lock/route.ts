import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { getPinnedNewsKeys } from "@/lib/news-lock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/news/lock — список ключей новостей, закреплённых студией.
 * Отдельный маршрут держим: /api/admin/news отдаёт массив строк таблицы news,
 * а это служебный список в site_settings (миграция схемы не требовалась).
 */
export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ keys: await getPinnedNewsKeys() });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

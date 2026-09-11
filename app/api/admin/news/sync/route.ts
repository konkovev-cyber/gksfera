import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/admin-auth";
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

  revalidatePath("/");
  return NextResponse.json({ ok: true, imported: result.imported, total: result.total });
}

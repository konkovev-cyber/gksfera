import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { checkAdmin } from "@/lib/admin-auth";

/**
 * GET /api/admin/files — список всех картинок из /public/images/
 * для фото-пикера в админке. Серверный доступ к fs (Next.js Node runtime).
 */
export const runtime = "nodejs";

export async function GET() {
  const denied = await checkAdmin();
  if (denied) return denied;
  const dir = join(process.cwd(), "public", "images");
  try {
    const files = readdirSync(dir)
      .filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .map((f) => {
        try {
          const st = statSync(join(dir, f));
          return { name: f, size: st.size, mtime: st.mtimeMs };
        } catch {
          return { name: f, size: 0, mtime: 0 };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({
      files: files.map((f) => ({
        src: `/images/${f.name}`,
        size: f.size,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "media";
const IMAGE_MAX = 20 * 1024 * 1024;  // 20MB
const VIDEO_MAX = 50 * 1024 * 1024;  // 50MB
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;

/**
 * POST /api/admin/photos/sign
 * Тело: { filename, size, contentType }
 * Ответ: { path, token, publicUrl } — клиент использует
 * `uploadToSignedUrl` через supabase-js или PUT напрямую на
 * https://<project>/storage/v1/object/upload/sign/<bucket>/<path>?token=<token>
 *
 * Почему через signed URL: сервер Vercel (serverless) на Hobby-плане
 * режет тело запроса до 4.5MB — 50MB видео через multipart не пройдёт.
 * Со signed URL файл идёт сразу в Supabase Storage, минуя Vercel.
 */
export async function POST(req: NextRequest) {
  const denied = await checkAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const filename = String(body.filename ?? "").trim();
  const size = Number(body.size ?? 0);
  const contentType = String(body.contentType ?? "").trim();

  if (!filename || !size) {
    return NextResponse.json({ error: "нужны filename и size" }, { status: 400 });
  }
  const isImage = contentType.startsWith("image/") || IMAGE_RE.test(filename);
  const isVideo = contentType.startsWith("video/") || VIDEO_RE.test(filename);
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "только изображения или видео" }, { status: 400 });
  }
  const maxBytes = isVideo ? VIDEO_MAX : IMAGE_MAX;
  const kind = isVideo ? "видео" : "фото";
  if (size > maxBytes) {
    return NextResponse.json(
      { error: `${kind} ${(size / 1024 / 1024).toFixed(1)}MB превышает лимит ${maxBytes / 1024 / 1024}MB` },
      { status: 413 },
    );
  }

  const safe = filename
    .replace(/[\\/]/g, "_")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .slice(-64);
  const path = `gallery/${Date.now()}-${safe}`;

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: pub } = db.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({
    path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl: pub.publicUrl,
    kind: isVideo ? "video" : "image",
  });
}

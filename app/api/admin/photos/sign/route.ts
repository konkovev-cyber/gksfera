import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "media";
const IMAGE_MAX = 20 * 1024 * 1024;  // 20MB
const VIDEO_MAX = 50 * 1024 * 1024;  // 50MB
// Явные allowlist'ы. SVG/HTML исключены намеренно — могут содержать скрипт
// и, будучи выложенными на доверенном хосте хранилища, дали бы stored-XSS.
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const VIDEO_EXT_RE = /\.(mp4|webm|mov|m4v|ogv)$/i;
const IMAGE_TYPES = /^image\/(jpeg|jpg|png|webp|gif|avif)$/i;
const VIDEO_TYPES = /^video\/(mp4|webm|quicktime|x-m4v|ogg|ogv)$/i;

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
  // Требование: И разрешение, И MIME должны быть из allowlist'а одного рода —
  // иначе «image/png» с именем x.html или SVG-файл не пройдут.
  const isImage = IMAGE_EXT_RE.test(filename) && IMAGE_TYPES.test(contentType);
  const isVideo = VIDEO_EXT_RE.test(filename) && VIDEO_TYPES.test(contentType);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "Разрешены только фото (jpg/png/webp/gif/avif) и видео (mp4/webm/mov)" },
      { status: 400 },
    );
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
    .slice(0, 64);
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

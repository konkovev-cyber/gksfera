import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service_role — bypasses RLS (insert allowed regardless of policy)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

/* ────────────────────────── Защита от спама ──────────────────────────
 * Слои (большинство атак — примитивные POST-скрипты мимо формы):
 *  1. Honeypot: скрытое поле «company_website», заполняют только боты.
 *  2. Минимальное время: заявка раньше MIN_FILL_MS после открытия формы.
 *  3. Rate-limit по IP (в памяти, best-effort для serverless).
 *  4. Анти-дубль по телефону (в БД — переживает холодный старт функции).
 *  5. Строгая валидация полей + запрет ссылок/управляющих символов.
 * Отклонённые заявки НЕ пишутся в БД и НЕ шлются в Telegram.
 * ──────────────────────────────────────────────────────────────────── */

const MIN_FILL_MS = 4000;          // человек физически не заполнит форму быстрее
const IP_WINDOW_MS = 10 * 60_000; // окно троттлинга по IP
const IP_MAX = 5;                  // максимум отправок с одного IP за окно
const PHONE_DUP_MS = 60 * 60_000; // та же защита «повторной» заявки с одного телефона (анти-флуд)
const PHONE_MAX_24H = 4;           // не более N заявок с одного телефона за сутки

// Простой in-memory token-bucket по IP. Живёт в рамках «тёплого» экземпляра
// функции — этого достаточно, чтобы срезать частые автоматические повторы.
const ipHits = new Map<string, { n: number; reset: number }>();
function tooManyFromIp(ip: string): boolean {
  const now = Date.now();
  const hit = ipHits.get(ip);
  if (!hit || now > hit.reset) {
    ipHits.set(ip, { n: 1, reset: now + IP_WINDOW_MS });
    return false;
  }
  hit.n += 1;
  // профилактика разрастания карты
  if (ipHits.size > 5000) {
    const now2 = Date.now();
    ipHits.forEach((v, k) => {
      if (now2 > v.reset) ipHits.delete(k);
    });
  }
  return hit.n > IP_MAX;
}

const strip = (v: unknown, max: number): string =>
  String(v ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ") // управляющие символы
    .trim()
    .slice(0, max);

function digits(s: string): string {
  return s.replace(/\D/g, "");
}

// Отклонение: { fail } — с человекочитаемым сообщением; либо ok — очищенные данные
type Clean = {
  parent_name: string;
  child_age: string;
  interest: string;
  interest_label: string;
  phone: string;
  comment: string;
};

function validate(body: any): { ok: true; data: Clean } | { ok: false; status: number; error: string } {
  // 1. Honeypot — тихо «принимаем», чтобы бот не понял, что его спалили
  if (strip(body.company_website, 100).length > 0) {
    return { ok: false, status: 200, error: "" }; // молча дропаем (см. вызывающий код)
  }

  // 2. Минимальное время заполнения (e.t — время рендера формы на клиенте)
  const t = Number(body.t);
  if (!Number.isFinite(t) || Date.now() - t < MIN_FILL_MS) {
    return { ok: false, status: 400, error: "Слишком быстро. Попробуйте ещё раз." };
  }

  const parent_name = strip(body.parent_name, 100);
  const child_age = strip(body.child_age, 40);
  const interest = strip(body.interest, 120);
  const phoneRaw = strip(body.phone, 40);
  const comment = strip(body.comment, 1000);

  // 5. Обязательные поля и разумные длины
  if (parent_name.length < 2 || parent_name.length > 100) {
    return { ok: false, status: 400, error: "Укажите имя (минимум 2 символа)." };
  }
  if (!child_age || child_age.length > 40) {
    return { ok: false, status: 400, error: "Укажите возраст ребёнка." };
  }
  if (!interest || interest.length > 120) {
    return { ok: false, status: 400, error: "Выберите направление." };
  }
  const dig = digits(phoneRaw);
  if (dig.length < 10 || dig.length > 12) {
    return { ok: false, status: 400, error: "Похоже, номер указан неверно." };
  }
  // Спам-маркеры в свободных полях: ссылки/URL почти всегда = бот-рассылка
  const linkRe = /(https?:\/\/|www\.|\.ru\/|\.com\/|\.xyz|t\.me\/|discord\.gg)/i;
  if (linkRe.test(parent_name) || linkRe.test(child_age) || linkRe.test(comment)) {
    return { ok: false, status: 200, error: "" }; // тихо дропаем спам со ссылками
  }

  return {
    ok: true,
    data: {
      parent_name,
      child_age,
      interest,
      interest_label: interest,
      phone: phoneRaw,
      comment,
    },
  };
}

export async function POST(request: Request) {
  try {
    // только JSON, ограничиваем «размер» через проверку наличия полей
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }

    // 3. Rate-limit по IP
    const ip =
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (tooManyFromIp(ip)) {
      return NextResponse.json(
        { error: "Слишком много заявок. Подождите несколько минут и попробуйте снова." },
        { status: 429 }
      );
    }

    const v = validate(body);
    // тихо отклонённое (honeypot / ссылочный спам) — делаем вид, что приняли
    if (!v.ok) {
      if (v.status === 200) return NextResponse.json({ ok: true });
      return NextResponse.json({ error: v.error }, { status: v.status });
    }
    const d = v.data;

    // 4. Анти-дубль по телефону через БД (переживает перезапуск функции)
    const since = new Date(Date.now() - PHONE_DUP_MS).toISOString();
    const { count: recent } = await supabaseAdmin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("phone", d.phone)
      .gte("created_at", since);
    if ((recent ?? 0) >= 2) {
      return NextResponse.json(
        { error: "Заявка с этим номером уже отправлена. Мы свяжемся с вами — подождите, пожалуйста." },
        { status: 429 }
      );
    }
    const since24 = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const { count: perDay } = await supabaseAdmin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("phone", d.phone)
      .gte("created_at", since24);
    if ((perDay ?? 0) >= PHONE_MAX_24H) {
      return NextResponse.json(
        { error: "С этого номера слишком много заявок за сутки. Попробуйте позже или позвоните нам." },
        { status: 429 }
      );
    }

    const { error } = await supabaseAdmin.from("enrollments").insert({
      parent_name: d.parent_name,
      child_age: d.child_age,
      interest: d.interest,
      interest_label: d.interest_label,
      phone: d.phone,
      comment: d.comment,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: "Не удалось сохранить заявку. Попробуйте позже." }, { status: 500 });
    }

    // Уведомление в Telegram (асинхронно, не блокирует ответ) — только валидным заявкам
    sendTelegramNotification({
      parentName: d.parent_name,
      childAge: d.child_age,
      interest: d.interest,
      contact: d.phone,
      comment: d.comment,
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Серверная ошибка. Попробуйте позже." }, { status: 500 });
  }
}

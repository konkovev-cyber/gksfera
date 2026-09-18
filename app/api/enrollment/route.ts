import { NextResponse } from "next/server";
import { sendTelegramNotification } from "@/lib/telegram";
import { serviceClient } from "@/lib/supabase-server";

// Server-side client with service_role — bypasses RLS (insert allowed regardless of policy)
const supabaseAdmin = serviceClient();

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
function pruneIps(now: number) {
  if (ipHits.size > 2000) {
    ipHits.forEach((v, k) => {
      if (now > v.reset) ipHits.delete(k);
    });
  }
}
function tooManyFromIp(ip: string): boolean {
  const now = Date.now();
  pruneIps(now);
  const hit = ipHits.get(ip);
  if (!hit || now > hit.reset) {
    // Жёсткий кап: даже если всё ещё разрастаемся, вытесняем самое старое.
    if (ipHits.size > 5000) {
      const oldest = ipHits.keys().next().value;
      if (oldest !== undefined) ipHits.delete(oldest);
    }
    ipHits.set(ip, { n: 1, reset: now + IP_WINDOW_MS });
    return false;
  }
  hit.n += 1;
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
  photo_consent?: boolean;
};

function validate(body: unknown): { ok: true; data: Clean } | { ok: false; status: number; error: string } {
  // Приводим к Record для безопасного доступа по ключу
  const b = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  // 1. Honeypot — тихо «принимаем», чтобы бот не понял, что его спалили
  if (strip(b.company_website, 100).length > 0) {
    return { ok: false, status: 200, error: "" }; // молча дропаем (см. вызывающий код)
  }

  // 2. Минимальное время заполнения: клиент шлёт elapsed (сколько мс форма
  //    была открыта) — не абсолютную метку, чтобы расхождение часов клиента
  //    с сервером не блокировало честных отправителей и не тривиализировало
  //    проверку «значением из прошлого».
  const elapsed = Number(b.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return { ok: false, status: 400, error: "Слишком быстро. Попробуйте ещё раз." };
  }

  const parent_name = strip(b.parent_name, 100);
  const child_age = strip(b.child_age, 40);
  const interest = strip(b.interest, 120);
  const phoneRaw = strip(b.phone, 40);
  const comment = strip(b.comment, 1000);

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
  // Контакт: допускается и телефон, и ник (Telegram/VK/WhatsApp — форма это
  // явно разрешает). Жёстко проверяем формат только когда есть цифры.
  if (phoneRaw.length < 3) {
    return { ok: false, status: 400, error: "Укажите телефон или способ связи." };
  }
  const dg = digits(phoneRaw);
  if (dg.length > 0 && (dg.length < 10 || dg.length > 13)) {
    return { ok: false, status: 400, error: "Похоже, номер указан неверно." };
  }
  // Согласие на обработку ПДн проверяем и на сервере (не только в браузере):
  // это данные о детях, одобрение должно подтверждаться на бэкенде.
  if (b.consent !== true) {
    return { ok: false, status: 400, error: "Необходимо согласие на обработку данных." };
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
      photo_consent: b.photo_consent === true,
    },
  };
}

export async function POST(request: Request) {
  try {
    // Дешёвые гейты ДО чтения/парсинга тела — чтобы мусорный трафик не
    // стоил полного буферизования и JSON.parse на каждый запрос.
    const len = Number(request.headers.get("content-length"));
    if (Number.isFinite(len) && len > 16 * 1024) {
      return NextResponse.json({ error: "Слишком большой запрос." }, { status: 413 });
    }

    // 3. Rate-limit по IP (бэренс-фолбэк: если IP недоступен — общая корзина)
    const ip =
      (request.headers.get("x-real-ip") || "").trim() ||
      (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      "shared";
    if (tooManyFromIp(ip)) {
      return NextResponse.json(
        { error: "Слишком много заявок. Подождите несколько минут и попробуйте снова." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
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
    const { count: recent, error: eDup } = await supabaseAdmin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("phone", d.phone)
      .gte("created_at", since);
    if (eDup) console.error("[enrollment] count-dup error:", eDup.message); // fail-open, но заметно в логах
    if ((recent ?? 0) >= 2) {
      return NextResponse.json(
        { error: "Заявка с этим номером уже отправлена. Мы свяжемся с вами — подождите, пожалуйста." },
        { status: 429 }
      );
    }
    const since24 = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const { count: perDay, error: eDay } = await supabaseAdmin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("phone", d.phone)
      .gte("created_at", since24);
    if (eDay) console.error("[enrollment] count-day error:", eDay.message);
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
      photo_consent: d.photo_consent,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: "Не удалось сохранить заявку. Попробуйте позже." }, { status: 500 });
    }

    // Уведомление в Telegram — ждём ДО отправки ответа: на serverless экземпляр
    // «змерзает» после flush-а ответа, и unfire-and-forget запрос терялся.
    // Внутри — свой таймаут 4с, так что пользователя это не подвесит.
    try {
      await sendTelegramNotification({
        parentName: d.parent_name,
        childAge: d.child_age,
        interest: d.interest,
        contact: d.phone,
        comment: d.comment,
      });
    } catch {
      /* доставка не критична для ответа */
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API error:", e);
    return NextResponse.json({ error: "Серверная ошибка. Попробуйте позже." }, { status: 500 });
  }
}

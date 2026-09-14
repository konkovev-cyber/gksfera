/**
 * Отправляет уведомление о новой заявке в Telegram.
 * Требует переменных окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
 */
/** Экранирует пользовательский текст для Telegram HTML (parse_mode=HTML). */
function esc(s: string): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendTelegramNotification(payload: {
  parentName: string;
  childAge: string;
  interest: string;
  contact: string;
  comment: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text = [
    "🔔 <b>Новая заявка в «Сферу»!</b>",
    "",
    `👤 <b>Родитель:</b> ${esc(payload.parentName)}`,
    `👶 <b>Возраст:</b> ${esc(payload.childAge || "—")}`,
    `📚 <b>Направление:</b> ${esc(payload.interest)}`,
    `📞 <b>Контакт:</b> ${esc(payload.contact)}`,
    payload.comment ? `💬 <b>Комментарий:</b> ${esc(payload.comment)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(4000),
    });
    // Telegram отвечает 200 даже при ok:false — проверяем оба.
    if (!res.ok) {
      console.error(`[telegram] sendMessage HTTP ${res.status}:`, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[telegram] Не удалось отправить уведомление:", e);
  }
}

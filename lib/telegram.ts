/**
 * Отправляет уведомление о новой заявке в Telegram.
 * Требует переменных окружения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
 */
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
    "🔔 <b>Новая заявка в «Сферу»!",
    "",
    `👤 <b>Родитель:</b> ${payload.parentName}`,
    `👶 <b>Возраст:</b> ${payload.childAge || "—"}`,
    `📚 <b>Направление:</b> ${payload.interest}`,
    `📞 <b>Контакт:</b> ${payload.contact}`,
    payload.comment ? `💬 <b>Комментарий:</b> ${payload.comment}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch (e) {
    console.error("[telegram] Не удалось отправить уведомление:", e);
  }
}

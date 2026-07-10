export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(200).json({ status: 'not_configured' });
  }

  const { name, phone, status, notes, chatId: customChatId } = req.body || {};
  if (!name) {
    return res.status(400).json({ status: 'bad_request' });
  }

  // Приоритет: chat_id пользователя из браузера, потом переменная окружения
  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    return res.status(200).json({ status: 'no_chat_id' });
  }

  const lines = [
    '🆕 Новый клиент',
    `👤 ${name}`,
    phone ? `📞 ${phone}` : null,
    `📋 ${status || 'Новый'}`,
    notes ? `💬 ${notes}` : null,
  ].filter(Boolean);

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: lines.join('\n') }),
  });

  if (!tgRes.ok) {
    return res.status(502).json({ status: 'telegram_error' });
  }

  return res.status(200).json({ status: 'sent' });
}

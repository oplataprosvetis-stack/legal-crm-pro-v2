export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(500).json({ status: 'bot_not_configured' });
  }

  const { username } = req.body || {};
  if (!username) {
    return res.status(400).json({ status: 'username_required' });
  }

  const clean = username.replace(/^@/, '').toLowerCase().trim();

  // Берём последние 100 апдейтов от бота
  const tgRes = await fetch(
    `https://api.telegram.org/bot${token}/getUpdates?limit=100&offset=-100`
  );

  if (!tgRes.ok) {
    return res.status(502).json({ status: 'telegram_error' });
  }

  const data = await tgRes.json();
  const updates = data.result || [];

  // Ищем сообщение от пользователя с нужным username
  for (const update of updates.reverse()) {
    const msg = update.message || update.callback_query?.message;
    const from = update.message?.from || update.callback_query?.from;
    if (from?.username?.toLowerCase() === clean) {
      return res.status(200).json({
        status: 'found',
        chatId: String(from.id),
        firstName: from.first_name || '',
      });
    }
  }

  return res.status(200).json({ status: 'not_found' });
}

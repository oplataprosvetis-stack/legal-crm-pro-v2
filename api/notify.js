export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'method_not_allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return res.status(200).json({ status: 'not_configured' });
  }

  const { type = 'new_client', client, task, previousStatus, status, chatId: customChatId, name, phone, notes } = req.body || {};
  const targetClient = client || { name, phone, notes, status };
  if (!targetClient?.name) {
    return res.status(400).json({ status: 'bad_request' });
  }

  const chatId = customChatId || process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    return res.status(200).json({ status: 'no_chat_id' });
  }

  const linesByType = {
    new_client: [
      '🆕 Новый клиент',
      `👤 ${targetClient.name}`,
      targetClient.phone ? `📞 ${targetClient.phone}` : null,
      targetClient.categoryTitle ? `🏷 ${targetClient.categoryTitle}` : null,
      `📋 ${targetClient.status || 'Новый'}`,
      targetClient.notes ? `💬 ${targetClient.notes}` : null,
    ],
    status_changed: [
      '🔁 Статус клиента изменён',
      `👤 ${targetClient.name}`,
      previousStatus ? `Было: ${previousStatus}` : null,
      `Стало: ${status || targetClient.status}`,
      targetClient.categoryTitle ? `🏷 ${targetClient.categoryTitle}` : null,
    ],
    task_done: [
      '✅ Задача выполнена',
      `👤 ${targetClient.name}`,
      task?.title ? `Задача: ${task.title}` : null,
      task?.dueAt ? `Дедлайн: ${new Date(task.dueAt).toLocaleString('ru-RU')}` : null,
      targetClient.categoryTitle ? `🏷 ${targetClient.categoryTitle}` : null,
    ],
  };

  const lines = (linesByType[type] || linesByType.new_client).filter(Boolean);

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
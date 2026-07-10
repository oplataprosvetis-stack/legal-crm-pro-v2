import { createClient } from '@supabase/supabase-js';

const STATUSES = new Set(['Новый', 'В работе', 'Закрыт']);
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })
  : null;

function getTableName() {
  return process.env.SUPABASE_TABLE || 'clients';
}

function parseBody(req) {
  if (req.method === 'GET' || req.method === 'DELETE') return null;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return req.body || null;
}

function getQueryId(req) {
  const value = req.query?.id;
  return Array.isArray(value) ? value[0] : value;
}

function cleanString(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function normalizeStatus(value) {
  return STATUSES.has(value) ? value : 'Новый';
}

function cleanTasks(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).map(task => ({
    id: cleanString(task?.id, 80) || crypto.randomUUID(),
    title: cleanString(task?.title, 180) || 'Новая задача',
    done: Boolean(task?.done),
    dueAt: cleanString(task?.dueAt || task?.due_at, 40) || null,
    createdAt: cleanString(task?.createdAt || task?.created_at, 40) || new Date().toISOString(),
    doneAt: cleanString(task?.doneAt || task?.done_at, 40) || null,
  }));
}

function createPayload(body) {
  const name = cleanString(body?.name, 120);
  if (!name) return { error: 'name_required' };

  return {
    id: cleanString(body.id, 80) || crypto.randomUUID(),
    name,
    phone: cleanString(body.phone, 40),
    status: normalizeStatus(body.status),
    notes: cleanString(body.notes, 1200),
    category_id: cleanString(body.categoryId || body.category_id, 80),
    category_title: cleanString(body.categoryTitle || body.category_title, 120),
    tasks: cleanTasks(body.tasks),
    notify_status_changes: Boolean(body.notifyStatusChanges ?? body.notify_status_changes ?? false),
    notify_task_done: Boolean(body.notifyTaskDone ?? body.notify_task_done ?? true),
    created_at: body.createdAt || body.created_at || new Date().toISOString(),
  };
}

function updatePayload(body) {
  if (!body || typeof body !== 'object') return {};

  const payload = {};
  if ('name' in body) {
    const name = cleanString(body.name, 120);
    if (!name) return { error: 'name_required' };
    payload.name = name;
  }
  if ('phone' in body) payload.phone = cleanString(body.phone, 40);
  if ('status' in body) {
    if (!STATUSES.has(body.status)) return { error: 'invalid_status' };
    payload.status = body.status;
  }
  if ('notes' in body) payload.notes = cleanString(body.notes, 1200);
  if ('categoryId' in body || 'category_id' in body) payload.category_id = cleanString(body.categoryId || body.category_id, 80);
  if ('categoryTitle' in body || 'category_title' in body) payload.category_title = cleanString(body.categoryTitle || body.category_title, 120);
  if ('tasks' in body) payload.tasks = cleanTasks(body.tasks);
  if ('notifyStatusChanges' in body || 'notify_status_changes' in body) payload.notify_status_changes = Boolean(body.notifyStatusChanges ?? body.notify_status_changes);
  if ('notifyTaskDone' in body || 'notify_task_done' in body) payload.notify_task_done = Boolean(body.notifyTaskDone ?? body.notify_task_done);

  return payload;
}

export default async function handler(req, res) {
  if (!supabase) {
    return res.status(500).json({ error: 'supabase_not_configured' });
  }

  const table = getTableName();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const payload = createPayload(body);
      if (payload.error) return res.status(400).json({ error: payload.error });

      const { data, error } = await supabase.from(table).insert(payload).select('*').single();
      if (error) throw error;
      return res.status(201).json({ client: data });
    }

    if (req.method === 'PATCH') {
      const body = parseBody(req);
      const id = getQueryId(req);
      if (!id) return res.status(400).json({ error: 'id_required' });

      const payload = updatePayload(body);
      if (payload.error) return res.status(400).json({ error: payload.error });
      if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'empty_update' });

      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();
      if (error) throw error;
      return res.status(200).json({ client: data });
    }

    if (req.method === 'DELETE') {
      const id = getQueryId(req);
      if (!id) return res.status(400).json({ error: 'id_required' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    console.error('api/clients error:', error);
    return res.status(500).json({ error: 'server_error' });
  }
}

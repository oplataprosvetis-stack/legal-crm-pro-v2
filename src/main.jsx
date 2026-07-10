import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  GripVertical,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import './styles.css';

const STATUSES = ['Новый', 'В работе', 'Закрыт'];
const STATUS_META = {
  'Новый': { color: 'status-new', step: 0, label: 'лид принят' },
  'В работе': { color: 'status-active', step: 1, label: 'юрист ведёт дело' },
  'Закрыт': { color: 'status-done', step: 2, label: 'результат зафиксирован' },
};

const CASE_TYPES = [
  {
    id: 'traffic',
    title: 'ДТП / страховая',
    owner: 'Автоюрист',
    deadlineHours: 24,
    partyType: 'person',
    document: 'Претензия в страховую',
    keywords: ['дтп', 'авар', 'осаго', 'каско', 'страх'],
    checklist: ['Проверить дату ДТП', 'Запросить документы ГИБДД', 'Подготовить претензию', 'Поставить контроль ответа'],
  },
  {
    id: 'labor',
    title: 'Трудовой спор',
    owner: 'Юрист по трудовому праву',
    deadlineHours: 48,
    partyType: 'person',
    document: 'Жалоба / досудебная претензия',
    keywords: ['работ', 'сотруд', 'увольн', 'зарплат', 'труд'],
    checklist: ['Проверить договор', 'Собрать переписку', 'Оценить сроки обращения', 'Подготовить позицию'],
  },
  {
    id: 'family',
    title: 'Семейное дело',
    owner: 'Семейный юрист',
    deadlineHours: 72,
    partyType: 'person',
    document: 'Проект заявления',
    keywords: ['развод', 'алимент', 'ребен', 'семейн', 'имущество'],
    checklist: ['Определить предмет спора', 'Собрать документы', 'Подготовить проект заявления', 'Назначить консультацию'],
  },
  {
    id: 'business',
    title: 'Бизнес / договор',
    owner: 'Юрист для бизнеса',
    deadlineHours: 72,
    partyType: 'business',
    document: 'Правовое заключение',
    keywords: ['ооо', 'договор', 'контрагент', 'поставк', 'аренд'],
    checklist: ['Проверить договор', 'Оценить риски', 'Сформировать вопросы', 'Подготовить правку документа'],
  },
];

const DEFAULT_CASE = {
  id: 'common',
  title: 'Общая консультация',
  owner: 'Дежурный юрист',
  deadlineHours: 24,
  partyType: 'person',
  document: 'План консультации',
  checklist: ['Уточнить проблему', 'Проверить срочность', 'Назначить ответственного', 'Зафиксировать следующий шаг'],
};

const DEMO_SCENARIOS = [
  { name: 'Мария Кузнецова', categoryId: 'traffic', status: 'Новый', notes: 'ДТП, страховая занизила выплату. Нужна претензия и контроль срока ответа.', tasks: ['Проверить дату ДТП', 'Запросить документы ГИБДД', 'Подготовить претензию', 'Поставить контроль ответа'], done: 0, ageDays: 0 },
  { name: 'Анна Петрова', categoryId: 'traffic', status: 'В работе', notes: 'После аварии нужна оценка ущерба и письмо в страховую.', tasks: ['Собрать фото повреждений', 'Запросить акт осмотра', 'Назначить независимую экспертизу', 'Подготовить претензию'], done: 1, ageDays: 1 },
  { name: 'Павел Орлов', categoryId: 'labor', status: 'Новый', notes: 'Работодатель задерживает выплату расчёта после увольнения.', tasks: ['Проверить трудовой договор', 'Собрать расчетные листки', 'Подготовить претензию работодателю'], done: 0, ageDays: 1 },
  { name: 'ООО Вектор', categoryId: 'business', status: 'В работе', notes: 'Контрагент нарушил сроки поставки по договору.', tasks: ['Проверить договор поставки', 'Рассчитать неустойку', 'Подготовить досудебную претензию', 'Поставить контроль ответа'], done: 2, ageDays: 2 },
  { name: 'Елена Морозова', categoryId: 'family', status: 'В работе', notes: 'Нужно подготовить документы по алиментам.', tasks: ['Уточнить данные ребёнка', 'Собрать справки о доходах', 'Подготовить заявление', 'Назначить дату подачи'], done: 2, ageDays: 2 },
  { name: 'ООО Север', categoryId: 'business', status: 'Новый', notes: 'Нужна проверка договора аренды перед подписанием.', tasks: ['Проверить предмет договора', 'Оценить штрафы и расторжение', 'Сформировать правки', 'Отправить клиенту резюме рисков'], done: 0, ageDays: 3 },
  { name: 'Илья Смирнов', categoryId: 'family', status: 'Закрыт', notes: 'Раздел имущества, консультация проведена, документы переданы.', tasks: ['Определить состав имущества', 'Подготовить список документов', 'Согласовать позицию', 'Передать клиенту план действий'], done: 4, ageDays: 5 },
  { name: 'ООО Альфа', categoryId: 'business', status: 'В работе', notes: 'Покупатель не оплатил поставку, нужна претензия.', tasks: ['Сверить накладные', 'Проверить оплату', 'Рассчитать долг', 'Подготовить претензию'], done: 1, ageDays: 1 },
  { name: 'Сергей Иванов', categoryId: 'labor', status: 'В работе', notes: 'Незаконное дисциплинарное взыскание.', tasks: ['Получить приказ', 'Собрать объяснения', 'Оценить сроки обжалования', 'Подготовить жалобу'], done: 2, ageDays: 4 },
  { name: 'Наталья Белова', categoryId: 'traffic', status: 'Новый', notes: 'Виновник ДТП без страховки, нужна стратегия взыскания.', tasks: ['Проверить материалы ДТП', 'Оценить ущерб', 'Подготовить исковую перспективу'], done: 0, ageDays: 0 },
  { name: 'ООО Меридиан', categoryId: 'business', status: 'Закрыт', notes: 'Проверка оферты для сайта завершена.', tasks: ['Проверить оферту', 'Проверить политику данных', 'Составить список правок', 'Передать финальную редакцию'], done: 4, ageDays: 6 },
  { name: 'Ольга Романова', categoryId: 'family', status: 'Новый', notes: 'Нужна консультация по порядку общения с ребёнком.', tasks: ['Уточнить судебную историю', 'Собрать документы', 'Подготовить вопросы к консультации'], done: 0, ageDays: 0 },
];

const DEMO_CLIENTS = DEMO_SCENARIOS.slice(0, 10).map((scenario, index) => scenarioToClient(scenario, index, 'd'));
const EMPTY_FORM = { name: '', phone: '+7', status: 'Новый', categoryId: 'traffic', notes: '', notifyStatusChanges: false, notifyTaskDone: true };
const EMPTY_CATEGORY_FORM = { title: '', partyType: 'person', owner: '', deadlineHours: 24, document: '', checklist: '' };
const DEMO_STORAGE_KEY = 'lcrm-v2-demo';
const CATEGORIES_STORAGE_KEY = 'lcrm-categories';
const TG_STORAGE_KEY = 'lcrm-tg';
const BUCKET_EMOJI = { hot: '🔥', warm: '🌡️', cool: '😎', empty: '·' };
const DEMO_AUTOPLAY_STEPS = 20;
const DEMO_AUTOPLAY_INTERVAL = 5000;

function daysAgo(value) {
  return new Date(Date.now() - 86400000 * value).toISOString();
}

function uid() {
  return window.crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
}

function fakePhone(index) {
  return `8(900)-000-00-${String((index % 99) + 1).padStart(2, '0')}`;
}

function scenarioCategory(categoryId) {
  return CASE_TYPES.find(category => category.id === categoryId) || DEFAULT_CASE;
}

function scenarioTasks(scenario, createdAt) {
  const category = scenarioCategory(scenario.categoryId);
  return scenario.tasks.map((title, index) => normalizeTask({
    id: `${scenario.categoryId}-${index + 1}-${createdAt}`,
    title,
    done: index < scenario.done,
    dueAt: defaultDueAt(createdAt, category, index),
    doneAt: index < scenario.done ? new Date(new Date(createdAt).getTime() + (index + 2) * 3600000).toISOString() : null,
  }));
}

function scenarioToClient(scenario, index, prefix = 'demo') {
  const category = scenarioCategory(scenario.categoryId);
  const createdAt = daysAgo(scenario.ageDays || 0);
  return normalizeClient({
    id: `${prefix}-${index + 1}`,
    name: scenario.name,
    phone: fakePhone(index),
    status: scenario.status,
    categoryId: category.id,
    categoryTitle: category.title,
    notes: scenario.notes,
    tasks: scenarioTasks(scenario, createdAt),
    notifyStatusChanges: true,
    notifyTaskDone: true,
    createdAt,
  });
}

function categoryTone(category) {
  const partyType = typeof category === 'string' ? (category === 'business' ? 'business' : 'person') : category?.partyType;
  return partyType === 'business' ? 'business' : 'person';
}

function partyTypeLabel(partyType) {
  return partyType === 'business' ? 'Юрлицо' : 'Физлицо';
}

function loadDemoClients() {
  try {
    const saved = localStorage.getItem(DEMO_STORAGE_KEY);
    return saved ? JSON.parse(saved).map(normalizeClient) : DEMO_CLIENTS;
  } catch {
    return DEMO_CLIENTS;
  }
}

function saveDemoClients(clients) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(clients));
  } catch {}
}

function loadTg() {
  try {
    return JSON.parse(localStorage.getItem(TG_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function parseTasks(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toDateTimeLocal(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function fromDateTimeLocal(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeTask(raw, fallbackDueAt) {
  return {
    id: raw?.id || uid(),
    title: String(raw?.title || '').trim() || 'Новая задача',
    done: Boolean(raw?.done),
    dueAt: raw?.dueAt || raw?.due_at || fallbackDueAt || null,
    createdAt: raw?.createdAt || raw?.created_at || new Date().toISOString(),
    doneAt: raw?.doneAt || raw?.done_at || null,
  };
}

function createTask(title, dueAt) {
  return normalizeTask({ title, dueAt });
}

function normalizeCategory(raw) {
  return {
    id: raw?.id || uid(),
    title: String(raw?.title || '').trim() || 'Новая категория',
    owner: String(raw?.owner || 'Дежурный юрист').trim(),
    deadlineHours: Number(raw?.deadlineHours || raw?.deadline_hours || 24),
    partyType: raw?.partyType === 'business' || raw?.party_type === 'business' || raw?.id === 'business' ? 'business' : 'person',
    document: String(raw?.document || 'План консультации').trim(),
    keywords: Array.isArray(raw?.keywords) ? raw.keywords : [],
    checklist: Array.isArray(raw?.checklist) ? raw.checklist : DEFAULT_CASE.checklist,
  };
}

function loadCategories() {
  try {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const custom = saved ? JSON.parse(saved).map(normalizeCategory) : [];
    return mergeCategories(CASE_TYPES, custom);
  } catch {
    return CASE_TYPES.map(normalizeCategory);
  }
}

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch {}
}

function mergeCategories(...groups) {
  const map = new Map();
  groups.flat().filter(Boolean).forEach(raw => {
    const category = normalizeCategory(raw);
    map.set(category.id, { ...map.get(category.id), ...category });
  });
  return [...map.values()];
}

function clientCategoryCandidates(clients) {
  return clients
    .filter(client => client.categoryId && client.categoryTitle)
    .map(client => ({ ...DEFAULT_CASE, id: client.categoryId, title: client.categoryTitle }));
}

function resolveCategory(client, categories) {
  if (client.categoryId) {
    const selected = categories.find(category => category.id === client.categoryId);
    if (selected) return selected;
  }
  if (client.categoryTitle) return normalizeCategory({ ...DEFAULT_CASE, id: client.categoryId || client.categoryTitle, title: client.categoryTitle });
  const haystack = `${client.name} ${client.notes}`.toLowerCase();
  return categories.find(type => type.keywords.some(keyword => haystack.includes(keyword))) || DEFAULT_CASE;
}

function defaultDueAt(createdAt, category, index = 0) {
  return new Date(new Date(createdAt).getTime() + (category.deadlineHours + index * 12) * 3600000).toISOString();
}

function nearestOpenTask(tasks) {
  return tasks
    .filter(task => !task.done && task.dueAt)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0] || null;
}

function normalizeClient(raw) {
  return {
    id: raw.id,
    name: raw.name || 'Клиент',
    phone: raw.phone || '',
    status: STATUSES.includes(raw.status) ? raw.status : 'Новый',
    categoryId: raw.categoryId || raw.category_id || '',
    categoryTitle: raw.categoryTitle || raw.category_title || '',
    notes: raw.notes || '',
    tasks: parseTasks(raw.tasks).map(task => normalizeTask(task)),
    notifyStatusChanges: Boolean(raw.notifyStatusChanges ?? raw.notify_status_changes ?? false),
    notifyTaskDone: Boolean(raw.notifyTaskDone ?? raw.notify_task_done ?? true),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function fmtDateTime(iso) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function extractPhoneDigits(raw) {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (digits.startsWith('7')) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formatPhoneDigits(digits) {
  let out = '+7';
  if (digits.length > 0) out += '(' + digits.slice(0, 3);
  if (digits.length >= 3) out += ')';
  if (digits.length > 3) out += '-' + digits.slice(3, 6);
  if (digits.length > 6) out += '-' + digits.slice(6, 8);
  if (digits.length > 8) out += '-' + digits.slice(8, 10);
  return out;
}

function formatPhone(raw) {
  return formatPhoneDigits(extractPhoneDigits(raw));
}

function classifyClient(client, categories, now = Date.now()) {
  const category = resolveCategory(client, categories);
  const nearest = nearestOpenTask(client.tasks);
  const deadlineAt = nearest?.dueAt || defaultDueAt(client.createdAt, category);
  const hoursLeft = Math.round((new Date(deadlineAt).getTime() - now) / 3600000);
  const haystack = `${client.name} ${client.notes}`.toLowerCase();
  const urgentWords = ['срочно', 'суд', 'сегодня', 'завтра', 'дтп', 'увольн'];
  const priority = client.status !== 'Закрыт' && (urgentWords.some(word => haystack.includes(word)) || hoursLeft <= 12) ? 'Высокий' : 'Нормальный';

  return { ...category, deadlineAt, hoursLeft, priority };
}

function enrichClient(client, categories, now) {
  const automation = classifyClient(client, categories, now);
  return {
    ...client,
    categoryId: client.categoryId || automation.id,
    categoryTitle: client.categoryTitle || automation.title,
    automation,
  };
}

function urgencyBucket(hoursLeft) {
  if (hoursLeft <= 12) return 'hot';
  if (hoursLeft <= 72) return 'warm';
  return 'cool';
}

function buildAgendaItems(clients, now) {
  const items = [];
  clients.forEach(client => {
    client.tasks.forEach(task => {
      if (task.done || !task.dueAt) return;
      const hoursLeft = Math.round((new Date(task.dueAt).getTime() - now) / 3600000);
      items.push({
        id: `${client.id}:${task.id}`,
        clientId: client.id,
        clientName: client.name,
        categoryTitle: client.automation?.title || client.categoryTitle,
        taskId: task.id,
        title: task.title,
        dueAt: task.dueAt,
        hoursLeft,
        bucket: urgencyBucket(hoursLeft),
      });
    });
  });
  return items.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}

function relativeDueLabel(dueAt, now) {
  const due = new Date(dueAt);
  const nowDate = new Date(now);
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const nowDay = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate());
  const diffDays = Math.round((dueDay - nowDay) / 86400000);
  const time = due.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 0) return `Просрочено · ${fmtDate(dueAt)}`;
  if (diffDays === 0) return `Сегодня, ${time}`;
  if (diffDays === 1) return `Завтра, ${time}`;
  if (diffDays < 7) return `${due.toLocaleDateString('ru-RU', { weekday: 'short' })}, ${time}`;
  return `${fmtDate(dueAt)}, ${time}`;
}

function buildDayStrip(items, now, days = 14) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const cells = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(start.getTime() + i * 86400000);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const dayItems = items.filter(item => {
      const d = new Date(item.dueAt);
      return d >= dayStart && d < dayEnd;
    });
    const bucket = dayItems.some(item => item.bucket === 'hot')
      ? 'hot'
      : dayItems.some(item => item.bucket === 'warm')
        ? 'warm'
        : dayItems.length ? 'cool' : 'empty';
    cells.push({ date: dayStart, count: dayItems.length, bucket });
  }
  return cells;
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(res.ok ? 'api_not_available' : `http_${res.status}`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.status || `http_${res.status}`);
  return data;
}

async function requestClients(method, payload, id) {
  const url = id ? `/api/clients?id=${encodeURIComponent(id)}` : '/api/clients';
  const init = { method, headers: { 'Content-Type': 'application/json' } };
  if (payload !== undefined) init.body = JSON.stringify(payload);
  return requestJson(url, init);
}

function MetricCard({ label, value, hint }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function SourceBadge({ source, error }) {
  if (source === 'loading') return null;
  if (source === 'supabase') {
    return (
      <div className="source-badge ok">
        <Database size={16} />
        <span>Supabase live</span>
      </div>
    );
  }
  return (
    <div className="source-badge demo" title={error || ''}>
      <Database size={16} />
      <span>Demo · данные в браузере</span>
    </div>
  );
}

function csvCell(value) {
  let normalized = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(normalized)) normalized = `'${normalized}`;
  return `"${normalized.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = `sep=;\r\n${rows.map(row => row.map(csvCell).join(';')).join('\r\n')}`;
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function App() {
  const [clients, setClients] = React.useState([]);
  const [categories, setCategories] = React.useState(loadCategories);
  const [categoryForm, setCategoryForm] = React.useState(EMPTY_CATEGORY_FORM);
  const [categoryFormOpen, setCategoryFormOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [source, setSource] = React.useState('loading');
  const [sourceError, setSourceError] = React.useState('');
  const [form, setForm] = React.useState(EMPTY_FORM);
  const [filter, setFilter] = React.useState('Все');
  const [search, setSearch] = React.useState('');
  const [toast, setToast] = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [savingId, setSavingId] = React.useState('');
  const [noteDrafts, setNoteDrafts] = React.useState({});
  const [taskInputs, setTaskInputs] = React.useState({});
  const [tgUser, setTgUser] = React.useState(loadTg);
  const [tgInput, setTgInput] = React.useState('');
  const [tgStatus, setTgStatus] = React.useState('idle');
  const [now, setNow] = React.useState(Date.now());
  const [agendaDayFilter, setAgendaDayFilter] = React.useState(null);
  const [demoPlaying, setDemoPlaying] = React.useState(false);
  const [demoStep, setDemoStep] = React.useState(0);
  const [demoSendStatus, setDemoSendStatus] = React.useState(true);
  const [demoSendTasks, setDemoSendTasks] = React.useState(false);
  const runDemoScenarioRef = React.useRef(() => {});
  const phoneRef = React.useRef(null);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (!demoPlaying) return;
    if (demoStep >= DEMO_AUTOPLAY_STEPS) {
      setDemoPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      runDemoScenarioRef.current();
      setDemoStep(step => step + 1);
    }, DEMO_AUTOPLAY_INTERVAL);
    return () => clearTimeout(timer);
  }, [demoPlaying, demoStep]);

  React.useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const payload = await requestClients('GET');
        if (!Array.isArray(payload)) throw new Error('invalid_clients_payload');
        if (ignore) return;
        setClients(payload.map(normalizeClient));
        setSource('supabase');
        setSourceError('');
      } catch (error) {
        if (ignore) return;
        setClients(loadDemoClients());
        setSource('demo');
        setSourceError(error.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    bootstrap();
    return () => { ignore = true; };
  }, []);

  React.useEffect(() => {
    if (!loading && source === 'demo') saveDemoClients(clients);
  }, [clients, loading, source]);

  React.useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  React.useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  React.useEffect(() => {
    const el = phoneRef.current;
    if (el === document.activeElement) el.setSelectionRange(el.value.length, el.value.length);
  }, [form.phone]);

  const categoryOptions = React.useMemo(() => mergeCategories(categories, clientCategoryCandidates(clients)), [categories, clients]);
  const enrichedClients = React.useMemo(() => clients.map(client => enrichClient(client, categoryOptions, now)), [clients, categoryOptions, now]);
  const counts = React.useMemo(
    () => STATUSES.reduce((acc, status) => ({ ...acc, [status]: clients.filter(c => c.status === status).length }), { Все: clients.length }),
    [clients]
  );
  const visible = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return enrichedClients.filter(client => {
      const matchesFilter = filter === 'Все' || client.status === filter;
      const matchesSearch = !query
        || client.name.toLowerCase().includes(query)
        || client.phone.includes(query)
        || client.notes.toLowerCase().includes(query)
        || client.automation.title.toLowerCase().includes(query)
        || client.tasks.some(task => task.title.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [enrichedClients, filter, search]);

  const agendaItems = React.useMemo(
    () => buildAgendaItems(enrichedClients.filter(client => client.status !== 'Закрыт'), now),
    [enrichedClients, now]
  );
  const agendaDayStrip = React.useMemo(() => buildDayStrip(agendaItems, now), [agendaItems, now]);
  const overdueCount = React.useMemo(() => agendaItems.filter(item => item.hoursLeft < 0).length, [agendaItems]);
  const visibleAgendaItems = React.useMemo(() => {
    if (!agendaDayFilter) return agendaItems;
    const dayStart = new Date(agendaDayFilter);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    return agendaItems.filter(item => {
      const d = new Date(item.dueAt);
      return d >= dayStart && d < dayEnd;
    });
  }, [agendaItems, agendaDayFilter]);
  const agendaGroups = React.useMemo(() => ([
    { key: 'hot', label: 'Горит', emoji: BUCKET_EMOJI.hot, items: visibleAgendaItems.filter(item => item.bucket === 'hot') },
    { key: 'warm', label: 'Подгорает', emoji: BUCKET_EMOJI.warm, items: visibleAgendaItems.filter(item => item.bucket === 'warm') },
    { key: 'cool', label: 'На чилле', emoji: BUCKET_EMOJI.cool, items: visibleAgendaItems.filter(item => item.bucket === 'cool') },
  ]), [visibleAgendaItems]);


  const urgentCount = enrichedClients.filter(c => c.automation.priority === 'Высокий' && c.status !== 'Закрыт').length;
  const inAutomation = enrichedClients.filter(c => c.status !== 'Закрыт').length;
  const demoLabel = demoPlaying ? 'Пауза' : (demoStep > 0 && demoStep < DEMO_AUTOPLAY_STEPS ? 'Продолжить' : 'Запустить демо');

  function exportToExcel() {
    const rows = [
      ['Клиент', 'Телефон', 'Категория', 'Тип клиента', 'Статус клиента', 'Заметка', 'Задача', 'Статус задачи', 'Дедлайн задачи', 'Дата создания'],
    ];

    enrichedClients.forEach(client => {
      const tasks = client.tasks.length ? client.tasks : [null];
      tasks.forEach(task => {
        rows.push([
          client.name,
          client.phone,
          client.automation.title,
          partyTypeLabel(client.automation.partyType),
          client.status,
          client.notes,
          task?.title || '',
          task ? (task.done ? 'Выполнена' : 'В работе') : '',
          task?.dueAt ? fmtDateTime(task.dueAt) : '',
          fmtDateTime(client.createdAt),
        ]);
      });
    });

    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`legal-crm-export-${date}.csv`, rows);
    setToast('Выгрузка Excel сформирована');
  }

  function patchClient(id, patch) {
    setClients(prev => prev.map(client => (client.id === id ? { ...client, ...patch } : client)));
  }

  async function persistCreate(client) {
    if (source === 'supabase') {
      const data = await requestClients('POST', client);
      return normalizeClient(data.client || client);
    }
    return client;
  }

  async function persistPatch(id, patch) {
    if (source === 'supabase') {
      const data = await requestClients('PATCH', patch, id);
      return normalizeClient(data.client || { id, ...patch });
    }
    return { id, ...patch };
  }

  async function addClientFromPayload(payload, options = {}) {
    const category = categoryOptions.find(item => item.id === payload.categoryId) || categoryOptions[0] || DEFAULT_CASE;
    const createdAt = new Date().toISOString();
    const client = normalizeClient({
      id: uid(),
      createdAt,
      categoryId: category.id,
      categoryTitle: category.title,
      tasks: category.checklist.map((title, index) => createTask(title, defaultDueAt(createdAt, category, index))),
      notifyStatusChanges: payload.notifyStatusChanges,
      notifyTaskDone: payload.notifyTaskDone,
      ...payload,
    });
    setSavingId('create');
    try {
      const saved = await persistCreate(client);
      setClients(prev => [saved, ...prev]);
      setExpanded(saved.id);
      setForm({ ...EMPTY_FORM, categoryId: category.id });
      setFormOpen(false);
      setToast(options.toast || `Клиент "${saved.name}" добавлен`);
      notifyTelegram({ type: 'new_client', client: saved });
    } catch (error) {
      setToast(error.message === 'limit_reached'
        ? 'Лимит демо-базы (100 клиентов) исчерпан — удалите несколько клиентов, чтобы добавить новых'
        : `Не удалось сохранить: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  function addClient(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    addClientFromPayload({
      name: form.name.trim(),
      phone: form.phone === '+7' ? '' : form.phone,
      status: form.status,
      categoryId: form.categoryId,
      notes: form.notes,
      notifyStatusChanges: form.notifyStatusChanges,
      notifyTaskDone: form.notifyTaskDone,
    });
  }

  function resetDemoData() {
    localStorage.removeItem(DEMO_STORAGE_KEY);
    localStorage.removeItem(CATEGORIES_STORAGE_KEY);
    setCategories(CASE_TYPES.map(normalizeCategory));
    setClients(DEMO_CLIENTS);
    setExpanded(null);
    setToast('Demo-данные сброшены');
  }

  function runDemoScenario() {
    const openClients = enrichedClients.filter(client => client.status !== 'Закрыт');
    const openWithTasks = openClients.filter(client => client.tasks.some(task => !task.done));
    const roll = Math.random();

    // "Клиент позвонил, дедлайн подгорел" — гарантирует, что за автоплей будут видны все три спектра.
    if (roll < 0.2 && openWithTasks.length) {
      const client = openWithTasks[Math.floor(Math.random() * openWithTasks.length)];
      const task = client.tasks.find(t => !t.done);
      const urgentDueAt = new Date(Date.now() + Math.round(Math.random() * 10) * 3600000).toISOString();
      setToast(`Демо: у ${client.name} срочный дедлайн по «${task.title}»`);
      updateTask(client.id, task.id, { dueAt: urgentDueAt }, { notify: false });
      return;
    }

    if (roll < 0.45 && openWithTasks.length) {
      const client = openWithTasks[Math.floor(Math.random() * openWithTasks.length)];
      const task = client.tasks.find(t => !t.done);
      setToast(`Демо: задача «${task.title}» у ${client.name} выполнена`);
      updateTask(client.id, task.id, { done: true }, { notify: demoSendTasks });
      return;
    }

    if (roll < 0.7 && openClients.length) {
      const client = openClients[Math.floor(Math.random() * openClients.length)];
      const nextStatus = STATUSES[STATUSES.indexOf(client.status) + 1];
      if (nextStatus) {
        updateStatus(client.id, nextStatus, { notify: demoSendStatus });
        return;
      }
    }

    const scenario = DEMO_SCENARIOS[clients.length % DEMO_SCENARIOS.length];
    const createdAt = new Date().toISOString();
    const category = scenarioCategory(scenario.categoryId);
    addClientFromPayload({
      name: scenario.name,
      phone: fakePhone(clients.length),
      status: scenario.status,
      categoryId: category.id,
      categoryTitle: category.title,
      notes: scenario.notes,
      tasks: scenarioTasks(scenario, createdAt),
      notifyStatusChanges: true,
      notifyTaskDone: true,
    }, { toast: `Демо: добавлен сценарий "${scenario.name}"` });
  }

  function toggleDemoPlay() {
    if (demoPlaying) {
      setDemoPlaying(false);
      return;
    }
    if (demoStep === 0 || demoStep >= DEMO_AUTOPLAY_STEPS) {
      setDemoStep(1);
      runDemoScenario();
    }
    setDemoPlaying(true);
  }

  runDemoScenarioRef.current = runDemoScenario;

  async function updateStatus(id, status, options = {}) {
    const notify = options.notify ?? true;
    const current = enrichedClients.find(client => client.id === id);
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { status });
      patchClient(id, updated);
      setToast(`Статус: ${status}`);
      if (notify && current?.notifyStatusChanges && current.status !== status) {
        notifyTelegram({ type: 'status_changed', client: { ...current, ...updated, status }, previousStatus: current.status, status });
      }
    } catch (error) {
      setToast(`Статус не сохранён: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function addCategory(event) {
    event.preventDefault();
    if (!categoryForm.title.trim()) return;
    const category = normalizeCategory({
      id: uid(),
      title: categoryForm.title,
      owner: categoryForm.owner,
      partyType: categoryForm.partyType,
      deadlineHours: categoryForm.deadlineHours,
      document: categoryForm.document,
      checklist: categoryForm.checklist.split('\n').map(item => item.trim()).filter(Boolean),
    });
    setCategories(prev => mergeCategories(prev, [category]));
    setForm(prev => ({ ...prev, categoryId: category.id }));
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setCategoryFormOpen(false);
    setToast(`Категория "${category.title}" добавлена`);
  }

  async function updateCategory(id, categoryId) {
    const category = categoryOptions.find(item => item.id === categoryId);
    const current = enrichedClients.find(client => client.id === id);
    if (!category || !current) return;
    const patch = {
      categoryId: category.id,
      categoryTitle: category.title,
      tasks: current.tasks.length ? current.tasks : category.checklist.map((title, index) => createTask(title, defaultDueAt(current.createdAt, category, index))),
    };
    setSavingId(id);
    try {
      const updated = await persistPatch(id, patch);
      patchClient(id, updated);
      setToast(`Категория: ${category.title}`);
    } catch (error) {
      setToast(`Категория не сохранена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function updateNotifyFlag(id, field, value) {
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { [field]: value });
      patchClient(id, updated);
    } catch (error) {
      setToast(`Настройка не сохранена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function saveNotes(id) {
    const notes = noteDrafts[id] ?? clients.find(c => c.id === id)?.notes ?? '';
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { notes });
      patchClient(id, updated);
      setToast('Заметка сохранена');
    } catch (error) {
      setToast(`Заметка не сохранена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function addTask(id) {
    const title = (taskInputs[id] || '').trim();
    const current = enrichedClients.find(client => client.id === id);
    if (!title || !current) return;
    const tasks = [...current.tasks, createTask(title, defaultDueAt(new Date().toISOString(), current.automation))];
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { tasks });
      patchClient(id, updated);
      setTaskInputs(prev => ({ ...prev, [id]: '' }));
      setToast('Задача добавлена');
    } catch (error) {
      setToast(`Задача не сохранена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function updateTask(id, taskId, patch, options = {}) {
    const notify = options.notify ?? true;
    const current = enrichedClients.find(client => client.id === id);
    if (!current) return;
    let completedTask = null;
    const tasks = current.tasks.map(task => {
      if (task.id !== taskId) return task;
      const next = { ...task, ...patch };
      if ('done' in patch) next.doneAt = patch.done ? new Date().toISOString() : null;
      if (!task.done && next.done) completedTask = next;
      return next;
    });
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { tasks });
      patchClient(id, updated);
      if (notify && completedTask && current.notifyTaskDone) {
        notifyTelegram({ type: 'task_done', client: current, task: completedTask });
      }
    } catch (error) {
      setToast(`Задача не обновлена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function removeTask(id, taskId) {
    const current = enrichedClients.find(client => client.id === id);
    if (!current) return;
    const tasks = current.tasks.filter(task => task.id !== taskId);
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { tasks });
      patchClient(id, updated);
    } catch (error) {
      setToast(`Задача не удалена: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function reorderTask(id, fromTaskId, toTaskId) {
    const current = enrichedClients.find(client => client.id === id);
    if (!current || fromTaskId === toTaskId) return;
    const tasks = [...current.tasks];
    const fromIndex = tasks.findIndex(task => task.id === fromTaskId);
    const toIndex = tasks.findIndex(task => task.id === toTaskId);
    if (fromIndex === -1 || toIndex === -1) return;
    const [moved] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    setSavingId(id);
    try {
      const updated = await persistPatch(id, { tasks });
      patchClient(id, updated);
    } catch (error) {
      setToast(`Порядок не сохранён: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  function moveTask(id, taskId, direction) {
    const current = enrichedClients.find(client => client.id === id);
    if (!current) return;
    const index = current.tasks.findIndex(task => task.id === taskId);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= current.tasks.length) return;
    reorderTask(id, taskId, current.tasks[targetIndex].id);
  }

  async function removeClient(id) {
    const client = clients.find(item => item.id === id);
    if (!client || !window.confirm(`Удалить клиента "${client.name}"?`)) return;

    setSavingId(id);
    try {
      if (source === 'supabase') await requestClients('DELETE', undefined, id);
      setClients(prev => prev.filter(item => item.id !== id));
      setExpanded(current => (current === id ? null : current));
      setToast('Клиент удалён');
    } catch (error) {
      setToast(`Не удалось удалить: ${error.message}`);
    } finally {
      setSavingId('');
    }
  }

  async function notifyTelegram(payload) {
    try {
      await requestJson('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, chatId: tgUser?.chatId || null }),
      });
    } catch {}
  }

  async function connectTelegram() {
    const username = tgInput.replace(/^@/, '').trim();
    if (!username) return;
    setTgStatus('loading');
    try {
      const data = await requestJson('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (data.status === 'found') {
        const user = { username, chatId: data.chatId, firstName: data.firstName };
        setTgUser(user);
        localStorage.setItem(TG_STORAGE_KEY, JSON.stringify(user));
        setTgStatus('ok');
        setTgInput('');
        setToast('Telegram подключён');
      } else {
        setTgStatus(data.status === 'bot_not_configured' ? 'not_configured' : 'not_found');
      }
    } catch (error) {
      setTgStatus(error.message === 'api_not_available' ? 'api_unavailable' : 'error');
    }
  }

  function disconnectTelegram() {
    setTgUser(null);
    localStorage.removeItem(TG_STORAGE_KEY);
    setTgStatus('idle');
    setTgInput('');
    setToast('Telegram отключён');
  }

  function toggleExpanded(client) {
    setExpanded(current => {
      const next = current === client.id ? null : client.id;
      if (next) setNoteDrafts(prev => (client.id in prev ? prev : { ...prev, [client.id]: client.notes || '' }));
      return next;
    });
  }

  function jumpToClient(clientId) {
    const client = clients.find(item => item.id === clientId);
    if (!client) return;
    setExpanded(clientId);
    setNoteDrafts(prev => (clientId in prev ? prev : { ...prev, [clientId]: client.notes || '' }));
    requestAnimationFrame(() => {
      document.getElementById(`client-row-${clientId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  return (
    <main className="page">
      {toast && <div className="toast">{toast}</div>}

      <header className="topbar">
        <div className="brand-block">
          <span className="eyebrow">Legal CRM · automation portfolio</span>
          <h1>Дела, клиенты и автоматизация</h1>
        </div>
        <div className="top-actions">
          <SourceBadge source={source} error={sourceError} />
          <button className={`btn-secondary btn-telegram ${tgUser ? 'success' : ''}`} onClick={() => setSettingsOpen(value => !value)}>
            {tgUser ? <Bell size={16} /> : <Bot size={16} />}
            <span>{tgUser ? `Telegram: @${tgUser.username}` : 'Telegram-уведомления'}</span>
          </button>
          <button className="btn-primary" onClick={() => setFormOpen(value => !value)}>
            {formOpen ? <X size={16} /> : <Plus size={16} />}
            <span>{formOpen ? 'Закрыть' : 'Новый клиент'}</span>
          </button>
        </div>
      </header>

      {settingsOpen && (
        <section className="settings-panel">
          <div className="section-title">
            <MessageCircle size={18} />
            <span>Telegram-уведомления</span>
          </div>
          {tgUser ? (
            <div className="tg-connected-info">
              <span className="tg-badge"><CheckCircle2 size={15} /> @{tgUser.username}{tgUser.firstName ? ` (${tgUser.firstName})` : ''}</span>
              <span className="tg-desc">Новые лиды отправляются в подключённый Telegram.</span>
              <button className="btn-ghost compact" onClick={disconnectTelegram}>Отключить</button>
            </div>
          ) : (
            <div className="tg-connect-form">
              <p>Напишите любое сообщение боту <a href="https://t.me/dostupnoe_pravo_bot" target="_blank" rel="noopener noreferrer">@dostupnoe_pravo_bot</a>, затем введите свой username.</p>
              <div className="tg-input-row">
                <span>@</span>
                <input value={tgInput} placeholder="username" onChange={e => { setTgInput(e.target.value.replace(/^@/, '')); setTgStatus('idle'); }} onKeyDown={e => e.key === 'Enter' && connectTelegram()} />
                <button className="btn-primary compact" onClick={connectTelegram} disabled={tgStatus === 'loading' || !tgInput.trim()}>{tgStatus === 'loading' ? '...' : 'Подключить'}</button>
              </div>
              {tgStatus === 'not_configured' && <p className="form-error">На сервере не задан TELEGRAM_BOT_TOKEN.</p>}
              {tgStatus === 'not_found' && <p className="form-error">Пользователь не найден в последних сообщениях бота.</p>}
              {tgStatus === 'api_unavailable' && <p className="form-error">Локальный Vite-сервер не запускает /api. Для Telegram откройте проект через vercel dev.</p>}
              {tgStatus === 'error' && <p className="form-error">Ошибка соединения с Telegram API.</p>}
            </div>
          )}
        </section>
      )}

      <section className="metrics-grid">
        <MetricCard label="Воронка" value={clients.length} hint="клиентов в базе" />
        <MetricCard label="В работе" value={inAutomation} hint="активных дел" />
        <MetricCard label="Срочно" value={urgentCount} hint="нужен быстрый ответ" />
        <div className="demo-runner">
          <div>
            <span>Сценарий</span>
            <strong>Автоплей: новые клиенты, статусы, задачи и дедлайны каждые 5 сек</strong>
            {demoStep > 0 && <small className="demo-step-counter">Шаг {Math.min(demoStep, DEMO_AUTOPLAY_STEPS)} / {DEMO_AUTOPLAY_STEPS}</small>}
          </div>
          <div className="demo-controls">
            <button
              type="button"
              className={`chip-toggle ${demoSendStatus ? 'on' : ''}`}
              onClick={() => setDemoSendStatus(value => !value)}
              title="Слать в Telegram уведомления о смене статуса во время демо"
            >
              <Bell size={13} />
              <span>Статусы</span>
            </button>
            <button
              type="button"
              className={`chip-toggle ${demoSendTasks ? 'on' : ''}`}
              onClick={() => setDemoSendTasks(value => !value)}
              title="Слать в Telegram уведомления о выполнении задач во время демо"
            >
              <Bell size={13} />
              <span>Задачи</span>
            </button>
            <button className="btn-dark" onClick={toggleDemoPlay} disabled={savingId === 'create'}>
              {demoPlaying ? <Pause size={16} /> : <Play size={16} />}
              <span>{demoLabel}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="category-panel">
        <div className="section-title inline-title">
          <Tag size={18} />
          <span>Категории дел</span>
          <button className="btn-secondary compact" onClick={() => setCategoryFormOpen(value => !value)}>
            {categoryFormOpen ? <X size={15} /> : <Plus size={15} />}
            <span>{categoryFormOpen ? 'Закрыть' : 'Добавить категорию'}</span>
          </button>
        </div>
        <div className="category-strip">
          {categoryOptions.map(category => <span key={category.id} className={`category-pill ${categoryTone(category)}`}><span>{category.title}</span><small>{partyTypeLabel(category.partyType)}</small></span>)}
        </div>
        {categoryFormOpen && (
          <form className="category-form" onSubmit={addCategory}>
            <label className="field">
              <span>Название</span>
              <input value={categoryForm.title} onChange={e => setCategoryForm({ ...categoryForm, title: e.target.value })} placeholder="Например: Наследство" required />
            </label>
            <label className="field small-field">
              <span>Тип клиента</span>
              <select value={categoryForm.partyType} onChange={e => setCategoryForm({ ...categoryForm, partyType: e.target.value })}>
                <option value="person">Физлицо</option>
                <option value="business">Юрлицо</option>
              </select>
            </label>
            <label className="field">
              <span>Ответственный</span>
              <input value={categoryForm.owner} onChange={e => setCategoryForm({ ...categoryForm, owner: e.target.value })} placeholder="Юрист по наследству" />
            </label>
            <label className="field small-field">
              <span>Дедлайн, ч</span>
              <input type="number" min="1" value={categoryForm.deadlineHours} onChange={e => setCategoryForm({ ...categoryForm, deadlineHours: e.target.value })} />
            </label>
            <label className="field">
              <span>Документ</span>
              <input value={categoryForm.document} onChange={e => setCategoryForm({ ...categoryForm, document: e.target.value })} placeholder="Пакет документов" />
            </label>
            <label className="field wide-field">
              <span>Стартовые задачи, каждая с новой строки</span>
              <textarea value={categoryForm.checklist} onChange={e => setCategoryForm({ ...categoryForm, checklist: e.target.value })} placeholder={'Проверить документы\nНазначить консультацию'} />
            </label>
            <button className="btn-primary" type="submit"><Save size={16} /><span>Сохранить категорию</span></button>
          </form>
        )}
      </section>

      <section className="agenda-panel">
        <div className="section-title inline-title">
          <CalendarDays size={18} />
          <span>Календарь дедлайнов</span>
          {overdueCount > 0 && <span className="agenda-overdue-pill">⚠ {overdueCount} просрочено</span>}
        </div>

        {agendaItems.length === 0 ? (
          <div className="empty side">Открытых дедлайнов нет — можно выдохнуть 😌</div>
        ) : (
          <>
            <div className="agenda-strip">
              {agendaDayStrip.map(cell => {
                const isActive = agendaDayFilter && new Date(agendaDayFilter).toDateString() === cell.date.toDateString();
                return (
                  <button
                    key={cell.date.toISOString()}
                    type="button"
                    className={`agenda-day agenda-day-${cell.bucket} ${isActive ? 'active' : ''}`}
                    onClick={() => setAgendaDayFilter(current => (
                      current && new Date(current).toDateString() === cell.date.toDateString() ? null : cell.date
                    ))}
                    title={`${cell.date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}: ${cell.count} задач`}
                  >
                    <span className="agenda-day-emoji">{BUCKET_EMOJI[cell.bucket]}</span>
                    <span className="agenda-day-bar" style={{ '--count': String(Math.min(cell.count, 6)) }} />
                    <span className="agenda-day-num">{cell.date.getDate()}</span>
                    <span className="agenda-day-name">{cell.date.toLocaleDateString('ru-RU', { weekday: 'short' })}</span>
                  </button>
                );
              })}
            </div>

            {agendaDayFilter && (
              <button type="button" className="btn-ghost compact agenda-clear-filter" onClick={() => setAgendaDayFilter(null)}>
                <X size={13} />
                <span>Показать все дни</span>
              </button>
            )}

            <div className="agenda-groups">
              {agendaGroups.filter(group => group.items.length).map(group => (
                <div key={group.key} className={`agenda-group agenda-group-${group.key}`}>
                  <div className="agenda-group-title">
                    <span className="agenda-emoji">{group.emoji}</span>
                    <span>{group.label}</span>
                    <strong>{group.items.length}</strong>
                  </div>
                  {group.items.map(item => (
                    <button key={item.id} type="button" className="agenda-item" onClick={() => jumpToClient(item.clientId)}>
                      <span className="avatar">{item.clientName[0]}</span>
                      <span className="agenda-item-body">
                        <strong>{item.title}</strong>
                        <small>{item.clientName} · {item.categoryTitle}</small>
                      </span>
                      <span className={`agenda-item-due ${item.hoursLeft < 0 ? 'overdue' : ''}`}>{relativeDueLabel(item.dueAt, now)}</span>
                    </button>
                  ))}
                </div>
              ))}
              {visibleAgendaItems.length === 0 && agendaDayFilter && (
                <div className="empty side">На этот день дедлайнов нет</div>
              )}
            </div>
          </>
        )}
      </section>

      <section className="workspace">
        <div className="left-pane">
          <div className="toolbar">
            <div className="filters">
              {['Все', ...STATUSES].map(status => (
                <button key={status} className={`counter-pill ${filter === status ? 'active' : ''} ${status !== 'Все' ? STATUS_META[status]?.color : ''}`} onClick={() => setFilter(status)}>
                  <span>{status}</span>
                  <strong>{counts[status] ?? 0}</strong>
                </button>
              ))}
            </div>
            <button className="btn-secondary compact export-btn" onClick={exportToExcel} disabled={!enrichedClients.length}>
              <Download size={15} />
              <span>Экспорт Excel</span>
            </button>
            <label className="search-box">
              <Search size={16} />
              <input placeholder="Поиск по делу, телефону, категории" value={search} onChange={e => setSearch(e.target.value)} />
            </label>
          </div>

          {formOpen && (
            <form className="add-form" onSubmit={addClient}>
              <div className="form-row">
                <label className="field">
                  <span>Имя клиента</span>
                  <input placeholder="Сергей Иванов" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </label>
                <label className="field">
                  <span>Телефон</span>
                  <input
                    ref={phoneRef}
                    placeholder="8(900)-000-00-01"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
                    onKeyDown={e => {
                      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
                      e.preventDefault();
                      setForm(prev => ({ ...prev, phone: formatPhoneDigits(extractPhoneDigits(prev.phone).slice(0, -1)) }));
                    }}
                    inputMode="tel"
                  />
                </label>
                <label className="field">
                  <span>Категория</span>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    {categoryOptions.map(category => <option key={category.id} value={category.id}>{category.title}</option>)}
                  </select>
                </label>
                <label className="field small-field">
                  <span>Статус</span>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(status => <option key={status}>{status}</option>)}
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Суть обращения</span>
                <input placeholder="Например: ДТП, страховая занизила выплату" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </label>
              <div className="switch-row">
                <label><input type="checkbox" checked={form.notifyStatusChanges} onChange={e => setForm({ ...form, notifyStatusChanges: e.target.checked })} /> Уведомлять в Telegram о смене статуса</label>
                <label><input type="checkbox" checked={form.notifyTaskDone} onChange={e => setForm({ ...form, notifyTaskDone: e.target.checked })} /> Уведомлять в Telegram о выполнении задач</label>
              </div>
              <div className="form-footer">
                <button className="btn-primary" type="submit" disabled={savingId === 'create'}>
                  <Plus size={16} />
                  <span>{savingId === 'create' ? 'Сохраняю' : 'Добавить'}</span>
                </button>
                <button className="btn-ghost" type="button" onClick={() => setFormOpen(false)}>Отмена</button>
              </div>
            </form>
          )}

          <div className="table-wrap">
            {loading ? (
              <div className="empty">Загрузка клиентов...</div>
            ) : visible.length === 0 ? (
              <div className="empty">Клиенты не найдены</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Категория</th>
                    <th>Статус</th>
                    <th>Задачи</th>
                    <th>Дедлайн</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(client => {
                    const draft = noteDrafts[client.id] ?? client.notes;
                    const isDirty = draft !== client.notes;
                    const doneTasks = client.tasks.filter(task => task.done).length;
                    const nearestTask = nearestOpenTask(client.tasks) || client.tasks[0];
                    return (
                      <React.Fragment key={client.id}>
                        <tr id={`client-row-${client.id}`} className={expanded === client.id ? 'row-expanded' : ''} onClick={() => toggleExpanded(client)}>
                          <td data-label="Клиент">
                            <div className="client-name">
                              <span className="avatar">{client.name[0]}</span>
                              <div>
                                <strong>{client.name}</strong>
                                <small>{client.phone || 'телефон не указан'}</small>
                              </div>
                              {client.automation.priority === 'Высокий' && (
                                <span className="priority hot" title="Нужен быстрый ответ">Срочно</span>
                              )}
                              <button
                                className="icon-btn danger"
                                onClick={e => { e.stopPropagation(); removeClient(client.id); }}
                                disabled={savingId === client.id}
                                aria-label="Удалить клиента"
                                title="Удалить"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                          <td data-label="Категория" onClick={e => e.stopPropagation()}>
                            <select className={`category-select ${categoryTone(client.automation)}`} value={client.categoryId} onChange={e => updateCategory(client.id, e.target.value)} disabled={savingId === client.id}>
                              {categoryOptions.map(category => <option key={category.id} value={category.id}>{category.title}</option>)}
                            </select>
                          </td>
                          <td data-label="Статус" onClick={e => e.stopPropagation()}>
                            <select className={`status-select ${STATUS_META[client.status]?.color}`} value={client.status} onChange={e => updateStatus(client.id, e.target.value)} disabled={savingId === client.id}>
                              {STATUSES.map(status => <option key={status}>{status}</option>)}
                            </select>
                          </td>
                          <td data-label="Задачи"><span className="task-count">{doneTasks}/{client.tasks.length}</span></td>
                          <td data-label="Дедлайн" onClick={e => e.stopPropagation()}>
                            {nearestTask ? (
                              <input
                                className={`deadline-input ${client.automation.hoursLeft <= 0 && client.status !== 'Закрыт' ? 'overdue' : ''}`}
                                type="datetime-local"
                                value={toDateTimeLocal(nearestTask.dueAt)}
                                onChange={e => updateTask(client.id, nearestTask.id, { dueAt: fromDateTimeLocal(e.target.value) })}
                                disabled={savingId === client.id}
                              />
                            ) : <span className="deadline muted">Нет задач</span>}
                          </td>
                        </tr>
                        {expanded === client.id && (
                          <tr className="detail-row">
                            <td colSpan={5}>
                              <div className="detail-grid">
                                <div className="progress-steps">
                                  {STATUSES.map((status, index) => (
                                    <React.Fragment key={status}>
                                      <div className={`step ${STATUS_META[client.status].step >= index ? 'done' : ''}`}>
                                        <span>{STATUS_META[client.status].step >= index ? <CheckCircle2 size={14} /> : index + 1}</span>
                                        <strong>{status}</strong>
                                        <small>{STATUS_META[status].label}</small>
                                      </div>
                                      {index < 2 && <div className={`step-line ${STATUS_META[client.status].step > index ? 'done' : ''}`} />}
                                    </React.Fragment>
                                  ))}
                                </div>
                                <div className="notes-wrap" onClick={e => e.stopPropagation()}>
                                  <div className="switch-row vertical">
                                    <label><input type="checkbox" checked={client.notifyStatusChanges} onChange={e => updateNotifyFlag(client.id, 'notifyStatusChanges', e.target.checked)} /> Уведомлять о смене статуса</label>
                                    <label><input type="checkbox" checked={client.notifyTaskDone} onChange={e => updateNotifyFlag(client.id, 'notifyTaskDone', e.target.checked)} /> Уведомлять о выполнении задач</label>
                                  </div>
                                  <label>Заметка по делу</label>
                                  <textarea value={draft} onChange={e => setNoteDrafts(prev => ({ ...prev, [client.id]: e.target.value }))} placeholder="Добавьте контекст, документы, следующий шаг" />
                                  <button className="btn-secondary compact" onClick={() => saveNotes(client.id)} disabled={!isDirty || savingId === client.id}>
                                    <Save size={15} />
                                    <span>{savingId === client.id ? 'Сохраняю' : 'Сохранить заметку'}</span>
                                  </button>
                                </div>
                                <div className="task-board" onClick={e => e.stopPropagation()}>
                                  <div className="task-board-title"><strong>Задачи по клиенту</strong></div>
                                  {client.tasks.map((task, index) => (
                                    <div
                                      key={task.id}
                                      className={`task-row ${task.done ? 'done' : ''}`}
                                      draggable
                                      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task.id); }}
                                      onDragOver={e => e.preventDefault()}
                                      onDrop={e => { e.preventDefault(); reorderTask(client.id, e.dataTransfer.getData('text/plain'), task.id); }}
                                    >
                                      <span className="task-drag-handle" title="Перетащите, чтобы изменить порядок"><GripVertical size={14} /></span>
                                      <label className="task-check">
                                        <input type="checkbox" checked={task.done} onChange={() => updateTask(client.id, task.id, { done: !task.done })} disabled={savingId === client.id} />
                                        <span>{task.title}</span>
                                      </label>
                                      <input className="task-date" type="datetime-local" value={toDateTimeLocal(task.dueAt)} onChange={e => updateTask(client.id, task.id, { dueAt: fromDateTimeLocal(e.target.value) })} disabled={savingId === client.id} />
                                      <div className="task-reorder-btns">
                                        <button className="icon-btn compact" onClick={() => moveTask(client.id, task.id, -1)} disabled={savingId === client.id || index === 0} title="Переместить выше" aria-label="Переместить выше"><ChevronUp size={13} /></button>
                                        <button className="icon-btn compact" onClick={() => moveTask(client.id, task.id, 1)} disabled={savingId === client.id || index === client.tasks.length - 1} title="Переместить ниже" aria-label="Переместить ниже"><ChevronDown size={13} /></button>
                                      </div>
                                      <button className="icon-btn" onClick={() => removeTask(client.id, task.id)} disabled={savingId === client.id} title="Удалить задачу"><Trash2 size={14} /></button>
                                    </div>
                                  ))}
                                  <div className="task-add-row">
                                    <input value={taskInputs[client.id] || ''} onChange={e => setTaskInputs(prev => ({ ...prev, [client.id]: e.target.value }))} placeholder="Новая задача" onKeyDown={e => e.key === 'Enter' && addTask(client.id)} />
                                    <button className="btn-primary compact" onClick={() => addTask(client.id)} disabled={savingId === client.id || !(taskInputs[client.id] || '').trim()}><Plus size={15} /><span>Добавить</span></button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </section>

      <footer className="foot">
        <span>{visible.length} из {clients.length} клиентов</span>
        <span>{source === 'supabase' ? 'Данные синхронизируются через Vercel API и Supabase' : 'Тестовые данные сохраняются в браузере'}</span>
        {source === 'demo' && <button className="btn-ghost compact" onClick={resetDemoData}>Сбросить demo</button>}
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

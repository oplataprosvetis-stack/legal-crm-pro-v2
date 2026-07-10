import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const STATUSES = ['Новый', 'В работе', 'Закрыт'];
const STATUS_META = {
  'Новый':    { color: 'status-new',    step: 0 },
  'В работе': { color: 'status-active', step: 1 },
  'Закрыт':  { color: 'status-done',   step: 2 },
};
const DEMO = [
  { id: 'd1', name: 'Анна Петрова',  phone: '+7 900 123-45-67', status: 'Новый',    notes: 'ДТП, нужна консультация',     createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'd2', name: 'ООО Север',      phone: '+7 343 222-10-10', status: 'В работе', notes: 'Трудовой спор с сотрудником',  createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'd3', name: 'Илья Смирнов',  phone: '+7 912 555-44-33', status: 'Закрыт',   notes: '',                             createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
];

function uid() { return window.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()); }
function load() { try { const s = localStorage.getItem('lcrm-v2'); return s ? JSON.parse(s) : DEMO; } catch { return DEMO; } }
function loadTg() { try { return JSON.parse(localStorage.getItem('lcrm-tg') || 'null'); } catch { return null; } }
function fmt(iso) { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }); }

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
function formatPhone(raw) { return formatPhoneDigits(extractPhoneDigits(raw)); }

function App() {
  const [clients, setClients]   = React.useState(load);
  const [form, setForm]         = React.useState({ name: '', phone: '+7', status: 'Новый', notes: '' });
  const [filter, setFilter]     = React.useState('Все');
  const [search, setSearch]     = React.useState('');
  const [toast, setToast]       = React.useState('');
  const [expanded, setExpanded] = React.useState(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [tgUser, setTgUser]     = React.useState(loadTg);   // { username, chatId, firstName }
  const [tgInput, setTgInput]   = React.useState('');
  const [tgStatus, setTgStatus] = React.useState('idle');   // idle | loading | ok | error | not_found
  const phoneRef = React.useRef(null);

  React.useEffect(() => { localStorage.setItem('lcrm-v2', JSON.stringify(clients)); }, [clients]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t); }, [toast]);
  React.useEffect(() => {
    const el = phoneRef.current;
    if (el === document.activeElement) el.setSelectionRange(el.value.length, el.value.length);
  }, [form.phone]);

  const counts = STATUSES.reduce((a, s) => ({ ...a, [s]: clients.filter(c => c.status === s).length }), { 'Все': clients.length });
  const visible = clients.filter(c => {
    const mf = filter === 'Все' || c.status === filter;
    const ms = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return mf && ms;
  });

  async function addClient(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    const client = { id: uid(), ...form, name: form.name.trim(), phone: form.phone === '+7' ? '' : form.phone, createdAt: new Date().toISOString() };
    setClients(prev => [client, ...prev]);
    setForm({ name: '', phone: '+7', status: 'Новый', notes: '' });
    setFormOpen(false);
    setToast(`Клиент "${client.name}" добавлен`);
    notifyTelegram(client);
  }

  function updateStatus(id, status) { setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c)); setToast('Статус обновлён'); }
  function updateNotes(id, notes)   { setClients(prev => prev.map(c => c.id === id ? { ...c, notes } : c)); }
  function remove(id) { setClients(prev => prev.filter(c => c.id !== id)); setToast('Клиент удалён'); setExpanded(null); }

  async function notifyTelegram(client) {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...client, chatId: tgUser?.chatId || null }),
      });
    } catch {}
  }

  async function connectTelegram() {
    const username = tgInput.replace(/^@/, '').trim();
    if (!username) return;
    setTgStatus('loading');
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (data.status === 'found') {
        const user = { username, chatId: data.chatId, firstName: data.firstName };
        setTgUser(user);
        localStorage.setItem('lcrm-tg', JSON.stringify(user));
        setTgStatus('ok');
        setTgInput('');
        setToast('Telegram подключён!');
      } else {
        setTgStatus('not_found');
      }
    } catch {
      setTgStatus('error');
    }
  }

  function disconnectTelegram() {
    setTgUser(null);
    localStorage.removeItem('lcrm-tg');
    setTgStatus('idle');
    setTgInput('');
    setToast('Telegram отключён');
  }

  return (
    <main className="page">
      {toast && <div className="toast">{toast}</div>}

      <header className="top">
        <div>
          <p className="eyebrow">LegalTech · Доступное право</p>
          <h1>Мои клиенты</h1>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button
            className={`btn-tg-toggle ${tgUser ? 'tg-connected' : ''}`}
            onClick={() => setSettingsOpen(o => !o)}
            title="Настройки Telegram-уведомлений"
          >
            <span className="btn-tg-icon">{tgUser ? '🔔' : '📲'}</span>
            {tgUser ? `@${tgUser.username}` : 'Подключить уведомления'}
          </button>
          <button className="btn-primary" onClick={() => setFormOpen(o => !o)}>
            {formOpen ? '✕ Закрыть' : '+ Добавить клиента'}
          </button>
        </div>
      </header>

      {settingsOpen && (
        <div className="settings-panel">
          <p className="settings-title">Telegram-уведомления</p>
          {tgUser ? (
            <div className="tg-connected-info">
              <span className="tg-badge">✓ @{tgUser.username}{tgUser.firstName ? ` (${tgUser.firstName})` : ''}</span>
              <span className="tg-desc">Уведомления о новых клиентах приходят вам в Telegram</span>
              <button className="btn-ghost btn-sm" onClick={disconnectTelegram}>Отключить</button>
            </div>
          ) : (
            <div className="tg-connect-form">
              <p className="tg-hint">
                1. Напишите любое сообщение боту{' '}
                <a href="https://t.me/dostupnoe_pravo_bot" target="_blank" rel="noopener noreferrer" className="tg-bot-link">
                  @dostupnoe_pravo_bot
                </a>{' '}
                в Telegram<br/>
                2. Введите ваш @логин ниже и нажмите «Подключить»
              </p>
              <div className="tg-input-row">
                <span className="tg-at">@</span>
                <input
                  className="tg-input"
                  placeholder="ваш_логин"
                  value={tgInput}
                  onChange={e => { setTgInput(e.target.value.replace(/^@/, '')); setTgStatus('idle'); }}
                  onKeyDown={e => e.key === 'Enter' && connectTelegram()}
                />
                <button
                  className="btn-primary btn-sm"
                  onClick={connectTelegram}
                  disabled={tgStatus === 'loading' || !tgInput.trim()}
                >
                  {tgStatus === 'loading' ? '...' : 'Подключить'}
                </button>
              </div>
              {tgStatus === 'not_found' && (
                <p className="tg-error">Не нашли вас. Сначала напишите боту @dostupnoe_pravo_bot в Telegram, потом попробуйте снова.</p>
              )}
              {tgStatus === 'error' && (
                <p className="tg-error">Ошибка соединения. Попробуйте ещё раз.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="counters">
        {['Все', ...STATUSES].map(s => (
          <button key={s} className={`counter-pill ${filter === s ? 'active' : ''} ${s !== 'Все' ? STATUS_META[s]?.color : ''}`}
            onClick={() => setFilter(s)}>
            <span className="pill-label">{s}</span>
            <span className="pill-count">{counts[s] ?? 0}</span>
          </button>
        ))}
        <input className="search" placeholder="Поиск по имени или телефону…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {formOpen && (
        <form className="add-form" onSubmit={addClient}>
          <div className="form-row">
            <div className="field">
              <label>Имя клиента *</label>
              <input placeholder="Сергей Иванов" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Телефон</label>
              <input
                ref={phoneRef}
                placeholder="+7(900)-000-00-00"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })}
                onKeyDown={e => {
                  if (e.key !== 'Backspace' && e.key !== 'Delete') return;
                  e.preventDefault();
                  setForm(f => ({ ...f, phone: formatPhoneDigits(extractPhoneDigits(f.phone).slice(0, -1)) }));
                }}
                onFocus={e => { const v = e.target.value; requestAnimationFrame(() => e.target.setSelectionRange(v.length, v.length)); }}
                inputMode="tel"
              />
            </div>
            <div className="field field-sm">
              <label>Статус</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Заметка</label>
            <input placeholder="Кратко о деле" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="form-footer">
            <button type="submit" className="btn-primary">Добавить</button>
            <button type="button" className="btn-ghost" onClick={() => setFormOpen(false)}>Отмена</button>
          </div>
        </form>
      )}

      <div className="table-wrap">
        {visible.length === 0 ? (
          <div className="empty">{search || filter !== 'Все' ? 'Клиентов не найдено' : 'Добавьте первого клиента'}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{width:'32%'}}>Клиент</th>
                <th style={{width:'18%'}}>Телефон</th>
                <th style={{width:'22%'}}>Статус</th>
                <th style={{width:'14%'}}>Добавлен</th>
                <th style={{width:'14%'}}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(c => (
                <React.Fragment key={c.id}>
                  <tr className={expanded === c.id ? 'row-expanded' : ''} onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <td>
                      <div className="client-name">
                        <span className="avatar">{c.name[0]}</span>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="muted">{c.phone || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <select className={`status-sel ${STATUS_META[c.status]?.color}`}
                        value={c.status} onChange={e => updateStatus(c.id, e.target.value)}>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="muted small">{fmt(c.createdAt)}</td>
                    <td className="actions" onClick={e => e.stopPropagation()}>
                      <button className="btn-icon danger" onClick={() => remove(c.id)} title="Удалить">✕</button>
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr className="detail-row">
                      <td colSpan={5}>
                        <div className="detail">
                          <div className="progress-steps">
                            {STATUSES.map((s, i) => (
                              <React.Fragment key={s}>
                                <div className={`step ${STATUS_META[c.status].step >= i ? 'done' : ''}`}>
                                  <div className="step-dot">{STATUS_META[c.status].step >= i ? '✓' : i + 1}</div>
                                  <span>{s}</span>
                                </div>
                                {i < 2 && <div className={`step-line ${STATUS_META[c.status].step > i ? 'done' : ''}`} />}
                              </React.Fragment>
                            ))}
                          </div>
                          <div className="notes-wrap">
                            <label className="notes-label">Заметка</label>
                            <textarea placeholder="Добавьте заметку по делу…"
                              value={c.notes}
                              onChange={e => updateNotes(c.id, e.target.value)}
                              onClick={e => e.stopPropagation()} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <footer className="foot">
        <span>{visible.length} из {clients.length} клиентов</span>
        <span>{tgUser ? `🔔 @${tgUser.username}` : 'Данные хранятся в браузере'}</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

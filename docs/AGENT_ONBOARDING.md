# Agent onboarding: Legal CRM Automation Portfolio

Этот файл предназначен для разработчика или AI-агента, который продолжает работу над проектом. README написан для человека-проверяющего; здесь — техническая карта проекта, стек, точки входа и подводные камни.

## Назначение проекта

`legal-crm-pro-v2` — Vite/React портфолио-приложение для демонстрации автоматизации юридической CRM.

Цель проекта: показать end-to-end workflow, а не только CRUD:

1. Клиент создаётся или добавляется из demo-сценария.
2. Приложение определяет категорию дела.
3. Категория даёт ответственного, документ, базовый SLA и чеклист.
4. У клиента есть задачи с дедлайнами.
5. Смена статуса и выполнение задачи могут отправлять Telegram-уведомления.
6. Данные сохраняются в Supabase через Vercel API или локально в demo-mode.

## Быстрый порядок чтения

1. `README.md` — публичное описание проекта.
2. `src/main.jsx` — вся бизнес-логика фронтенда и React-компоненты.
3. `src/styles.css` — весь UI и адаптивность.
4. `api/clients.js` — Supabase CRUD endpoint.
5. `api/notify.js` — отправка Telegram-уведомлений.
6. `api/connect.js` — MVP-привязка Telegram username к chat id.
7. `package.json` — команды запуска.

## Стек

- React + Vite.
- Vercel serverless functions в `api/`.
- Supabase JS client используется только на серверной стороне.
- Telegram Bot API вызывается только из serverless API.
- Иконки: `lucide-react`.
- UI: обычный CSS без Tailwind/Material/Bootstrap.

## Команды

Фронтенд без Vercel API:

```bash
npm run dev
```

Важный нюанс: обычный Vite dev server не обслуживает `api/*`. В этом режиме `/api/clients`, `/api/notify`, `/api/connect` могут быть недоступны, и фронт перейдёт в demo-mode.

Vercel-like режим:

```bash
npm run dev:vercel
```

Production build:

```bash
npm run build
```

Синтаксическая проверка API:

```bash
node --check api\clients.js
node --check api\notify.js
node --check api\connect.js
```

## Environment variables

Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` или `SUPABASE_ANON_KEY`
- `SUPABASE_TABLE` опционально, по умолчанию `clients`

Telegram:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID` опционально, fallback-чат для уведомлений

Секреты не должны попадать во фронтенд. Фронт вызывает только локальные endpoints `/api/*`.

`.env`, `.env.local`, `.env*` и `.vercel` игнорируются в `.gitignore`.

## Supabase schema

Минимальная таблица:

```sql
create table if not exists public.clients (
  id text primary key,
  name text not null,
  phone text default '',
  status text not null default 'Новый' check (status in ('Новый', 'В работе', 'Закрыт')),
  category_id text default '',
  category_title text default '',
  notes text default '',
  tasks jsonb not null default '[]'::jsonb,
  notify_status_changes boolean not null default false,
  notify_task_done boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.clients add column if not exists category_id text default '';
alter table public.clients add column if not exists category_title text default '';
alter table public.clients add column if not exists tasks jsonb not null default '[]'::jsonb;
alter table public.clients add column if not exists notify_status_changes boolean not null default false;
alter table public.clients add column if not exists notify_task_done boolean not null default true;

create index if not exists clients_created_at_idx on public.clients (created_at desc);
```

API хранит snake_case поля в базе, фронт нормализует их в camelCase.

## API endpoints

### `api/clients.js`

Методы:

- `GET /api/clients` — список клиентов из Supabase.
- `POST /api/clients` — создать клиента.
- `PATCH /api/clients?id=<id>` — обновить клиента.
- `DELETE /api/clients?id=<id>` — удалить клиента.

Особенности:

- если нет Supabase env, возвращает `supabase_not_configured`;
- чистит строки и лимитирует длины;
- принимает `tasks` как JSON-массив;
- нормализует статусы только в `Новый`, `В работе`, `Закрыт`;
- использует `SUPABASE_TABLE || 'clients'`.

### `api/notify.js`

`POST /api/notify`

Типы уведомлений:

- `new_client`;
- `status_changed`;
- `task_done`.

Если `TELEGRAM_BOT_TOKEN` не задан, возвращает `not_configured` без падения. Если нет `chatId` и нет `TELEGRAM_CHAT_ID`, возвращает `no_chat_id`.

### `api/connect.js`

`POST /api/connect`

MVP-логика:

1. Пользователь пишет любое сообщение боту.
2. Фронт отправляет username.
3. API вызывает Telegram `getUpdates`.
4. API ищет username среди последних updates и возвращает `chatId`.

Это достаточно для портфолио, но не production-подход. Для production лучше делать `/start <token>` и хранить привязку на сервере.

## Frontend architecture

Основной файл: `src/main.jsx`.

Ключевые блоки:

- `STATUSES` / `STATUS_META` — статусы и визуальные метаданные.
- `CASE_TYPES` — базовые категории дел, включая `partyType` для цвета `Физлицо/Юрлицо`.
- `DEFAULT_CASE` — fallback-категория.
- `DEMO_SCENARIOS` — сценарии для кнопки demo.
- `scenarioToClient()` — превращает demo-сценарий в клиента.
- `normalizeClient()` — нормализация данных из Supabase/localStorage.
- `classifyClient(client, categories, now)` — выбор категории, дедлайна, приоритета. Принимает `now` (мс), чтобы `hoursLeft`/"Просрочено" пересчитывались по тикающему таймеру, а не замораживались на момент первого рендера.
- `enrichClient()` — добавляет клиенту automation-данные (`client.tasks` используется как есть, без синтетической подмены чеклистом — см. "Подводные камни").
- `requestClients()` — wrapper над `/api/clients`.
- `notifyTelegram()` — wrapper над `/api/notify`.
- `exportToExcel()` — CSV-экспорт клиентов и задач для открытия в Excel. `csvCell()` экранирует ведущие `=`, `+`, `-`, `@` (защита от formula injection).
- `reorderTask()` / `moveTask()` — смена порядка задач: drag-and-drop (desktop, нативный HTML5 DnD) и кнопки ▲▼ (везде, включая мобильные — HTML5 DnD ненадёжен на touch).

Состояние хранится в React state. Demo-данные и локальные категории сохраняются в `localStorage`.

LocalStorage keys:

- `lcrm-v2-demo` — demo-клиенты;
- `lcrm-categories` — пользовательские категории;
- `lcrm-tg` — Telegram-привязка.

## Data model на фронте

Клиент:

```js
{
  id,
  name,
  phone,
  status,
  categoryId,
  categoryTitle,
  notes,
  tasks,
  notifyStatusChanges,
  notifyTaskDone,
  createdAt
}
```

Задача:

```js
{
  id,
  title,
  done,
  dueAt,
  createdAt,
  doneAt
}
```

Категория:

```js
{
  id,
  title,
  owner,
  deadlineHours,
  partyType, // 'person' или 'business'
  document,
  keywords,
  checklist
}
```

## Demo-mode

Demo-mode включается, если `/api/clients` недоступен или возвращает ошибку.

Это нормальное поведение для `npm run dev`, потому что Vite не поднимает Vercel functions.

Не считать `Demo mode` ошибкой, если запуск идёт через Vite. Для проверки Supabase/API использовать `npm run dev:vercel` или деплой на Vercel.

Кнопка `Запустить демо` добавляет следующий сценарий из `DEMO_SCENARIOS`. Телефоны генерируются фейковые через `fakePhone()` в формате вроде `8(900)-000-00-01`.

## UI и адаптивность

Основной файл: `src/styles.css`.

Последняя логика адаптивности:

- desktop: `workspace` в одну колонку, таблица на всю ширину;
- правый сайдбар удалён из JSX, потому что дублировал раскрытую строку и съедал ширину;
- таблица использует `table-layout: fixed`;
- на `max-width: 920px` таблица превращается в карточки;
- на `max-width: 640px` формы и задачи перестраиваются в один столбец.

Важное UI-решение: категория, статус и дедлайн редактируются inline в строке, чтобы не загромождать экран отдельными панелями.

Цвета категорий идут от `partyType`:

- `business` / `Юрлицо` — фиолетовый;
- `person` / `Физлицо` — розовый.

Цвета намеренно НЕ пересекаются с палитрой статусов (`.status-new` синий, `.status-active` жёлтый, `.status-done` зелёный) — раньше категории использовали те же синий/зелёный, что и статусы, и это визуально путало. Если меняешь палитру статусов или категорий — держи их различимыми.

## Telegram-поведение

У клиента есть два флага:

- `notifyStatusChanges`;
- `notifyTaskDone`.

`updateStatus()` отправляет `status_changed`, если флаг включён.

`updateTask()` отправляет `task_done`, если задача была переведена из `done=false` в `done=true` и флаг включён.

Создание клиента отправляет `new_client`, если подключён Telegram/fallback chat id.

## Подводные камни

- `npm run dev` не равно Vercel runtime. Для `/api/*` нужен `npm run dev:vercel`.
- Не переносить Supabase ключи во фронт. Только serverless API.
- `TELEGRAM_BOT_TOKEN` может отсутствовать: это не должно ломать UI.
- `api/connect.js` зависит от Telegram `getUpdates`; если пользователь не писал боту, username не найдётся.
- `datetime-local` работает в локальном времени браузера, а хранение идёт в ISO.
- Supabase хранит snake_case, фронт работает с camelCase.
- Экспорт в Excel сделан без зависимости: это CSV с BOM и sep=;, чтобы Excel корректно открыл русские заголовки и колонки.
- Demo-категории и demo-клиенты могут быть в `localStorage`; при странном состоянии нажать `Сбросить demo` или очистить localStorage.
- Все данные демонстрационные. Не добавлять реальные персональные данные в seed/demo.
- Проект рассчитан на Vercel. Если деплоить иначе, нужно отдельно обеспечить serverless API routing.
- Пользовательские категории (`lcrm-categories`) живут только в `localStorage` браузера, НЕ в Supabase. В live-режиме категория, добавленная в одном браузере, не будет видна в другом — клиент с этой категорией всё равно отрендерится (категория реконструируется из `categoryId`/`categoryTitle` самого клиента), но потеряет кастомный чеклист/дедлайн/ответственного для новых клиентов в другом браузере. Известное ограничение, не баг.
- `client.tasks` больше НЕ подменяется чеклистом категории на лету, если пуст (раньше `tasksForClient()` делала это при каждом рендере — баг: удаление последней задачи тут же возвращало дефолтный чеклист с новыми случайными id). Чеклист категории применяется только один раз, при создании клиента (`addClientFromPayload`). Если тебе нужно "пустой список задач = дефолтный чеклист", делай это явно в момент создания, не в `classifyClient`/`enrichClient`.
- `.table-wrap` должен оставаться `overflow-x: auto` (не `visible` и не `hidden`) — `visible` ломает горизонтальный скролл на всю страницу вместо контейнера, `hidden` иногда обрезает нативные `<select>`-дропдауны.
- CSS-переменные вроде `var(--card)`/`var(--border)` использовались в мобильном брейкпоинте без объявления в `:root` — рендерились как невалидные (пустой фон/рамка). Если добавляешь `var(--x)`, either объяви его в `:root`, либо используй литерал.

## Проверка перед сдачей

Минимум:

```bash
npm run build
node --check api\clients.js
node --check api\notify.js
node --check api\connect.js
```

Если менялся UI, желательно вручную проверить:

- desktop ширину;
- ширину около 920px;
- мобильную ширину около 390px;
- раскрытие строки клиента;
- inline смену категории, статуса и дедлайна;
- добавление и выполнение задачи;
- demo-mode;
- live Supabase mode через Vercel runtime.

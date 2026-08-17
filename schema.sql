-- Схема базы заявок. Применяется командой:
--   npx wrangler d1 execute koza-bookings --file schema.sql --remote

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,

  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  service TEXT,
  -- Желаемые дата и время как их выбрал клиент: дата в виде ГГГГ-ММ-ДД.
  date TEXT,
  time TEXT,
  comment TEXT,

  -- new — новая, confirmed — подтверждена, declined — отклонена, done — состоялась
  status TEXT NOT NULL DEFAULT 'new',
  decided_at TEXT,

  -- Одноразовый код, по которому клиент подписывается на бота.
  -- Обнуляется сразу после привязки чата.
  claim_token TEXT UNIQUE,
  -- Чат клиента в телеграме, если он подписался. Пока пусто — писать ему нельзя.
  client_chat_id TEXT,
  -- Отметка, что подтверждение клиенту уже ушло: защита от повторной отправки.
  client_notified_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at);

-- Попытки входа в приложение — чтобы пароль нельзя было спокойно перебирать.
CREATE TABLE IF NOT EXISTS login_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_at ON login_attempts (at);

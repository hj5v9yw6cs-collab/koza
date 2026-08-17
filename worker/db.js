// Схема базы и её создание.
//
// Таблицы заводятся сами при первом обращении к API: так не нужно вручную
// выполнять SQL в панели Cloudflare, и новая база сразу готова к работе.
// Все запросы идемпотентны, поэтому параллельные вызовы друг другу не мешают.

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS bookings (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at TEXT NOT NULL,

     name TEXT NOT NULL,
     contact TEXT NOT NULL,
     service TEXT,
     -- Дата в виде ГГГГ-ММ-ДД, время строкой вида 14:00.
     date TEXT,
     time TEXT,
     comment TEXT,

     -- new — новая, confirmed — подтверждена, declined — отклонена, done — состоялась
     status TEXT NOT NULL DEFAULT 'new',
     decided_at TEXT,

     -- Одноразовый код, по которому клиент подписывается на бота.
     claim_token TEXT UNIQUE,
     -- Чат клиента в телеграме. Пока пусто — писать ему нельзя.
     client_chat_id TEXT,
     -- Отметка, что подтверждение ушло: защита от повторной отправки.
     client_notified_at TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at)`,

  // Попытки входа — чтобы пароль от приложения нельзя было спокойно перебирать.
  `CREATE TABLE IF NOT EXISTS login_attempts (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     at TEXT NOT NULL,
     ip TEXT
   )`,
  `CREATE INDEX IF NOT EXISTS idx_login_attempts_at ON login_attempts (at)`,
]

// Внутри одного изолята достаточно проверить схему единожды.
let ready = null

async function run(env) {
  try {
    await env.DB.batch(MIGRATIONS.map((sql) => env.DB.prepare(sql)))
  } catch (err) {
    // Пачкой быстрее, но если база её не приняла — выполняем по одному.
    console.error('schema batch failed, applying one by one', err)
    for (const sql of MIGRATIONS) {
      await env.DB.prepare(sql).run()
    }
  }
}

export function ensureSchema(env) {
  if (!ready) {
    ready = run(env).catch((err) => {
      // Сбрасываем, чтобы следующий запрос попробовал снова, а не считал базу готовой.
      ready = null
      throw err
    })
  }
  return ready
}

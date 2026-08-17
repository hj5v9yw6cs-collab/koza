// Приём заявки с сайта: сохраняем в базу, уведомляем мастера в телеграме
// и отдаём клиенту одноразовую ссылку на бота, чтобы он мог получить
// подтверждение (бот не имеет права написать первым, пока клиент не нажал Start).

import { json, esc, clean, nowIso, randomToken, telegramCall, formatDate } from './lib.js'

const LIMITS = {
  name: 80,
  contact: 120,
  service: 80,
  date: 20,
  time: 20,
  comment: 1000,
}

// Имя бота нужно для ссылки вида t.me/<bot>?start=<код>. Спрашиваем Telegram
// один раз на изолят, чтобы не держать это в двух местах.
let cachedBotUsername = null

async function botUsername(env) {
  if (env.TELEGRAM_BOT_USERNAME) return env.TELEGRAM_BOT_USERNAME
  if (cachedBotUsername) return cachedBotUsername

  const { ok, data } = await telegramCall(env, 'getMe', {})
  if (!ok) return null

  cachedBotUsername = data.result?.username ?? null
  return cachedBotUsername
}

export async function handleBooking(request, env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({ ok: false, error: 'Форма ещё не настроена.' }, 500)
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return json({ ok: false, error: 'Некорректный запрос.' }, 400)
  }

  // Бот заполнил скрытое поле — тихо делаем вид, что всё хорошо.
  if (clean(payload.website, 100)) {
    return json({ ok: true })
  }

  const data = Object.fromEntries(
    Object.entries(LIMITS).map(([key, max]) => [key, clean(payload[key], max)]),
  )

  if (!data.name || !data.contact) {
    return json({ ok: false, error: 'Напиши имя и способ связи.' }, 400)
  }

  const claimToken = randomToken()

  const inserted = await env.DB.prepare(
    `INSERT INTO bookings (created_at, name, contact, service, date, time, comment, claim_token)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
     RETURNING id`,
  )
    .bind(
      nowIso(),
      data.name,
      data.contact,
      data.service || null,
      data.date || null,
      data.time || null,
      data.comment || null,
      claimToken,
    )
    .first()

  const id = inserted?.id

  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${esc(data.name)}`,
    `<b>Связь:</b> ${esc(data.contact)}`,
  ]

  if (data.service) lines.push(`<b>Услуга:</b> ${esc(data.service)}`)
  if (data.date || data.time) {
    const when = [formatDate(data.date), data.time].filter(Boolean).join(', ')
    lines.push(`<b>Когда:</b> ${esc(when)}`)
  }
  if (data.comment) lines.push('', `<b>Комментарий:</b> ${esc(data.comment)}`)
  lines.push('', 'Подтвердить или отклонить — в приложении.')

  // Заявка уже сохранена, поэтому сбой телеграма не должен её терять:
  // мастер увидит её в приложении, а клиент получит обычный ответ формы.
  const notified = await telegramCall(env, 'sendMessage', {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: lines.join('\n'),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  })

  if (!notified.ok) {
    console.error('booking saved but master not notified', id)
  }

  const bot = await botUsername(env)

  return json({
    ok: true,
    // Ссылка, по которой клиент подписывается на подтверждение.
    subscribe: bot && id ? `https://t.me/${bot}?start=${claimToken}` : null,
  })
}

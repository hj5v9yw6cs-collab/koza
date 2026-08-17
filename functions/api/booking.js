// Cloudflare Pages Function: принимает заявку с сайта и отправляет её в Telegram.
// Токен бота живёт только здесь, в переменных окружения Cloudflare, — в браузер не попадает.
//
// Нужные переменные (Cloudflare Pages → Settings → Environment variables):
//   TELEGRAM_BOT_TOKEN — токен от @BotFather
//   TELEGRAM_CHAT_ID   — id чата, куда падают заявки (свой личный или группы)

const LIMITS = {
  name: 80,
  contact: 120,
  service: 80,
  date: 20,
  time: 20,
  comment: 1000,
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })

// Сообщение уходит с parse_mode: 'HTML' — экранируем всё, что пришло от пользователя.
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Управляющие символы и лишние пробелы убираем, чтобы заявка не ломала разметку.
const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

async function handleBooking(request, env) {
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

  const lines = [
    '<b>Новая заявка с сайта</b>',
    '',
    `<b>Имя:</b> ${esc(data.name)}`,
    `<b>Связь:</b> ${esc(data.contact)}`,
  ]

  if (data.service) lines.push(`<b>Услуга:</b> ${esc(data.service)}`)
  if (data.date || data.time) {
    lines.push(`<b>Когда:</b> ${esc([data.date, data.time].filter(Boolean).join(' '))}`)
  }
  if (data.comment) lines.push('', `<b>Комментарий:</b> ${esc(data.comment)}`)

  try {
    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })

    if (!tg.ok) {
      console.error('telegram sendMessage failed', tg.status, await tg.text())
      return json({ ok: false, error: 'Не удалось отправить заявку.' }, 502)
    }

    return json({ ok: true })
  } catch (err) {
    console.error('telegram request error', err)
    return json({ ok: false, error: 'Не удалось отправить заявку.' }, 502)
  }
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Метод не поддерживается.' }, 405)
  }
  return handleBooking(request, env)
}

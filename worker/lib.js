// Мелкие общие помощники серверной части.

export const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  })

// Сообщение уходит в Telegram с parse_mode: 'HTML' — экранируем всё чужое.
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Управляющие символы и лишние пробелы убираем, чтобы текст не ломал разметку.
export const clean = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)

export const nowIso = () => new Date().toISOString()

export const randomToken = (bytes = 16) =>
  [...crypto.getRandomValues(new Uint8Array(bytes))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

// Сравнение без утечки времени: длина и все байты проверяются одинаково долго.
export function safeEqual(a, b) {
  const enc = new TextEncoder()
  const x = enc.encode(String(a ?? ''))
  const y = enc.encode(String(b ?? ''))
  if (x.length !== y.length) return false
  let diff = 0
  for (let i = 0; i < x.length; i += 1) diff |= x[i] ^ y[i]
  return diff === 0
}

export async function telegramCall(env, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    console.error('telegram', method, 'failed', res.status, JSON.stringify(data))
    return { ok: false, data }
  }
  return { ok: true, data }
}

// Даты показываем по-русски и в часовом поясе мастера, а не в UTC.
export const TIMEZONE = 'Asia/Yekaterinburg'

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
    timeZone: TIMEZONE,
  })
}

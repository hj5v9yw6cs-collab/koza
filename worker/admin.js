// API приложения мастера: список заявок и решения по ним.
// Все обработчики вызываются только после проверки входа в index.js.

import { json, clean, nowIso } from './lib.js'
import { notifyClient } from './telegram.js'

const STATUSES = ['new', 'confirmed', 'declined', 'done']

export async function listBookings(request, env) {
  const url = new URL(request.url)
  const status = url.searchParams.get('status')

  const where = STATUSES.includes(status) ? 'WHERE status = ?1' : ''
  const stmt = env.DB.prepare(
    `SELECT id, created_at, name, contact, service, date, time, comment, status,
            decided_at, client_chat_id IS NOT NULL AS client_subscribed,
            client_notified_at
     FROM bookings
     ${where}
     ORDER BY (date IS NULL), date ASC, time ASC, created_at DESC
     LIMIT 500`,
  )

  const { results } = await (where ? stmt.bind(status) : stmt).all()

  return json({
    ok: true,
    bookings: (results ?? []).map((b) => ({
      ...b,
      client_subscribed: !!b.client_subscribed,
    })),
  })
}

export async function decideBooking(request, env, id, status) {
  if (!STATUSES.includes(status)) {
    return json({ ok: false, error: 'Неизвестный статус.' }, 400)
  }

  const booking = await env.DB.prepare('SELECT * FROM bookings WHERE id = ?1').bind(id).first()

  if (!booking) return json({ ok: false, error: 'Заявка не найдена.' }, 404)

  await env.DB.prepare('UPDATE bookings SET status = ?1, decided_at = ?2 WHERE id = ?3')
    .bind(status, nowIso(), id)
    .run()

  let clientNotified = false
  let clientReason = null

  // Клиенту пишем только по решению и только один раз.
  if ((status === 'confirmed' || status === 'declined') && !booking.client_notified_at) {
    const res = await notifyClient(env, booking, status)
    clientNotified = res.ok
    clientReason = res.reason ?? null
  }

  return json({ ok: true, status, clientNotified, clientReason })
}

export async function updateBooking(request, env, id) {
  const body = await request.json().catch(() => ({}))

  const date = clean(body.date, 20) || null
  const time = clean(body.time, 20) || null
  const comment = clean(body.comment, 1000) || null

  const booking = await env.DB.prepare('SELECT id FROM bookings WHERE id = ?1').bind(id).first()
  if (!booking) return json({ ok: false, error: 'Заявка не найдена.' }, 404)

  await env.DB.prepare('UPDATE bookings SET date = ?1, time = ?2, comment = ?3 WHERE id = ?4')
    .bind(date, time, comment, id)
    .run()

  return json({ ok: true })
}

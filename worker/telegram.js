// Входящие сообщения бота. Нужны для одной вещи: когда клиент нажимает Start
// по ссылке с кодом, мы запоминаем его чат и получаем право написать ему
// подтверждение. Всё остальное бот вежливо игнорирует.

import { json, nowIso, safeEqual, telegramCall, formatDate } from './lib.js'

async function reply(env, chatId, text) {
  await telegramCall(env, 'sendMessage', {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  })
}

export async function handleTelegramWebhook(request, env) {
  // Telegram присылает секрет в заголовке — так посторонний не подсунет нам
  // фальшивое обновление.
  if (env.TELEGRAM_WEBHOOK_SECRET) {
    const got = request.headers.get('X-Telegram-Bot-Api-Secret-Token')
    if (!safeEqual(got, env.TELEGRAM_WEBHOOK_SECRET)) {
      return json({ ok: false }, 403)
    }
  }

  const update = await request.json().catch(() => null)
  const message = update?.message
  const chatId = message?.chat?.id
  const text = String(message?.text ?? '')

  if (!chatId) return json({ ok: true })

  const start = text.match(/^\/start(?:\s+(\S+))?/)

  if (!start) {
    await reply(env, chatId, 'Записаться можно на сайте — там же придёт подтверждение.')
    return json({ ok: true })
  }

  const token = start[1]

  if (!token) {
    await reply(env, chatId, 'Привет! Оставь заявку на сайте, и я пришлю подтверждение записи.')
    return json({ ok: true })
  }

  const booking = await env.DB.prepare(
    'SELECT id, name, date, time, status FROM bookings WHERE claim_token = ?1',
  )
    .bind(token)
    .first()

  if (!booking) {
    await reply(env, chatId, 'Ссылка устарела. Оставь заявку на сайте заново.')
    return json({ ok: true })
  }

  // Код одноразовый: обнуляем, чтобы по нему нельзя было подписаться дважды.
  await env.DB.prepare(
    'UPDATE bookings SET client_chat_id = ?1, claim_token = NULL WHERE id = ?2',
  )
    .bind(String(chatId), booking.id)
    .run()

  const when = [formatDate(booking.date), booking.time].filter(Boolean).join(', ')

  if (booking.status === 'confirmed') {
    await reply(env, chatId, `Запись уже подтверждена${when ? `: ${when}` : ''}. До встречи!`)
    await env.DB.prepare('UPDATE bookings SET client_notified_at = ?1 WHERE id = ?2')
      .bind(nowIso(), booking.id)
      .run()
  } else {
    await reply(
      env,
      chatId,
      `Спасибо, заявка получена${when ? ` на ${when}` : ''}. ` +
        'Пришлю сюда подтверждение, как только Екатерина подтвердит время.',
    )
  }

  return json({ ok: true })
}

// Сообщение клиенту, когда мастер подтвердила или отклонила запись.
export async function notifyClient(env, booking, status) {
  if (!booking.client_chat_id) return { ok: false, reason: 'клиент не подписан' }

  const when = [formatDate(booking.date), booking.time].filter(Boolean).join(', ')

  const text =
    status === 'confirmed'
      ? `Запись подтверждена${when ? `: ${when}` : ''}. Адрес пришлю здесь же перед визитом. До встречи!`
      : `К сожалению, на${when ? ` ${when}` : ' это время'} записаться не получится. ` +
        'Напиши, пожалуйста, другое удобное время — подберём.'

  const sent = await telegramCall(env, 'sendMessage', { chat_id: booking.client_chat_id, text })

  if (!sent.ok) {
    // Частый случай: клиент заблокировал бота. Причину показываем мастеру,
    // чтобы было понятно, что клиенту надо написать вручную.
    return { ok: false, reason: sent.data?.description || 'телеграм не принял сообщение' }
  }

  await env.DB.prepare('UPDATE bookings SET client_notified_at = ?1 WHERE id = ?2')
    .bind(nowIso(), booking.id)
    .run()

  return { ok: true }
}

// Одноразовая настройка: сказать Telegram, куда присылать обновления.
export async function setupWebhook(request, env) {
  const url = new URL(request.url)
  const target = `${url.origin}/api/telegram`

  const { ok, data } = await telegramCall(env, 'setWebhook', {
    url: target,
    secret_token: env.TELEGRAM_WEBHOOK_SECRET || undefined,
    allowed_updates: ['message'],
  })

  return json({ ok, target, telegram: data })
}

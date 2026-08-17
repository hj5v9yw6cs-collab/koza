// Точка входа воркера.
//
// Статику отдаёт привязка ASSETS (папка dist), внутренние адреса вида /services
// и /app получают index.html — дальше маршрут разбирает React.
// Всё под /api/ обрабатываем здесь.

import { json } from './lib.js'
import { handleBooking } from './booking.js'
import { handleTelegramWebhook, setupWebhook } from './telegram.js'
import { handleLogin, handleLogout, isLoggedIn } from './auth.js'
import { listBookings, decideBooking, updateBooking } from './admin.js'

const notFound = () => json({ ok: false, error: 'Не найдено.' }, 404)
const wrongMethod = () => json({ ok: false, error: 'Метод не поддерживается.' }, 405)

async function handleApi(request, env, url) {
  const path = url.pathname
  const method = request.method

  if (path === '/api/booking') {
    return method === 'POST' ? handleBooking(request, env) : wrongMethod()
  }

  if (path === '/api/telegram') {
    return method === 'POST' ? handleTelegramWebhook(request, env) : wrongMethod()
  }

  if (path === '/api/admin/login') {
    return method === 'POST' ? handleLogin(request, env) : wrongMethod()
  }

  // Дальше — только для мастера.
  if (path.startsWith('/api/admin/')) {
    if (!(await isLoggedIn(request, env))) {
      return json({ ok: false, error: 'Нужно войти.' }, 401)
    }

    if (path === '/api/admin/logout') {
      return method === 'POST' ? handleLogout() : wrongMethod()
    }

    if (path === '/api/admin/me') {
      return json({ ok: true })
    }

    if (path === '/api/admin/bookings') {
      return method === 'GET' ? listBookings(request, env) : wrongMethod()
    }

    if (path === '/api/admin/setup-webhook') {
      return method === 'POST' ? setupWebhook(request, env) : wrongMethod()
    }

    const decide = path.match(/^\/api\/admin\/bookings\/(\d+)\/(confirm|decline|done|new)$/)
    if (decide) {
      if (method !== 'POST') return wrongMethod()
      const statuses = { confirm: 'confirmed', decline: 'declined', done: 'done', new: 'new' }
      return decideBooking(request, env, Number(decide[1]), statuses[decide[2]])
    }

    const edit = path.match(/^\/api\/admin\/bookings\/(\d+)$/)
    if (edit) {
      return method === 'PATCH' ? updateBooking(request, env, Number(edit[1])) : wrongMethod()
    }
  }

  return notFound()
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url)
      } catch (err) {
        console.error('api error', url.pathname, err)
        return json({ ok: false, error: 'Внутренняя ошибка.' }, 500)
      }
    }

    const response = await env.ASSETS.fetch(request)

    if (response.status === 404 && (request.method === 'GET' || request.method === 'HEAD')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request))
    }

    return response
  },
}

// Точка входа воркера. Статику отдаёт привязка ASSETS (папка dist), а /api/*
// обрабатываем сами. Внутренние адреса вида /services файлами не существуют,
// поэтому для них возвращаем index.html — дальше маршрут разбирает React.
import { handleBooking, json } from './booking.js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/booking') {
      if (request.method !== 'POST') {
        return json({ ok: false, error: 'Метод не поддерживается.' }, 405)
      }
      return handleBooking(request, env)
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ ok: false, error: 'Не найдено.' }, 404)
    }

    const response = await env.ASSETS.fetch(request)

    if (response.status === 404 && (request.method === 'GET' || request.method === 'HEAD')) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', url), request))
    }

    return response
  },
}

// Запросы приложения мастера. Кука сессии ходит сама, но fetch по умолчанию
// не отправляет её на некоторых платформах — поэтому credentials указываем явно.
async function call(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    const err = new Error(data.error || 'Нужно войти.')
    err.unauthorized = true
    throw err
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'Что-то пошло не так.')
  }

  return data
}

export const api = {
  me: () => call('/api/admin/me'),
  login: (password) =>
    call('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => call('/api/admin/logout', { method: 'POST' }),
  bookings: (status) =>
    call(`/api/admin/bookings${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  decide: (id, action) => call(`/api/admin/bookings/${id}/${action}`, { method: 'POST' }),
  setupWebhook: () => call('/api/admin/setup-webhook', { method: 'POST' }),
}

export default api

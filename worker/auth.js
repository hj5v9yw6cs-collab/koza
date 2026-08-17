// Вход в приложение мастера.
//
// Пароль хранится секретом ADMIN_PASSWORD в Cloudflare. После входа выдаём
// подписанную куку: сервер не хранит сессии, а проверяет подпись. Ключ подписи
// выводится из пароля, поэтому смена пароля разом закрывает все входы.

import { json, nowIso, safeEqual } from './lib.js'

const COOKIE = 'koza_session'
const TTL_SECONDS = 60 * 60 * 24 * 30 // месяц
const MAX_ATTEMPTS = 10 // за 15 минут
const WINDOW_MINUTES = 15

const enc = new TextEncoder()

async function signingKey(env) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(`koza-session-v1:${env.ADMIN_PASSWORD}`),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

async function makeToken(env) {
  const expires = Math.floor(Date.now() / 1000) + TTL_SECONDS
  const payload = String(expires)
  const sig = await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode(payload))
  return `${payload}.${b64url(sig)}`
}

async function validToken(env, token) {
  const [payload, sig] = String(token ?? '').split('.')
  if (!payload || !sig) return false

  const expected = await crypto.subtle.sign('HMAC', await signingKey(env), enc.encode(payload))
  if (!safeEqual(sig, b64url(expected))) return false

  const expires = Number(payload)
  return Number.isFinite(expires) && expires > Math.floor(Date.now() / 1000)
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') ?? ''
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

export async function isLoggedIn(request, env) {
  if (!env.ADMIN_PASSWORD) return false
  return validToken(env, readCookie(request, COOKIE))
}

// Слишком частые попытки входа отклоняем — иначе пароль можно перебирать.
async function tooManyAttempts(env, ip) {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()

  const { results } = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM login_attempts WHERE at > ?1 AND ip IS ?2',
  )
    .bind(since, ip)
    .all()

  return (results?.[0]?.n ?? 0) >= MAX_ATTEMPTS
}

export async function handleLogin(request, env) {
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'Пароль приложения не настроен.' }, 500)
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? null

  if (await tooManyAttempts(env, ip)) {
    return json({ ok: false, error: 'Слишком много попыток. Подожди 15 минут.' }, 429)
  }

  const body = await request.json().catch(() => ({}))

  if (!safeEqual(body.password, env.ADMIN_PASSWORD)) {
    await env.DB.prepare('INSERT INTO login_attempts (at, ip) VALUES (?1, ?2)')
      .bind(nowIso(), ip)
      .run()
    return json({ ok: false, error: 'Неверный пароль.' }, 401)
  }

  // Удачный вход обнуляет счётчик, чтобы не блокировать саму себя.
  await env.DB.prepare('DELETE FROM login_attempts WHERE ip IS ?1').bind(ip).run()

  const token = await makeToken(env)

  return json(
    { ok: true },
    200,
    {
      'Set-Cookie':
        `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_SECONDS}`,
    },
  )
}

export function handleLogout() {
  return json({ ok: true }, 200, {
    'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
  })
}

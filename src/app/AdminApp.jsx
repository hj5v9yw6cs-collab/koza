import { useCallback, useEffect, useMemo, useState } from 'react'
import api from './api.js'
import './app.css'

const TZ = 'Asia/Yekaterinburg'

const STATUS_LABEL = {
  new: 'новая',
  confirmed: 'подтверждена',
  declined: 'отклонена',
  done: 'состоялась',
}

const TABS = [
  ['new', 'новые'],
  ['confirmed', 'подтверждённые'],
  ['', 'все'],
]

function formatDay(dateStr) {
  if (!dateStr) return 'без даты'
  const d = new Date(`${dateStr}T12:00:00Z`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
    timeZone: TZ,
  })
}

function today() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TZ }) // ГГГГ-ММ-ДД
}

// Ссылка, по которой мастер может написать клиенту сама, если тот не подписан.
function contactHref(contact) {
  const value = String(contact ?? '').trim()
  if (value.startsWith('@')) return `https://t.me/${value.slice(1)}`
  const digits = value.replace(/[^+\d]/g, '')
  return digits.length >= 6 ? `tel:${digits}` : null
}

function Login({ onDone }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.login(password)
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-login">
      <form onSubmit={submit}>
        <h1 className="app-login-title">Заявки</h1>
        <label htmlFor="pwd">пароль</label>
        <input
          id="pwd"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
        />
        <button className="app-btn app-btn-primary" type="submit" disabled={busy || !password}>
          {busy ? 'проверяю…' : 'войти'}
        </button>
        {error && <p className="app-error">{error}</p>}
      </form>
    </div>
  )
}

function Card({ booking, onDecide, busy }) {
  const href = contactHref(booking.contact)
  const isPast = booking.date && booking.date < today()
  const decided = booking.status === 'confirmed' || booking.status === 'declined'

  // Про клиента честно: получил ли он уведомление и можно ли ему вообще писать.
  const note = booking.client_notified_at
    ? 'клиент получил уведомление в телеграме'
    : booking.client_subscribed
      ? decided
        ? 'клиенту не удалось отправить уведомление — попробуй ещё раз'
        : 'клиент подписан на бота, уведомление уйдёт по кнопке'
      : 'клиент не подписан на бота: напиши ему сам по ссылке выше'

  // Кнопка повторной отправки нужна, если клиент подписан, решение принято,
  // а сообщение до него не дошло.
  const canRetry = decided && booking.client_subscribed && !booking.client_notified_at

  return (
    <article className={`app-card app-card-${booking.status}`}>
      <header className="app-card-head">
        <div>
          <h3>{booking.name}</h3>
          {href ? (
            <a className="app-contact" href={href} target="_blank" rel="noreferrer">
              {booking.contact}
            </a>
          ) : (
            <span className="app-contact">{booking.contact}</span>
          )}
        </div>
        <span className={`app-chip app-chip-${booking.status}`}>
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </header>

      <dl className="app-meta">
        {booking.time && (
          <>
            <dt>время</dt>
            <dd>{booking.time}</dd>
          </>
        )}
        {booking.service && (
          <>
            <dt>услуга</dt>
            <dd>{booking.service}</dd>
          </>
        )}
        {booking.comment && (
          <>
            <dt>комментарий</dt>
            <dd>{booking.comment}</dd>
          </>
        )}
      </dl>

      <p className="app-note">{note}</p>

      <div className="app-actions">
        {booking.status !== 'confirmed' && (
          <button
            className="app-btn app-btn-primary"
            onClick={() => onDecide(booking.id, 'confirm')}
            disabled={busy}
          >
            подтвердить
          </button>
        )}
        {booking.status !== 'declined' && (
          <button
            className="app-btn"
            onClick={() => onDecide(booking.id, 'decline')}
            disabled={busy}
          >
            отклонить
          </button>
        )}
        {booking.status === 'confirmed' && isPast && (
          <button className="app-btn" onClick={() => onDecide(booking.id, 'done')} disabled={busy}>
            состоялась
          </button>
        )}
        {canRetry && (
          <button
            className="app-btn"
            onClick={() => onDecide(booking.id, booking.status === 'confirmed' ? 'confirm' : 'decline')}
            disabled={busy}
          >
            уведомить клиента
          </button>
        )}
      </div>
    </article>
  )
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(null) // null — ещё не знаем
  const [tab, setTab] = useState('new')
  const [bookings, setBookings] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [flash, setFlash] = useState('')

  const load = useCallback(
    async (status) => {
      setError('')
      try {
        const data = await api.bookings(status)
        setBookings(data.bookings)
        setAuthed(true)
      } catch (err) {
        if (err.unauthorized) setAuthed(false)
        else setError(err.message)
      }
    },
    [],
  )

  useEffect(() => {
    load(tab)
  }, [tab, load])

  async function decide(id, action) {
    setBusy(true)
    setFlash('')
    try {
      const res = await api.decide(id, action)
      if (action === 'confirm' || action === 'decline') {
        setFlash(
          res.clientNotified
            ? 'Клиенту отправлено сообщение в телеграм.'
            : `Клиенту не отправлено: ${res.clientReason || 'он не подписан на бота'}. Напиши ему сам.`,
        )
      }
      await load(tab)
    } catch (err) {
      if (err.unauthorized) setAuthed(false)
      else setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  // Заявки группируем по дню — это и есть календарь.
  const days = useMemo(() => {
    const map = new Map()
    for (const b of bookings) {
      const key = b.date ?? ''
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(b)
    }
    return [...map.entries()]
  }, [bookings])

  if (authed === false) return <Login onDone={() => load(tab)} />

  return (
    <div className="app">
      <header className="app-top">
        <h1>Заявки</h1>
        <button
          className="app-btn app-btn-quiet"
          onClick={async () => {
            await api.logout().catch(() => {})
            setAuthed(false)
          }}
        >
          выйти
        </button>
      </header>

      <nav className="app-tabs">
        {TABS.map(([value, label]) => (
          <button
            key={label}
            className="app-tab"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {flash && <p className="app-flash">{flash}</p>}
      {error && <p className="app-error">{error}</p>}

      {authed === null && <p className="app-empty">загружаю…</p>}

      {authed && days.length === 0 && <p className="app-empty">Заявок пока нет.</p>}

      {days.map(([date, list]) => (
        <section className="app-day" key={date || 'none'}>
          <h2 className={date && date === today() ? 'app-day-title app-today' : 'app-day-title'}>
            {formatDay(date)}
            {date === today() && <span className="app-today-mark">сегодня</span>}
          </h2>
          {list.map((b) => (
            <Card key={b.id} booking={b} onDecide={decide} busy={busy} />
          ))}
        </section>
      ))}

      {authed && (
        <footer className="app-foot">
          <button
            className="app-btn app-btn-quiet"
            onClick={async () => {
              setFlash('')
              try {
                const res = await api.setupWebhook()
                setFlash(
                  res.ok
                    ? 'Бот подключён: подписки клиентов будут работать.'
                    : 'Не удалось подключить бота, проверь токен.',
                )
              } catch (err) {
                setError(err.message)
              }
            }}
          >
            подключить бота
          </button>
          <span className="app-hint">
            Нужно нажать один раз — после этого клиенты смогут подписываться на подтверждения.
          </span>
        </footer>
      )}
    </div>
  )
}

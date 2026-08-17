import { useState } from 'react'
import site, { contactLinks } from '../data/site.js'
import { bookingOptions } from '../data/services.js'
import Reveal from '../components/Reveal.jsx'

const empty = {
  name: '',
  contact: '',
  service: '',
  date: '',
  time: '',
  comment: '',
  // Ловушка для ботов: люди это поле не видят и не заполняют.
  website: '',
}

export default function Booking() {
  const [form, setForm] = useState(empty)
  const [state, setState] = useState('idle') // idle | sending | ok | err
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const today = new Date().toISOString().slice(0, 10)

  async function submit(e) {
    e.preventDefault()
    if (state === 'sending') return

    if (!form.name.trim() || !form.contact.trim()) {
      setError('Заполните имя и способ связи.')
      setState('err')
      return
    }

    setState('sending')
    setError('')

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Не удалось отправить заявку.')
      }

      setState('ok')
      setForm(empty)
    } catch (err) {
      setError(err.message || 'Не удалось отправить заявку.')
      setState('err')
    }
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">запись</span>
          <h1 className="script h-display" style={{ marginTop: '0.5rem' }}>
            booking
          </h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap form-grid">
          <Reveal>
            <p className="lead">
              Оставьте заявку — я получу её в телеграм и вернусь с подтверждением в течение дня.
              Если удобнее написать напрямую, ссылки ниже.
            </p>

            <div className="chips" style={{ marginTop: '2rem' }}>
              {contactLinks.map((l) => (
                <a className="chip" key={l.key} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ))}
              {site.contacts.phone && (
                <a className="chip" href={`tel:${site.contacts.phone.replace(/[^+\d]/g, '')}`}>
                  {site.contacts.phone}
                </a>
              )}
            </div>
          </Reveal>

          <Reveal>
            <form onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="name">как вас зовут *</label>
                <input
                  id="name"
                  value={form.name}
                  onChange={set('name')}
                  autoComplete="name"
                  maxLength={80}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="contact">телефон или телеграм *</label>
                <input
                  id="contact"
                  value={form.contact}
                  onChange={set('contact')}
                  placeholder="+7 999 000-00-00 или @nickname"
                  maxLength={120}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="service">услуга</label>
                <select id="service" value={form.service} onChange={set('service')}>
                  <option value="">не выбрано — подскажите на месте</option>
                  {bookingOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div className="field" style={{ flex: '1 1 10rem' }}>
                  <label htmlFor="date">желаемая дата</label>
                  <input id="date" type="date" min={today} value={form.date} onChange={set('date')} />
                </div>

                <div className="field" style={{ flex: '1 1 10rem' }}>
                  <label htmlFor="time">удобное время</label>
                  <select id="time" value={form.time} onChange={set('time')}>
                    <option value="">любое</option>
                    {site.hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="comment">комментарий</label>
                <textarea
                  id="comment"
                  value={form.comment}
                  onChange={set('comment')}
                  maxLength={1000}
                  placeholder="Пожелания по дизайну, аллергии, вопросы"
                />
              </div>

              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">website</label>
                <input id="website" tabIndex={-1} value={form.website} onChange={set('website')} />
              </div>

              <button className="btn btn-wide" type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'отправляю…' : 'отправить заявку'}
              </button>

              {state === 'ok' && (
                <div className="form-status ok" role="status">
                  Заявка отправлена. Я свяжусь с вами, чтобы подтвердить время — спасибо!
                </div>
              )}

              {state === 'err' && (
                <div className="form-status err" role="alert">
                  {error} Можно также написать напрямую в телеграм.
                </div>
              )}

              <p className="field-hint" style={{ marginTop: '1rem' }}>
                Нажимая кнопку, вы соглашаетесь на обработку указанных данных для записи на
                приём.
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sizedServices, calcServices, calcExtras } from '../data/services.js'
import Reveal from './Reveal.jsx'

const sizedById = Object.fromEntries(sizedServices.map((s) => [s.id, s]))

export default function Calculator() {
  const navigate = useNavigate()
  const [serviceId, setServiceId] = useState('extension')
  const [size, setSize] = useState('m')
  const [chosen, setChosen] = useState([])

  const service = calcServices.find((s) => s.id === serviceId)
  const sizes = service.sized ? Object.keys(sizedById[serviceId].prices) : []

  // При смене услуги длина может стать недоступной (у коррекции нет xl и xxl).
  const activeSize = service.sized && !sizes.includes(size) ? sizes[sizes.length - 1] : size

  const extras = calcExtras.filter((e) => e.only.includes(serviceId))
  const activeExtras = extras.filter((e) => chosen.includes(e.id))

  const { min, max } = useMemo(() => {
    const base = service.sized
      ? { min: sizedById[serviceId].prices[activeSize], max: sizedById[serviceId].prices[activeSize] }
      : { min: service.min, max: service.max }

    const added = activeExtras.reduce((sum, e) => sum + e.price, 0)
    return { min: base.min + added, max: base.max + added }
  }, [service, serviceId, activeSize, activeExtras])

  const total = min === max ? `${min} ₽` : `${min}–${max} ₽`

  // Тот же вид, что и в списке услуг формы записи, — чтобы селект совпал.
  const bookingValue = service.sized ? `${service.title} ${activeSize}` : service.title

  const toggle = (id) =>
    setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <Reveal className="calc">
      <div className="calc-form">
        <fieldset className="calc-group">
          <legend className="calc-legend">услуга</legend>
          <div className="chips">
            {calcServices.map((s) => (
              <button
                type="button"
                key={s.id}
                className="chip"
                aria-pressed={s.id === serviceId}
                onClick={() => {
                  setServiceId(s.id)
                  setChosen([])
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </fieldset>

        {service.sized && (
          <fieldset className="calc-group">
            <legend className="calc-legend">длина</legend>
            <div className="chips">
              {sizes.map((s) => (
                <button
                  type="button"
                  key={s}
                  className="chip chip-size"
                  aria-pressed={s === activeSize}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="calc-hint">{sizedById[serviceId].note}</p>
          </fieldset>
        )}

        {extras.length > 0 && (
          <fieldset className="calc-group">
            <legend className="calc-legend">добавить</legend>
            <div className="chips">
              {extras.map((e) => (
                <button
                  type="button"
                  key={e.id}
                  className="chip"
                  aria-pressed={chosen.includes(e.id)}
                  onClick={() => toggle(e.id)}
                >
                  {e.title} + {e.price} ₽
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {service.note && <p className="calc-hint">{service.note}</p>}
      </div>

      <div className="calc-total">
        <span className="eyebrow">примерная стоимость</span>
        <div className="calc-sum">{total}</div>
        <p className="calc-hint">
          Точную цену скажу, когда увижу ногти: длину и состояние иногда видно только вживую.
        </p>
        <button
          type="button"
          className="btn btn-wide"
          onClick={() => navigate(`/booking?service=${encodeURIComponent(bookingValue)}`)}
        >
          записаться на это
        </button>
      </div>
    </Reveal>
  )
}

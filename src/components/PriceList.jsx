import { simpleServices, sizedServices, extras } from '../data/services.js'
import Reveal from './Reveal.jsx'

export default function PriceList() {
  return (
    <>
      <div>
        {simpleServices.map((s) => (
          <Reveal className="price-row" key={s.id}>
            <div>
              <div className="name">{s.title}</div>
              <div className="note">{s.note}</div>
            </div>
            <div className="amount">{s.price} ₽</div>
          </Reveal>
        ))}
      </div>

      <Reveal className="sized" style={{ marginTop: 'var(--gap)' }}>
        {sizedServices.map((s) => (
          <div key={s.id}>
            <div className="sized-head">
              <h3>{s.title}</h3>
              <p>{s.note}</p>
            </div>
            {Object.entries(s.prices).map(([size, price]) => (
              <div className="size-line" key={size}>
                <span className="size">{size}</span>
                <span className="dots" />
                <span className="amount">{price} ₽</span>
              </div>
            ))}
          </div>
        ))}
      </Reveal>

      <div style={{ marginTop: 'var(--gap)' }}>
        {extras.map((e) => (
          <Reveal className="price-row" key={e.id}>
            <div>
              <div className="name">{e.title}</div>
              {e.note && <div className="note">{e.note}</div>}
            </div>
            <div className="amount">{e.priceLabel}</div>
          </Reveal>
        ))}
      </div>
    </>
  )
}

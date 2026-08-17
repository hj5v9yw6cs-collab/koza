import { Link } from 'react-router-dom'
import PriceList from '../components/PriceList.jsx'
import Calculator from '../components/Calculator.jsx'
import Reveal from '../components/Reveal.jsx'
import site from '../data/site.js'

export default function Services() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">прайс</span>
          <h1 className="script h-display" style={{ marginTop: '0.5rem' }}>
            price list
          </h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">посчитать</span>
            <h2 className="script h-section" style={{ margin: '0.5rem 0 1.75rem' }}>
              calculator
            </h2>
          </Reveal>

          <Calculator />

          <Reveal style={{ marginTop: 'var(--gap)' }}>
            <span className="eyebrow">весь прайс</span>
          </Reveal>

          <PriceList />

          <Reveal style={{ marginTop: 'var(--gap)' }}>
            <p className="field-hint" style={{ maxWidth: '52ch' }}>
              Длина считается по свободному краю: xs — совсем короткие, xxl — самые длинные.
              Не знаешь свой размер — просто напиши в заявке, подскажу на месте.
            </p>
            <ul className="notes">
              {site.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal style={{ marginTop: '2.5rem' }}>
            <Link to="/booking" className="btn">
              записаться
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

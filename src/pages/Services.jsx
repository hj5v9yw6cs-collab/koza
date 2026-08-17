import { Link } from 'react-router-dom'
import PriceList from '../components/PriceList.jsx'
import Reveal from '../components/Reveal.jsx'

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
          <PriceList />

          <Reveal style={{ marginTop: 'var(--gap)' }}>
            <p className="field-hint" style={{ maxWidth: '52ch' }}>
              Длина считается по свободному краю: xs — совсем короткие, xxl — самые длинные.
              Если не знаете свой размер, просто напишите в заявке — подскажу на месте.
            </p>
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

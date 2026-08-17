import { Link } from 'react-router-dom'
import site from '../data/site.js'
import photos from '../data/portfolio.js'
import portrait from '../data/portrait.js'
import Reveal from '../components/Reveal.jsx'
import Figure from '../components/Figure.jsx'
import Gallery from '../components/Gallery.jsx'
import { simpleServices, sizedServices } from '../data/services.js'

export default function Home() {
  const preview = photos.slice(0, 4)
  const from = Math.min(...sizedServices.flatMap((s) => Object.values(s.prices)))

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div className="hero-meta">
            <h1 className="script h-display">manicure</h1>
            <p className="lead">
              Аппаратный маникюр, наращивание и коррекция. Аккуратно, стерильно и без спешки —
              так, чтобы руками хотелось любоваться ещё месяц.
            </p>
            <div>
              <Link to="/booking" className="btn">
                записаться
              </Link>
            </div>
          </div>

          <Figure
            src={portrait || photos[0]?.src}
            alt={portrait ? site.name : 'Работа мастера'}
          />
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">обо мне</span>
            <h2 className="script h-section" style={{ margin: '0.5rem 0 1.5rem' }}>
              about me
            </h2>
            <p className="lead">{site.about}</p>
            <div style={{ marginTop: '2rem' }}>
              <Link to="/about" className="link-more">
                смотреть больше
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal className="values">
            {site.values.map(([title, text]) => (
              <div className="value" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section>
        <div className="wrap">
          <Reveal>
            <span className="eyebrow">прайс</span>
            <h2 className="script h-section" style={{ margin: '0.5rem 0 2rem' }}>
              services
            </h2>
          </Reveal>

          {simpleServices.map((s) => (
            <Reveal className="price-row" key={s.id}>
              <div>
                <div className="name">{s.title}</div>
                <div className="note">{s.note}</div>
              </div>
              <div className="amount">{s.price} ₽</div>
            </Reveal>
          ))}

          <Reveal className="price-row">
            <div>
              <div className="name">наращивание и коррекция</div>
              <div className="note">по длине — от xs до xxl, с покрытием гелем и light дизайном</div>
            </div>
            <div className="amount">от {from} ₽</div>
          </Reveal>

          <Reveal style={{ marginTop: '2rem' }}>
            <Link to="/services" className="link-more">
              весь прайс
            </Link>
          </Reveal>
        </div>
      </section>

      {preview.length > 0 && (
        <section>
          <div className="wrap">
            <Reveal>
              <span className="eyebrow">работы</span>
              <h2 className="script h-section" style={{ margin: '0.5rem 0 2rem' }}>
                gallery
              </h2>
            </Reveal>
            <Gallery photos={preview} />
            <Reveal style={{ marginTop: '2rem' }}>
              <Link to="/portfolio" className="link-more">
                все работы
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      <section>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <h2 className="serif-italic" style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}>
              Запишемся?
            </h2>
            <p className="lead" style={{ margin: '1rem auto 2rem' }}>
              Оставьте заявку — я отвечу в течение дня и подберём удобное время.
            </p>
            <Link to="/booking" className="btn">
              записаться
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import photos from '../data/portfolio.js'
import Reveal from '../components/Reveal.jsx'

export default function Portfolio() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">работы</span>
          <h1 className="script h-display" style={{ marginTop: '0.5rem' }}>
            gallery
          </h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          {photos.length > 0 ? (
            <Reveal className="gallery">
              {photos.map((p) => (
                <div className="tile" key={p.name}>
                  <img src={p.src} alt="Работа мастера" loading="lazy" />
                </div>
              ))}
            </Reveal>
          ) : (
            <div className="gallery-empty">
              Фото работ скоро появятся здесь.
              <br />
              <span className="field-hint">
                (файлы кладутся в <code>src/assets/portfolio/</code> — галерея собирается сама)
              </span>
            </div>
          )}

          <Reveal style={{ marginTop: 'var(--gap)', textAlign: 'center' }}>
            <Link to="/booking" className="btn">
              записаться
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

import { Link } from 'react-router-dom'
import site from '../data/site.js'
import photos from '../data/portfolio.js'
import portrait from '../data/portrait.js'
import Reveal from '../components/Reveal.jsx'
import Figure from '../components/Figure.jsx'

export default function About() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="eyebrow">обо мне</span>
          <h1 className="script h-display" style={{ marginTop: '0.5rem' }}>
            about me
          </h1>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap hero-grid">
          <div className="hero-meta">
            <p className="lead">{site.about}</p>
            <p className="lead">
              Работаю в {site.city}. Материалы — профессиональные бренды, инструмент проходит
              полный цикл стерилизации, пилки и файлы одноразовые. Если у вас чувствительная кожа
              или тонкие ногти — скажите заранее, подберу более бережный протокол.
            </p>
          </div>

          <Figure
            src={portrait || photos[1]?.src || photos[0]?.src}
            alt={portrait ? site.name : 'Работа мастера'}
          />
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
        <div className="wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <Link to="/booking" className="btn">
              записаться
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}

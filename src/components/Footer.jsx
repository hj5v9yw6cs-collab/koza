import { Link } from 'react-router-dom'
import site, { contactLinks } from '../data/site.js'

export default function Footer() {
  const { phone, address } = site.contacts

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-brand">{site.name}</div>

        <div className="footer-cols">
          <div>
            <Link to="/services">услуги</Link>
            <Link to="/portfolio">работы</Link>
            <Link to="/about">обо мне</Link>
            <Link to="/booking">записаться</Link>
          </div>

          <div>
            {contactLinks.map((l) => (
              <a key={l.key} href={l.href} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ))}
          </div>

          <div>
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>}
            {address && <span className="footer-plain">{address}</span>}
            <span className="footer-plain">{site.city}</span>
          </div>
        </div>

        <div className="footer-note">
          {site.name} · {site.master} · {new Date().getFullYear()} · Instagram принадлежит Meta —
          организации, признанной экстремистской и запрещённой в РФ
        </div>
      </div>
    </footer>
  )
}

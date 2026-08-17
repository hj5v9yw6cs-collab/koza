import { Link } from 'react-router-dom'
import site from '../data/site.js'

export default function Footer() {
  const { telegram, instagram, phone, address } = site.contacts

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-brand">{site.name}</div>

        <div className="footer-cols">
          <div>
            <Link to="/services">услуги</Link>
            <Link to="/portfolio">работы</Link>
            <Link to="/about">обо мне</Link>
          </div>
          <div>
            {telegram && (
              <a href={telegram} target="_blank" rel="noreferrer">
                telegram
              </a>
            )}
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer">
                instagram
              </a>
            )}
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>}
          </div>
          <div>
            <Link to="/booking">записаться</Link>
            {address && <span style={{ display: 'block', padding: '0.25rem 0' }}>{address}</span>}
          </div>
        </div>

        <div className="footer-note">
          {site.city} · {new Date().getFullYear()} · Instagram принадлежит Meta — организации,
          признанной экстремистской и запрещённой в РФ
        </div>
      </div>
    </footer>
  )
}

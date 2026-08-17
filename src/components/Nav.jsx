import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import site from '../data/site.js'

const links = [
  ['/', 'главная'],
  ['/about', 'обо мне'],
  ['/services', 'услуги'],
  ['/portfolio', 'работы'],
  ['/booking', 'запись'],
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <NavLink to="/" className="nav-brand" onClick={() => setOpen(false)}>
          {site.name}
        </NavLink>

        <button
          className="nav-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="nav-links"
        >
          {open ? 'закрыть' : 'меню'}
        </button>

        <nav id="nav-links" className={open ? 'nav-links open' : 'nav-links'}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={location.pathname === to ? 'active' : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

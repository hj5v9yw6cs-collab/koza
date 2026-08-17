import Reveal from './Reveal.jsx'

// Крупная картинка-плашка. Пока фото нет — аккуратная заглушка вместо пустоты.
export default function Figure({ src, alt, label = 'фото' }) {
  return (
    <Reveal className="hero-figure">
      {src ? <img src={src} alt={alt} /> : <div className="figure-empty">{label}</div>}
    </Reveal>
  )
}

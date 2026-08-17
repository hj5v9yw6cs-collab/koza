import { useEffect, useRef } from 'react'
import Reveal from './Reveal.jsx'

// Сетка работ. На устройствах с курсором плитки чёрно-белые и расцветают под
// курсором (это в CSS). На телефоне наводить нечем, поэтому цвет получает то
// фото, которое сейчас в центре экрана, — галерея расцветает по ходу прокрутки.
export default function Gallery({ photos }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.classList.toggle('lit', entry.isIntersecting)
        }
      },
      // Узкая полоса по центру экрана: считается только то, что её пересекает.
      { rootMargin: '-45% 0px -45% 0px' },
    )

    root.querySelectorAll('.tile').forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [photos])

  return (
    <div ref={ref}>
      <Reveal className="gallery">
        {photos.map((p) => (
          <div className="tile" key={p.name}>
            <img src={p.src} alt="Работа мастера" loading="lazy" />
          </div>
        ))}
      </Reveal>
    </div>
  )
}

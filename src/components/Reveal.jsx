import { useEffect, useRef, useState } from 'react'

// Плавное появление блока при скролле.
export default function Reveal({ children, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return

    // Без IntersectionObserver показываем блок сразу, чтобы контент не пропал.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag ref={ref} className={`reveal ${shown ? 'in' : ''} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

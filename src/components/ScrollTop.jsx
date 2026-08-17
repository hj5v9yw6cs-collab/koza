import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// При переходе между страницами возвращаем скролл наверх.
export default function ScrollTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])

  return null
}

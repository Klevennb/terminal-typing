import { useEffect, useState } from 'react'
import { parseRoute } from './routes'

export function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))

  useEffect(() => {
    function navigate() {
      setRoute(parseRoute(window.location.hash))
    }
    window.addEventListener('hashchange', navigate)
    return () => window.removeEventListener('hashchange', navigate)
  }, [])

  return route
}

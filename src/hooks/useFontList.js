import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

// Module-level so the catalog is fetched once no matter how many components ask
// for it (FontList and the empty state both do).
let catalogPromise = null

function fetchCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`,
      { referrer: window.location.href }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Google Fonts API error: ${r.status}`)
        return r.json()
      })
      .then((data) => data.items ?? [])
      .catch((err) => {
        catalogPromise = null // let a later mount retry
        throw err
      })
  }
  return catalogPromise
}

export function useFontList() {
  const [fonts, setFonts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!API_KEY) {
      setError('Add VITE_GOOGLE_FONTS_API_KEY to your .env file')
      setLoading(false)
      return
    }

    let active = true
    fetchCatalog()
      .then((items) => {
        if (!active) return
        setFonts(items)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { fonts, loading, error }
}

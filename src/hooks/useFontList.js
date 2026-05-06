import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

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

    fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`,
      { referrer: window.location.href }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Google Fonts API error: ${r.status}`)
        return r.json()
      })
      .then((data) => {
        setFonts(data.items ?? [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return { fonts, loading, error }
}

import { useState, useEffect } from 'react'
import * as opentype from 'opentype.js'

const parsedFontCache = new Map()
const objectUrls = new Map()

function injectFontFace(familyName, buffer) {
  const existing = document.querySelector(`style[data-glyph-explorer="${familyName}"]`)
  if (existing) return

  const blob = new Blob([buffer], { type: 'font/ttf' })
  const url = URL.createObjectURL(blob)
  objectUrls.set(familyName, url)

  const style = document.createElement('style')
  style.setAttribute('data-glyph-explorer', familyName)
  style.textContent = `@font-face { font-family: '${familyName}'; src: url('${url}'); }`
  document.head.appendChild(style)
}

function buildGlyphList(font) {
  const glyphs = []
  for (let i = 0; i < font.numGlyphs; i++) {
    const g = font.glyphs.get(i)
    glyphs.push({
      index: i,
      name: g.name,
      unicode: g.unicode,
      unicodes: g.unicodes ?? [],
      glyph: g,
    })
  }
  return glyphs
}

export function useFont(fontItem, variant) {
  const [state, setState] = useState({
    glyphs: [],
    fontFamily: null,
    parsedFont: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (!fontItem) {
      setState({ glyphs: [], fontFamily: null, parsedFont: null, loading: false, error: null })
      return
    }

    const resolvedVariant =
      variant && fontItem.files[variant] ? variant : Object.keys(fontItem.files)[0]
    const url = fontItem.files[resolvedVariant]
    const cacheKey = url

    if (parsedFontCache.has(cacheKey)) {
      const cached = parsedFontCache.get(cacheKey)
      setState({ ...cached, loading: false, error: null })
      return
    }

    setState({ glyphs: [], fontFamily: null, parsedFont: null, loading: true, error: null })

    fetch(url, { referrer: window.location.href })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch font: ${r.status}`)
        return r.arrayBuffer()
      })
      .then((buffer) => {
        const font = opentype.parse(buffer)
        const familyName = `ge-${fontItem.family.replace(/\s+/g, '-').toLowerCase()}-${resolvedVariant}`

        injectFontFace(familyName, buffer)

        const glyphs = buildGlyphList(font)
        const result = { glyphs, fontFamily: familyName, parsedFont: font }
        parsedFontCache.set(cacheKey, result)
        setState({ ...result, loading: false, error: null })
      })
      .catch((err) => {
        setState({ glyphs: [], fontFamily: null, parsedFont: null, loading: false, error: err.message })
      })
  }, [fontItem, variant])

  return state
}

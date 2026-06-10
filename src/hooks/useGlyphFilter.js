import { useState, useEffect, useMemo } from 'react'
import { getBlock, getAvailableBlocks } from '../utils/unicodeBlocks'

export function useGlyphFilter(glyphs, resetKey) {
  const [search, setSearch] = useState('')
  const [activeBlocks, setActiveBlocks] = useState(new Set())
  const [hideEmpty, setHideEmpty] = useState(false)
  const [unicodeOnly, setUnicodeOnly] = useState(false)

  useEffect(() => {
    setSearch('')
    setActiveBlocks(new Set())
    setHideEmpty(false)
    setUnicodeOnly(false)
  }, [resetKey])

  const availableBlocks = useMemo(() => getAvailableBlocks(glyphs), [glyphs])

  function toggleBlock(name) {
    setActiveBlocks(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const filteredGlyphs = useMemo(() => {
    let result = glyphs

    if (unicodeOnly) {
      result = result.filter(g => g.unicode != null)
    }

    if (hideEmpty) {
      result = result.filter(g => (g.glyph.path?.commands?.length ?? 0) > 0)
    }

    if (activeBlocks.size > 0) {
      result = result.filter(g => {
        if (g.unicode == null) return false
        const block = getBlock(g.unicode)
        return block != null && activeBlocks.has(block.name)
      })
    }

    const q = search.trim().toLowerCase()
    if (q) {
      const hexQ = q.startsWith('u+') ? q.slice(2) : q
      const isHex = /^[0-9a-f]+$/.test(hexQ)

      result = result.filter(g => {
        if (g.name?.toLowerCase().includes(q)) return true
        if (isHex && g.unicode != null) {
          const hex = g.unicode.toString(16).toLowerCase()
          const padLen = hex.length <= 4 ? 4 : 6
          if (hex === hexQ || hex.padStart(padLen, '0') === hexQ.padStart(padLen, '0')) return true
        }
        return false
      })
    }

    return result
  }, [glyphs, search, activeBlocks, hideEmpty, unicodeOnly])

  const isFiltered = search.trim() !== '' || activeBlocks.size > 0 || hideEmpty || unicodeOnly

  return {
    filteredGlyphs,
    search, setSearch,
    activeBlocks, toggleBlock,
    hideEmpty, setHideEmpty,
    unicodeOnly, setUnicodeOnly,
    availableBlocks,
    isFiltered,
  }
}

import { useState, useEffect, useMemo } from 'react'
import {
  getBlockName,
  getAvailableBlocks,
  getAllBlocksWithCounts,
  OTHER_SCRIPT_BLOCKS,
} from '../utils/unicodeBlocks'

export function useGlyphFilter(glyphs, resetKey) {
  const [search, setSearch] = useState('')
  // Categories the user has unchecked. Primary categories start checked; the
  // "other scripts" blocks start unchecked, since they're usually large
  // secondary-script ranges that swamp the grid when browsing a Latin face.
  const [hiddenBlocks, setHiddenBlocks] = useState(new Set())
  const [hideEmpty, setHideEmpty] = useState(true)
  const [unicodeOnly, setUnicodeOnly] = useState(false)

  // Category counts describe what the grid would show if only that category were
  // checked, so they must honour hideEmpty / unicodeOnly. Block filtering itself
  // is applied afterwards.
  const countBasis = useMemo(() => {
    let result = glyphs
    if (unicodeOnly) result = result.filter(g => g.unicode != null)
    if (hideEmpty) result = result.filter(g => (g.glyph.path?.commands?.length ?? 0) > 0)
    return result
  }, [glyphs, unicodeOnly, hideEmpty])

  const availableBlocks = useMemo(() => getAvailableBlocks(countBasis), [countBasis])
  const allBlocks = useMemo(() => getAllBlocksWithCounts(countBasis), [countBasis])

  // Defaults key off the raw glyph list so that toggling hideEmpty / unicodeOnly
  // can't change this identity and re-trigger the reset effect below.
  const otherBlockNames = useMemo(
    () =>
      getAvailableBlocks(glyphs)
        .filter(b => OTHER_SCRIPT_BLOCKS.has(b.name))
        .map(b => b.name),
    [glyphs]
  )

  // Every category the UI actually offers a checkbox for.
  const toggleableBlockNames = useMemo(() => {
    const primary = allBlocks
      .filter(b => b.count > 0 && !OTHER_SCRIPT_BLOCKS.has(b.name))
      .map(b => b.name)
    return [...primary, ...otherBlockNames]
  }, [allBlocks, otherBlockNames])

  useEffect(() => {
    setSearch('')
    setHiddenBlocks(new Set(otherBlockNames))
    setHideEmpty(true)
    setUnicodeOnly(false)
  }, [resetKey, otherBlockNames])

  function toggleBlock(name) {
    setHiddenBlocks(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  function setAllBlocksChecked(checked) {
    setHiddenBlocks(checked ? new Set() : new Set(toggleableBlockNames))
  }

  const allBlocksHidden =
    toggleableBlockNames.length > 0 &&
    toggleableBlockNames.every(name => hiddenBlocks.has(name))

  const filteredGlyphs = useMemo(() => {
    let result = glyphs

    if (unicodeOnly) {
      result = result.filter(g => g.unicode != null)
    }

    if (hideEmpty) {
      result = result.filter(g => (g.glyph.path?.commands?.length ?? 0) > 0)
    }

    if (hiddenBlocks.size > 0) {
      result = result.filter(g => {
        if (g.unicode == null) return true
        return !hiddenBlocks.has(getBlockName(g.unicode))
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
  }, [glyphs, search, hiddenBlocks, hideEmpty, unicodeOnly])

  const isFiltered = search.trim() !== '' || hiddenBlocks.size > 0 || hideEmpty || unicodeOnly

  return {
    filteredGlyphs,
    search, setSearch,
    hiddenBlocks, toggleBlock,
    setAllBlocksChecked, allBlocksHidden,
    hideEmpty, setHideEmpty,
    unicodeOnly, setUnicodeOnly,
    availableBlocks,
    allBlocks,
    isFiltered,
  }
}

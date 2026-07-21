import { memo, useMemo } from 'react'

const DISPLAY_SIZE = 40

function GlyphSvg({ glyph, font }) {
  const pathData = useMemo(() => {
    try {
      const path = glyph.getPath(0, font.ascender, font.unitsPerEm)
      return path.toPathData(2)
    } catch {
      return null
    }
  }, [glyph, font])

  const height = font.ascender - font.descender
  const hasPath = pathData && pathData.length > 1

  if (!hasPath) {
    return <span className="text-content-muted text-lg select-none">∅</span>
  }

  return (
    <svg
      viewBox={`0 0 ${font.unitsPerEm} ${height}`}
      width={DISPLAY_SIZE}
      height={DISPLAY_SIZE}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={pathData} fill="currentColor" />
    </svg>
  )
}

const GlyphCell = memo(function GlyphCell({ glyph, fontFamily, font, onClick, isSelected }) {
  const hasUnicode = glyph.unicode != null
  const isPrintable = hasUnicode && glyph.unicode >= 32

  const label = hasUnicode
    ? `U+${glyph.unicode.toString(16).toUpperCase().padStart(glyph.unicode > 0xffff ? 6 : 4, '0')}`
    : glyph.name ?? `#${glyph.index}`

  return (
    // Cells carry only their right and bottom rule; the grid wrapper closes the
    // top and left edges, so shared lines never double up.
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-between p-2 border-r border-b border-border transition-colors min-w-0 w-full h-full text-left
        ${isSelected ? 'bg-accent' : 'hover:bg-surface'}`}
    >
      <div className="flex flex-1 items-center justify-center w-full">
        {isPrintable ? (
          <span
            style={{ fontFamily: `'${fontFamily}'`, fontSize: DISPLAY_SIZE, lineHeight: 1 }}
            className={`select-none ${isSelected ? 'text-on-accent' : ''}`}
          >
            {String.fromCodePoint(glyph.unicode)}
          </span>
        ) : (
          <span className={isSelected ? 'text-on-accent' : ''}>
            <GlyphSvg glyph={glyph.glyph} font={font} />
          </span>
        )}
      </div>
      <span className={`text-[10px] font-mono mt-1 truncate max-w-full ${isSelected ? 'text-on-accent/70' : 'text-content-muted'}`}>
        {label}
      </span>
    </button>
  )
})

export default GlyphCell

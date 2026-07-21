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
    // While expanded the cell becomes the close control — a large ✕ replaces the
    // character outright, so there is one obvious way to collapse the row.
    <button
      onClick={onClick}
      aria-label={isSelected ? `Close ${label} details` : undefined}
      className={`flex flex-col items-center justify-between p-2 border-r border-b border-border transition-colors min-w-0 w-full h-full text-left
        ${isSelected ? 'bg-accent' : 'hover:bg-surface'}`}
    >
      {isSelected ? (
        <span className="flex flex-1 items-center justify-center w-full text-on-accent/80 hover:text-on-accent transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="38"
            height="38"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </span>
      ) : (
        <>
          <div className="flex flex-1 items-center justify-center w-full">
            {isPrintable ? (
              <span
                style={{ fontFamily: `'${fontFamily}'`, fontSize: DISPLAY_SIZE, lineHeight: 1 }}
                className="select-none"
              >
                {String.fromCodePoint(glyph.unicode)}
              </span>
            ) : (
              <GlyphSvg glyph={glyph.glyph} font={font} />
            )}
          </div>
          <span className="text-[10px] font-mono mt-1 truncate max-w-full text-content-muted">
            {label}
          </span>
        </>
      )}
    </button>
  )
})

export default GlyphCell

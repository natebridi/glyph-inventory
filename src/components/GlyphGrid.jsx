import { useRef, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFont } from '../hooks/useFont'
import GlyphCell from './GlyphCell'
import GlyphDetail from './GlyphDetail'

const CELL_SIZE = 88
const GAP = 6

function parseVariant(v) {
  if (v === 'regular') return { weight: '400', italic: false }
  if (v === 'italic') return { weight: '400', italic: true }
  const isItalic = v.endsWith('italic')
  return { weight: isItalic ? v.slice(0, -6) : v, italic: isItalic }
}

function buildVariant(weight, italic) {
  if (weight === '400') return italic ? 'italic' : 'regular'
  return italic ? `${weight}italic` : weight
}

function VariantControls({ variants, files, weight, italic, onWeightChange, onItalicChange }) {
  const available = variants.filter(v => files[v]).map(parseVariant)
  const weights = [...new Set(available.map(p => p.weight))].sort((a, b) => Number(a) - Number(b))
  const italicAvailable = available.some(p => p.weight === weight && p.italic)

  return (
    <div className="flex items-center gap-3">
      {weights.length > 1 && (
        <div className="flex border border-gray-200 rounded overflow-hidden">
          {weights.map((w) => (
            <button
              key={w}
              onClick={() => onWeightChange(w)}
              className={`px-2.5 py-1 text-xs transition-colors border-r border-gray-200 last:border-r-0
                ${weight === w
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => onItalicChange(!italic)}
        disabled={!italic && !italicAvailable}
        className={`px-2.5 py-1 text-xs italic rounded border transition-colors
          ${italic
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }
          disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        I
      </button>
    </div>
  )
}

export default function GlyphGrid({ fontItem }) {
  const [weight, setWeight] = useState('400')
  const [italic, setItalic] = useState(false)
  const [selectedGlyph, setSelectedGlyph] = useState(null)

  const variant = buildVariant(weight, italic)
  const resolvedVariant = fontItem.files?.[variant] ? variant : Object.keys(fontItem.files ?? {})[0]

  const { glyphs, fontFamily, parsedFont, loading, error } = useFont(fontItem, resolvedVariant)

  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(800)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    setContainerWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const available = (fontItem.variants ?? []).filter(v => fontItem.files?.[v]).map(parseVariant)
    const defaultWeight = available.some(p => p.weight === '400' && !p.italic)
      ? '400'
      : available[0]?.weight ?? '400'
    setWeight(defaultWeight)
    setItalic(false)
    setSelectedGlyph(null)
  }, [fontItem])

  useEffect(() => {
    setSelectedGlyph(null)
  }, [variant])

  function handleWeightChange(w) {
    setWeight(w)
    if (italic) {
      const available = (fontItem.variants ?? []).filter(v => fontItem.files?.[v]).map(parseVariant)
      if (!available.some(p => p.weight === w && p.italic)) setItalic(false)
    }
  }

  const panelWidth = 320
  const effectiveWidth = containerWidth - panelWidth
  const columnCount = Math.max(1, Math.floor((effectiveWidth + GAP) / (CELL_SIZE + GAP)))

  const rows = []
  for (let i = 0; i < glyphs.length; i += columnCount) {
    rows.push(glyphs.slice(i, i + columnCount))
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => CELL_SIZE + GAP,
    overscan: 5,
  })

  return (
    <div className="relative isolate flex flex-col h-full">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: -1,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255) 1px, transparent 1px)',
          backgroundSize: '6px 6px',
          backgroundAttachment: 'fixed',
          maskImage: 'linear-gradient(to top, black 0%, transparent 40vh)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 40vh)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: -2,
          background: 'linear-gradient(to top, #e5efea, transparent 60vh)',
        }}
      />
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{fontItem.family}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {loading ? 'Loading…' : (
              <>
                {glyphs.length.toLocaleString()} glyphs
                {' · '}
                <a
                  href={`https://fonts.google.com/specimen/${fontItem.family.replace(/ /g, '+')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-emerald-600 hover:text-gray-800 transition-colors"
                >
                  Google Fonts
                  <span className="inline-flex ml-1 relative top-px">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12px" viewBox="0 0 512 512">
                      <path d="M299 107L299 64L448 64L448 213L405 213L405 137L196 346L166 316L375 107L299 107M107 405L405 405L405 256L448 256L448 405Q448 422 435 435Q422 448 405 448L107 448Q89 448 76.50 435.50Q64 423 64 405L64 107Q64 89 76.50 76.50Q89 64 107 64L256 64L256 107L107 107" fill="currentColor" />
                    </svg>
                  </span>
                </a>
              </>
            )}
          </p>
        </div>
        <VariantControls
          variants={fontItem.variants ?? []}
          files={fontItem.files ?? {}}
          weight={weight}
          italic={italic}
          onWeightChange={handleWeightChange}
          onItalicChange={setItalic}
        />
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>
      )}

      {loading && (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          Fetching and parsing font file…
        </div>
      )}

      {!loading && !error && glyphs.length > 0 && (
        <div className="flex-1 overflow-hidden relative">
          <div ref={containerRef} className="h-full overflow-auto p-6">
            <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                <div
                  key={virtualRow.index}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    right: panelWidth,
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columnCount}, ${CELL_SIZE}px)`,
                    gap: GAP,
                  }}
                >
                  {rows[virtualRow.index].map((glyph) => (
                    <GlyphCell
                      key={glyph.index}
                      glyph={glyph}
                      fontFamily={fontFamily}
                      font={parsedFont}
                      isSelected={selectedGlyph?.index === glyph.index}
                      onClick={() =>
                        setSelectedGlyph((prev) =>
                          prev?.index === glyph.index ? null : glyph
                        )
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {selectedGlyph && (
            <GlyphDetail
              glyph={selectedGlyph}
              fontFamily={fontFamily}
              font={parsedFont}
              onClose={() => setSelectedGlyph(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}

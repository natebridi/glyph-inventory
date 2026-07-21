import { memo, useRef, useState, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFont } from '../hooks/useFont'
import { useGlyphFilter } from '../hooks/useGlyphFilter'
import GlyphCell from './GlyphCell'
import GlyphDetail from './GlyphDetail'
import GlyphFilter from './GlyphFilter'
import CheckboxRow from './CheckboxRow'

const CELL_SIZE = 88
const GAP = 0
const SAMPLE_SENTENCES = [
  'Sphinx of black quartz, judge my vow.',
  'Pack my box with five dozen liquor jugs.',
  'A wizard mixes bright glyphs beneath the moon.',
  'Typography gives quiet ideas a visible voice.',
  'The quick onyx goblin jumps over the lazy dwarf.',
  'Every letter carries a little piece of history.',
  'Jaded zombies acted quaintly but kept driving.',
  'Small details make familiar words feel new.',
]

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

const SamplePreview = memo(function SamplePreview({ fontFamily, reserved }) {
  const [sampleSize, setSampleSize] = useState(32)
  const [sampleSentence] = useState(
    () => SAMPLE_SENTENCES[Math.floor(Math.random() * SAMPLE_SENTENCES.length)]
  )

  return (
    <div className="mb-10" style={{ width: `calc(100% - ${reserved}px)` }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-4 text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M133 107L21 405L73 405L100 329L220 329L247 405L299 405L187 107L133 107M205 286L115 286L159 162L161 162L205 286M320 235L491 235L491 277L320 277" fill="currentColor" /></svg>
        </div>
        <input
          id="sample-size"
          type="range"
          min="16"
          max="72"
          step="1"
          value={sampleSize}
          onChange={(event) => setSampleSize(Number(event.target.value))}
          aria-label="Sample text size"
          className="w-32 accent-accent"
        />
        <div className="w-6 text-accent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M133 107L21 405L73 405L100 329L220 329L247 405L299 405L187 107L133 107M205 286L115 286L159 162L161 162L205 286M427 171L427 235L491 235L491 277L427 277L427 341L384 341L384 277L320 277L320 235L384 235L384 171" fill="currentColor" /></svg>
        </div>
        <label htmlFor="sample-size" className="hidden text-[10px] uppercase tracking-wider text-content-muted">
          Sample size
        </label>
      </div>
      <p
        className="text-content whitespace-nowrap overflow-hidden text-ellipsis"
        style={{ fontFamily: `'${fontFamily}'`, fontSize: `${sampleSize}px`, lineHeight: 1.2 }}
      >
        {sampleSentence}
      </p>
    </div>
  )
})

function VariantControls({ variants, files, weight, italic, onWeightChange, onItalicChange }) {
  const available = variants.filter(v => files[v]).map(parseVariant)
  const weights = [...new Set(available.map(p => p.weight))].sort((a, b) => Number(a) - Number(b))
  const italicAvailable = available.some(p => p.weight === weight && p.italic)

  return (
    <div className="flex items-center gap-3">
      {weights.length > 1 && (
        <div className="flex overflow-hidden">
          <label className="text-xs py-1 pr-4">Weight</label>
          {weights.map((w) => (
            <button
              key={w}
              onClick={() => onWeightChange(w)}
              className={`px-2.5 py-1 text-xs border-b-2 transition-colors last:border-r-0
                ${weight === w
                  ? 'text-content border-b-2 font-semibold'
                  : 'text-content border-transparent hover:bg-surface-hover'
                }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}
      <CheckboxRow
        label="Italic"
        checked={italic}
        disabled={!italic && !italicAvailable}
        disabledTitle="not available at this weight"
        onChange={() => onItalicChange(!italic)}
      />
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

  const resetKey = `${fontItem.family}/${resolvedVariant}`
  const filter = useGlyphFilter(glyphs, resetKey)

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
  // Only reserve space for the detail panel when it's actually open, so glyphs
  // fill the full width the rest of the time.
  const reserved = selectedGlyph ? panelWidth : 0
  const effectiveWidth = containerWidth - reserved
  const columnCount = Math.max(1, Math.floor((effectiveWidth + GAP) / (CELL_SIZE + GAP)))

  const rows = []
  for (let i = 0; i < filter.filteredGlyphs.length; i += columnCount) {
    rows.push(filter.filteredGlyphs.slice(i, i + columnCount))
  }

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => CELL_SIZE + GAP,
    overscan: 5,
    // Buffer so a scrolled-to glyph isn't flush against the viewport edge.
    scrollPaddingStart: 48,
    scrollPaddingEnd: 48,
  })

  // Keep the selected glyph on screen: opening the detail panel reflows the grid
  // (fewer columns), which can move the selected cell out of view.
  useEffect(() => {
    if (!selectedGlyph) return
    const pos = filter.filteredGlyphs.findIndex(g => g.index === selectedGlyph.index)
    if (pos < 0) return
    const rowIndex = Math.floor(pos / columnCount)
    rowVirtualizer.scrollToIndex(rowIndex, { align: 'auto', behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGlyph, columnCount])

  return (
    <div className="flex h-full">
      {/* Controls column — title bar, variant picker and filters, to the left of the glyphs */}
      <div className="w-72 shrink-0 flex flex-col h-full overflow-y-auto">
        <div className="px-6 py-4">
          <h2 className="text-lg font-semibold text-content truncate">{fontItem.family}</h2>
          <a
            href={`https://fonts.google.com/specimen/${fontItem.family.replace(/ /g, '+')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-xs text-link underline hover:text-link-hover transition-colors"
          >
            Google Fonts
            <span className="inline-flex ml-1 relative top-px">
              <svg xmlns="http://www.w3.org/2000/svg" width="12px" viewBox="0 0 512 512">
                <path d="M299 107L299 64L448 64L448 213L405 213L405 137L196 346L166 316L375 107L299 107M107 405L405 405L405 256L448 256L448 405Q448 422 435 435Q422 448 405 448L107 448Q89 448 76.50 435.50Q64 423 64 405L64 107Q64 89 76.50 76.50Q89 64 107 64L256 64L256 107L107 107" fill="currentColor" />
              </svg>
            </span>
          </a>
        </div>

        {!loading && !error && glyphs.length > 0 && (
          <GlyphFilter
            search={filter.search}
            onSearchChange={filter.setSearch}
            hiddenBlocks={filter.hiddenBlocks}
            onBlockToggle={filter.toggleBlock}
            onAllBlocksChecked={filter.setAllBlocksChecked}
            allBlocksHidden={filter.allBlocksHidden}
            hideEmpty={filter.hideEmpty}
            onHideEmptyChange={filter.setHideEmpty}
            unicodeOnly={filter.unicodeOnly}
            onUnicodeOnlyChange={filter.setUnicodeOnly}
            availableBlocks={filter.availableBlocks}
            allBlocks={filter.allBlocks}
            filteredCount={filter.filteredGlyphs.length}
            totalCount={glyphs.length}
            isFiltered={filter.isFiltered}
          />
        )}
      </div>

      {/* Glyph area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <div className="shrink-0 px-6 py-3 overflow-x-auto">
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
          <div className="m-6 p-4 bg-danger/10 text-danger text-sm rounded-md">{error}</div>
        )}

        {loading && (
          <div className="flex h-full items-center justify-center text-content-muted text-sm">
            Fetching and parsing font file…
          </div>
        )}

        {!loading && !error && glyphs.length > 0 && (
          <>
            <div ref={containerRef} className="flex-1 min-h-0 overflow-auto p-6">
              <SamplePreview key={resetKey} fontFamily={fontFamily} reserved={reserved} />

              {filter.filteredGlyphs.length === 0 ? (
                <div className="flex min-h-32 items-center justify-center text-content-muted text-sm">
                  No glyphs match these filters
                </div>
              ) : (
                <div
                  className="border-t border-l border-border"
                  style={{
                    height: rowVirtualizer.getTotalSize(),
                    position: 'relative',
                    // +1 for the left rule, so the fixed-width columns inside
                    // still land exactly on CELL_SIZE boundaries.
                    width: columnCount * CELL_SIZE + 1,
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: virtualRow.start,
                        left: 0,
                        right: 0,
                        height: CELL_SIZE,
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
              )}
            </div>

            {selectedGlyph && (
              <GlyphDetail
                glyph={selectedGlyph}
                fontFamily={fontFamily}
                font={parsedFont}
                onClose={() => setSelectedGlyph(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useState, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFontList } from '../hooks/useFontList'

const CATEGORIES = ['all', 'sans-serif', 'serif', 'display', 'handwriting', 'monospace']
const LOGO_STEP = 3

function Logo() {
  function renderWord(word) {
    return word.split('').map((char, i) => (
      <span
        key={i}
        aria-hidden="true"
        style={{ marginTop: `${i * LOGO_STEP}px` }}
        className="inline-flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-[2px] uppercase text-gray-600 bg-white leading-none select-none"
      >
        {char}
      </span>
    ))
  }

  return (
    <h1 aria-label="Glyph Inventory" className="leading-none mb-4">
      <span className="flex gap-1 items-start" aria-hidden="true">
        {renderWord('glyph')}
      </span>
      <span className="flex gap-1 items-start mt-1 ml-[25px]" aria-hidden="true">
        {renderWord('inventory')}
      </span>
    </h1>
  )
}

export default function FontList({ selected, onSelect }) {
  const { fonts, loading, error } = useFontList()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    return fonts.filter((f) => {
      const matchesQuery = f.family.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || f.category === category
      return matchesQuery && matchesCategory
    })
  }, [fonts, query, category])

  const listRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 58,
    overscan: 10,
  })

  return (
    <aside className="relative isolate w-72 flex flex-col border-r border-gray-100 shrink-0 h-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: -1,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255) 1px, transparent 1px)',
            backgroundSize: '6px 6px',
            backgroundAttachment: 'fixed',
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 50vh)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 50vh)',
          }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: -2,
          background: 'linear-gradient(to bottom, #e4efe9, transparent 40vh)',
        }}
      />
      <div className="px-4 pt-5 pb-3 border-b border-gray-200 shrink-0">
        <Logo />

        <input
          type="search"
          placeholder="Search typefaces…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 bg-white"
        />

        <div className="flex flex-wrap gap-1 mt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors capitalize
                ${category === cat
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-500 bg-white border-gray-200 hover:border-gray-400'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-50 text-red-700 text-xs rounded-md">{error}</div>
      )}

      {loading && (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          Loading fonts…
        </div>
      )}

      {!loading && !error && (
        <div ref={listRef} className="flex-1 overflow-auto">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const font = filtered[virtualRow.index]
              const isSelected = selected?.family === font.family
              return (
                <div
                  key={font.family}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    right: 0,
                  }}
                >
                  <button
                    onClick={() => onSelect(font)}
                    className={`w-full text-left px-4 py-2.5 transition-colors
                      ${isSelected
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-sm font-medium truncate">{font.family}</div>
                    <div className={`text-xs mt-0.5 capitalize ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                      {font.category} · {font.variants.length} variant{font.variants.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-gray-400 text-sm">
          No typefaces found
        </div>
      )}
    </aside>
  )
}

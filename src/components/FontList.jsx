import { useState, useRef, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useFontList } from '../hooks/useFontList'
import CategoryIcon from './CategoryIcon'

// Short labels keep the three-column filter grid on one line each.
const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'sans-serif', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Script' },
  { value: 'monospace', label: 'Mono' },
]

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

  const isFiltered = query !== '' || category !== 'all'

  const listRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 45,
    overscan: 10,
  })

  return (
    <aside className="w-72 flex flex-col shrink-0 h-full border-r border-border">
      <div className="flex items-center h-[38px] px-4 border-b border-border shrink-0">
        <h1 className="font-mono text-[11px] font-medium tracking-[0.13em] text-content">
          GLYPH INVENTORY
        </h1>
      </div>

      {/* Borderless search: with no box to outline, focus is signalled by the band
          tinting to `surface` and the magnifier inking up. */}
      <div className={`flex items-center gap-[11px] mb-4 px-4 py-5 shrink-0 transition-colors focus-within:bg-accent focus-within:text-content-inverted ${query ? 'focus-within:text-content-inverted' : 'text-content'}`}>
        <svg
          className={`shrink-0 transition-colors`}
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          type="text"
          placeholder="Search typefaces"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setQuery('')}
          className={`flex-1 min-w-0 bg-transparent outline-none text-xl  caret-accent placeholder:text-content-muted ${query ? 'text-content focus:text-content-inverted' : 'text-content-inverted'} `}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className={`shrink-0 flex items-center justify-center w-6 h-6 -mr-1 rounded-full transition-colors hover:bg-background hover:text-content`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        )}
      </div>

      {/* Fixed-width slots rather than free wrap, so the six marks form two clean lanes. */}
      <div className="flex flex-wrap gap-x-4 gap-y-2.5 px-4 pb-4 border-b border-border shrink-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`flex items-center gap-1.5 w-[74px] pb-[5px] border-b-2 transition-colors
              ${category === cat.value
                ? 'border-accent text-content font-semibold'
                : 'border-transparent text-content-secondary hover:text-content'
              }`}
          >
            <CategoryIcon category={cat.value} size={14} className="shrink-0" />
            <span className="text-[12.5px] leading-[15px]">{cat.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="m-4 p-3 bg-danger/10 text-danger text-xs rounded-md">{error}</div>
      )}

      {loading && (
        <div className="flex flex-1 items-center justify-center text-content-muted text-sm">
          Loading fonts…
        </div>
      )}

      {!loading && !error && (
        <div className="flex justify-end px-4 pt-3 pb-1.5 shrink-0">
          <span className="font-mono text-[11px] tracking-[0.06em] text-content-muted tabular-nums">
            {isFiltered
              ? `${filtered.length.toLocaleString()} of ${fonts.length.toLocaleString()}`
              : fonts.length.toLocaleString()}
          </span>
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
                        ? 'bg-accent text-on-accent'
                        : 'text-content-secondary hover:bg-surface-hover'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        category={font.category}
                        size={18}
                        title={font.category}
                        className="shrink-0 bg-surface text-content-secondary rounded-md"
                      />
                      <span className="flex-1 text-sm font-medium truncate">{font.family}</span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-content-muted text-sm">
          No typefaces found
        </div>
      )}
    </aside>
  )
}

import { useState } from 'react'
import { OTHER_SCRIPT_BLOCKS } from '../utils/unicodeBlocks'
import CheckboxRow from './CheckboxRow'

export default function GlyphFilter({
  search, onSearchChange,
  hiddenBlocks, onBlockToggle,
  hideEmpty, onHideEmptyChange,
  unicodeOnly, onUnicodeOnlyChange,
  onAllBlocksChecked, allBlocksHidden,
  availableBlocks,
  allBlocks,
  filteredCount, totalCount,
  isFiltered,
}) {
  // Primary categories are always shown (disabled when absent); other scripts
  // stay in the collapsible drawer and only list blocks the font actually has.
  const primaryBlocks = allBlocks.filter(b => !OTHER_SCRIPT_BLOCKS.has(b.name))
  const otherBlocks = availableBlocks.filter(b => OTHER_SCRIPT_BLOCKS.has(b.name))
  const hasHiddenOther = otherBlocks.some(b => hiddenBlocks.has(b.name))
  // Other scripts are hidden by default now, so expanding whenever something is
  // hidden would mean the drawer always starts open. The "(n hidden)" badge on
  // the collapsed toggle carries that information instead.
  const [showOther, setShowOther] = useState(false)
  const otherExpanded = showOther

  return (
    <div className="px-6 py-4 space-y-3">
      <div className="relative">
        <svg
          className="absolute left-0 top-1/2 -translate-y-1/2 text-content pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Name or codepoint…"
          className="w-full py-1 pl-7 text-xs border-b-2 border-border-strong outline-none focus:border-border-strong"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary"
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div>
        <CheckboxRow
          checked={hideEmpty}
          onChange={() => onHideEmptyChange(!hideEmpty)}
          label="Hide empty"
        />
        <CheckboxRow
          checked={unicodeOnly}
          onChange={() => onUnicodeOnlyChange(!unicodeOnly)}
          label="Unicode only"
        />
      </div>

      {(primaryBlocks.length > 0 || otherBlocks.length > 0) && (
        <div className="pt-2">
          <div className="flex items-center justify-between gap-2 pb-1">
            <button
              onClick={() => onAllBlocksChecked(allBlocksHidden)}
              className="text-[11px] text-link underline underline-offset-2 hover:text-link-hover transition-colors"
            >
              {allBlocksHidden ? 'Check all' : 'Uncheck all'}
            </button>
            {isFiltered && (
              <span className="shrink-0 font-mono text-[11px] tracking-[0.06em] tabular-nums text-content-muted">
                {filteredCount.toLocaleString()} of {totalCount.toLocaleString()}
              </span>
            )}
          </div>

          {primaryBlocks.map(block => (
            <CheckboxRow
              key={block.name}
              label={block.name}
              count={block.count}
              disabled={block.count === 0}
              checked={block.count > 0 && !hiddenBlocks.has(block.name)}
              onChange={() => onBlockToggle(block.name)}
            />
          ))}

          {otherBlocks.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => setShowOther(v => !v)}
                className="flex items-center gap-1 py-1 text-xs text-content-muted hover:text-content-secondary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${otherExpanded ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Other scripts
                {hasHiddenOther && (
                  <span className="ml-0.5 tabular-nums text-content-muted">
                    ({otherBlocks.filter(b => hiddenBlocks.has(b.name)).length} hidden)
                  </span>
                )}
              </button>
              {otherExpanded && (
                <div>
                  {otherBlocks.map(block => (
                    <CheckboxRow
                      key={block.name}
                      label={block.name}
                      count={block.count}
                      checked={!hiddenBlocks.has(block.name)}
                      onChange={() => onBlockToggle(block.name)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

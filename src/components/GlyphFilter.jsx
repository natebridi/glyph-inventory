import { useState } from 'react'
import { OTHER_SCRIPT_BLOCKS } from '../utils/unicodeBlocks'

function Toggle({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors whitespace-nowrap
        ${active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'text-gray-500 bg-white border-gray-200 hover:border-gray-400'
        }`}
    >
      {children}
    </button>
  )
}

function BlockChip({ block, active, onToggle }) {
  return (
    <button
      onClick={() => onToggle(block.name)}
      className={`px-2 py-0.5 text-xs rounded-full border transition-colors
        ${active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'text-gray-500 bg-white border-gray-200 hover:border-gray-400'
        }`}
    >
      {block.name}
      <span className="ml-1 tabular-nums text-gray-400">{block.count}</span>
    </button>
  )
}

export default function GlyphFilter({
  search, onSearchChange,
  activeBlocks, onBlockToggle,
  hideEmpty, onHideEmptyChange,
  unicodeOnly, onUnicodeOnlyChange,
  availableBlocks,
  filteredCount, totalCount,
  isFiltered,
}) {
  const primaryBlocks = availableBlocks.filter(b => !OTHER_SCRIPT_BLOCKS.has(b.name))
  const otherBlocks = availableBlocks.filter(b => OTHER_SCRIPT_BLOCKS.has(b.name))
  const hasActiveOther = otherBlocks.some(b => activeBlocks.has(b.name))
  const [showOther, setShowOther] = useState(false)
  const otherExpanded = showOther || hasActiveOther

  return (
    <div className="px-6 py-3 border-b border-gray-100 shrink-0 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
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
            className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded-md outline-none focus:border-gray-400 bg-white w-48"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <Toggle active={hideEmpty} onClick={() => onHideEmptyChange(!hideEmpty)}>
          Hide empty
        </Toggle>
        <Toggle active={unicodeOnly} onClick={() => onUnicodeOnlyChange(!unicodeOnly)}>
          Unicode only
        </Toggle>

        {isFiltered && (
          <span className="ml-auto text-xs text-gray-400 tabular-nums">
            {filteredCount.toLocaleString()} of {totalCount.toLocaleString()}
          </span>
        )}
      </div>

      {availableBlocks.length > 0 && (
        <div className="space-y-1.5">
          {primaryBlocks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {primaryBlocks.map(block => (
                <BlockChip key={block.name} block={block} active={activeBlocks.has(block.name)} onToggle={onBlockToggle} />
              ))}
            </div>
          )}

          {otherBlocks.length > 0 && (
            <div>
              <button
                onClick={() => setShowOther(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
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
                {hasActiveOther && (
                  <span className="ml-0.5 tabular-nums text-gray-500">
                    ({otherBlocks.filter(b => activeBlocks.has(b.name)).length} active)
                  </span>
                )}
              </button>
              {otherExpanded && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {otherBlocks.map(block => (
                    <BlockChip key={block.name} block={block} active={activeBlocks.has(block.name)} onToggle={onBlockToggle} />
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

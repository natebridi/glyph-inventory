import { useMemo } from 'react'
import { useFontList } from '../hooks/useFontList'

const SUGGESTION_COUNT = 5

export default function EmptyState({ onSelect }) {
  const { fonts } = useFontList()

  // `fonts` arrives sorted by popularity, so the head of the list is the most
  // popular families.
  const suggestions = useMemo(() => fonts.slice(0, SUGGESTION_COUNT), [fonts])

  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-medium tracking-[-0.015em] text-content">
          Select a typeface from the list to inspect its glyphs
        </h2>

        {suggestions.length > 0 && (
          <p className="mt-3 text-sm text-content-secondary">
            Or try{' '}
            {suggestions.map((font, i) => (
              <span key={font.family}>
                {i > 0 && ', '}
                <button
                  onClick={() => onSelect(font)}
                  className="text-link underline underline-offset-2 transition-colors hover:text-link-hover"
                >
                  {font.family}
                </button>
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  )
}

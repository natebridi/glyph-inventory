import { useState } from 'react'
import FontList from './components/FontList'
import GlyphGrid from './components/GlyphGrid'

export default function App() {
  const [selectedFont, setSelectedFont] = useState(null)

  return (
    <div className="flex h-full bg-white text-gray-900">
      <FontList selected={selectedFont} onSelect={setSelectedFont} />
      <main className="flex-1 overflow-hidden">
        {selectedFont ? (
          <GlyphGrid fontItem={selectedFont} />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Select a typeface to explore its glyph set
          </div>
        )}
      </main>
    </div>
  )
}

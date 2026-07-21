import { useState } from 'react'
import { Agentation } from 'agentation'
import FontList from './components/FontList'
import GlyphGrid from './components/GlyphGrid'
import EmptyState from './components/EmptyState'

export default function App() {
  const [selectedFont, setSelectedFont] = useState(null)

  return (
    <div className="flex h-full bg-background text-content">
      <FontList selected={selectedFont} onSelect={setSelectedFont} />
      <main className="flex-1 overflow-hidden">
        {selectedFont ? (
          <GlyphGrid fontItem={selectedFont} />
        ) : (
          <EmptyState onSelect={setSelectedFont} />
        )}
      </main>
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

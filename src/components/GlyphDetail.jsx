import { useState, useEffect, useMemo } from 'react'
import { getRepresentations } from '../utils/representations'

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={copied ?
        'shrink-0 px-2 py-1 rounded transition-colors bg-emerald-700 text-white' :
        'shrink-0 px-2 py-1 rounded text-gray-400 hover:text-gray-700 transition-colors'}
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" viewBox="0 -960 960 960" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
    </button>
  )
}

function GlyphPreview({ glyph, fontFamily, font }) {
  const hasUnicode = glyph.unicode != null
  const isPrintable = hasUnicode && glyph.unicode >= 32

  if (isPrintable) {
    return (
      <span
        style={{ fontFamily: `'${fontFamily}'`, fontSize: 80, lineHeight: 1 }}
        className="select-all text-gray-900"
      >
        {String.fromCodePoint(glyph.unicode)}
      </span>
    )
  }

  if (!font) return null

  try {
    const height = font.ascender - font.descender
    const path = glyph.glyph.getPath(0, font.ascender, font.unitsPerEm)
    const pathData = path.toPathData(2)
    return (
      <svg
        viewBox={`0 0 ${font.unitsPerEm} ${height}`}
        width={80}
        height={80}
        preserveAspectRatio="xMidYMid meet"
        className="text-gray-900"
      >
        <path d={pathData} fill="currentColor" />
      </svg>
    )
  } catch {
    return <span className="text-gray-300 text-4xl">∅</span>
  }
}

function buildSvgString(glyph, font) {
  if (!font) return null
  try {
    const height = font.ascender - font.descender
    const path = glyph.glyph.getPath(0, font.ascender, font.unitsPerEm)
    const pathData = path.toPathData(2)
    if (!pathData || pathData.length <= 1) return null
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${font.unitsPerEm} ${height}"><path d="${pathData}"/></svg>`
  } catch {
    return null
  }
}

export default function GlyphDetail({ glyph, fontFamily, font, onClose }) {
  const svgString = useMemo(() => buildSvgString(glyph, font), [glyph, font])

  const representations = useMemo(() => {
    const reps = getRepresentations(glyph.unicode) ?? []
    if (svgString) reps.push({ label: 'SVG', value: svgString, svg: true })
    return reps.length > 0 ? reps : null
  }, [glyph.unicode, svgString])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const hexLabel = glyph.unicode != null
    ? `U+${glyph.unicode.toString(16).toUpperCase().padStart(glyph.unicode > 0xffff ? 6 : 4, '0')}`
    : null

  return (
    <div className="absolute inset-y-0 right-0 w-80 bg-white border-l border-gray-100 shadow-2xl flex flex-col z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-900 truncate">
            {glyph.name ?? `Glyph #${glyph.index}`}
          </p>
          {hexLabel && (
            <p className="text-xs text-gray-400 font-mono mt-0.5">{hexLabel}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="shrink-0 ml-3 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Preview */}
      <div className="flex items-center justify-center py-8 border-b border-gray-100 bg-gray-50 shrink-0">
        <GlyphPreview glyph={glyph} fontFamily={fontFamily} font={font} />
      </div>

      {/* Representations */}
      <div className="flex-1 overflow-auto">
        {representations && (
          <ul className="divide-y divide-gray-50">
            {representations.map(({ label, value, note, svg }) => (
              <li key={label} className="px-5 py-3">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                      {label}
                      {note && <span className="normal-case tracking-normal ml-1">· {note}</span>}
                    </p>
                    {svg ? <p className="text-lg font-mono text-gray-800 break-all">&lt;svg &hellip; /&gt; <span className="text-[10px] text-gray-500">{value.length} chars</span></p> : <p className="text-lg font-mono text-gray-800 break-all">{value}</p>}
                    {svg}
                  </div>
                  <CopyButton value={value} />
                </div>
              </li>
            ))}
          </ul>
        )}
        {glyph.unicode == null && (
          <div className="px-5 py-4 text-xs text-gray-400 border-t border-gray-50">
            No Unicode code point — accessed via OpenType layout features (e.g.{' '}
            <code className="bg-gray-100 px-1 rounded">liga</code>,{' '}
            <code className="bg-gray-100 px-1 rounded">salt</code>).
          </div>
        )}
      </div>
    </div>
  )
}

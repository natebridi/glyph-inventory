import { useState, useEffect, useMemo } from 'react'
import { getRepresentations } from '../utils/representations'

// Enter/exit timing. Kept in one place because GlyphGrid needs the same number
// to know when the collapse has finished and the row can be unmounted.
export const DETAIL_ANIM_MS = 420
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
// Gap between steps of the top-down reveal.
const STEP_MS = 20

// These transitions are set inline, which outranks any `motion-reduce:` class,
// so the preference has to be read in JS and applied to the style itself.
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// Content arrives in sequence rather than as one block: the character leads,
// then everything below it follows in reading order.
function reveal(delay, open, reduced) {
  if (reduced) return { opacity: open ? 1 : 0 }
  return {
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0)' : 'translateY(-8px)',
    filter: open ? 'blur(0)' : 'blur(12px)',
    transition: `opacity 240ms ease, transform 240ms ${EASE}, filter 240ms ease`,
    transitionDelay: open ? `${delay}ms` : '0ms',
  }
}

// The character gets its own treatment: a slight settle plus a defocus-to-focus
// blur, anchored at the top of the glyph so it grows downward rather than
// appearing to rise off the baseline.
function revealHero(open, reduced) {
  if (reduced) return { opacity: open ? 1 : 0 }
  return {
    opacity: open ? 1 : 0,
    transform: open ? 'scale(1)' : 'translateY(-10px) scale(0.7)',
    filter: open ? 'blur(0px)' : 'blur(16px)',
    transformOrigin: '50% 0%',
    transition: `opacity 260ms ease, transform 380ms ${EASE}, filter 300ms ease`,
  }
}

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
        'shrink-0 px-2 py-1 transition-colors bg-success text-content' :
        'shrink-0 px-2 py-1 text-content-inverted hover:bg-on-accent/20 transition-colors'}
      aria-label={copied ? 'Copied' : 'Copy'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" viewBox="0 -960 960 960" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
    </button>
  )
}

function GlyphPreview({ glyph, fontFamily, font, size = 104 }) {
  const hasUnicode = glyph.unicode != null
  const isPrintable = hasUnicode && glyph.unicode >= 32

  if (isPrintable) {
    return (
      <span
        style={{ fontFamily: `'${fontFamily}'`, fontSize: size, lineHeight: 1 }}
        className="select-all text-on-accent"
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
        width={size}
        height={size}
        preserveAspectRatio="xMidYMid meet"
        className="text-on-accent"
      >
        <path d={pathData} fill="currentColor" />
      </svg>
    )
  } catch {
    return <span className="text-on-accent/60 text-4xl">∅</span>
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

export default function GlyphDetail({ glyph, fontFamily, font, onClose, open }) {
  const reduced = usePrefersReducedMotion()
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
    // 0fr → 1fr is the one height transition CSS can actually interpolate, so the
    // row opens smoothly and the virtualizer re-measures it as it grows.
    <div
      className="grid"
      style={{
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: reduced ? 'none' : `grid-template-rows ${DETAIL_ANIM_MS}ms ${EASE}`,
      }}
    >
      <div className="overflow-hidden">
        <div className="border-b border-r border-border bg-accent">
          <div className="flex items-start gap-8 px-6 py-6">
            {/* Hero — leads the sequence, scaling up out of the cell it came from */}
            <div className="shrink-0 w-[168px] flex flex-col items-center gap-3">
              <div
                className="flex items-start justify-center h-[112px]"
                style={revealHero(open, reduced)}
              >
                <GlyphPreview glyph={glyph} fontFamily={fontFamily} font={font} />
              </div>
              <div
                className="text-center min-w-0 w-full"
                style={reveal(STEP_MS, open, reduced)}
              >
                <p className="text-xs font-medium text-on-accent truncate">
                  {glyph.name ?? `Glyph #${glyph.index}`}
                </p>
                {hexLabel && (
                  <p className="font-mono text-[11px] tabular-nums text-on-accent/70 mt-0.5">
                    {hexLabel}
                  </p>
                )}
              </div>
            </div>

            {/* Representations — laid out across the full grid width */}
            <div className="flex-1 min-w-0">
              {representations && (
                <ul className="grid grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-1">
                  {representations.map(({ label, value, note, svg }, i) => (
                    <li
                      key={label}
                      className="min-w-0 py-1.5"
                      style={reveal(STEP_MS * 2 + i * 45, open, reduced)}
                    >
                      <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs text-on-accent/60 tracking-wide mb-0.5">
                            {label}
                            {note && <span className="normal-case tracking-normal ml-1">· {note}</span>}
                          </p>
                          {svg ? (
                            <p className="text-sm font-mono text-on-accent truncate">
                              &lt;svg &hellip; /&gt;{' '}
                              <span className="text-[10px] text-on-accent/70">{value.length} chars</span>
                            </p>
                          ) : (
                            <p className="text-sm font-mono text-on-accent truncate">{value}</p>
                          )}
                        </div>
                        <CopyButton value={value} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {glyph.unicode == null && (
                <div
                  className="mt-3 text-xs text-on-accent/70"
                  style={reveal(STEP_MS * 2, open, reduced)}
                >
                  No Unicode code point — accessed via OpenType layout features (e.g.{' '}
                  <code className="bg-on-accent/15 px-1 rounded">liga</code>,{' '}
                  <code className="bg-on-accent/15 px-1 rounded">salt</code>).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

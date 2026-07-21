import iconAll from '../assets/icon_all.svg?raw'
import iconSans from '../assets/icon_sans.svg?raw'
import iconSerif from '../assets/icon_serif.svg?raw'
import iconDisplay from '../assets/icon_display.svg?raw'
import iconHand from '../assets/icon_hand.svg?raw'
import iconMono from '../assets/icon_mono.svg?raw'

// Strip the XML prolog / doctype so the markup can be inlined into HTML.
const clean = (svg) =>
  svg.replace(/<\?xml[\s\S]*?\?>/, '').replace(/<!DOCTYPE[\s\S]*?>/, '').trim()

// Google Fonts category → glyph-shaped icon in src/assets.
// `all` is the no-filter pseudo-category, so its mark is a grid rather than a letterform.
const ICONS = {
  all: clean(iconAll),
  'sans-serif': clean(iconSans),
  serif: clean(iconSerif),
  display: clean(iconDisplay),
  handwriting: clean(iconHand),
  monospace: clean(iconMono),
}

// Inlined so `fill: currentColor` (an inherited property) tints the paths,
// letting the icon adapt to selected/disabled states.
export default function CategoryIcon({ category, size = 20, className = '', title }) {
  const markup = ICONS[category]
  if (!markup) return null
  return (
    <span
      aria-hidden="true"
      title={title}
      className={className}
      style={{
        display: 'inline-flex',
        width: size,
        height: size,
        lineHeight: 0,
        fill: 'currentColor',
      }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  )
}

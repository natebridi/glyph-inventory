const BLOCKS = [
  { name: 'Basic Latin', start: 0x0000, end: 0x00FF },
  { name: 'Latin Extended-A', start: 0x0100, end: 0x017F },
  { name: 'Latin Extended-B', start: 0x0180, end: 0x024F },
  { name: 'IPA Extensions', start: 0x0250, end: 0x02AF },
  { name: 'Spacing Modifiers', start: 0x02B0, end: 0x02FF },
  { name: 'Combining Diacritics', start: 0x0300, end: 0x036F },
  { name: 'Greek & Coptic', start: 0x0370, end: 0x03FF },
  { name: 'Cyrillic', start: 0x0400, end: 0x04FF },
  { name: 'Cyrillic Supplement', start: 0x0500, end: 0x052F },
  { name: 'Armenian', start: 0x0530, end: 0x058F },
  { name: 'Hebrew', start: 0x0590, end: 0x05FF },
  { name: 'Arabic', start: 0x0600, end: 0x06FF },
  { name: 'Syriac', start: 0x0700, end: 0x074F },
  { name: 'Devanagari', start: 0x0900, end: 0x097F },
  { name: 'Bengali', start: 0x0980, end: 0x09FF },
  { name: 'Gurmukhi', start: 0x0A00, end: 0x0A7F },
  { name: 'Gujarati', start: 0x0A80, end: 0x0AFF },
  { name: 'Tamil', start: 0x0B80, end: 0x0BFF },
  { name: 'Telugu', start: 0x0C00, end: 0x0C7F },
  { name: 'Kannada', start: 0x0C80, end: 0x0CFF },
  { name: 'Malayalam', start: 0x0D00, end: 0x0D7F },
  { name: 'Thai', start: 0x0E00, end: 0x0E7F },
  { name: 'Lao', start: 0x0E80, end: 0x0EFF },
  { name: 'Tibetan', start: 0x0F00, end: 0x0FFF },
  { name: 'Georgian', start: 0x10A0, end: 0x10FF },
  { name: 'Hangul Jamo', start: 0x1100, end: 0x11FF },
  { name: 'Latin Extended Additional', start: 0x1E00, end: 0x1EFF },
  { name: 'Greek Extended', start: 0x1F00, end: 0x1FFF },
  { name: 'General Punctuation', start: 0x2000, end: 0x206F },
  { name: 'Superscripts & Subscripts', start: 0x2070, end: 0x209F },
  { name: 'Currency Symbols', start: 0x20A0, end: 0x20CF },
  { name: 'Letterlike Symbols', start: 0x2100, end: 0x214F },
  { name: 'Number Forms', start: 0x2150, end: 0x218F },
  { name: 'Arrows', start: 0x2190, end: 0x21FF },
  { name: 'Mathematical Operators', start: 0x2200, end: 0x22FF },
  { name: 'Miscellaneous Technical', start: 0x2300, end: 0x23FF },
  { name: 'Control Pictures', start: 0x2400, end: 0x243F },
  { name: 'Enclosed Alphanumerics', start: 0x2460, end: 0x24FF },
  { name: 'Box Drawing', start: 0x2500, end: 0x257F },
  { name: 'Block Elements', start: 0x2580, end: 0x259F },
  { name: 'Geometric Shapes', start: 0x25A0, end: 0x25FF },
  { name: 'Miscellaneous Symbols', start: 0x2600, end: 0x26FF },
  { name: 'Dingbats', start: 0x2700, end: 0x27BF },
  { name: 'Supplemental Arrows', start: 0x27F0, end: 0x27FF },
  { name: 'Braille Patterns', start: 0x2800, end: 0x28FF },
  { name: 'Supplemental Mathematical', start: 0x2A00, end: 0x2AFF },
  { name: 'CJK Symbols & Punctuation', start: 0x3000, end: 0x303F },
  { name: 'Hiragana', start: 0x3040, end: 0x309F },
  { name: 'Katakana', start: 0x30A0, end: 0x30FF },
  { name: 'Bopomofo', start: 0x3100, end: 0x312F },
  { name: 'Hangul Compatibility Jamo', start: 0x3130, end: 0x318F },
  { name: 'Enclosed CJK', start: 0x3200, end: 0x32FF },
  { name: 'CJK Compatibility', start: 0x3300, end: 0x33FF },
  { name: 'CJK Unified Ideographs', start: 0x4E00, end: 0x9FFF },
  { name: 'Hangul Syllables', start: 0xAC00, end: 0xD7AF },
  { name: 'Private Use Area', start: 0xE000, end: 0xF8FF },
  { name: 'CJK Compatibility Ideographs', start: 0xF900, end: 0xFAFF },
  { name: 'Alphabetic Presentation Forms', start: 0xFB00, end: 0xFB4F },
  { name: 'Arabic Presentation Forms-A', start: 0xFB50, end: 0xFDFF },
  { name: 'CJK Compatibility Forms', start: 0xFE30, end: 0xFE4F },
  { name: 'Small Form Variants', start: 0xFE50, end: 0xFE6F },
  { name: 'Arabic Presentation Forms-B', start: 0xFE70, end: 0xFEFF },
  { name: 'Halfwidth & Fullwidth Forms', start: 0xFF00, end: 0xFFEF },
  { name: 'Mathematical Alphanumeric Symbols', start: 0x1D400, end: 0x1D7FF },
  { name: 'Emoji & Symbols', start: 0x1F300, end: 0x1F9FF },
]

// Reclassifies characters from the old Latin-1 Supplement range (U+0080–U+00FF)
// into more meaningful blocks. Basic Latin's range covers the remaining Latin letters.
const LATIN1_OVERRIDES = new Map([
  [0x00A1, 'General Punctuation'],       // ¡
  [0x00A2, 'Currency Symbols'],          // ¢
  [0x00A3, 'Currency Symbols'],          // £
  [0x00A4, 'Currency Symbols'],          // ¤
  [0x00A5, 'Currency Symbols'],          // ¥
  [0x00A6, 'General Punctuation'],       // ¦
  [0x00A7, 'Letterlike Symbols'],        // §
  [0x00A8, 'Spacing Modifiers'],         // ¨
  [0x00A9, 'Letterlike Symbols'],        // ©
  [0x00AB, 'General Punctuation'],       // «
  [0x00AC, 'Mathematical Operators'],    // ¬
  [0x00AD, 'General Punctuation'],       // soft hyphen
  [0x00AE, 'Letterlike Symbols'],        // ®
  [0x00AF, 'Spacing Modifiers'],         // ¯
  [0x00B0, 'Mathematical Operators'],    // °
  [0x00B1, 'Mathematical Operators'],    // ±
  [0x00B2, 'Superscripts & Subscripts'], // ²
  [0x00B3, 'Superscripts & Subscripts'], // ³
  [0x00B4, 'Spacing Modifiers'],         // ´
  [0x00B5, 'Letterlike Symbols'],        // µ
  [0x00B6, 'General Punctuation'],       // ¶
  [0x00B7, 'General Punctuation'],       // ·
  [0x00B8, 'Spacing Modifiers'],         // ¸
  [0x00B9, 'Superscripts & Subscripts'], // ¹
  [0x00BB, 'General Punctuation'],       // »
  [0x00BC, 'Number Forms'],              // ¼
  [0x00BD, 'Number Forms'],              // ½
  [0x00BE, 'Number Forms'],              // ¾
  [0x00BF, 'General Punctuation'],       // ¿
  [0x00D7, 'Mathematical Operators'],    // ×
  [0x00F7, 'Mathematical Operators'],    // ÷
])

export const OTHER_SCRIPT_BLOCKS = new Set([
  'Greek & Coptic',
  'Greek Extended',
  'Latin Extended-A',
  'Latin Extended-B',
  'Latin Extended Additional',
  'IPA Extensions',
  'Combining Diacritics',
  'Cyrillic',
  'Cyrillic Supplement',
  'Armenian',
  'Hebrew',
  'Arabic',
  'Syriac',
  'Devanagari',
  'Bengali',
  'Gurmukhi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Thai',
  'Lao',
  'Tibetan',
  'Georgian',
  'Hangul Jamo',
  'Hangul Compatibility Jamo',
  'Hangul Syllables',
  'CJK Symbols & Punctuation',
  'Hiragana',
  'Katakana',
  'Bopomofo',
  'Enclosed CJK',
  'CJK Compatibility',
  'CJK Unified Ideographs',
  'CJK Compatibility Ideographs',
  'Alphabetic Presentation Forms',
  'Arabic Presentation Forms-A',
  'Arabic Presentation Forms-B',
  'CJK Compatibility Forms',
  'Small Form Variants',
  'Halfwidth & Fullwidth Forms',
])

export function getBlock(codepoint) {
  const override = LATIN1_OVERRIDES.get(codepoint)
  if (override != null) return { name: override }
  return BLOCKS.find(b => codepoint >= b.start && codepoint <= b.end) ?? null
}

export function getAvailableBlocks(glyphs) {
  const counts = new Map()
  for (const g of glyphs) {
    if (g.unicode == null) continue
    const block = getBlock(g.unicode)
    if (!block) continue
    counts.set(block.name, (counts.get(block.name) ?? 0) + 1)
  }
  return BLOCKS
    .filter(b => counts.has(b.name))
    .map(b => ({ ...b, count: counts.get(b.name) }))
}

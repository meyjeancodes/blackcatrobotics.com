# BlackCat Robotics — Code Style Rules

## No Emojis. Ever.

Emojis are prohibited in all HTML, CSS, JS, and copy across every
blackcatrobotics.com property. This includes:
- Unicode emoji (U+1F000 and above)
- Dingbats and symbol characters used decoratively (check, warning, arrow, X, star, etc.)
- Emoji in alt text, placeholder text, meta descriptions, or page titles

Use plain text, HTML entities, or CSS-only visual treatments instead.

## Approved Alternatives

- Checkmarks: use text "Yes" or a CSS ::before element
- Warnings: use "[!]" prefix or a styled CSS badge
- Arrows: use &rarr; &larr; &nearr; or plain "->" in copy; use '\2192' in CSS content properties
- Close buttons: use &times; or plain "X"
- Decorative symbols: use CSS borders, backgrounds, or ::before/::after

This rule applies to all current and future pages, components,
dashboard UI, and any copy written for the site.

## Verify Command

Run this after any HTML edit to confirm no violations:

```
python3 -c "
import re
TARGET = set([0x2713,0x26A0,0x2192,0x2190,0x25BE,0x25BC,0x2715,0x2605]) | set(range(0x1F000,0x20000))
files = ['index.html','blackcat-os.html','blackcat-grid.html','habitat.html']
for fname in files:
    with open(fname, encoding='utf-8') as f:
        hits = [f'L{i} U+{ord(m.group()):04X}: {line.strip()[:70]}' for i,line in enumerate(f,1) for m in re.finditer(r'[^\x00-\x7F]',line) if ord(m.group()) in TARGET]
    print('PASS' if not hits else 'FAIL', fname)
    for h in hits: print(' ',h)
"
```

Expected output: `PASS` for every file, no lines below each.

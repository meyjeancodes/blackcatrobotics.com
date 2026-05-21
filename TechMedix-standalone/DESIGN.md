---
version: alpha
name: BlackCat Robotics
description: Warm industrial minimalism — muted paper, fire-orange accent, ink-black text.
colors:
  primary: "#0A0A0F"
  ink-2: "#3A3A45"
  ink-3: "#8888A0"
  paper: "#F0EFE8"
  paper-2: "#FAFAF4"
  white: "#FFFFFF"
  fire: "#CC3D17"
  fire-2: "#D4401A"
  gold: "#C8A96E"
  green: "#1DB954"
typography:
  h1:
    fontFamily: Tanker
    fontSize: 48px
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  h2:
    fontFamily: Tanker
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  h3:
    fontFamily: Tanker
    fontSize: 28px
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: Satoshi
    fontSize: 15px
    lineHeight: 1.8
  body-small:
    fontFamily: Satoshi
    fontSize: 12px
    lineHeight: 1.65
  label-caps:
    fontFamily: Chakra Petch
    fontSize: 9px
    fontWeight: 500
    letterSpacing: "0.08em"
  label-micro:
    fontFamily: Chakra Petch
    fontSize: 7.5px
    letterSpacing: "0.06em"
  eyebrow:
    fontFamily: Chakra Petch
    fontSize: 10px
    letterSpacing: "0.12em"
rounded:
  sm: 12px
  lg: 20px
  pill: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
components:
  button-primary:
    backgroundColor: "{colors.fire}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: 13px 28px
  button-primary-hover:
    backgroundColor: "{colors.fire-2}"
    textColor: "{colors.white}"
  button-outline:
    backgroundColor: transparent
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 13px 28px
  button-outline-dark:
    backgroundColor: transparent
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: 13px 28px
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: 18px 20px
  tag-active:
    backgroundColor: "#43A04720"
    textColor: "#15803D"
    rounded: "{rounded.pill}"
  tag-fire:
    backgroundColor: "#E84E1B1E"
    textColor: "{colors.fire}"
    rounded: "{rounded.pill}"
  tag-gold:
    backgroundColor: "#C8A96E26"
    textColor: "#92661A"
    rounded: "{rounded.pill}"
  tag-indigo:
    backgroundColor: "#6366F11E"
    textColor: "#4338CA"
    rounded: "{rounded.pill}"
  nav-cta:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: 8px 20px
  nav-cta-hover:
    backgroundColor: "{colors.fire}"
---

## Overview

BlackCat Robotics speaks in warm industrial minimalism. The palette is grounded in muted paper tones (#F0EFE8) with deep ink (#0A0A0F) text. Fire orange (#E84E1B) is the sole accent color — used sparingly for primary actions, links, and badges. Dark sections (hero, ticker, how-it-works) invert to an ink backdrop with white text. The overall mood: technical but not cold, authoritative but not aggressive.

## Colors

- **Primary (#0A0A0F):** Near-black for body text, nav, footers, and dark section backgrounds.
- **Paper (#F0EFE8):** Primary page background — warm off-white, never pure white.
- **Paper-2 (#FAFAF4):** Slightly lighter surface for card and alternate sections.
- **Fire (#CC3D17):** The sole interaction driver. Buttons, links, badges, accent marks.
- **Fire-2 (#D4401A):** Hover state for fire elements.
- **Ink-2 (#3A3A45):** Secondary body text, descriptions.
- **Ink-3 (#8888A0):** Lowest-emphasis text — labels, captions, metadata.
- **Gold (#C8A96E):** Reserved for special callouts and premium badges.
- **Green (#1DB954):** Status indicators (active, live, online).

On dark backgrounds, text uses reduced opacity (55%) rather than a lighter hex — creates a consistent dimming effect.

## Typography

Three font families, each with a clear job:

- **Tanker** — Display headings. Large sizes with tight negative tracking. Never body text.
- **Satoshi** — Body text, buttons, navigation. Clean geometric sans.
- **Chakra Petch** — UI labels, badges, tabs, ticker. Monospace feel. Always uppercase.

## Layout

Desktop sections use 96px vertical / 80px horizontal padding. Tablet reduces to 64px / 24px. Mobile is 48px / 16px. Cards scroll horizontally at 280px min-width with 16px gap and snap-scroll. Navigation is a fixed 68px bar with 24px backdrop blur.

## Elevation

The default card shadow is subtle (0 2px 16px / 7% ink). Hovered cards get a large shadow (0 20px 60px / 15% ink). The hero uses a gradient overlay to ensure text readability on any background.

## Shapes

- **sm:** 12px — spec badges, small containers.
- **lg:** 20px — cards, modals.
- **pill:** 9999px — buttons, nav links, tabs, tag chips.

## Components

- **button-primary:** Fire bg, white text, pill shape. The only high-emphasis action per view.
- **button-primary-hover:** Brighter fire (#FF6535), lifts 2px with stronger glow shadow.
- **button-outline:** Transparent bg with ink border on light sections.
- **button-outline-dark:** Transparent bg with white border on dark sections.
- **card:** White bg, lg rounded, subtle border. Hover lifts +5px with large shadow.
- **Tags (tag-*):** 4 color variants for platform status — green (active), fire (compatible), gold (premium), indigo (defense).
- **nav-cta:** Ink bg, white text, pill shape. Hover transitions to fire bg.

## Do's and Don'ts

- **Do** use fire (#E84E1B) as the sole accent — don't introduce new action colors.
- **Do** keep page background paper (#F0EFE8) — never pure white on main surfaces.
- **Don't** use Tanker for body text — it's a display face only.
- **Don't** put buttons on pure white — use card surfaces only.
- **Don't** use fire for non-interactive decoration — it loses its signal value.
- **Don't** nest component variants. `button-primary-hover` is a sibling, not a child.

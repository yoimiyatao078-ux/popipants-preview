
# Popipants Website — Full 2000s Retro Internet Aesthetic Redesign

## Objective
Completely rebuild the Popipants website from the current kawaii pastel pink style into an authentic **2000s retro internet / Y2K aesthetic** — inspired by sites like resurg3nce.com, with floating stickers, spinning CD, old-PC-style popups, animated figurines, white sparkle particles, and a future-ready theme switcher architecture.

---

## Current State → Target State

| Aspect | Current | Target |
|--------|---------|--------|
| Aesthetic | Kawaii pastel pink, modern minimal | 2000s retro internet, Y2K, glitchy, raw |
| Colors | Pink/lavender/cream | Pink (default), with CSS vars for blue/red/black themes. No purple. |
| Font (headings) | Bubblegum Sans | Something more Y2K — e.g. VT323 (pixel), Monoton (retro), or Freestyle Script |
| Font (body) | Space Grotesk | Same or similar clean body font |
| Location | Oslo | Trondheim |
| Story section | "Our Story" as main feature | "My Story" — moved to secondary/about page, not homepage |
| Sparkle color | Pink | White sparkles floating |
| Decorations | Static kawaii images inline | Stickers with background-removed PNGs floating with animation |
| Interactions | Basic hover effects | Spinning CD, figurine click → old-PC popup, category panel with sticker icons |
| Theme system | None | CSS custom property architecture for 4 color modes |

---

## Image Asset Strategy

### Stickers (background-removed PNGs needed)
- `2273a7b2835475826942d9e99f8141c5.jpg` → CD design → Spinning CD on screen edge
- `30ba7f94c36127f33230d3bac5ca944e.jpg` → Flip phone → Floating sticker
- `36a4cd08bda3ea966542556f42ff13a8.jpg` → Hello Kitty "made in Japan" → Floating sticker

### Section Backgrounds
- `44c25eb3210ab65bf79af3edf543c632.jpg` → Monster design → Hero section bg
- `5fcd0e280ee08d1cce1ed17e2ca2724a.jpg` → Monster design → Features section bg
- `787d18bc6b73030a3360be43075448bb.jpg` → Monster design → Collection section bg
- And others for lookbook/other sections

### Y2K Website Example
- `ff4e84d900dea743dd1549508ae27d89.jpg` → 2000s website reference for layout/structure

> **Note**: Background removal for stickers will be done via CSS `mix-blend-mode`, `filter`, or semi-transparent overlays since we can't use external tools for actual image editing. We'll style them to look embedded into the page naturally.

---

## Implementation Plan

### Step 1: CSS Color System Overhaul (`styles.css`)
**Goal**: Establish a theme-ready CSS custom property system, remove all purple, add white sparkle colors.

**Changes**:
- Rewrite `:root` variables with a complete pink theme (default)
- Add `[data-theme="blue"]`, `[data-theme="red"]`, `[data-theme="black"]` variable sets (for future use)
- Remove ALL purple/lavender/lilac references
- Add new Y2K-specific variables: `--glitch-color`, `--retro-green`, `--retro-yellow`, `--chrome`
- Add white sparkle color variables
- Add retro pixel/terminal-style aesthetic tokens

**Color Palettes** (each theme):
```
PINK (default):    #FF69B4, #FFB6D9, #FFF0F5, #FF1493, #FF6EB4
BLUE (tropical):   #00BFFF, #00CED1, #E0FFFF, #20B2AA, #40E0D0  (future)
RED (downtown):    #DC143C, #8B0000, #2D0A0A, #FF4444, #CC0000  (future)
BLACK (gothic):    #1A1A1A, #333333, #0D0D0D, #666666, #4A4A4A  (future)
```

### Step 2: Complete CSS Rewrite for 2000s Aesthetic (`styles.css`)
**Goal**: Transform the entire visual language.

**Changes**:
- Body background: dark or mixed pattern, not clean white
- Add scanline/CRT overlay effect via CSS pseudo-elements
- Change all border-radius from 24px to more angular/brutalist (2-8px) with occasional rounded for kawaii contrast
- Add pixel-art borders, dashed/dotted borders (very 2000s)
- Add `cursor: url(...)` custom cursors (star or sparkle)
- Add "under construction" / "guestbook" / "visitor counter" aesthetic elements
- Retro button styles: beveled 3D effect, gradient buttons
- Star/sparkle animations: change from pink to white
- Add marquee-style CSS animation for certain elements
- Add retro scrollbar styling (`::-webkit-scrollbar`)
- Glitch text effect for headings
- Blinking text effect for accents (subtle, not annoying)
- Visitor counter placeholder
- "Best viewed in" badge aesthetic

### Step 3: JavaScript Overhaul (`script.js`)
**Goal**: Add all new interactive elements.

**Changes**:
- **White sparkle system**: Replace current pink stars with white sparkles that float around the page (canvas or DOM-based)
- **Spinning CD**: Add the CD sticker to page edge, spinning continuously with CSS animation, click to play cute music (or toggle)
- **Animated figurines**: 2-3 floating character stickers on the side. Clicking one triggers an old-PC-style popup (see below)
- **Old-PC popup**: A popup styled like a Windows 98/XP dialog box with title bar, close button (X), and content area with email signup form. Uses the retro beveled border style.
- **Category panel**: Horizontal strip with category buttons (Shirts, Pants, Accessories, etc.) with sticker icons. Icons vary by theme (future-ready).
- **Theme switcher**: 4 colored circles in a sidebar or bottom corner. Click to change `data-theme` attribute on `<html>`. Currently only pink works; others show "Coming Soon" tooltip.
- **Cursor trail**: White sparkle cursor trail (replacing pink)
- Keep: scroll header effect, mobile menu, intersection observer animations

### Step 4: Rebuild Home Page (`index.html`)
**Goal**: Full 2000s retro landing page.

**Structure**:
- **Top bar**: Marquee-style scrolling text ("✦ FREE SHIPPING IN NORWAY ✦ NEW DROPS COMING SOON ✦")
- **Header**: Category panel with sticker icons (Shirts 👕, Pants 👖, Accessories ✨, etc.)
- **Hero**: Monster-design background, POPIPANTS title with glitch effect, tagline "Trondheim, Norway · est. 2024"
- **Main buttons**: Shop, Lookbook, Contact (useful actions — NOT "Our Story")
- **Spinning CD**: Positioned on right edge of screen, rotating continuously
- **Floating stickers**: CD, flip phone, Hello Kitty — floating with gentle animation
- **Figurines**: 2-3 animated characters on left side, clickable → old-PC popup
- **White sparkles**: Floating across entire page
- **Visitor counter**: Retro-style at bottom
- **Footer**: Social links, "My Story" link (small, not main attraction), "Made in Trondheim ♡"
- Remove "Oslo" → "Trondheim" everywhere

### Step 5: Rebuild About Page (`about.html`)
**Goal**: "My Story" page with 2000s diary/blog aesthetic.

**Structure**:
- Retro blog-post style layout (like a LiveJournal or early blog)
- "My Story" instead of "Our Story"
- Written in first person
- Monster design background for hero
- Retro-styled cards with beveled borders
- Mention Trondheim, not Oslo
- Keep inspiration gallery but with retro styling
- Remove purple glow orbs

### Step 6: Rebuild Collection Page (`collection.html`)
**Goal**: Retro product grid with "Coming Soon" state.

**Structure**:
- Monster-design background for hero section
- Product grid with retro card styling
- "Coming Soon" badges styled like old "NEW!" GIF badges
- Category filter bar with sticker icons
- Newsletter signup with old-PC-style input
- Remove purple references

### Step 7: Rebuild Lookbook Page (`lookbook.html`)
**Goal**: Masonry grid with retro overlay styling.

**Structure**:
- Monster-design background for hero
- Masonry grid using actual reference images
- Retro tag overlays (dashed borders, pixel fonts)
- Lightbox with old-window-chrome styling
- Remove purple references

### Step 8: Rebuild Contact Page (`contact.html`)
**Goal**: Retro contact form with 2000s aesthetic.

**Structure**:
- Contact form styled like an old Windows form (beveled inputs, pixel borders)
- Location: Trondheim, Norway
- Social links styled as retro buttons
- FAQ section with retro card styling
- Remove purple references

### Step 9: Theme Switcher Integration
**Goal**: Wire up the 4-theme CSS variable system.

**Structure**:
- Fixed sidebar with 4 colored circles: 🩷 pink (active), 🔵 blue, 🔴 red, ⚫ black
- Clicking pink = current theme (works now)
- Clicking blue/red/black = shows "Coming Soon ✦" tooltip
- CSS variables are already defined in Step 1 — just need `data-theme` attribute switching
- Theme persists via `localStorage`

### Step 10: Polish & Verify
- Mobile responsiveness pass
- All pages navigate correctly
- No purple anywhere
- Location says Trondheim
- Sparkles are white
- Stickers float properly
- CD spins
- Figurine popups work
- Theme switcher functional (pink works, others show coming soon)
- No broken images or links

---

## Files to Modify

| File | Action |
|------|--------|
| `styles.css` | **Major rewrite** — new color system, 2000s aesthetic, retro styling |
| `script.js` | **Major rewrite** — sparkles, CD, figurines, popups, theme switcher |
| `index.html` | **Full rebuild** — new hero, stickers, CD, figurines, sparkles |
| `about.html` | **Full rebuild** — "My Story", retro blog style, Trondheim |
| `collection.html` | **Full rebuild** — retro product grid, category icons |
| `lookbook.html` | **Full rebuild** — retro masonry, lightbox styling |
| `contact.html` | **Full rebuild** — retro form, Trondheim location |

---

## Verification / DoD

- [ ] All 5 pages load without errors
- [ ] No purple (#800080, lavender, lilac) anywhere in CSS
- [ ] "Trondheim" appears (not "Oslo")
- [ ] "My Story" appears (not "Our Story")
- [ ] White sparkles animate across pages
- [ ] CD sticker spins on screen edge
- [ ] Clicking figurine opens old-PC-style popup
- [ ] Theme switcher shows 4 circles; pink works, others show "Coming Soon"
- [ ] Category panel appears with icon labels
- [ ] Mobile-responsive on all pages
- [ ] Reference images used as section backgrounds
- [ ] Sticker images float with animation
- [ ] Retro 2000s aesthetic is consistent across all pages

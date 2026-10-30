# Popipants — Project Instructions

## Overview
Popipants is a handmade character streetwear brand from Trondheim, Norway. This website uses a **Y2K old-PC retro aesthetic** inspired by early-2000s GeoCities/Angelfire sites and Windows 95/98 UI.

## Tech Stack
- Vanilla HTML, CSS, JavaScript (no frameworks)
- Google Fonts: Monoton (headings), Comic Neue (body/accents)
- System fonts: Tahoma, Arial (UI elements)
- No build tools, no bundler

## Deployment & Planned Services
- **Vercel** is the deployment platform for this static site and will provide the production URL, preview deployments, HTTPS, and custom-domain configuration.
- **Supabase** will be used for the future product/catalog database, email-list records, and authenticated admin data. Public browser code must only use publishable Supabase values; never commit service-role keys.
- **Stripe** will be used for future checkout and payment processing. Stripe secret keys must stay in Vercel environment variables and server-side/API code; never expose them in HTML or client JavaScript.

### Vercel setup
1. Create or sign in to a Vercel account at https://vercel.com and create a new project from this repository.
2. Keep the framework preset as **Other** (this is a static HTML/CSS/JS site), leave the build command empty, and use `.` as the output directory.
3. Deploy. Vercel will serve `index.html` as the root page and the other HTML files as clean URLs.
4. For a custom domain, open the project in Vercel → **Settings → Domains**, add the domain, then follow the DNS records Vercel provides at your registrar. Vercel will automatically provision HTTPS after DNS verification.
5. Add future secrets under **Settings → Environment Variables** for the Production, Preview, and Development environments as appropriate. Do not put secrets in this repository.

The repository includes `vercel.json` for clean URLs, no trailing slashes, and basic security headers. The `.gitignore` keeps `.env` files and Vercel's local folder out of version control.

## Design Rules (STRICT)

### Color Palette
- **White/light backgrounds only** — NO dark themes
- **Pink**: `#FF69B4` (primary), `#FFB6D9`, `#FFD6E8`
- **Cyan**: `#00CED1`, `#BAE6FD`, `#E0F2FE`
- **Accent green**: `#089F7B`
- **Panel gray**: `#C0C0C0`, `#DFDFDF`
- **Text**: `#333333`, `#666666`

### Layout
- Two-column layout: left sidebar (180px) + main content
- Sidebar has Win95-style blue titlebar sections
- Top nav bar with colored buttons (pink, blue, orange, green, purple)
- All content panels use Win95 chrome (outset/inset borders)

### Image Usage Rules (CRITICAL)
The `.jpg` images in the project folder are **design references** for the visual aesthetic — NOT content to be displayed on the website.
- **DO**: Use images as background textures, pattern inspiration, color references, or tiling backgrounds
- **DO**: Extract colors, patterns, or visual motifs from them to inform CSS styling
- **DON'T**: Insert them as `<img>` tags on the page as if they're product photos
- **DON'T**: Treat them as inventory/product images or display them in product cards
- **DON'T**: Show them to visitors as if they're part of the brand's content

The website uses **emoji placeholders** (`👕`, `🧥`, `🎒`) and **gradient backgrounds** for product cards until real product photography is available. The figurine/sticker/CD images exist to guide the *vibe*, not to be literally shown.

### What NOT To Do
- **NO dark backgrounds** — the site is bright and light
- **NO floating stickers, figurines, or spinning CDs** — no viewport-fixed decorations
- **NO modern card designs** — use Win95 panel styling
- **NO injecting reference images into the site** — see Image Usage Rules above

### Allowed Effects
- Cursor sparkle trail (pink/cyan)
- Banner stars animation
- Win95 popup messages
- Category/sidebar filtering (JS)
- Visitor counter animation

## File Structure
See **README-structure.md** for the full map (written for non-coders).
Short version: pages are the 5 `.html` files; shared sidebar/menu/footer live in `js/layout.js`;
styles are in `css/` (loaded through `css/main.css`); colour themes are in `themes/theme-*.css`;
pictures used by the site are in `images/`; mood-board pictures not used live in `inspiration/`.

## CSS Classes Reference
- `.page-wrapper` / `.page-layout` — main layout container
- `.sidebar` / `.sidebar-section` / `.sidebar-title` / `.sidebar-nav` (built by js/layout.js)
- `.main-content` / `.top-nav.category-nav` (built by js/layout.js)
- `.banner` / `.banner-title` / `.banner-subtitle`
- `.win-panel` / `.win-titlebar` / `.win-panel-inset` — Win95 window chrome
- `.card` / `.product-card` / `.product-image` / `.product-info`
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-retro` / `.btn-aero`
- `.masonry-grid` / `.masonry-item` / `.masonry-overlay` / `.masonry-tag`
- `.filter-bar` / `.filter-btn` — lookbook filtering
- `.u-*` helper classes — css/utilities.css

## JS Features
- js/theme-boot.js — applies the saved theme before the page paints
- js/layout.js — shared sidebar, top menu, marquee, footer
- js/main.js — sparkles, cursor trail, popups, music button, theme boxes, lookbook filter, visitor counter
- js/shop-and-extras.js — shop filters, bag, contact prefill, "my_desktop" shelf
- js/critters.js + js/critter-shapes.js (generated) — per-mood critters; source in tools/critters/ (run build.py)

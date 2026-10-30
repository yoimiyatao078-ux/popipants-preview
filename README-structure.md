# Popipants website — where to change what

This is a plain website: just HTML, CSS and JavaScript files. There's no build step and no
installing. Vercel shows the files exactly as they are.

**To look at it on your computer:** open a terminal in this folder, run
`python -m http.server 8000`, then go to http://localhost:8000 in your browser.
(Double-clicking `index.html` mostly works too, but the music player needs the little server.)

---

## The folders, in plain words

```
popipants/
├── index.html          ← Home page
├── collection.html     ← Shop ("Shop the drop")
├── lookbook.html       ← Lookbook gallery
├── about.html          ← My Story
├── contact.html        ← Contact form
│
├── js/                 ← things that MOVE or REACT (clicks, popups, menus)
│   ├── layout.js           ★ sidebar, top menu, scrolling bar, footer (shared by ALL pages)
│   ├── main.js             sparkles, popups, music button, theme boxes, lookbook filter, visitor counter
│   ├── shop-and-extras.js  shop filter buttons, shopping bag, "my_desktop" icon row
│   ├── critters.js         the little critters (perching, corner buddy, hover surprise)
│   ├── critter-shapes.js   critter drawings (MADE BY tools/critters/build.py, don't hand-edit)
│   └── theme-boot.js       remembers your colour theme (don't need to touch)
│
├── css/                ← how things LOOK (colours, sizes, spacing)
│   ├── main.css            the list of all style files, in order (don't reorder!)
│   ├── base.css            fonts + basic colours + basic text settings
│   ├── layout.css          the big pieces: scrolling bar, sidebar, main column, menus
│   ├── components.css      reusable bits: windows, buttons, product cards, popups, footer
│   ├── responsive.css      phone/tablet adjustments
│   ├── sidebar-and-menu.css theme box area, "click me" button, pill menu, music player
│   ├── extras.css          colour boxes, glossy buttons, shopping bag, icon row
│   ├── utilities.css       tiny helper classes used in the HTML (u-center, u-emoji-lg …)
│   └── pages/
│       ├── home.css        only the Home page
│       ├── inner-pages.css Shop, Lookbook, My Story, Contact (they share one look)
│       ├── about.css       My Story bits
│       └── contact.css     the contact form
│
├── themes/             ← the 4 colour worlds (the coloured boxes in the sidebar)
│   ├── theme-pink.css      Pink (the default look)
│   ├── theme-blue.css      Blue — tropical
│   ├── theme-red.css       Red — downtown
│   ├── theme-goth.css      Goth — black/purple
│   └── theme-shared.css    rules every non-pink theme uses (usually leave alone)
│
├── images/             ← every picture the site actually shows
│   ├── pink/  blue/        theme pictures
│   └── inspo/              Pinterest pins used in the "my_desktop" row
├── inspiration/        ← mood-board pictures NOT on the site yet (kept for redesigns;
│                          Vercel skips this folder, see .vercelignore)
├── music/              ← background songs (on your PC; the Home page plays one)
├── vercel.json         ← Vercel settings (clean URLs etc.)
└── CLAUDE.md           ← notes for AI helpers
```

---

## "I want to…" cheat sheet

| I want to… | Open this file | What to look for |
|---|---|---|
| Add/rename a page in the left menu | `js/layout.js` | the `SIDEBAR_LINKS` list at the top |
| Change the round pill buttons at the top | `js/layout.js` | the `TOP_LINKS` list |
| Change the footer text / social links | `js/layout.js` | the `footer:` part |
| Change the scrolling text at the very top | that page's `.html` file | `data-text="…"` on the first `<script>` line |
| Change words, products, prices on a page | that page's `.html` file | just edit the text between the tags |
| Add a product to the shop | `collection.html` | copy one whole `<div class="product-card" …>…</div>` block and change it (`data-category` = tees / hoodies / accessories / limited) |
| Change a theme's colours | `themes/theme-<name>.css` | the `--t-…` lines at the top (each has a comment) |
| Rename a theme box / its tooltip | `js/layout.js` | the `THEMES` list |
| Change how the Home page looks | `css/pages/home.css` | |
| Change how the inner pages look | `css/pages/inner-pages.css` | |
| Change how things look on phones | `css/responsive.css` (and the `@media` bits at the end of page files) | |
| Change popup messages | `js/main.js` | search for the message text |
| Change the critters | see "Critters" below | |
| Swap a picture | put the new file in `images/` and change its name where it's used | search all files for the old name |

**How to find something fast:** in your code editor press Ctrl+Shift+F (search in all files) and
type a word you can see on the page, like `fresh from the studio`.

---

## Good to know

- **The sidebar, top menu and footer are written once** in `js/layout.js`. Each page just has a
  line like `<script src="js/layout.js" data-part="sidebar"></script>` where the sidebar goes.
  Edit `layout.js`, and all 5 pages change together.
- **Theme order matters.** `css/main.css` loads the files from top to bottom, and later files
  win. Add new style files to that list and don't shuffle it.
- Pink is the "normal" design, so most pink colours are written straight into the `css/` files.
  The other themes repaint on top of it.
- After changing something, refresh with **Ctrl+F5** so the browser doesn't show an old copy.


## Critters (the little animals)

Each mood has its own critters:
- Pink: butterfly-1 and butterfly-3
- Blue: hibiscus-1 to hibiscus-5
- Red: ladybug-3
- Goth: goth-1 (the bat with a pink heart) and goth-5 (the heart-wing moth)

They show up in 3 ways:
1. **Perched**: 1–2 critters sit on the edge of buttons, cards, titles or menu pills. After a few seconds they fly to another spot you can see. Butterflies and the moth flutter, flowers drift, and the ladybug hops. Phones only get 1.
2. **Corner buddy**: one critter sits next to the mood boxes. When you change mood, it swaps to that mood's critter and bounces hello.
3. **Hover surprise**: when your mouse goes over a product card, a critter pops onto the card's corner. It leaves when the mouse leaves. This is off on phones and tablets.

They never block clicks. They stand still if your device is set to "reduce motion". They pause when the tab is hidden.

**Swap or add a critter**
1. The drawings live in `tools/critters/designs.py`.
2. Open `tools/critters/build.py` and edit the `MOODS` list. Put a critter's name under a mood and pick how it moves: `fly`, `drift` or `hop`.
3. In the site folder, run `python tools/critters/build.py`. This rewrites `js/critter-shapes.js` and `css/critters.css`.
4. To change size, placement or glow, edit `tools/critters/critters-wander.css` and run the build again. Don't edit `css/critters.css` directly.
5. To change timing, edit the settings at the top of `js/critters.js`: which spots they perch on, how long they stay, how fast they fly, and how many critters show at once.

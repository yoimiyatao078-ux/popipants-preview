# Changes (Grok Bot)
## 2026-10-30 — clean-up / restructure
- Split styles.css + themes.css into css/ (base, layout, components, responsive, pages/*, utilities, extras) and themes/theme-{pink,blue,red,goth,shared}.css, loaded via css/main.css.
- Removed dead/overridden CSS (old "black" theme, overridden page backgrounds, unused classes, old roaming-ladybug, bug/heart stickers, hero wings).
- Shared sidebar / top menu / marquee / footer moved into js/layout.js (no flash, works on Vercel clean URLs).
- JS moved into js/; removed dead code (unused synth music handler, old category-panel filter, old active-link code, emoji ladybug).
- Images: used ones moved to images/ with readable names; unused mood-board pictures moved to inspiration/ (excluded from deploy via .vercelignore); duplicate root copies removed.
- Inline styles replaced by classes (css/utilities.css).
- Accessibility: skip link, aria-current on menu, dialog roles + Esc-to-close + focus on popups, aria-labels on social links, reduced-motion support, focus outline.
- Bug fixes: My Story page was not linked from the menu; Lookbook had an old different top menu; contact form squashed on phones; white text-on-white boxes in Red/Goth; two ladybugs at once.
## Earlier the same day
- Ladybug, theme boxes, shop bag/filters, inspo shelf (see README-structure.md).

## Critters (replaces ladybug.js)
- Per-mood critters run in 3 modes: perched, corner buddy and hover surprise.
- Source is in tools/critters/. The build writes js/critter-shapes.js and css/critters.css.
- js/ladybug.js was removed.

## Round 3 — pixel-art remakes
- tools/art/build_pixel.py: original images (phone, CD, notes, stripe tile) rebuilt as pixel art (small grid, limited palette, stepped outline) -> images/art/*.png, shown with image-rendering: pixelated. CD now at 50% opacity.
- Sticker: same layout/barcode/colours as the original, own pixel cat (not Hello Kitty). Two versions: made-in-norway-jp.png (日本製) — used in sidebar — and made-in-norway-no.png (laget i norge).
- Pink critters: new pixel butterflies (tools/critters/pixel_butterfly.py) with glow aura, twinkle sparkles and a slower, smoother 1.6s flutter.

## Round 3b — flying butterflies, phone size, sticker on the right
- Pink mood (js/critters.js): one pixel butterfly idles on top of the "shop the drop"/bag button and follows it on scroll/resize; the other wanders on smooth steering curves with gentle meander, slows when arriving, sometimes hovers mid-air or lands on buttons/titles for a few seconds, flutters faster in flight (.9s) and slower at rest, leaves a faint pixel sparkle trail. pointer-events none; reduced motion = old still behaviour, trail hidden. Other moods unchanged.
- Phone: back to the original size/spot (270px, right -32px, bottom -38px). Pixel PNG is 135px with the tilt baked in, so it's exactly 2x (1x = 135px on phones).
- 日本製 sticker moved from the sidebar to the right side of the main content (js/layout.js adds it, css in pages/home.css).
- Reverted: 日本製 sticker is back in the sidebar in its original spot (right-side placement removed from js/layout.js and css/pages/home.css).

## Round 3c — original placements restored + natural butterfly flight
- Decorative images use the exact original CSS from the pre-refactor site (pixel PNGs kept, image-rendering: pixelated):
  phone 270px, right -32 / bottom -38, rotate(-8deg), mix-blend multiply (the "slightly transparent" look); CD 296px at right 13 / top -22, multiply, no extra opacity; notes 330px, opacity .25, multiply; sidebar sticker 132px, rotate(-3deg), multiply; tile back to 260px / 190px and the pixel tile now has the original 736x414 shape (96x54). Phone PNG no longer has the tilt baked in. Mobile sizes are back to the original ones too.
- Wandering pink butterfly: per-frame physics instead of eased tweens. It has a heading with constant small jitter and steers toward a slowly drifting target. Irregular wingbeats (0.16–0.32s) each give a forward push and a little hop up, and it sinks between beats. Occasional short glides with the wings held still, banking from turn rate, drag, no constant speed.
- Background music (js/main.js): playlist of all 6 tracks in music/. Play starts a random track, switches to a different random track every 60s with a 1.5s crossfade, and also when a track ends. Pause/resume keeps the current track. Filenames are URL-encoded. The status line shows the current track name.

## Round v3 — music buttons + baby pink back
- FM section: grey button replaced by the glossy gel pill (Option A); sidebar on every page gets a small spinning pink CD toggle (Option C, 80px, opacity .45 -> .85 on hover/focus). Both drive the same playlist in js/main.js (toggleMusic/syncMusicUI) and stay in sync via .is-playing + aria-pressed.
- css/preview-brand.css: removed the v2 white background overrides so the theme-pink baby pink + stripes are back; one pink text colour kept. Backup of v2 file: /tmp/preview-brand.v2.bak.

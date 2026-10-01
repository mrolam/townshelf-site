# Townshelf: clickable preview

A static, clickable prototype of **Townshelf**, a marketplace where independent, physical local shops
from across the US sell quality, vetted goods nationwide under their own names.

> **Preview only.** Sample stores and items, no real payments, no signups, no backend and no network calls.
> Mega Brown Box (La Habra, CA) is a real store, but its items here are generic examples, not its real
> inventory or prices. All other shops, owners and quotes are fictional.
> Townshelf is not affiliated with American Express.

## Quick start

```bash
# Option 1: just open the file
open index.html            # macOS (or double-click it)

# Option 2: local server
python3 -m http.server 8765
# → http://127.0.0.1:8765/
```

No build step and no dependencies. Fonts are bundled locally.

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Browse / search with filters | `browse.html` (`?q=`, `?cat=`, `?store=`, `?town=`, `?cond=`) |
| Store page (template) | `store.html?id=<store-slug>` |
| Item page (template) | `item.html?id=<item-slug>` |
| Mock cart / checkout (no payment) | `cart.html` |
| List your shop (interest form, local only) | `list-your-shop.html` |
| About / how it works / FAQ | `about.html` |

## Project structure

```
index.html … about.html   Pages (plain HTML + minimal JS)
css/style.css             Theme (cream/white, charcoal text, teal accents, restrained orange)
js/app.js                 Shared rendering: header/footer, cards, map, postmarks, mock cart, font switch
js/art.js                 Flat SVG placeholder illustrations (no external images)
data/data.js              ALL stores + items (window.TOWNSHELF_DATA)
data/stores.csv, items.csv  Spreadsheet copies of the data
data/templates/           Blank CSV templates
tools/csv_to_datajs.py    CSV → data.js (and --export for data.js → CSV)
tools/screenshots.py      Playwright screenshots → screenshots/
assets/                   Logo, favicon, (future) photos and logos
fonts/                    DM Sans, Fraunces, Young Serif, Bricolage Grotesque, Outfit, Work Sans (SIL OFL)
```

## Adding a store or item

Everything renders from `data/data.js`: home, map pins, browse filters, store and item pages.
Add one store entry (with `lat`/`lng` for its map pin) plus its items, and you're done.

- Step-by-step guide: [ADDING-A-STORE.md](ADDING-A-STORE.md)
- Listing format every item follows: [LISTING-TEMPLATE.md](LISTING-TEMPLATE.md)
- Spreadsheet workflow: edit `data/stores.csv` / `data/items.csv`, then `python3 tools/csv_to_datajs.py`

Item fields that drive the home page:

- `featured: true` shows the item in "Featured finds".
- `hero: <number>` adds the item to the hero rotation. `1`–`3` are shown first (1 = large tile), higher numbers rotate in. Use `false` to leave it out.
- `checkedOn: "YYYY-MM-DD"` is the date the listing was checked; the newest ones fill the "Recently checked" strip.

Store field: `spotlight: true` makes that shop the home page "Shop of the week" (the first match is used).

## Design

- Font: **Fraunces headings + DM Sans body** (default, option 2). Preview alternatives with `?font=1` … `?font=6`.
- Colors: cream/white backgrounds, charcoal text, teal (`#1C8A94`) for buttons and links, and orange (`#EE7A2E`)
  used sparingly: the Townshelf Checked mark, postmarks, the "List your shop" button and the hero accent underline.

## Engagement features (calm, vanilla JS/CSS)

All motion is turned off when the visitor's system has `prefers-reduced-motion` set. There are no popups and no sound.

- Sections fade and slide in as you scroll
- Item, shop and strip cards lift slightly on hover
- The orange underline on "every corner" draws in when the page loads
- Hero tiles slowly crossfade through sample items and towns (each tile links to its item)
- "Shop of the week" spotlight
- Map pins pulse softly. Hovering (desktop) or tapping (mobile) a pin opens a mini shop card; a second tap opens the store. Keyboard: Enter/Escape
- "Recently checked" horizontal strip of newly checked items
- Category chip row (on home it links to Browse; on Browse it filters the results)

## Join form ("Click here to join")

A teal bar at the very top of every page has an orange **Click here to join** button (there's also a "Join Townshelf" link in the footer, and any link to `#join` opens it). It opens a short form: name, email, I am a (Shopper / Shop owner), optional shop name, city/state, phone and website/Instagram for shop owners, and an optional message.

Submissions are sent with [FormSubmit](https://formsubmit.co) (AJAX endpoint `https://formsubmit.co/ajax/Mitch@megabrownbox.com`, set in `TS.JOIN_ENDPOINT` in `js/app.js`) with the subject "New Townshelf join request", the table template, and a `_honey` honeypot field. A thank-you message is shown in place after sending.

**Activation:** the very first submission makes FormSubmit send a one-time "Activate Form" email to Mitch@megabrownbox.com. Click it once; after that every submission is emailed. The service worker never handles POSTs or other sites' requests, so it doesn't touch submissions.

Test without sending anything: `python3 tools/join_check.py` (FormSubmit is mocked).

## "New local shops loading…" strip

A small cream strip sits above the home page "Featured shops" grid and above both listing grids on Browse. It has a tiny storefront icon in the logo style, an animated ellipsis, and an "Own a shop? Join" link that opens the join form with **Shop owner** already selected. When the strip scrolls into view the storefront plays a one-time ~1.25 s "opening" animation (the window blind rolls up and the door sign flips from CLOSED to OPEN). With `prefers-reduced-motion` (or no JS) it is shown already open and nothing moves. Add a strip anywhere with `<div data-loading-strip></div>` (`data-tone="white"` on cream sections). Test: `python3 tools/loading_strip_check.py`.

## "Coming soon: Shop by video" teaser

A teaser card in the home page "How we vet" section and a small line on every item page announce the planned Shop by video feature (video-chat the shop live during store hours before buying). It is a teaser only, with no working video features; the links open the join form. Rendered by `TS.videoTeaser()` and `TS.videoLine()` in `js/app.js`. Test: `python3 tools/teaser_check.py`.

## Installable web app (PWA)

- `manifest.webmanifest`: name/short name "Townshelf", `start_url` and `scope` set to `/townshelf-site/` (the GitHub Pages path), standalone display, cream background (`#FBF6EA`), teal theme (`#1C8A94`), icons at 192 and 512 plus maskable versions in `assets/icons/`.
- `sw.js`: caches the site shell, sample data and default fonts so the site works offline. Pages are fetched from the network first and fall back to the cache offline; other files come from the cache and refresh in the background. The cache is versioned (`VERSION` at the top of `sw.js`). **Bump it whenever you change shell files.** When a new version is ready, the page shows a small "Refresh" bar.
- `js/pwa.js`: registers the service worker and shows a small, dismissible "Add Townshelf to your home screen" card. It uses the browser install prompt on Android/desktop Chrome and Edge, and shows Share → Add to Home Screen steps on iOS Safari. It appears only once, never on first paint (it waits for a scroll or tap and some time on the page), and is never shown again once dismissed or installed. Force it for testing with `?pwa-demo=ios` or `?pwa-demo=android`.
- Regenerate all icons from the source logo with `python3 tools/make_icons.py <logo.jpg>`.
- If you host the site somewhere other than `/townshelf-site/`, update `id`, `start_url` and `scope` in the manifest.

## Screenshots

```bash
python3 -m http.server 8765 &      # from this folder
pip install playwright && python3 -m playwright install chromium   # first time only
python3 tools/screenshots.py
```

## Open placeholders

Pricing and commission, shipping price and program, ship-by window, returns policy, tax, verification process
details, ZIP lookup, real item and store photos, shop logos, founder photo, and Mega Brown Box's street address.
These show as yellow `[TBD]` tags in the UI.

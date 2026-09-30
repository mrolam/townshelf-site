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

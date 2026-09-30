# Adding a store to the Townshelf preview

Every page (home featured shops/items, map pins, town chips, browse filters, store pages,
item pages, cart) renders from **one file: `data/data.js`** (`window.TOWNSHELF_DATA`).
Store and item pages are templates driven by the URL:

- `store.html?id=<store slug>`
- `item.html?id=<item slug>`

**To add a store, add one store entry plus its items. That's all.** The map pin, town chip,
browse filters (category, shop, town) and store page all update automatically.
It works through a local server and also by double-clicking `index.html` (file://).

## Option A: edit `data/data.js` directly

1. Open `data/data.js`.
2. Copy the store template below into the `"stores": [ ... ]` list (mind the commas).
3. Add its items to `"items": [ ... ]` (see LISTING-TEMPLATE.md for the item format).
4. Reload the browser.

```json
{
  "slug": "harbor-lane-books",
  "name": "Harbor Lane Books",
  "category": "Used & new books",
  "town": "Santa Cruz",
  "state": "CA",
  "lat": 36.97,
  "lng": -122.03,
  "owner": "Owner Name",
  "ownerRole": "Owner",
  "tagline": "One short line about the shop.",
  "story": "Two or three sentences in the owner's voice: what the shop is, who runs it, what makes it special.",
  "quote": "Optional short owner quote (leave \"\" for none).",
  "verified": true,
  "checked": true,
  "sample": false,
  "featured": true,
  "color": "#1C8A94",
  "colorLight": "#D6ECEC",
  "icon": "notebook",
  "logo": ""
}
```

### Store fields

| Field | Required | What it is |
|---|---|---|
| `slug` | yes | Unique URL id: lowercase letters, numbers, dashes (`harbor-lane-books`). Used in `store.html?id=` and by items' `store` field. |
| `name` | yes | Shop's display name. The shop is always shown under its own name. |
| `category` | yes | Type of shop, shown on cards and the store page (e.g. "Records & audio"). |
| `town`, `state` | yes | Storefront city and 2-letter state. Drives the "Shipped from" postmark, town filter and map label. |
| `lat`, `lng` | yes | Storefront latitude/longitude (decimal). The map pin is placed automatically. Get them from any map app: right-click the storefront and copy the coordinates. |
| `owner`, `ownerRole` | yes | Owner name and role, for the "Meet the owner" card and store page. |
| `tagline` | yes | One line under the shop name. |
| `story` | yes | 2-3 sentence shop story. |
| `quote` | no | Short owner quote. Leave `""` and the page shows a "story coming soon" note. |
| `verified` | yes | `true` once the physical storefront is verified. Shows the "Verified storefront" badge. |
| `checked` | yes | `true` once the shop's listings pass review. Shows the **Townshelf Checked** mark. |
| `sample` | yes | `true` for fictional preview shops (adds a "Sample shop (fictional)" tag). Use `false` for real shops. |
| `featured` | no | `true` to include the shop in the home page "Featured shops" (the first 6 are shown). |
| `spotlight` | no | `true` to feature the shop as the home page "Shop of the week". Set it on one shop only; if several have it, the first is used. |
| `color`, `colorLight` | optional | Shop brand colors (hex). Kept in the data for future use; the current minimal theme shows all shops in neutral colors. |
| `icon` | no | Fallback illustration key (see `js/art.js`, e.g. `box`, `record`, `plant`, `lamp`, `jacket`). |
| `logo` | no | Path to a logo image, e.g. `assets/logos/harbor-lane-books.png`. Empty = colored monogram. |

## Option B: manage in a spreadsheet (CSV → data.js)

1. `data/stores.csv` and `data/items.csv` hold the current data (open them in Google Sheets or Excel).
   Blank templates with one example row are in `data/templates/`.
2. Add rows, save as CSV, then run:
   ```
   python3 tools/csv_to_datajs.py
   ```
   This validates the data (unique slugs, known store, valid condition, price, lat/lng) and rewrites `data/data.js`.
3. To refresh the CSVs from the current `data.js`: `python3 tools/csv_to_datajs.py --export`.

In the CSVs, list fields (`included`, `photos`, `photoShots`) use `|` between entries, and booleans are `true`/`false`.

## Photos and logos
Put real photos in `assets/photos/<store-slug>/` and list their paths in the item's `photos` array
(in shot-list order: front, back, label/tag, flaws, scale). If `photos` is empty, the site shows an
illustrated placeholder labeled "real store photos required at launch."

## Screenshots
With the site served (`python3 -m http.server 8765` in this folder), run `python3 tools/screenshots.py`
(requires Playwright + Chromium) to regenerate the PNGs in `screenshots/`.

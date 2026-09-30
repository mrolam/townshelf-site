# Townshelf item listing template

Every Townshelf listing uses the same structure, so shoppers can trust and compare items from any shop.
Every sample item in the preview follows this format, and the item page (`item.html?id=...`) always
shows the same sections in the same order: photos → condition + **Townshelf Checked** → title → price
(+ original retail) → condition definition → description → what's included / missing → sold & shipped by →
shipping (ships from, ship-by, cost, returns) → item details (brand, category, condition, dimensions, weight).

## Required fields

| # | Field (`data.js` key) | Rule |
|---|---|---|
| 1 | **Title** (`title`) | **Brand + item + key detail + size/color.** e.g. `[Brand] Stand Mixer, Tilt-Head, 5-Qt, Red` · `Unbranded 1980s Denim Trucker Jacket, Men's M, Medium Wash`. No ALL CAPS, no hype words ("AMAZING!!"), no keyword stuffing. Use "Unbranded" or "Shop-made" when there's no brand. |
| 2 | **Brand** (`brand`) | Maker/brand, or "Unbranded", "Shop-made", "Local potter", etc. |
| 3 | **Condition grade** (`condition`) | Exactly one of `New`, `Open Box`, `Like New` (definitions below). |
| 4 | **What's included** (`included`) | List every piece in the box (`["Mixer base","5-qt bowl","Whisk"]`). |
| 5 | **What's missing** (`missing`) | Anything not included that normally would be (e.g. "Original box", "Carry case"), or `"None"`. |
| 6 | **Photos** (`photos`) | **3-6 real photos of the actual item** (no stock photos), in shot-list order (below). |
| 7 | **Price** (`price`) | Your selling price in USD. |
| 8 | **Original / retail price** (`retailPrice`) | If known, otherwise `null`. Never inflate it. |
| 9 | **Dimensions** (`dimensions`) | Packed (or item + flat measurements for apparel), e.g. `14 x 9 x 14 in`. Used for shipping. |
| 10 | **Weight** (`weight`) | Packed weight, e.g. `22 lb`. Used for shipping. |
| 11 | **Ships from** | Automatic from the store's `town`, `state` (shown as the postmark). |
| 12 | **Ship-by window** (`shipBy`) | e.g. `Ships within 2 business days`. Leave `""` while policy is pending (shows a TBD placeholder). |
| 13 | **Returns note** (`returns`) | e.g. `30-day returns, buyer pays return shipping`. Leave `""` while policy is pending. |
| 14 | **Category** (`category`) | One of the site categories (e.g. Home & Kitchen, Electronics, Vintage & Apparel, Music, Toys & Games, Plants & Garden, Paper & Gifts, Tools & Outdoor). A new category shows up in the filters automatically. |
| 15 | **Description** (`description`) | **2-3 short, honest sentences:** actual condition, what was tested, and any flaw (and point to the flaw photo). |

Also: `slug` (unique id, lowercase-dashes), `store` (the store's slug), `checked` (true once reviewed →
**Townshelf Checked** mark), `example` (true only for illustrative example items), `featured` (home page "Featured finds"), `hero` (a number that adds the item to the home hero rotation: 1–3 are shown first, 1 is the large tile, higher numbers rotate in; `false` = not in the hero), `checkedOn` (date the listing was checked, `"YYYY-MM-DD"`; the newest items fill the home "Recently checked" strip),
`photoShots` (labels for the photos), `art` (preview illustration used when there are no photos; `artBg` is optional and unused in the minimal theme).

## Condition grades

- **New**: Brand new, unused, in original packaging. Packaging may show shelf wear (say so).
- **Open Box**: Box opened, never or barely used, all parts included (or missing parts listed) and tested by the store.
- **Like New**: Used or returned, tested and cleaned, with no visible wear. If there's visible wear, it doesn't qualify.

Not allowed at any grade: recalled, counterfeit, hazardous or broken items.

## Photo shot list (3-6 photos)

1. **Front**: whole item, plain background, good light.
2. **Back**: whole item, reverse side.
3. **Label / tag**: brand, model or serial label, size tag or record label.
4. **Flaws**: a close-up of any scuff, mark or wear. If there are none, a close-up that shows the condition.
5. **Scale**: next to a common object or a ruler/tape.
6. *(Optional)* **In use / accessories**: powered on, or all included pieces laid out.

## Copy-paste item entry (`data/data.js` → `"items"`)

```json
{
  "slug": "harbor-lane-books-atlas-1962",
  "store": "harbor-lane-books",
  "title": "[Brand] World Atlas, 1962 Edition, Hardcover, Blue",
  "brand": "[Brand]",
  "category": "Paper & Gifts",
  "condition": "Like New",
  "price": 40,
  "retailPrice": null,
  "included": ["Atlas", "Dust jacket"],
  "missing": "None",
  "dimensions": "15 x 11 x 2 in",
  "weight": "5 lb",
  "shipBy": "",
  "returns": "",
  "description": "Clean, tight binding with no writing or torn pages. Dust jacket intact. Ships in a padded box.",
  "photos": [
    "assets/photos/harbor-lane-books/atlas-front.jpg",
    "assets/photos/harbor-lane-books/atlas-back.jpg",
    "assets/photos/harbor-lane-books/atlas-label.jpg",
    "assets/photos/harbor-lane-books/atlas-flaws.jpg",
    "assets/photos/harbor-lane-books/atlas-scale.jpg"
  ],
  "photoShots": ["Front", "Back", "Label / tag", "Flaws", "Scale"],
  "checked": true,
  "example": false,
  "featured": false,
  "hero": false,
  "checkedOn": "2026-09-28",
  "art": "notebook",
  "artBg": "#FCE3D0"
}
```

Spreadsheet version: `data/templates/items-template.csv` (list fields separated by `|`), converted with
`python3 tools/csv_to_datajs.py`.

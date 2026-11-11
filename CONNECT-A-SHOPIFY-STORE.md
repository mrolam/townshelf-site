# Connecting a Shopify store to TownShelf (preview, Nov 11 2026)

Pilot: Mega Brown Box (megabrownbox.com, La Habra, CA).

## What works today (concierge import, this branch)
`tools/shopify_import.py` reads the store's **public** Shopify catalog (`/products.json`, no app,
no API key, no store login) and writes `data/imports/<store>.js`. Every page (home, browse,
store, item) picks it up. "Buy" links go to the product on the shop's own site, so the shop
keeps checkout. Optional `--inventory` adds Admin stock counts and drops zero-stock items.

MBB run: 602 active in-stock products in Admin; 531 also published to the Online Store ->
531 imported (4,198 units) in about 3 seconds.

```
python3 tools/shopify_import.py --domain megabrownbox.com --store mega-brown-box \
    --inventory mbb_inventory.json
```

### Store-owner steps today: about 2 minutes for the owner, about 15 minutes for TownShelf
1. Owner sends their shop web address, town, and a 2-3 sentence story (about 2 min).
2. TownShelf adds the store entry to `data/data.js` (name, town, map pin, colors) (about 10 min).
3. TownShelf runs the importer (seconds), checks the store page, then commits (about 3 min).
4. Re-run to refresh. There is no auto-sync yet, so prices and stock go stale between runs.

## Proposed one-click "Connect Shopify": 4 owner steps, about 3 minutes
1. "List your shop" -> **Connect Shopify** -> enter `yourshop.myshopify.com`.
2. Shopify approval screen (scopes `read_products`, `read_inventory`) -> Install.
3. Short profile form: town, story, photo, and agree to founding-shop terms (free, then 5-8%).
4. Preview your TownShelf store page -> **Go live**.
Behind it: the TownShelf app (live.townshelf.com) does a bulk import of products, then
keeps in sync with `products/update`, `products/delete` and `inventory_levels/update`
webhooks, and serves the catalog as JSON to townshelf.com.

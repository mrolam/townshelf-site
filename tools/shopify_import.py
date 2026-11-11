#!/usr/bin/env python3
"""TownShelf Shopify importer (preview).

Pulls a Shopify store's PUBLIC storefront catalog (https://<domain>/products.json, no app
or API key needed) and writes data/imports/<slug>.js, which replaces that store's items in
window.TOWNSHELF_DATA. Every "Buy" goes to the product page on the shop's own site.

Optional: --inventory <file.json> = list of {handle,totalInventory} from the Shopify Admin
API (needs read_products/read_inventory). With it, only products with stock > 0 are kept and
the stock count is shown. Without it, Shopify's public "available" flag is used.

  python3 tools/shopify_import.py --domain megabrownbox.com --store mega-brown-box \
      [--inventory inv.json] [--featured 8]
"""
import argparse, json, re, time, urllib.request, html, datetime

CATS = [  # first match wins
 ("Holiday Decor", r"christmas|xmas|holiday|santa|reindeer|halloween|nativity|snowman|ornament|wreath|garland|nutcracker|easter|thanksgiving|hanukkah"),
 ("Garden & Outdoor", r"garden|planter|gazing|globe|bird ?bath|birdhouse|statue|patio|outdoor|fountain|wind chime|fire ?pit|bench|gnome|trellis|solar|stake|pot\b"),
 ("Lighting", r"lamp|chandelier|pendant|sconce|light\b|lighting|lantern"),
 ("Furniture", r"sofa|couch|futon|chair|stool|table|desk|dresser|cabinet|console|bed\b|bed frame|headboard|nightstand|bookcase|shelf|shelving|ottoman|bench|vanity|sectional|loveseat|armoire|chest"),
 ("Wall Art & Mirrors", r"mirror|wall art|canvas|print|painting|portrait|frame"),
 ("Rugs & Textiles", r"\brug|pillow|throw|blanket|curtain|quilt|towel"),
 ("Kitchen & Dining", r"kitchen|dining|dinnerware|plate|bowl|mug|glass|cookware|pan\b|knife|bar ?cart"),
 ("Kids & Toys", r"kids|toy|baby|toddler|plush|game|puzzle|dirt bike"),
 ("Pets", r"\bdog|\bcat\b|pet\b|crate"),
 ("Storage & Baskets", r"basket|storage|bin\b|organizer|hamper"),
]
def category(title, ptype):
    s = f"{title} {ptype}".lower()
    for name, rx in CATS:
        if re.search(rx, s): return name
    return "Home & Decor"

def condition(body):
    m = re.search(r"condition\s*:?\s*(new|open[- ]box|like[- ]new|used|refurbished|pre-production sample|scratch(?: and|&) dent)", re.sub(r"<[^>]+>", " ", body or ""), re.I)
    if not m: return "See listing"
    c = m.group(1).lower().replace("-", " ")
    return {"new": "New", "open box": "Open Box", "like new": "Like New"}.get(c, c.title())

def clean(body, n=300):
    t = html.unescape(re.sub(r"<[^>]+>", " ", body or ""))
    t = re.sub(r"\s+", " ", t).strip()
    return t if len(t) <= n else t[:n].rsplit(" ", 1)[0] + "…"

def fetch_all(domain):
    out, page = [], 1
    while True:
        req = urllib.request.Request(f"https://{domain}/products.json?limit=250&page={page}",
                                     headers={"User-Agent": "TownShelf-Importer/0.1"})
        ps = json.load(urllib.request.urlopen(req, timeout=30))["products"]
        if not ps: return out
        out += ps; page += 1; time.sleep(0.5)

def main():
    a = argparse.ArgumentParser(); a.add_argument("--domain", required=True)
    a.add_argument("--store", required=True); a.add_argument("--inventory")
    a.add_argument("--featured", type=int, default=8); a.add_argument("--out")
    o = a.parse_args()
    inv = None
    if o.inventory:
        inv = {r["handle"]: r.get("totalInventory") for r in json.load(open(o.inventory))}
    items = []
    for p in fetch_all(o.domain):
        h = p["handle"]
        if inv is not None:
            if (inv.get(h) or 0) <= 0: continue
        elif not any(v.get("available") for v in p["variants"]): continue
        vs = [v for v in p["variants"] if v.get("available")] or p["variants"]
        cheapest = min(vs, key=lambda v: float(v["price"]))
        price = float(cheapest["price"])
        ca = cheapest.get("compare_at_price")
        retail = float(ca) if ca and float(ca) > price else None
        imgs = [i["src"] for i in p.get("images", [])][:6]
        items.append({
          "slug": f"{o.store[:3]}-{h}"[:90], "store": o.store, "title": p["title"],
          "brand": p.get("vendor") or "", "category": category(p["title"], p.get("product_type", "")),
          "condition": condition(p.get("body_html")), "price": price, "retailPrice": retail,
          "included": [], "missing": "", "dimensions": "", "weight": "", "shipBy": "", "returns": "",
          "description": clean(p.get("body_html")), "photos": imgs,
          "photoShots": [f"Photo {i+1}" for i in range(len(imgs))],
          "stock": inv.get(h) if inv is not None else None,
          "checked": False, "example": False, "featured": False, "real": True,
          "buyUrl": f"https://{o.domain}/products/{h}", "art": "box", "artBg": "#FCE3D0",
          "_updated": p.get("updated_at", "")})
    # feature the most recently updated items that have a photo and a discount
    ranked = sorted([i for i in items if i["photos"]], key=lambda i: (i["retailPrice"] is not None, i["_updated"]), reverse=True)
    for i in ranked[:o.featured]: i["featured"] = True
    for i in items: i.pop("_updated")
    stamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M %Z").strip()
    js = (f"/* AUTO-GENERATED by tools/shopify_import.py from https://{o.domain}/products.json at {stamp}.\n"
          f"   {len(items)} in-stock products. Do not edit by hand; re-run the importer. */\n"
          f"(function(D){{var items={json.dumps(items, ensure_ascii=False)};\n"
          f"D.items=D.items.filter(function(i){{return i.store!=={json.dumps(o.store)};}}).concat(items);\n"
          f"D.imports=D.imports||{{}};D.imports[{json.dumps(o.store)}]={{source:{json.dumps(o.domain)},count:items.length,at:{json.dumps(stamp)}}};\n"
          f"}})(window.TOWNSHELF_DATA);\n")
    out = o.out or f"data/imports/{o.store}.js"
    open(out, "w").write(js)
    print(f"{len(items)} items -> {out} ({len(js)//1024} KB)")

if __name__ == "__main__": main()

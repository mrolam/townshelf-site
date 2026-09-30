#!/usr/bin/env python3
"""Townshelf preview: manage shops/items in a spreadsheet.

  python3 tools/csv_to_datajs.py            # data/stores.csv + data/items.csv  ->  data/data.js
  python3 tools/csv_to_datajs.py --export   # data/data.js  ->  data/stores.csv + data/items.csv

List fields (included, photos, photoShots) use "|" between entries.
Booleans: true/false (or yes/no, 1/0). Empty retailPrice = unknown.
"onboardingSoonTowns" (grey map dots) are kept from the existing data.js.
"""
import csv, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_JS = os.path.join(ROOT, "data", "data.js")
STORES_CSV = os.path.join(ROOT, "data", "stores.csv")
ITEMS_CSV = os.path.join(ROOT, "data", "items.csv")

STORE_FIELDS = ["slug","name","category","town","state","lat","lng","owner","ownerRole","tagline","story","quote",
                "verified","checked","sample","featured","spotlight","color","colorLight","icon","logo"]
ITEM_FIELDS = ["slug","store","title","brand","category","condition","price","retailPrice","included","missing",
               "dimensions","weight","shipBy","returns","description","photos","photoShots",
               "checked","checkedOn","example","featured","hero","art","artBg"]
LISTS = {"included","photos","photoShots"}
BOOLS = {"verified","checked","sample","featured","spotlight","example"}
NUMS = {"lat","lng","price","retailPrice","hero"}
CONDITIONS = {"New","Open Box","Like New"}

HEADER = open(DATA_JS, encoding="utf-8").read().split("window.TOWNSHELF_DATA = {", 1)[0] if os.path.exists(DATA_JS) else "/* Townshelf preview data */\n"

def read_js():
    src = open(DATA_JS, encoding="utf-8").read()
    body = src.split("window.TOWNSHELF_DATA = ", 1)[1].strip().rstrip(";")
    return json.loads(body)

def to_cell(k, v):
    if k in LISTS: return "|".join(v or [])
    if k in BOOLS: return "true" if v else "false"
    return "" if v is None else v

def from_cell(k, v):
    v = (v or "").strip()
    if k in LISTS: return [x.strip() for x in v.split("|") if x.strip()]
    if k in BOOLS: return v.lower() in ("true","yes","y","1")
    if k in NUMS:
        if v == "": return 0 if k == "hero" else None
        n = float(v); return int(n) if n.is_integer() and k in ("price","retailPrice","hero") else n
    return v

def export():
    d = read_js()
    for path, rows, fields in ((STORES_CSV, d["stores"], STORE_FIELDS), (ITEMS_CSV, d["items"], ITEM_FIELDS)):
        with open(path, "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fields); w.writeheader()
            for r in rows: w.writerow({k: to_cell(k, r.get(k)) for k in fields})
    print(f"Exported {len(d['stores'])} stores, {len(d['items'])} items to data/*.csv")

def build():
    old = read_js() if os.path.exists(DATA_JS) else {}
    def load(path, fields):
        with open(path, newline="", encoding="utf-8-sig") as f:
            return [{k: from_cell(k, r.get(k)) for k in fields} for r in csv.DictReader(f) if (r.get("slug") or "").strip()]
    stores, items = load(STORES_CSV, STORE_FIELDS), load(ITEMS_CSV, ITEM_FIELDS)
    errs, slugs = [], set()
    for s in stores:
        if not re.fullmatch(r"[a-z0-9-]+", s["slug"]): errs.append(f"store slug '{s['slug']}': use lowercase letters, numbers, dashes")
        if s["slug"] in slugs: errs.append(f"duplicate store slug {s['slug']}")
        slugs.add(s["slug"])
        if s["lat"] is None or s["lng"] is None: errs.append(f"store {s['slug']}: lat/lng missing (no map pin)")
        s["quote"] = s["quote"] or ""
    islugs = set()
    for i in items:
        if i["store"] not in slugs: errs.append(f"item {i['slug']}: unknown store '{i['store']}'")
        if i["condition"] not in CONDITIONS: errs.append(f"item {i['slug']}: condition must be New / Open Box / Like New")
        if i["price"] is None: errs.append(f"item {i['slug']}: price missing")
        if i["slug"] in islugs: errs.append(f"duplicate item slug {i['slug']}")
        islugs.add(i["slug"])
        if not i["photoShots"]: i["photoShots"] = ["Front","Back","Label / tag","Flaws","Scale"]
    if errs:
        print("Fix these and re-run:\n  " + "\n  ".join(errs)); sys.exit(1)
    out = {"stores": stores, "items": items, "onboardingSoonTowns": old.get("onboardingSoonTowns", [])}
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write(HEADER + "window.TOWNSHELF_DATA = " + json.dumps(out, indent=2, ensure_ascii=False) + ";\n")
    print(f"Wrote data/data.js: {len(stores)} stores, {len(items)} items")

if __name__ == "__main__":
    export() if "--export" in sys.argv else build()

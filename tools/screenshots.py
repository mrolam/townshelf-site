import sys, asyncio
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
OUT = "screenshots"
SHOTS = [
  ("home-desktop.png", "index.html", 1366),
  ("home-mobile-390.png", "index.html", 390),
  ("store-mega-brown-box.png", "store.html?id=mega-brown-box", 1366),
  ("item-page.png", "item.html?id=rv-denim-jacket", 1366),
  ("list-your-shop.png", "list-your-shop.html", 1366),
  ("browse.png", "browse.html", 1366),
  ("cart-drawer.png", "item.html?id=mbb-stand-mixer", 1366),
  ("cart.png", "cart.html", 1366),
  ("about.png", "about.html", 1366),
  ("home-top.png", "index.html", 1280),
  ("font-option-1.png", "index.html?font=1", 1280),
  ("font-option-2.png", "index.html?font=2", 1280),
  ("font-option-3.png", "index.html?font=3", 1280),
  ("font-option-4.png", "index.html?font=4", 1280),
  ("font-option-5.png", "index.html?font=5", 1280),
  ("font-option-6.png", "index.html?font=6", 1280),
]
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        errs = []
        for name, path, w in SHOTS:
            ctx = await b.new_context(viewport={"width": w, "height": 800 if (name.startswith("font-") or name=="home-top.png") else 900}, device_scale_factor=1, reduced_motion="reduce")
            pg = await ctx.new_page()
            pg.on("pageerror", lambda e, n=name: errs.append((n, str(e))))
            pg.on("console", lambda m, n=name: m.type == "error" and errs.append((n, m.text)))
            if name == "cart.png":
                await pg.goto(BASE + "/index.html")
                await pg.evaluate("localStorage.setItem('ts_cart', JSON.stringify([{slug:'mbb-stand-mixer',qty:1},{slug:'rv-denim-jacket',qty:2},{slug:'fh-monstera',qty:1}]))")
            await pg.goto(BASE + "/" + path)
            await pg.wait_for_load_state("networkidle")
            await pg.evaluate("document.fonts.ready")
            if name.startswith("font-") or name == "home-top.png":
                await pg.screenshot(path=f"{OUT}/{name}")
            elif name == "cart-drawer.png":
                await pg.click("#add"); await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(500)
                await pg.screenshot(path=f"{OUT}/{name}")
            else:
                await pg.screenshot(path=f"{OUT}/{name}", full_page=True)
            sw = await pg.evaluate("document.documentElement.scrollWidth")
            if sw > w: errs.append((name, f"horizontal overflow: scrollWidth {sw} > {w}"))
            await ctx.close()
        # interactive check (normal motion): hover a map pin to show the mini shop card
        ctx = await b.new_context(viewport={"width": 1366, "height": 900})
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(("map-hover", str(e))))
        await pg.goto(BASE + "/index.html"); await pg.wait_for_load_state("networkidle")
        pin = pg.locator('.usmap .pin[data-slug="mega-brown-box"]')
        await pin.scroll_into_view_if_needed(); await pg.wait_for_timeout(900)
        await pin.hover(force=True); await pg.wait_for_timeout(500)
        await pg.locator("#map").screenshot(path=f"{OUT}/home-map-hover.png")
        await ctx.close()
        # PWA install prompt on mobile (forced with ?pwa-demo=, nothing remembered)
        IOS_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 "
                  "(KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1")
        for kind, fname, ua in [("ios", "pwa-prompt-mobile", IOS_UA), ("android", "pwa-prompt-android", None)]:
            opts = {"viewport": {"width": 390, "height": 844}, "device_scale_factor": 2, "is_mobile": True,
                    "has_touch": True, "reduced_motion": "reduce"}
            if ua: opts["user_agent"] = ua
            ctx = await b.new_context(**opts)
            pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(("pwa", str(e))))
            await pg.goto(BASE + "/index.html?pwa-demo=" + kind); await pg.wait_for_load_state("networkidle")
            await pg.wait_for_selector(".pwa-prompt"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"{OUT}/{fname}.png")
            await ctx.close()
        await b.close()
        print("ERRORS:", errs if errs else "none")
asyncio.run(main())

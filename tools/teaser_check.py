"""Screenshot the 'Coming soon: Shop by video' teaser (home + item page, desktop + mobile)."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
OUT = "screenshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for name, vp, mob in [("desktop", {"width": 1280, "height": 800}, False), ("mobile", {"width": 390, "height": 844}, True)]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob, reduced_motion="reduce")
            await ctx.route("https://formsubmit.co/**", lambda r: r.abort())
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(BASE + "/index.html", wait_until="networkidle")
            await pg.evaluate("(()=>{const t=document.querySelector('.vid-teaser');scrollTo(0,t.getBoundingClientRect().top+scrollY-(innerHeight-t.offsetHeight)/2)})()")
            await pg.wait_for_timeout(400); await pg.screenshot(path=f"{OUT}/teaser-{name}.png")
            await pg.click(".vid-teaser-link"); opened = await pg.evaluate("document.getElementById('join').classList.contains('open')")
            await pg.goto(BASE + "/item.html?id=lo-bud-vase", wait_until="networkidle")
            await pg.evaluate("(()=>{const t=document.querySelector('.vid-line');scrollTo(0,t.getBoundingClientRect().top+scrollY-260)})()")
            await pg.wait_for_timeout(400); await pg.screenshot(path=f"{OUT}/teaser-item-{name}.png")
            ov = await pg.evaluate("document.documentElement.scrollWidth>innerWidth")
            print(name, "| teaser link opens join form:", opened, "| item line present:", await pg.locator(".vid-line").count(), "| h-overflow:", ov)
            await ctx.close()
        print("page errors:", errs or "none"); await b.close()
asyncio.run(main())

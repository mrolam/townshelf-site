"""Screenshot the join CTA + form and test the submit flow with FormSubmit MOCKED (no real request is sent)."""
import asyncio, json, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
OUT = "screenshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []; sent = []
        for name, vp, mob in [("desktop", {"width": 1280, "height": 800}, False), ("mobile", {"width": 390, "height": 844}, True)]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob, reduced_motion="reduce")
            async def mock(route):
                sent.append({"url": route.request.url, "method": route.request.method, "body": json.loads(route.request.post_data or "{}")})
                await route.fulfill(status=200, content_type="application/json", body='{"success":"true","message":"The form was submitted successfully."}')
            await ctx.route("https://formsubmit.co/**", mock)      # never hit the real service
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(BASE + "/index.html", wait_until="networkidle")
            await pg.evaluate("navigator.serviceWorker && navigator.serviceWorker.ready")
            await pg.reload(wait_until="networkidle")   # now controlled by the service worker
            ctrl = await pg.evaluate("!!(navigator.serviceWorker && navigator.serviceWorker.controller)")
            await pg.screenshot(path=f"{OUT}/join-cta-{name}.png", clip={"x": 0, "y": 0, "width": vp["width"], "height": 200 if mob else 160})
            await pg.click(".joinbar-btn"); await pg.wait_for_selector("#join.open")
            await pg.fill('[name="Name"]', "Test Person"); await pg.fill('[name="Email"]', "test@example.com")
            await pg.click('.join-chip:has-text("Shop owner")')
            await pg.fill('[name="Shop name"]', "Example Shop"); await pg.fill('[name="City/State"]', "La Habra, CA")
            await pg.wait_for_timeout(200)
            await pg.screenshot(path=f"{OUT}/join-form-{name}.png")
            await pg.click(".join-submit"); await pg.wait_for_selector(".join-thanks:not([hidden])")
            await pg.screenshot(path=f"{OUT}/join-thanks-{name}.png")
            # empty submit shows validation error
            await pg.click(".join-thanks [data-join-close]"); await pg.goto(BASE + "/browse.html#join", wait_until="networkidle")
            opened = await pg.evaluate("document.getElementById('join').classList.contains('open')")
            await pg.click(".join-submit"); err = await pg.locator(".join-err").inner_text()
            print(name, "| sw controlled:", ctrl, "| #join deep link opens:", opened, "| empty-submit error:", err[:60])
            await ctx.close()
        print("mocked requests:", json.dumps(sent, indent=1)); print("page errors:", errs or "none")
        await b.close()
asyncio.run(main())

"""Screenshot the 'New local shops loading…' strip (home + browse, desktop + mobile) and check the
'Own a shop? Join' link opens the join form preset to Shop owner. FormSubmit is blocked: nothing is sent."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
OUT = "screenshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); errs = []
        for name, vp, mob in [("desktop", {"width": 1280, "height": 800}, False), ("mobile", {"width": 390, "height": 844}, True)]:
            for rm in ("no-preference", "reduce"):
                ctx = await b.new_context(viewport=vp, device_scale_factor=2 if mob else 1, is_mobile=mob, has_touch=mob, reduced_motion=rm)
                await ctx.route("https://formsubmit.co/**", lambda r: r.abort())
                pg = await ctx.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
                await pg.goto(BASE + "/index.html", wait_until="networkidle")
                n_home = await pg.locator(".loading-strip").count()
                STATE = "(()=>{const s=document.querySelector('.loading-strip');const b=getComputedStyle(s.querySelector('.ls-blind')).transform;const o=getComputedStyle(s.querySelector('.ls-open')).transform;return {classes:s.className,blind:b,openSign:o}})()"
                anim = await pg.evaluate(STATE)
                if rm == "reduce":
                    print(name, "| reduced motion (should be open, not armed):", anim); await ctx.close(); continue
                print(name, "| before scroll (armed, closed):", anim)
                logo = await pg.evaluate("(()=>{const i=document.querySelector('.topbar .brand img');const r=i.getBoundingClientRect();return [i.naturalWidth,i.naturalHeight,Math.round(r.width*10)/10,r.height]})()")
                sec = pg.locator("#featuredStores").locator("xpath=ancestor::section[1]")
                await pg.evaluate("(()=>{const s=document.querySelector('.loading-strip');scrollTo(0,s.getBoundingClientRect().top+scrollY-200)})()"); await pg.wait_for_timeout(1800)
                print(name, "| after animation (open):", await pg.evaluate(STATE))
                await pg.screenshot(path=f"{OUT}/loading-strip-{name}.png")   # viewport, header logo checked above
                # frozen frames: closed (t=0), mid-animation (blind half up), sign flipping
                strip = pg.locator(".loading-strip").first
                for label, t in [("start", 0), ("mid", 450), ("flip", 950)]:
                    await pg.evaluate("t=>{const s=document.querySelector('.loading-strip');s.classList.remove('ls-play');void s.offsetWidth;s.classList.add('ls-play');document.getAnimations().forEach(a=>{if(s.contains(a.effect.target)){a.pause();a.currentTime=t}})}", t)
                    await strip.screenshot(path=f"{OUT}/loading-strip-{name}-{label}.png")
                await pg.evaluate("document.getAnimations().forEach(a=>{try{a.finish()}catch(e){a.play()}})")
                await pg.click(".loading-strip .ls-link"); await pg.wait_for_selector("#join.open")
                role = await pg.evaluate("(document.querySelector('input[name=\"I am a\"]:checked')||{}).value")
                owner = await pg.evaluate("!document.querySelector('.join-owner').hidden")
                await pg.goto(BASE + "/browse.html", wait_until="networkidle"); await pg.wait_for_timeout(1200)
                n_browse = await pg.locator(".loading-strip").count()
                await pg.evaluate("(()=>{const s=document.querySelector('.loading-strip');scrollTo(0,s.getBoundingClientRect().top+scrollY-160)})()"); await pg.wait_for_timeout(1800)
                await pg.screenshot(path=f"{OUT}/loading-strip-browse-{name}.png")
                overflow = await pg.evaluate("document.documentElement.scrollWidth>innerWidth")
                print(name, "| strips home/browse:", n_home, n_browse, "| anim:", anim, "| join role preset:", role, "owner fields shown:", owner, "| logo natural/rendered:", logo, "| h-overflow:", overflow)
                await ctx.close()
        print("page errors:", errs or "none"); await b.close()
asyncio.run(main())

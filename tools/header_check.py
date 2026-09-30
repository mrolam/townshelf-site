"""Screenshot the header on desktop and mobile and verify the logo is not clipped."""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8765"
OUT = "screenshots"
JS = """() => {
 const img=document.querySelector('.topbar .brand img'); const r=img.getBoundingClientRect();
 let clip=[]; for(let e=img.parentElement;e&&e!==document.body;e=e.parentElement){const s=getComputedStyle(e);
   if(s.overflow!=='visible'){const p=e.getBoundingClientRect(); if(r.left<p.left||r.right>p.right||r.top<p.top||r.bottom>p.bottom) clip.push(e.className)}}
 const s=getComputedStyle(img);
 return {src:img.currentSrc,natural:[img.naturalWidth,img.naturalHeight],rendered:[Math.round(r.width*10)/10,Math.round(r.height*10)/10],
   ratioOk:Math.abs(r.width/r.height-img.naturalWidth/img.naturalHeight)<0.02,objectFit:s.objectFit,clippedBy:clip,
   inViewport:r.left>=0&&r.right<=innerWidth,wordmark:document.querySelector('.topbar .brand span').textContent}}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, vp, mob in [("desktop", {"width": 1280, "height": 800}, False), ("mobile", {"width": 390, "height": 844}, True)]:
            ctx = await b.new_context(viewport=vp, device_scale_factor=2, is_mobile=mob)
            pg = await ctx.new_page()
            await pg.goto(BASE + "/index.html", wait_until="networkidle")
            print(name, await pg.evaluate(JS))
            bottom = await pg.evaluate("document.querySelector('.topbar').getBoundingClientRect().bottom")
            await pg.screenshot(path=f"{OUT}/header-check-{name}.png", clip={"x": 0, "y": 0, "width": vp["width"], "height": bottom + 16})
            await ctx.close()
        await b.close()
asyncio.run(main())

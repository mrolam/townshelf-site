/* Townshelf PWA: service worker registration, update bar, and a one-time "Add to home screen" prompt.
   Test/screenshot hook: add ?pwa-demo=ios or ?pwa-demo=android to force the prompt (nothing is remembered). */
(function () {
  var KEY = "ts_install_prompt";            // "shown" | "dismissed" | "installed"
  var VISITS = "ts_visits";
  var demo = new URLSearchParams(location.search).get("pwa-demo");
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- service worker + update handling ---------- */
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        function offer(worker) { if (worker && navigator.serviceWorker.controller) showUpdate(worker); }
        if (reg.waiting) offer(reg.waiting);
        reg.addEventListener("updatefound", function () {
          var w = reg.installing;
          w && w.addEventListener("statechange", function () { if (w.state === "installed") offer(w); });
        });
      }).catch(function () {});
      var reloading = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (reloading || !window.__tsUpdateAccepted) return; reloading = true; location.reload();
      });
    });
  }
  function showUpdate(worker) {
    if (document.getElementById("ts-update")) return;
    var bar = document.createElement("div");
    bar.id = "ts-update"; bar.className = "ts-update"; bar.setAttribute("role", "status");
    bar.innerHTML = '<span>A new version of Townshelf is ready.</span><button type="button" class="btn btn-primary btn-sm">Refresh</button><button type="button" class="pwa-x" aria-label="Dismiss">×</button>';
    bar.querySelector(".btn").onclick = function () { window.__tsUpdateAccepted = true; worker.postMessage("SKIP_WAITING"); };
    bar.querySelector(".pwa-x").onclick = function () { bar.remove(); };
    document.body.appendChild(bar);
  }

  /* ---------- install prompt ---------- */
  var ua = navigator.userAgent;
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var isIOSSafari = isIOS && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  var deferred = null;

  var visits = parseInt(store.get(VISITS) || "0", 10) + 1; store.set(VISITS, String(visits));

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e;
    if (!demo) schedule("android");
  });
  window.addEventListener("appinstalled", function () { store.set(KEY, "installed"); hide(); });

  function eligible() { return !standalone && !store.get(KEY); }

  // Never on first paint: wait for real engagement (a scroll or tap) and some time on the page.
  // On a repeat page view the wait is shorter.
  var scheduled = false;
  function schedule(kind) {
    if (scheduled || !eligible()) return; scheduled = true;
    var wait = visits > 1 ? 4000 : 15000, timeUp = false, engaged = false;
    function go() { if (timeUp && engaged) { cleanup(); show(kind); } }
    function onEngage() { engaged = true; go(); }
    function cleanup() { window.removeEventListener("scroll", onEngage); window.removeEventListener("pointerdown", onEngage); }
    window.addEventListener("scroll", onEngage, { passive: true });
    window.addEventListener("pointerdown", onEngage);
    setTimeout(function () { timeUp = true; go(); }, wait);
  }
  if (!demo && isIOSSafari) window.addEventListener("load", function () { schedule("ios"); });
  if (demo === "ios" || demo === "android") window.addEventListener("load", function () { setTimeout(function () { show(demo, true); }, 600); });

  var el = null;
  function show(kind, isDemo) {
    if (el || (!isDemo && !eligible())) return;
    if (!isDemo) store.set(KEY, "shown");          // shown once, ever
    var share = '<svg class="pwa-share" viewBox="0 0 24 24" width="18" height="18" aria-label="Share"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6.5A1.5 1.5 0 0 0 5 11.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 17.5 10H16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
    var body = kind === "ios"
      ? '<p>Tap ' + share + ' <b>Share</b>, then <b>Add to Home Screen</b>.</p>'
      : '<p>Get quick access to local shops, even offline.</p><button type="button" class="btn btn-primary btn-sm pwa-install">Install</button>';
    el = document.createElement("div");
    el.className = "pwa-prompt" + (reduced ? "" : " pwa-anim");
    el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Add Townshelf to your home screen");
    el.innerHTML = '<img src="assets/icons/icon-192.png" alt="" width="44" height="44">' +
      '<div class="pwa-body"><strong>Add Townshelf to your home screen</strong>' + body + '</div>' +
      '<button type="button" class="pwa-x" aria-label="Dismiss">×</button>';
    el.querySelector(".pwa-x").onclick = function () { if (!isDemo) store.set(KEY, "dismissed"); hide(); };
    var ib = el.querySelector(".pwa-install");
    if (ib) ib.onclick = function () {
      if (!deferred) { hide(); return; }
      deferred.prompt();
      deferred.userChoice.then(function (r) { store.set(KEY, r.outcome === "accepted" ? "installed" : "dismissed"); deferred = null; hide(); });
    };
    document.body.appendChild(el);
    requestAnimationFrame(function () { el && el.classList.add("in"); });
  }
  function hide() { if (el) { el.remove(); el = null; } }
})();

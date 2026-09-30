/* Townshelf preview — shared rendering. Everything renders from window.TOWNSHELF_DATA (data/data.js). */
(function(){
/* Font options: ?font=1..6 (remembered for the session). 1 = DM Sans, 2 = Fraunces + DM Sans (DEFAULT, owner's pick), 3 = Outfit + Work Sans,
   4 = Young Serif + DM Sans, 5 = Bricolage Grotesque + DM Sans, 6 = Fraunces Soft (SOFT/WONK axes up) + DM Sans */
(function(){try{var f=new URLSearchParams(location.search).get("font");if(/^[1-6]$/.test(f||""))sessionStorage.setItem("ts_font",f);f=sessionStorage.getItem("ts_font")||"2";document.documentElement.setAttribute("data-font",f);}catch(e){document.documentElement.setAttribute("data-font","2");}})();
var TS = window.TS = window.TS || {};
var D = window.TOWNSHELF_DATA || {stores:[],items:[],onboardingSoonTowns:[]};
TS.D = D;
TS.CONDITIONS = ["New","Open Box","Like New"];
TS.COND_INFO = {
  "New":"Brand new, unused, in original packaging.",
  "Open Box":"Box opened, never or barely used, all parts included, tested by the store.",
  "Like New":"Used or returned, tested, cleaned, no visible wear."
};
var esc = TS.esc = function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});};
TS.store = function(slug){return D.stores.find(function(s){return s.slug===slug;});};
TS.item = function(slug){return D.items.find(function(i){return i.slug===slug;});};
TS.itemsFor = function(slug){return D.items.filter(function(i){return i.store===slug;});};
TS.param = function(k){return new URLSearchParams(location.search).get(k);};
TS.money = function(n){return "$"+Number(n).toFixed(2);};
TS.categories = function(){var s=[];D.items.forEach(function(i){if(s.indexOf(i.category)<0)s.push(i.category);});return s.sort();};
TS.towns = function(){var s=[];D.stores.forEach(function(st){var t=st.town+", "+st.state;if(s.indexOf(t)<0)s.push(t);});return s.sort();};
TS.sampleTag = function(st){return st&&st.sample?'<span class="tag tag-sample">Sample shop (fictional)</span>':'';};

/* ---------- postmark / stamp ---------- */
var pmId=0;
TS.postmark = function(town,state,opts){
  opts=opts||{}; var id="pm"+(++pmId); var col="#EE7A2E";
  var t=String(town).toUpperCase(); var fs=t.length>=9?10:(t.length>=8?11.5:(t.length>=6?13:15));
  return '<svg class="postmark '+(opts.cls||"")+'" viewBox="0 0 150 100" aria-label="Postmark: shipped from '+esc(town)+', '+esc(state)+'">'+
   '<defs><path id="'+id+'t" d="M18 50 A32 32 0 0 1 82 50"/><path id="'+id+'b" d="M14 50 A36 36 0 0 0 86 50"/></defs>'+
   '<g fill="none" stroke="'+col+'" stroke-width="2"><circle cx="50" cy="50" r="45"/>'+
   '<path d="M102 40 q8 -5 16 0 t16 0 t16 0 M102 60 q8 -5 16 0 t16 0 t16 0"/></g>'+
   '<text style="font-family:var(--font-body),sans-serif" font-weight="600" font-size="8.5" letter-spacing="1.5" fill="'+col+'"><textPath href="#'+id+'t" startOffset="50%" text-anchor="middle">SHIPPED FROM</textPath></text>'+
   '<text style="font-family:var(--font-body),sans-serif" font-weight="600" font-size="9" letter-spacing="2" fill="'+col+'"><textPath href="#'+id+'b" startOffset="50%" text-anchor="middle" dominant-baseline="hanging">'+esc(String(state).toUpperCase())+' · USA</textPath></text>'+
   '<text x="50" y="55" text-anchor="middle" style="font-family:var(--font-body),sans-serif" font-weight="700" font-size="'+fs+'" fill="'+col+'">'+esc(t)+'</text></svg>';
};
TS.shipsFrom = function(st){return '<span class="ships-from"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="#EE7A2E" stroke-width="1.8"/><path d="M6 10h8M6 7.5h8M6 12.5h8" stroke="#EE7A2E" stroke-width="1.2"/></svg>Ships from '+esc(st.town)+', '+esc(st.state)+'</span>';};

/* ---------- visuals ---------- */
TS.itemPhoto = function(it,idx){
  idx=idx||0;
  if(it.photos && it.photos[idx]) return '<img class="art" src="'+esc(it.photos[idx])+'" alt="'+esc(it.title)+'">';
  var cls=["","v1","v3","v2","v4","v1"][idx%6];
  return TS.art(it.art,"#F3EFE6",cls); /* artBg kept in data but the minimal theme uses one neutral backdrop */
};
TS.storeLogo = function(st,size){
  size=size||64;
  if(st.logo) return '<img class="store-logo" style="width:'+size+'px;height:'+size+'px" src="'+esc(st.logo)+'" alt="'+esc(st.name)+' logo">';
  var init=st.name.split(/\s+/).filter(function(w){return /[A-Za-z]/.test(w[0]);}).slice(0,2).map(function(w){return w[0];}).join("");
  return '<span class="store-logo mono" style="width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*0.36)+'px">'+esc(init)+'</span>';
};
/* "Townshelf Checked" mark: original design, a check resting on a shelf line */
TS.checkIcon = function(sz){return '<svg class="chk-ico" viewBox="0 0 24 24" width="'+sz+'" height="'+sz+'" aria-hidden="true"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="#EE7A2E"/><path d="M7 12l3.2 3.2L17 8.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';};
TS.checkedMark = function(opts){opts=opts||{};return '<span class="tchecked'+(opts.small?' sm':'')+'" title="Townshelf Checked: verified storefront, item inspected, honest grade, real photos">'+TS.checkIcon(opts.small?14:18)+'<span>Townshelf Checked</span></span>';};
TS.condBadge = function(c){return '<span class="cond cond-'+c.toLowerCase().replace(/\s+/g,"-")+'">'+esc(c)+'</span>';};
TS.verifiedBadge = function(){return '<span class="verified">Verified storefront</span>';};

TS.itemCard = function(it){
  var st=TS.store(it.store)||{name:"?",town:"",state:""};
  return '<a class="item-card" href="item.html?id='+encodeURIComponent(it.slug)+'">'+
    '<div class="item-img">'+TS.itemPhoto(it,0)+'</div>'+
    '<div class="item-body"><div class="item-meta">'+TS.condBadge(it.condition)+(it.example?'<span class="tag">Example item</span>':'')+'</div>'+
    '<h3>'+esc(it.title)+'</h3>'+
    '<div class="item-store">'+esc(st.name)+'</div>'+TS.shipsFrom(st)+
    '<div class="item-price">'+TS.money(it.price)+' <small>sample price</small></div>'+(it.checked?TS.checkedMark({small:true}):'')+'</div></a>';
};
TS.storeCard = function(st){
  var n=TS.itemsFor(st.slug).length;
  return '<a class="store-card" href="store.html?id='+encodeURIComponent(st.slug)+'">'+
    '<div class="store-card-top">'+TS.storeLogo(st,48)+'<div><h3>'+esc(st.name)+'</h3><div class="muted small">'+esc(st.town)+', '+esc(st.state)+' · '+esc(st.category)+'</div></div></div>'+
    '<p>'+esc(st.tagline)+'</p>'+
    '<div class="store-card-foot">'+(st.checked?TS.checkedMark({small:true}):'')+'<span class="muted small">'+n+' items</span></div>'+
    (st.sample?'<div class="tag">Sample shop (fictional)</div>':'')+'</a>';
};
TS.ownerCard = function(st){
  var quote = st.quote ? '<blockquote>“'+esc(st.quote)+'”</blockquote>' : '<blockquote class="pending">Owner story coming soon, in their own words.</blockquote>';
  return '<article class="owner-card" style="--sc:'+esc(st.color)+';--scl:'+esc(st.colorLight)+'">'+
    '<div class="owner-avatar" aria-hidden="true"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="40" fill="'+esc(st.colorLight)+'"/><circle cx="40" cy="32" r="14" fill="'+esc(st.color)+'"/><path d="M14 72 Q40 40 66 72" fill="'+esc(st.color)+'"/></svg></div>'+
    '<div><div class="hand">Meet '+esc(st.owner.split(" ")[0])+'</div>'+quote+
    '<p class="owner-meta"><strong>'+esc(st.owner)+'</strong>, '+esc(st.ownerRole)+' · <a href="store.html?id='+encodeURIComponent(st.slug)+'">'+esc(st.name)+'</a>, '+esc(st.town)+', '+esc(st.state)+'</p>'+TS.sampleTag(st)+'</div></article>';
};

/* ---------- US map (simplified illustrated outline, no external map) ---------- */
var US=[[-124.7,48.4],[-122.8,49],[-95.2,49],[-94.8,49.4],[-89.6,48],[-84.4,46.5],[-82.5,45.3],[-82.4,43],[-79,43.3],[-76.5,44.2],[-75,45],[-71.5,45],[-70,46.7],[-68.2,47.4],[-67,45],[-70.2,43.6],[-70.6,42.6],[-70,41.8],[-71.9,41.3],[-74,40.6],[-74.2,39.6],[-75.5,38.9],[-76,37],[-75.7,35.5],[-76.8,34.7],[-78.6,33.8],[-80.8,32.1],[-81.4,30.6],[-80.1,26.8],[-80.4,25.2],[-81.8,26],[-82.8,28],[-82.6,29.9],[-84.3,30],[-86.5,30.4],[-89.6,30.2],[-89.4,29],[-91.3,29.3],[-93.8,29.7],[-95,29.2],[-97.2,27.6],[-97.4,25.9],[-99.2,26.5],[-100.5,28.2],[-101.6,29.8],[-103.1,29],[-104.5,29.7],[-106.5,31.8],[-108.2,31.3],[-111.1,31.3],[-114.8,32.5],[-117.1,32.5],[-118.5,34],[-120.6,34.6],[-121.9,36.6],[-122.5,37.8],[-123.8,39.8],[-124.3,42],[-124,44.6],[-124.1,46.9]];
function proj(lng,lat){return [((lng+125)*16.5+10).toFixed(1),((49.5-lat)*20+10).toFixed(1)];}
TS.usMap = function(){
  var pts=US.map(function(p){return proj(p[0],p[1]).join(",");}).join(" ");
  var soon=(D.onboardingSoonTowns||[]).map(function(t){var p=proj(t.lng,t.lat);return '<circle class="soon" cx="'+p[0]+'" cy="'+p[1]+'" r="5"><title>'+esc(t.town)+', '+esc(t.state)+' (onboarding soon, illustrative)</title></circle>';}).join("");
  var pins=D.stores.filter(function(s){return s.lat!=null&&s.lng!=null;}).map(function(s,i){
    var p=proj(s.lng,s.lat), x=+p[0], y=+p[1], right = x<700;
    var lx = right ? x+14 : x-14, anchor = right?"start":"end";
    return '<g class="pin" tabindex="0" role="button" aria-label="'+esc(s.name)+', '+esc(s.town)+', '+esc(s.state)+'" data-slug="'+esc(s.slug)+'" data-x="'+x+'" data-y="'+(y-23)+'">'+
      '<circle class="pulse" cx="'+x+'" cy="'+y+'" r="7" style="animation-delay:'+(i*0.45).toFixed(2)+'s"/>'+
      '<path d="M'+x+' '+y+' c-9 -12 -12 -17 -12 -23 a12 12 0 0 1 24 0 c0 6 -3 11 -12 23z" fill="#1C8A94"/>'+
      '<circle cx="'+x+'" cy="'+(y-23)+'" r="4.5" fill="#fff"/>'+
      '<text x="'+lx+'" y="'+(y-18)+'" text-anchor="'+anchor+'" class="pin-town">'+esc(s.town)+', '+esc(s.state)+'</text></g>';
  }).join("");
  return '<div class="map-box"><svg class="usmap" viewBox="0 0 1000 540" role="img" aria-label="Map of Townshelf shops across the US">'+
    '<polygon points="'+pts+'" fill="#F3EFE6" stroke="#CFC8B8" stroke-width="2" stroke-linejoin="round"/>'+soon+pins+'</svg><div class="map-card" hidden></div></div>';
};
/* mini shop card on hover (desktop) or tap (touch) */
TS.bindMap = function(root){
  var box=root.querySelector(".map-box"), card=root.querySelector(".map-card"), svg=root.querySelector("svg"), cur=null, hideT;
  function show(g){
    clearTimeout(hideT);
    var st=TS.store(g.getAttribute("data-slug")); if(!st) return; cur=g;
    var n=TS.itemsFor(st.slug).length;
    card.innerHTML='<div class="mc-top">'+TS.storeLogo(st,36)+'<div><strong>'+esc(st.name)+'</strong><div class="muted small">'+esc(st.town)+', '+esc(st.state)+'</div></div></div>'+
      '<div class="small muted" style="margin:6px 0 8px">'+esc(st.category)+' · '+n+' items</div>'+(st.checked?TS.checkedMark({small:true}):'')+
      '<a class="mc-link" href="store.html?id='+encodeURIComponent(st.slug)+'">Visit shop →</a>';
    card.hidden=false;
    var r=svg.getBoundingClientRect(), br=box.getBoundingClientRect(), k=r.width/1000;
    var x=(+g.getAttribute("data-x"))*k+(r.left-br.left), y=(+g.getAttribute("data-y"))*k+(r.top-br.top);
    var w=card.offsetWidth, h=card.offsetHeight;
    var left=Math.min(Math.max(x-w/2,0),br.width-w), top=y-h-16; if(top<0) top=y+30;
    card.style.left=left+"px"; card.style.top=top+"px";
    root.querySelectorAll(".pin").forEach(function(p){p.classList.toggle("on",p===g);});
  }
  function hide(){hideT=setTimeout(function(){card.hidden=true;cur=null;root.querySelectorAll(".pin.on").forEach(function(p){p.classList.remove("on");});},250);}
  root.querySelectorAll(".pin").forEach(function(g){
    g.addEventListener("mouseenter",function(){if(matchMedia("(hover:hover)").matches)show(g);});
    g.addEventListener("mouseleave",function(){if(matchMedia("(hover:hover)").matches)hide();});
    g.addEventListener("click",function(e){e.stopPropagation(); if(cur===g && !matchMedia("(hover:hover)").matches){location.href="store.html?id="+g.getAttribute("data-slug");} else show(g);});
    g.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault(); if(cur===g) location.href="store.html?id="+g.getAttribute("data-slug"); else show(g);} if(e.key==="Escape"){card.hidden=true;cur=null;}});
  });
  card.addEventListener("mouseenter",function(){clearTimeout(hideT);});
  card.addEventListener("mouseleave",function(){if(matchMedia("(hover:hover)").matches)hide();});
  document.addEventListener("click",function(e){if(!box.contains(e.target)){card.hidden=true;cur=null;}});
};

/* ---------- motion helpers (all respect prefers-reduced-motion) ---------- */
TS.reduced = function(){return window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;};
TS.reveal = function(){
  var els=document.querySelectorAll(".sec-head, .vet, .grid > *, .store-grid > *, .spotlight, .strip, .chips-row, .founder, .cta-in, .map-wrap, .list-grid > *, .standards li, .store-cols > *, .faq details");
  els.forEach(function(el,i){el.classList.add("reveal");});
  if(TS.reduced() || !("IntersectionObserver" in window)){els.forEach(function(el){el.classList.add("in");});return;}
  var io=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting){
    var sib=[].indexOf.call(en.target.parentNode.children,en.target); en.target.style.transitionDelay=Math.min(sib,6)*60+"ms";
    en.target.classList.add("in"); io.unobserve(en.target);}});},{rootMargin:"0px 0px -8% 0px",threshold:0.08});
  els.forEach(function(el){io.observe(el);});
};
TS.categoryChips = function(active){
  return '<div class="chips-row" role="list">'+['<a role="listitem" class="chip'+(!active?' on':'')+'" href="browse.html" data-cat="">All</a>'].concat(TS.categories().map(function(c){return '<a role="listitem" class="chip'+(active===c?' on':'')+'" href="browse.html?cat='+encodeURIComponent(c)+'" data-cat="'+esc(c)+'">'+esc(c)+'</a>';})).join("")+'</div>';
};
TS.stripCard = function(it){
  var st=TS.store(it.store); var dt=new Date(it.checkedOn+"T12:00:00");
  var label=isNaN(dt)?"":dt.toLocaleDateString("en-US",{month:"short",day:"numeric"});
  return '<a class="strip-card" href="item.html?id='+encodeURIComponent(it.slug)+'"><div class="strip-img">'+TS.itemPhoto(it,0)+'</div><div class="strip-body"><div class="strip-date">'+TS.checkIcon(12)+' Checked '+esc(label)+'</div><div class="strip-title">'+esc(it.title)+'</div><div class="muted small">'+esc(st.town)+', '+esc(st.state)+' · '+TS.money(it.price)+'</div></div></a>';
};

/* ---------- cart (mock, localStorage) ---------- */
var mem=[];
function load(){try{return JSON.parse(localStorage.getItem("ts_cart")||"[]");}catch(e){return mem;}}
function save(c){try{localStorage.setItem("ts_cart",JSON.stringify(c));}catch(e){mem=c;} TS.updateCount();}
TS.cart = load;
TS.cartAdd = function(slug){var c=load();var l=c.find(function(x){return x.slug===slug;});if(l)l.qty++;else c.push({slug:slug,qty:1});save(c);};
TS.cartSet = function(slug,q){var c=load().map(function(x){if(x.slug===slug)x.qty=q;return x;}).filter(function(x){return x.qty>0;});save(c);};
TS.cartClear = function(){save([]);};
TS.updateCount = function(){var n=load().reduce(function(a,b){return a+b.qty;},0);document.querySelectorAll(".cart-count").forEach(function(e){e.textContent=n;e.style.display=n?"":"none";});};
TS.openDrawer = function(){
  var d=document.getElementById("drawer"); var c=load();
  var rows=c.map(function(l){var it=TS.item(l.slug);if(!it)return "";var st=TS.store(it.store);
    return '<div class="mini-line"><div class="mini-img">'+TS.itemPhoto(it,0)+'</div><div><strong>'+esc(it.title)+'</strong><div class="muted">'+esc(st.name)+' · qty '+l.qty+'</div></div><div>'+TS.money(it.price*l.qty)+'</div></div>';}).join("");
  var sub=c.reduce(function(a,l){var it=TS.item(l.slug);return a+(it?it.price*l.qty:0);},0);
  d.querySelector(".drawer-body").innerHTML = rows ? rows+'<div class="mini-sub"><span>Subtotal</span><strong>'+TS.money(sub)+'</strong></div><p class="muted" style="font-size:.8rem">Shipping: <span class="placeholder">[TBD]</span></p>' : '<p class="muted">Your cart is empty.</p>';
  d.classList.add("open"); document.body.classList.add("noscroll");
};
TS.closeDrawer = function(){document.getElementById("drawer").classList.remove("open");document.body.classList.remove("noscroll");};

/* ---------- chrome ---------- */
function nav(active){
  var L=[["browse.html","Shop"],["browse.html#towns","Shop by town"],["about.html","How it works"],["list-your-shop.html","List your shop"]];
  return L.map(function(l){var c=(l[0]==="list-your-shop.html"?"nav-cta":"")+(active===l[0]?" active":"");return '<a href="'+l[0]+'"'+(c.trim()?' class="'+c.trim()+'"':'')+'>'+l[1]+'</a>';}).join("");
}
TS.chrome = function(active){
  var h=document.getElementById("site-header");
  if(h) h.innerHTML =
   '<div class="preview-banner">Preview with sample stores and items · No real payments or signups</div>'+
   '<header class="topbar"><div class="wrap topbar-in">'+
   '<a class="brand" href="index.html"><img src="assets/logo-icon.png?v=2" alt="" width="55" height="44"><span>townshelf</span></a>'+
   '<nav class="mainnav" id="mainnav">'+nav(active)+'</nav>'+
   '<form class="topsearch" action="browse.html"><input name="q" type="search" placeholder="Search shops & items" aria-label="Search"></form>'+
   '<a class="cartbtn" href="cart.html" aria-label="Cart"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 7h14l-1.5 11h-11z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 7a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2"/></svg><span class="cart-count" style="display:none">0</span></a>'+
   '<button class="menubtn" aria-label="Menu" onclick="document.getElementById(\'mainnav\').classList.toggle(\'open\')"><span></span><span></span><span></span></button>'+
   '</div></header>';
  var f=document.getElementById("site-footer");
  if(f) f.innerHTML =
   '<footer class="footer"><div class="wrap footer-grid">'+
   '<div><a class="brand brand-foot" href="index.html"><img src="assets/logo-icon.png?v=2" alt="" width="55" height="44"><span>townshelf</span></a><p>Quality, vetted goods from real local shops in every corner of the country, shipped to your door. Every order keeps a local shop open.</p></div>'+
   '<div><h4>Shop</h4><a href="browse.html">All items</a><a href="browse.html#towns">Shop by town</a><a href="store.html?id=mega-brown-box">Mega Brown Box</a></div>'+
   '<div><h4>Townshelf</h4><a href="about.html">How it works</a><a href="about.html#faq">FAQ</a><a href="list-your-shop.html">List your shop</a><a href="cart.html">Cart (preview)</a></div>'+
   '</div><div class="wrap footer-note">Preview prototype with sample stores and items. Apart from Mega Brown Box (La Habra, CA), shops, owners and quotes are fictional; Mega Brown Box items shown are generic examples. Prices are sample figures. No payments are processed.<br>Townshelf is not affiliated with American Express.</div></footer>'+
   '<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer-scrim" onclick="TS.closeDrawer()"></div><aside class="drawer-panel" role="dialog" aria-label="Cart">'+
   '<div class="drawer-head"><strong>Added to your cart</strong><button onclick="TS.closeDrawer()" aria-label="Close">✕</button></div>'+
   '<div class="preview-pill">Preview only, no payment</div><div class="drawer-body"></div>'+
   '<div class="drawer-foot"><a class="btn btn-primary" href="cart.html">View cart & checkout</a><button class="btn btn-ghost" onclick="TS.closeDrawer()">Keep shopping</button></div></aside></div>';
  TS.updateCount();
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setTimeout(TS.reveal,0);});}else{setTimeout(TS.reveal,0);}
};
})();

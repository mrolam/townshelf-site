/* Optional live catalog from the TownShelf Shopify sales channel API. Falls back to data/data.js on any problem.
   TS.ready(opts, cb): opts.stores = "all" (every live shop) or an array of store slugs. cb runs once, after data is merged. */
(function(){
var TS=window.TS, D=TS.D, C=window.TOWNSHELF_CONFIG||{};
TS.channelApp=function(){
  try{var o=new URLSearchParams(location.search).get("ts_api");if(o!==null){if(o)sessionStorage.setItem("ts_api",o);else sessionStorage.removeItem("ts_api");}
    var s=sessionStorage.getItem("ts_api");if(s)return s.replace(/\/+$/,"");}catch(e){}
  return String(C.channelApp||"").replace(/\/+$/,"");
};
function getJSON(url,ms){
  return new Promise(function(res,rej){var x=new XMLHttpRequest();x.open("GET",url);x.timeout=ms||6000;
    x.onload=function(){if(x.status>=200&&x.status<300){try{res(JSON.parse(x.responseText));}catch(e){rej(e);}}else rej(new Error("HTTP "+x.status));};
    x.onerror=x.ontimeout=function(){rej(new Error("network"));};x.send();});
}
function catalog(base,slug){
  var items=[];
  function page(n){return getJSON(base+"/api/catalog/"+encodeURIComponent(slug)+"?limit=250&page="+n).then(function(j){
    items=items.concat(j.items||[]); return (n<j.pages&&n<20)?page(n+1):items;});}
  return page(1);
}
function mergeStore(api){
  var cur=TS.store(api.slug);
  if(cur){ /* data.js entry wins for hand-written fields (map pin, colors, owner quote); profile fields come from the shop */
    ["town","state","story"].forEach(function(k){if(api[k])cur[k]=api[k];});
    cur.live=true; return;
  }
  delete api.itemCount; api.live=true; D.stores.push(api);
}
TS.ready=function(opts,cb){
  var base=TS.channelApp(), done=false;
  function finish(){if(done)return;done=true;cb();}
  if(!base){finish();return;}
  getJSON(base+"/api/stores").then(function(j){
    var stores=(j.stores||[]).filter(function(s){return opts.stores==="all"||(opts.stores||[]).indexOf(s.slug)>=0;});
    return Promise.all(stores.map(function(s){return catalog(base,s.slug).then(function(items){return {s:s,items:items};});}));
  }).then(function(res){
    res.forEach(function(r){mergeStore(r.s);D.items=D.items.filter(function(i){return i.store!==r.s.slug;}).concat(r.items);});
    D.catalogSource="api"; finish();
  }).catch(function(e){if(window.console)console.warn("TownShelf catalog API unavailable, using built-in data:",e.message);finish();});
  setTimeout(finish,9000);
};
})();

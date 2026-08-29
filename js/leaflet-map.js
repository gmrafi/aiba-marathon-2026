(function(){
  var routeURL='data/route-reference-2025.geojson';
  var maps=[];
  var colors={route:'#d4ff00',outline:'#071812',water:'#3c9ee8',medical:'#d9465f',km:'#f2b84b'};
  function popup(p){return '<strong>'+ (p.name||'Route point') +'</strong><br><small>'+ (p.detail||'2025 reference route') +'</small>';}
  function makeMarker(map,f){
    var p=f.properties||{}, c=f.geometry.coordinates;
    var icon=L.divIcon({className:'leaflet-star-marker',html:'★',iconSize:[38,38],iconAnchor:[19,19]});
    L.marker([c[1],c[0]],{icon:icon,zIndexOffset:1000}).addTo(map).bindPopup(popup(p));
  }
  function featureByType(data,type){return (data.features||[]).find(function(f){return f.geometry&&f.geometry.type===type;});}
  function init(el,data){
    if(el._leafletMap)return el._leafletMap;
    var map=L.map(el,{zoomControl:true,scrollWheelZoom:true,preferCanvas:true});
    var tile=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
    var line=featureByType(data,'LineString');
    if(!line){el.parentElement.classList.add('map-error');return map;}
    var coords=line.geometry.coordinates.map(function(c){return [c[1],c[0]];});
    var shadow=L.polyline(coords,{color:colors.outline,weight:12,opacity:.8,lineCap:'round',lineJoin:'round'}).addTo(map);
    var route=L.polyline(coords,{color:colors.route,weight:5,opacity:1,lineCap:'round',lineJoin:'round'}).addTo(map);
    var bounds=route.getBounds();
    (data.features||[]).filter(function(f){return f.geometry&&f.geometry.type==='Point'&&((f.properties||{}).kind==='waypoint');}).forEach(function(f){makeMarker(map,f);});
    map.fitBounds(bounds,{padding:[28,28]});
    setTimeout(function(){map.invalidateSize();},120);
    el.parentElement.classList.add('leaflet-ready');
    el._leafletMap=map; el._routeLayers={route:route,shadow:shadow,bounds:bounds};
    return map;
  }
  function refreshButtons(){
    document.querySelectorAll('[data-route]').forEach(function(btn){btn.addEventListener('click',function(){
      document.querySelectorAll('[data-route]').forEach(function(b){b.classList.toggle('active',b===btn);});
      var label=btn.getAttribute('data-route');
      document.querySelectorAll('.race-map').forEach(function(el){var m=el._leafletMap;if(!m||!el._routeLayers)return;var all=el._routeLayers.route.getLatLngs();var subset=label==='kids'?all.slice(0,Math.max(4,Math.floor(all.length*.04))):label==='10k'?all.slice(0,Math.max(8,Math.floor(all.length*.24))):all;el._routeLayers.route.setLatLngs(subset);m.fitBounds(L.latLngBounds(subset),{padding:[28,28]});});
      var n=document.getElementById('mapRouteName'),d=document.getElementById('mapDistance');if(n)n.textContent=label==='kids'?'Kids 1K Preview':label==='10k'?'10K Preview Segment':'2025 Reference Route';if(d)d.textContent=label==='kids'?'1 KM':label==='10k'?'10 KM':'42 KM';
    });});
    document.querySelectorAll('[data-fly-route]').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.race-map').forEach(function(el){if(el._leafletMap&&el._routeLayers)el._leafletMap.fitBounds(el._routeLayers.bounds,{padding:[28,28],animate:true,duration:1.2});});});});
  }
  function start(data){document.querySelectorAll('.race-map').forEach(function(el){init(el,data);});refreshButtons();}
  function fail(){document.querySelectorAll('.map-shell').forEach(function(el){el.classList.add('map-error');});}
  function boot(){if(!window.L)return fail();fetch(routeURL).then(function(r){if(!r.ok)throw Error('route');return r.json();}).then(start).catch(fail);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

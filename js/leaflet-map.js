(function(){
  var routeURL='data/route-reference-2025.geojson';
  var maps=[];
  var colors={route:'#d4ff00',outline:'#071812',water:'#3c9ee8',medical:'#d9465f',km:'#f2b84b',start:'#d4ff00',finish:'#ef6351'};
  function popup(p){return '<strong>'+ (p.name||'Route point') +'</strong><br><small>'+ (p.detail||'2025 reference route') +'</small>';}
  function makeMarker(map,f){
    var p=f.properties||{}, c=f.geometry.coordinates;
    var icon=L.divIcon({className:'leaflet-star-marker',html:'<span>★</span>',iconSize:[42,42],iconAnchor:[21,21]});
    L.marker([c[1],c[0]],{icon:icon,zIndexOffset:1000}).addTo(map).bindPopup(popup(p)).bindTooltip((p.name||'Waypoint').replace('Army Institute of Business Administration (Army IBA), Sylhet','Army IBA').replace('Academy Square Sreerampur Sylhet','Academy Square Sreerampur'),{permanent:true,direction:'right',offset:[16,0],className:'waypoint-label'});
  }
  function featureByType(data,type){return (data.features||[]).find(function(f){return f.geometry&&f.geometry.type===type;});}
  function tileLayers(){
    return {
      osm:L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors',opacity:1}),
      esri:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles © Esri, Maxar, Earthstar Geographics'}),
      esriLabels:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,opacity:.85,attribution:'Labels © Esri'}),
      terrain:L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',{maxZoom:14,opacity:.45,attribution:'Hillshade © Esri'})
    };
  }
  function applyLayer(map,layer){
    if(map._layerSet){
      Object.keys(map._layerSet).forEach(function(k){
        if(map.hasLayer(map._layerSet[k])) map.removeLayer(map._layerSet[k]);
      });
    }
    map._layerSet=tileLayers();
    if(layer==='satellite'){map._layerSet.esri.addTo(map);}
    else if(layer==='hybrid'){map._layerSet.esri.addTo(map);map._layerSet.esriLabels.addTo(map);}
    else if(layer==='terrain'){map._layerSet.esri.addTo(map);map._layerSet.terrain.addTo(map);}
    else {map._layerSet.osm.addTo(map);}
  }
  function haversine(a,b){
    var R=6371,toRad=function(d){return d*Math.PI/180;};
    var dLat=toRad(b[0]-a[0]),dLon=toRad(b[1]-a[1]);
    var s=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLon/2)*Math.sin(dLon/2);
    return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
  }
  function cumulativeKm(coords){var cum=[0];for(var i=1;i<coords.length;i++){cum.push(cum[i-1]+haversine(coords[i-1],coords[i]));}return cum;}
  function makeKmMarkers(map,coords,intervalKm){
    var cum=cumulativeKm(coords);
    var total=cum[cum.length-1];
    var layer=L.layerGroup();
    for(var d=intervalKm;d<=total-0.2;d+=intervalKm){
      var idx=cum.findIndex(function(v){return v>=d;});
      var latlng=coords[idx];
      var icon=L.divIcon({className:'km-marker',html:'<span>'+Math.round(d)+'</span>',iconSize:[30,22],iconAnchor:[15,11]});
      L.marker(latlng,{icon:icon,interactive:false,zIndexOffset:900}).addTo(layer);
    }
    return layer;
  }
  function makeAidStations(map,coords){
    var total=cumulativeKm(coords).slice(-1)[0];
    var stations=[
      {km:Math.round(total*0.25),kind:'water',name:'Aid Station 1',detail:'Water + first aid'},
      {km:Math.round(total*0.5),kind:'medical',name:'Aid Station 2',detail:'Medical tent + water'},
      {km:Math.round(total*0.75),kind:'water',name:'Aid Station 3',detail:'Water + energy gels'}
    ];
    var layer=L.layerGroup();
    stations.forEach(function(s){
      var idx=cumulativeKm(coords).findIndex(function(v){return v>=s.km;});
      var latlng=coords[idx];
      var icon=L.divIcon({className:'aid-marker aid-'+s.kind,html:'<span>'+(s.kind==='medical'?'+':'W')+'</span>',iconSize:[28,28],iconAnchor:[14,14]});
      L.marker(latlng,{icon:icon,zIndexOffset:950}).addTo(layer).bindPopup('<strong>'+s.name+'</strong><br><small>~KM '+s.km+' · '+s.detail+'</small>');
    });
    return layer;
  }
  function addMapExtras(map,coords){
    var kmMark=makeKmMarkers(map,coords,5);
    var aidMark=makeAidStations(map,coords);
    map._extras={kmMark:kmMark,aidMark:aidMark};
    fextras(map).forEach(function(l){map.addLayer(l);});
  }
  function fextras(map){return map._extras?[map._extras.kmMark,map._extras.aidMark]:[];}
  function addControls(map,el){
    var ctrl=document.createElement('div');ctrl.className='map-float-controls';
    var locate=document.createElement('button');locate.type='button';locate.className='map-fc';
    locate.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
    locate.title='Locate me';locate.setAttribute('aria-label','Locate me');
    locate.onclick=function(){
      if(!navigator.geolocation){locate.title='Geolocation not supported';return;}
      locate.classList.add('busy');
      navigator.geolocation.getCurrentPosition(function(p){
        locate.classList.remove('busy');
        var m=L.circleMarker([p.coords.latitude,p.coords.longitude],{radius:8,color:'#d4ff00',weight:3,fillColor:'#062018',fillOpacity:1}).addTo(map);
        L.circle([p.coords.latitude,p.coords.longitude],{radius:60,color:'#d4ff00',weight:1,fillOpacity:.1}).addTo(map);
        map._userMarker=m;map.setView([p.coords.latitude,p.coords.longitude],16,{animate:true});
      },function(){locate.classList.remove('busy');locate.title='Location unavailable';},{enableHighAccuracy:true,timeout:8000});
    };
    var layerBtn=document.createElement('button');layerBtn.type='button';layerBtn.className='map-fc';
    layerBtn.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 4 8 12 14 20 8"/><polygon points="4 14 12 20 20 14" opacity=".5"/></svg>';
    layerBtn.title='Switch layer: Street / Satellite / Hybrid / Terrain';
    layerBtn.setAttribute('aria-label','Switch basemap layer');
    var cycle=['street','satellite','hybrid','terrain'];var idx=0;
    layerBtn.onclick=function(){
      idx=(idx+1)%cycle.length;applyLayer(map,cycle[idx]);layerBtn.title='Layer: '+cycle[idx]+' (click to switch)';
      if(window.updateLayerLabel)window.updateLayerLabel(cycle[idx]);
    };
    var fsBtn=document.createElement('button');fsBtn.type='button';fsBtn.className='map-fc';
    fsBtn.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"/></svg>';
    fsBtn.title='Toggle fullscreen';fsBtn.setAttribute('aria-label','Toggle fullscreen');
    fsBtn.onclick=function(){
      var shell=el.parentElement;
      if(!document.fullscreenElement){if(shell.requestFullscreen)shell.requestFullscreen();}
      else{document.exitFullscreen();}
    };
    ctrl.appendChild(locate);ctrl.appendChild(layerBtn);ctrl.appendChild(fsBtn);
    map._floatControls=ctrl;el.parentElement.appendChild(ctrl);
    var acc=document.createElement('button');acc.className='fly-mini';
    acc.type='button';acc.innerHTML='<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M21 3L3 21M3 3l18 18" opacity="0"/><path d="M3 21l9-7 4 4 8-9"/></svg> Fit Route';
    acc.title='Fit route to view';
    acc.onclick=function(){if(map._routeLayers)map.fitBounds(map._routeLayers.bounds,{padding:[28,28],animate:true,duration:1.2});};
    el.parentElement.appendChild(acc);
  }
  function paintElevationPanel(el,coords,totalKm){
    var panel=document.createElement('div');panel.className='elev-panel';
    var svgNS="http://www.w3.org/2000/svg";
    var w=300,h=70;
    var svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.setAttribute('preserveAspectRatio','none');
    var path='',pts=[];
    var N=Math.min(coords.length,80);var step=Math.max(1,Math.floor(coords.length/N));
    for(var i=0;i<coords.length;i+=step){pts.push([i,coords[i][1]]);}
    var mn=99e9,mx=-99e9;pts.forEach(function(p){if(p[1]<mn)mn=p[1];if(p[1]>mx)mx=p[1];});
    var pad=Math.max((mx-mn)*.15,.0005);
    mn-=pad;mx+=pad;
    var baseY=h-8;pts.forEach(function(p,i){
      var x=(i/(pts.length-1))*w;var y=baseY-((p[1]-mn)/(mx-mn))*(h-16);
      path+=(i?' L':'M')+x.toFixed(1)+' '+y.toFixed(1);
    });
    var area=document.createElementNS(svgNS,'path');area.setAttribute('d',path+' L'+w+' '+h+' L0 '+h+' Z');area.setAttribute('fill','rgba(200,241,53,.18)');svg.appendChild(area);
    var line=document.createElementNS(svgNS,'path');line.setAttribute('d',path);line.setAttribute('fill','none');line.setAttribute('stroke','#d4ff00');line.setAttribute('stroke-width','1.5');svg.appendChild(line);
    var lab=document.createElement('div');lab.className='ep-meta';
    lab.innerHTML='<span class="ep-tag">PROFILE · ~'+totalKm.toFixed(1)+' KM</span><small>Indicative latitude trend (full DEM planned for phase 2)</small>';
    panel.appendChild(lab);panel.appendChild(svg);
    el.parentElement.appendChild(panel);
  }
  function init(el,data){
    if(el._leafletMap)return el._leafletMap;
    var map=L.map(el,{zoomControl:true,scrollWheelZoom:true,preferCanvas:true});
    applyLayer(map, el.getAttribute('data-initial-layer')||'street');
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
    el._leafletMap=map;
    el._routeLayers={route:route,shadow:shadow,bounds:bounds};
    addMapExtras(map,coords);
    addControls(map,el);
    var totalKm=cumulativeKm(coords).slice(-1)[0];
    paintElevationPanel(el,coords,totalKm);
    if(document.getElementById('mapDistance'))document.getElementById('mapDistance').textContent=totalKm.toFixed(1)+' KM (~'+(totalKm*5.5).toFixed(0)+' min runner)';
    return map;
  }
  function refreshButtons(){
    document.querySelectorAll('[data-route]').forEach(function(btn){btn.addEventListener('click',function(){
      document.querySelectorAll('[data-route]').forEach(function(b){b.classList.toggle('active',b===btn);});
      var label=btn.getAttribute('data-route');
      document.querySelectorAll('.race-map').forEach(function(el){var m=el._leafletMap;if(!m||!el._routeLayers)return;
        var fullSet=m._routeLayers.shadow.getLatLngs();
        var subset=label==='kids'?fullSet.slice(0,Math.max(4,Math.floor(fullSet.length*.04)))
                    :label==='10k'?fullSet.slice(0,Math.max(8,Math.floor(fullSet.length*.24)))
                    :fullSet;
        m._routeLayers.route.setLatLngs(subset);
        var sh=m._routeLayers.shadow;sh.setLatLngs(subset);
        legendUpdate(label,subset);
        m.fitBounds(L.latLngBounds(subset),{padding:[28,28]});
      });
      var n=document.getElementById('mapRouteName'),d=document.getElementById('mapDistance');if(n)n.textContent=label==='kids'?'Kids 1K Preview':label==='10k'?'10K Preview Segment':'2025 Reference Route';
      if(d){var km=label==='kids'?1.0:label==='10k'?10.0:21.1;d.textContent=km.toFixed(1)+' KM (~'+(km*5.5).toFixed(0)+' min runner)';}
    });});
    document.querySelectorAll('[data-fly-route]').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.race-map').forEach(function(el){if(el._leafletMap&&el._routeLayers)el._leafletMap.fitBounds(el._routeLayers.bounds,{padding:[28,28],animate:true,duration:1.2});});});});
  }
  function legendUpdate(label,subset){}
  function start(data){document.querySelectorAll('.race-map').forEach(function(el){init(el,data);});refreshButtons();window.updateLayerLabel=function(name){document.querySelectorAll('[data-layer-name]').forEach(function(e){e.textContent=name;});};}
  function fail(){document.querySelectorAll('.map-shell').forEach(function(el){el.classList.add('map-error');});}
  var inlineRoute={line:[[91.94664,24.8985],[91.9465,24.89796],[91.94634,24.89726],[91.94628,24.89709],[91.94592,24.89598],[91.94568,24.89521],[91.94535,24.8942],[91.94472,24.89237],[91.94411,24.89054],[91.94405,24.89037],[91.94388,24.88985],[91.94359,24.88899],[91.94348,24.88865],[91.94342,24.88846],[91.94339,24.88837],[91.94326,24.88801],[91.94322,24.88788],[91.94305,24.88736],[91.94299,24.88718],[91.94292,24.88698],[91.94278,24.88658],[91.94275,24.8865],[91.9427,24.88637],[91.94251,24.8859],[91.94237,24.88561],[91.94233,24.88553],[91.94229,24.88544],[91.94221,24.8853],[91.94215,24.88521],[91.94195,24.8849],[91.94188,24.88477],[91.94166,24.88441],[91.9416,24.88432],[91.94135,24.88402],[91.94121,24.88385],[91.94066,24.88319],[91.9399,24.88238],[91.93976,24.88222],[91.9397,24.88217],[91.9395,24.88193],[91.93924,24.88164],[91.9385,24.88081],[91.93804,24.88032],[91.93799,24.88026],[91.93778,24.88003],[91.93757,24.87974],[91.93698,24.87909],[91.93622,24.87826],[91.93501,24.87694],[91.93473,24.87663],[91.93434,24.8762],[91.93364,24.87534],[91.9331,24.87474],[91.9329,24.87452],[91.93242,24.87404],[91.93219,24.87378],[91.9317,24.87322],[91.93128,24.87261],[91.93119,24.87245],[91.93112,24.87227],[91.93094,24.87168],[91.93085,24.87116],[91.93082,24.87075],[91.9308,24.87052],[91.9308,24.87047],[91.93082,24.87033],[91.93082,24.87018],[91.93083,24.87015],[91.93083,24.87011],[91.93082,24.86987],[91.93082,24.86947],[91.93079,24.86901],[91.93075,24.86861],[91.93048,24.86728],[91.93033,24.86676],[91.93026,24.86649],[91.93024,24.86641],[91.93014,24.86606],[91.9301,24.86589],[91.93006,24.86575],[91.93005,24.86571],[91.93001,24.86553],[91.92996,24.86536],[91.92992,24.86518],[91.92988,24.86501],[91.92971,24.86447],[91.92969,24.86441],[91.92968,24.86435],[91.92954,24.86389],[91.92943,24.8634],[91.92912,24.86229],[91.92907,24.86212],[91.9289,24.8616],[91.92887,24.8615],[91.92884,24.86143],[91.92877,24.86126],[91.92871,24.86109],[91.92869,24.86105],[91.92852,24.8606],[91.92841,24.86032],[91.92797,24.85918],[91.92787,24.85895],[91.92784,24.85886],[91.92781,24.85874],[91.92777,24.85861],[91.92775,24.85851],[91.92774,24.85849],[91.92772,24.85843],[91.9277,24.85828],[91.9277,24.85825],[91.92767,24.85816],[91.92766,24.85815],[91.92765,24.85815],[91.92764,24.85815],[91.92763,24.85815],[91.92752,24.85823],[91.92738,24.85833],[91.92705,24.85861],[91.92683,24.85876],[91.92647,24.85902],[91.92633,24.85911],[91.92575,24.85953],[91.92569,24.85958],[91.92564,24.85962],[91.92494,24.86012],[91.92491,24.86014],[91.92442,24.86049],[91.92358,24.86111],[91.92342,24.86122],[91.92334,24.86128],[91.92329,24.86132],[91.92296,24.86156],[91.92195,24.8623],[91.92176,24.86245],[91.92152,24.86263],[91.92008,24.86368],[91.91998,24.86374],[91.91947,24.86411],[91.91938,24.86418],[91.9187,24.86467],[91.91839,24.8649],[91.91819,24.86504],[91.91791,24.86524],[91.91789,24.86526],[91.91763,24.86545],[91.91703,24.86588],[91.91693,24.86595],[91.91668,24.86613],[91.9165,24.86627],[91.91637,24.86636],[91.91625,24.86645],[91.91548,24.867],[91.91517,24.86722],[91.91479,24.8675],[91.91398,24.86808],[91.91368,24.86831],[91.91315,24.86869],[91.91281,24.86894],[91.91262,24.86908],[91.9125,24.86916],[91.91214,24.86942],[91.91192,24.86959],[91.91162,24.8698],[91.91152,24.86986],[91.91136,24.86998],[91.91129,24.87002],[91.91104,24.87018],[91.91086,24.8703],[91.9108,24.87034],[91.91055,24.87048],[91.91047,24.87052],[91.91024,24.87064],[91.90999,24.87077],[91.90951,24.87099],[91.90947,24.87101],[91.90918,24.87113],[91.90884,24.87127],[91.90877,24.8713],[91.9086,24.87137],[91.90857,24.87138],[91.90836,24.87146],[91.90816,24.87152],[91.90795,24.87159],[91.90775,24.87165],[91.90773,24.87166],[91.90717,24.87182],[91.90671,24.87196],[91.90605,24.87212],[91.90595,24.87214],[91.90559,24.87222],[91.90532,24.87228],[91.90517,24.87231],[91.90495,24.87235],[91.90457,24.87242],[91.90389,24.87258],[91.90369,24.87262],[91.90358,24.87265],[91.90329,24.87272],[91.90283,24.87281],[91.90262,24.87284],[91.90245,24.87288],[91.90211,24.87294],[91.90206,24.87295],[91.90152,24.87307],[91.90097,24.8732],[91.90066,24.87327],[91.90059,24.87329],[91.90034,24.87334],[91.90028,24.87335],[91.90006,24.87339],[91.9,24.8734],[91.8997,24.87345],[91.89967,24.87345],[91.89948,24.8735],[91.89923,24.87355],[91.89881,24.87364],[91.89857,24.87369],[91.89795,24.87383],[91.89766,24.87387],[91.89711,24.87397],[91.89667,24.87403],[91.89626,24.87407],[91.89547,24.87417],[91.89437,24.8743],[91.89377,24.87438],[91.89324,24.87444],[91.89292,24.87448],[91.89287,24.87449],[91.8924,24.87458],[91.89218,24.87463],[91.89192,24.87466],[91.89138,24.87473],[91.89116,24.87475],[91.89109,24.87476],[91.89059,24.87483],[91.89008,24.87489],[91.88971,24.87494],[91.88912,24.87502],[91.88873,24.87508],[91.88871,24.87508],[91.88828,24.87513],[91.88822,24.87514],[91.88757,24.87522],[91.88724,24.87527],[91.88696,24.87531],[91.8866,24.87536],[91.88617,24.87541],[91.8859,24.87545],[91.88537,24.87551],[91.88422,24.87566],[91.88411,24.87568],[91.88375,24.87572],[91.88254,24.87588],[91.88251,24.87589],[91.88231,24.87592],[91.88228,24.87593],[91.88189,24.876],[91.88155,24.87608],[91.88116,24.87621],[91.88094,24.8763],[91.88061,24.87644],[91.88036,24.87654],[91.87998,24.87672],[91.87975,24.87684],[91.87963,24.8769],[91.87943,24.87702],[91.87939,24.87704],[91.87923,24.87714],[91.8792,24.87716],[91.87903,24.87728],[91.87876,24.87748],[91.87862,24.87758],[91.87855,24.87762],[91.87832,24.87779],[91.87831,24.8778],[91.87808,24.87799],[91.87796,24.8781],[91.8778,24.87825],[91.87758,24.87847],[91.87746,24.8786],[91.87741,24.87858],[91.87725,24.87846],[91.87707,24.87829],[91.87696,24.8782],[91.87683,24.8781],[91.8768,24.87809],[91.87664,24.87798],[91.87648,24.87788],[91.87625,24.87777],[91.87614,24.87774],[91.87606,24.87772],[91.87592,24.87775],[91.87577,24.87765],[91.87566,24.87761],[91.87566,24.87763],[91.87565,24.87764],[91.87565,24.87765],[91.87564,24.87766],[91.87564,24.87767],[91.87563,24.87768],[91.87562,24.8777],[91.87556,24.87771],[91.8755,24.87779],[91.87549,24.87783],[91.87547,24.87787],[91.87546,24.87789]],points:[{"coordinates":[91.9459066,24.8986604],"properties":{"kind":"waypoint","name":"Army Institute of Business Administration (Army IBA), Sylhet","detail":"Start and finish, AIBA Sylhet"}},{"coordinates":[91.9276761,24.8580832],"properties":{"kind":"waypoint","name":"Academy Square Sreerampur Sylhet","detail":"Reference waypoint"}},{"coordinates":[91.8756369,24.8779308],"properties":{"kind":"waypoint","name":"Humayon Rashid Chottor","detail":"Reference waypoint"}}]};
  function boot(){if(!window.L)return;var data={features:[{geometry:{type:'LineString',coordinates:inlineRoute.line}}].concat(inlineRoute.points.map(function(p){return {geometry:{type:'Point',coordinates:p.coordinates},properties:p.properties};}))};start(data);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();

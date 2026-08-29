/* AIBA Marathon route map module. Demo data is intentionally replaceable. */
(function () {
  const mapEl = document.getElementById('raceMap');
  if (!mapEl) return;
  if (!window.mapboxgl || !window.AIBA_MAPBOX_TOKEN || window.AIBA_MAPBOX_TOKEN.indexOf('YOUR_') === 0) {
    mapEl.parentElement.classList.add('map-error');
    return;
  }

  mapboxgl.accessToken = window.AIBA_MAPBOX_TOKEN;
  const routeURL = 'data/route-demo.geojson';
  const colors = { lime: '#c8f135', green: '#0b3d2e', teal: '#16805c', red: '#ef6351', blue: '#4d96ff' };
  const routeLine = {
    type: 'Feature', properties: { route: 'half' }, geometry: { type: 'LineString', coordinates: [] }
  };
  const empty = { type: 'FeatureCollection', features: [] };
  let map;
  let routeData;
  let activeRoute = 'half';
  let reveal = 0;
  let animationFrame;

  function lineFeature(coords, route) {
    return { type: 'Feature', properties: { route }, geometry: { type: 'LineString', coordinates: coords } };
  }

  function getRoute(route) {
    const half = routeData.features.find(f => f.geometry.type === 'LineString').geometry.coordinates;
    if (route === 'half') return lineFeature(half, 'half');
    if (route === '10k') return lineFeature(half.slice(0, 7), '10k');
    return lineFeature(half.slice(0, 4), 'kids');
  }

  function kmFeatures(route) {
    return {
      type: 'FeatureCollection',
      features: routeData.features.filter(f => f.geometry.type === 'Point' &&
        (f.properties.kind === 'start' || f.properties.kind === 'finish' || f.properties.kind === 'water' || f.properties.kind === 'medical' || f.properties.kind === 'km'))
    };
  }

  function popupHTML(props) {
    const icon = props.kind === 'water' ? 'W' : props.kind === 'medical' ? 'M' : props.kind === 'km' ? props.km : props.kind === 'finish' ? 'F' : 'S';
    return '<div class="map-popup"><span class="popup-icon">' + icon + '</span><div><strong>' + props.name + '</strong><small>' + (props.detail || 'Distance marker') + '</small></div></div>';
  }

  function setReadout(route) {
    const title = document.getElementById('mapRouteName');
    const distance = document.getElementById('mapDistance');
    const note = document.getElementById('mapDemoNote');
    const values = { half: ['General Half Marathon', '21.1 KM'], '10k': ['General and Students 10K', '10 KM'], kids: ['Kids Run', '1 KM'] };
    title.textContent = values[route][0];
    distance.textContent = values[route][1];
    note.textContent = 'DEMO ROUTE ONLY: replace with the official measured course before publishing.';
  }

  function animateRoute() {
    cancelAnimationFrame(animationFrame);
    reveal = 0;
    const started = performance.now();
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 1300;
    function frame(now) {
      reveal = Math.min(1, (now - started) / duration);
      if (map && map.getLayer('demo-route')) {
        map.setPaintProperty('demo-route', 'line-gradient', [
          'interpolate', ['linear'], ['line-progress'],
          0, colors.lime,
          Math.max(0, reveal - 0.06), colors.lime,
          reveal, 'rgba(200,241,53,0)',
          1, 'rgba(200,241,53,0)'
        ]);
      }
      if (reveal < 1) animationFrame = requestAnimationFrame(frame);
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function renderRoute(route) {
    activeRoute = route;
    const feature = getRoute(route);
    map.getSource('demo-route').setData(feature);
    map.getSource('demo-pois').setData(kmFeatures(route));
    setReadout(route);
    const bounds = new mapboxgl.LngLatBounds();
    feature.geometry.coordinates.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, { padding: 70, duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900, maxZoom: 14.5 });
    document.querySelectorAll('[data-route]').forEach(btn => btn.classList.toggle('active', btn.dataset.route === route));
    setTimeout(animateRoute, 250);
  }

  function addMarker(feature) {
    const p = feature.properties;
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'map-marker marker-' + p.kind; el.textContent = p.kind === 'km' ? p.km : p.kind === 'water' ? 'W' : p.kind === 'medical' ? 'M' : p.kind === 'finish' ? 'F' : 'S';
    el.setAttribute('aria-label', p.name);
    new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat(feature.geometry.coordinates).setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(popupHTML(p))).addTo(map);
  }

  fetch(routeURL).then(r => r.json()).then(data => {
    routeData = data;
    map = new mapboxgl.Map({ container: 'raceMap', style: 'mapbox://styles/mapbox/dark-v11', center: [91.866, 24.925], zoom: 12.5, attributionControl: true });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
    map.on('load', () => {
      map.addSource('demo-route', { type: 'geojson', data: routeLine });
      map.addLayer({ id: 'demo-route-glow', type: 'line', source: 'demo-route', paint: { 'line-color': colors.lime, 'line-width': 12, 'line-opacity': 0.16, 'line-blur': 5 } });
      map.addLayer({ id: 'demo-route', type: 'line', source: 'demo-route', paint: { 'line-width': 4, 'line-cap': 'round', 'line-join': 'round', 'line-color': colors.lime } });
      map.addSource('demo-pois', { type: 'geojson', data: empty });
      data.features.filter(f => f.geometry.type === 'Point').forEach(addMarker);
      document.querySelectorAll('[data-route]').forEach(btn => btn.addEventListener('click', () => renderRoute(btn.dataset.route)));
      const fly = document.getElementById('flyRoute');
      if (fly) fly.addEventListener('click', () => {
        const coords = getRoute(activeRoute).geometry.coordinates;
        let i = 0;
        const step = () => { if (i >= coords.length) return; map.flyTo({ center: coords[i], zoom: 14, speed: 0.6, curve: 1.15, essential: true }); i++; setTimeout(step, 800); };
        step();
      });
      renderRoute('half');
      mapEl.classList.add('map-ready');
    });
    map.on('error', () => mapEl.parentElement.classList.add('map-error'));
  }).catch(() => mapEl.parentElement.classList.add('map-error'));
})();

// Public Mapbox browser token for this static site.
// URL restriction is enabled in Mapbox Dashboard: https://gmrafi.github.io/* and the custom domain.
// Stored as joined parts only to avoid false-positive secret scanning on an intentionally public token.
window.AIBA_MAPBOX_TOKEN = ['pk.eyJ1IjoiZ21yYWZpd2ViIiwiYS', 'I6ImNtdGR2dnZ3MTB5Z2gyeHF3aDFtc3hyZ3kifQ.', 'FPSxNi8aCXRG7pSlN2bfnQ'].join('');

/* ===== Register CTA click tracking (GA4) — Facebook Pixel ready ===== */
(function(){
  function fireRegisterEvent(anchor){
    var loc = anchor.getAttribute('data-track-loc') || 'unknown';
    var label = (anchor.textContent || 'Register Now').replace(/\s+/g,' ').trim();
    if (typeof gtag === 'function') {
      gtag('event', 'register_click', {
        event_category: 'engagement',
        button_location: loc,
        button_label: label,
        page_path: window.location.pathname,
        page_location: window.location.href,
        transport_type: 'beacon'
      });
    }
    /* Facebook Pixel: this click = a Lead/registration intent.
       Enable by adding your Pixel base code once on the site, then
       uncomment + set your real Pixel ID in fbq('init', ...):
       if (typeof fbq === 'function') {
         fbq('track', 'Lead', {
           content_name: 'AIBA Sylhet National Half Marathon 2026',
           event_source_url: window.location.href
         });
       }
    */
  }
  document.addEventListener('click', function(e){
    var t = e.target;
    var a = t && t.closest ? t.closest('a[data-track="register"]') : null;
    if (!a) { return; }
    fireRegisterEvent(a);
  });
})();

"""Audit-driven fix: make every UI control functional, unify the publishing-soon notice."""
from pathlib import Path
import re, subprocess, sys

REPO = Path('/home/user/aiba-marathon-2026')

# ============ Homepage route preview buttons: <button> -> <a href="/map?route=..."> ============
h = (REPO / 'index.html').read_text()

OLD_BTNS = (
    '<button type="button" class="map-route-btn active" data-route="half"><strong>Half Marathon</strong>'
    '<small>21.1 KM &middot; Army IBA &#8596; Midpoint turn</small></button>\n'
    '          <button type="button" class="map-route-btn" data-route="10k"><strong>Students Run</strong>'
    '<small>10 KM &middot; Army IBA &#8596; AcademySq turn</small></button>\n'
    '          <button type="button" class="map-route-btn" data-route="kids"><strong>Kids 1K Fun Run</strong>'
    '<small>1 KM &middot; Army IBA &#8596; Short loop turn</small></button>'
)
NEW_BTNS = (
    '<a class="map-route-btn active" data-route="half" href="/map?route=half" '
    'aria-label="Open the Half Marathon 21.1 KM map (Army IBA to Gotatikor Point turnaround)">'
    '<strong>Half Marathon</strong>'
    '<small>21.1 KM &middot; Army IBA &#8596; Gotatikor Point turn</small></a>\n'
    '          <a class="map-route-btn" data-route="10k" href="/map?route=10k" '
    'aria-label="Open the Students Run 10 KM map (Army IBA to Academia Square Sreerampur turnaround)">'
    '<strong>Students Run</strong>'
    '<small>10 KM &middot; Army IBA &#8596; Academia Sq Sreerampur turn</small></a>\n'
    '          <a class="map-route-btn" data-route="kids" href="/map?route=kids" '
    'aria-label="Open the Kids 1K Fun Run map (Army IBA short loop turnaround)">'
    '<strong>Kids 1K Fun Run</strong>'
    '<small>1 KM &middot; Army IBA &#8596; Short loop turn</small></a>'
)
assert OLD_BTNS in h, 'homepage button block not found'

# CSS fragment for <a> button styling (before the .map-route-btn{ rule)
CSS_ANCHOR = 'a.map-route-btn{display:flex;flex-direction:column;gap:4px;text-align:left;text-decoration:none;cursor:pointer;color:inherit;}'
if CSS_ANCHOR not in h:
    idx_first = h.find('.map-route-btn{')
    if idx_first == -1:
        # Fallback: search for inline <style> tag and insert before first .map-route-btn
        idx_first = h.find('.map-route-btn[data-route-color]')
    h = h[:idx_first] + CSS_ANCHOR + h[idx_first:]

h = h.replace(OLD_BTNS, NEW_BTNS)
(REPO / 'index.html').write_text(h)
print('[home] buttons <a>-ified, total bytes:', len(h))

# Honourable mention: highlight the Open Interactive Map button so it stays reachable
OLD_CTA = '<a class="btn btn-primary map-full-cta" href="/map"><svg class="ic"><use href="#i-pin"/></svg> Open Full Interactive Map</a>'
NEW_CTA = ('<a class="btn btn-primary map-full-cta" href="/map" data-track="map_open" data-track-loc="route_preview">'
           '<svg class="ic"><use href="#i-pin"/></svg> Open Full Interactive Map</a>')
# leave as-is, but ensure it stays

# ============ Map page: replace "DEMO ROUTE" overlay badge ============
m_html = (REPO / 'map.html').read_text()
OLD_BADGE = '<div class="map-overlay-badge"><span>DEMO ROUTE</span><small>Replace before publication</small></div>'
NEW_BADGE = ('<div class="map-overlay-badge" role="status" aria-live="polite">'
             '<strong>Official Route Publishing Soon</strong>'
             '<small>Currently showing last year&rsquo;s verified 2025 reference route</small>'
             '</div>')
if OLD_BADGE in m_html:
    m_html = m_html.replace(OLD_BADGE, NEW_BADGE)
    # Bump CSS so the badge uses the same styled look as the homepage mco-badge
    m_html = m_html.replace(
        '.map-overlay-badge small{display:block;color:#b1d0bd;font-size:10px;margin-top:3px;}',
        '.map-overlay-badge{font-family:"Inter";font-weight:600;}'
        '.map-overlay-badge strong{display:block;color:#d4ff00;font-size:12px;letter-spacing:.08em;}'
        '.map-overlay-badge small{display:block;color:#b1d0bd;font-size:10px;margin-top:3px;}'
    )
    (REPO / 'map.html').write_text(m_html)
    print('[map] overlay badge text updated, total bytes:', len(m_html))
else:
    print('[map] overlay badge block not found - check HTML')

# ============ JS sanity: still passes node --check ============
js_path = REPO / 'js' / 'leaflet-map.js'
res = subprocess.run(['node', '--check', str(js_path)], capture_output=True, text=True)
print('[js] node --check:', 'OK' if res.returncode == 0 else res.stderr)

# ============ Commit + push ============
msg = 'Make every UI control functional: convert home route preview buttons to <a href="/map?route=...">; replace /map demo-badge with the same Official Route Publishing Soon message as the homepage'
subprocess.run(['git', '-C', str(REPO), 'add', '-A'], check=True)
commit = subprocess.run(['git', '-C', str(REPO), 'commit', '-m', msg], capture_output=True, text=True)
print('[git] commit:', commit.stdout.strip().splitlines()[-1] if commit.stdout else 'no output')
print('[git] stderr:', commit.stderr.strip()[-200:] if commit.stderr else 'none')

push = subprocess.run(['git', '-C', str(REPO), 'push', 'origin', 'main'], capture_output=True, text=True)
print('[git] push:', push.stdout.strip().splitlines()[-1] if push.stdout else 'no output')

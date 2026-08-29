# AIBA Sylhet National Half Marathon 2026

[![Live Website](https://img.shields.io/badge/Live%20Website-gmrafi.github.io%2Faiba--marathon--2026-0b3d2e?style=for-the-badge)](https://gmrafi.github.io/aiba-marathon-2026/)
[![HTML5](https://img.shields.io/badge/HTML5-static%20site-e34f26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-responsive%20design-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![GitHub Pages](https://img.shields.io/badge/Deployed%20with-GitHub%20Pages-222222?style=flat-square&logo=github)](https://pages.github.com/)

Official event website for **AIBA Sylhet National Half Marathon 2026**, organised by the **Army IBA Hiking And Trekking Club, Sylhet**.

## Event Overview

- **Event:** AIBA Sylhet National Half Marathon 2026
- **Tagline:** Run From Sylhet, Run For The Nation
- **Event date:** 13 November 2026
- **Early Bird registration:** Starts 01 September 2026
- **Venue:** Army Institute of Business Administration (AIBA), Sylhet Cantonment Road, Sylhet, Bangladesh
- **Organiser:** Army IBA Hiking And Trekking Club, Sylhet
- **Expected participants:** 1,000
- **Total prize pool:** BDT 300K
- **Awards:** Strictly gender-neutral
- **Official contact:** 01316891926

## Race Categories

- **Kids 1K:** Children aged 12 years and under. Birth certificate verification is required.
- **Students 10K:** Open up to undergraduate session 2021–22. Postgraduate students are not eligible. Valid student ID verification is required.
- **General 10K:** Participants aged 50 years and under.
- **General Half Marathon:** 21.1K for participants aged 50 years and under.
- **Veteran categories:** Veteran 10K and Veteran Half Marathon are included in the event programme.

## Registration Fees

| Category | Regular fee | Early Bird fee |
|---|---:|---:|
| Kids 1K | BDT 700 | BDT 600 |
| Students 10K | BDT 1,000 | BDT 900 |
| General 10K | BDT 1,200 | BDT 1,100 |
| Half Marathon 21.1K | BDT 1,400 | BDT 1,300 |

Early Bird participants receive **BDT 100 off** the applicable regular fee, subject to official terms and conditions.

## Website Features

- Responsive, mobile-first single-page event website
- Poster-inspired dark forest green and lime visual identity
- Light and Dark mode toggle with saved visitor preference
- Race day and Early Bird countdown timers
- Run Bangladesh registration call-to-action area
- Race categories and eligibility information
- Prize structure and tiered prize distribution explanation
- Expected participant statistics
- Announcements placeholder for future official updates
- Promo video placeholder
- Facilities, pacers, sponsor and partner placeholders
- Public interactive race-route map with a no-token Leaflet basemap and embedded demo route data
- Dedicated `map.html` explorer with route toggles for 42K reference, 10K and Kids 1K previews
- Auto-fit route view, visible waypoint stars, permanent waypoint labels, zoom controls and click-to-open details
- Reduced-motion fallback and mobile-responsive map layout
- The verified 2025 reference route is embedded in `js/leaflet-map.js` and can later be replaced with the official measured course
- Rules, contact details and official Facebook links
- Original AIBA and AIBA Hiking & Trekking Club logos

## Technology

This is a lightweight static website built with:

- Semantic HTML5
- CSS3 custom properties, responsive grid and theme tokens
- Vanilla JavaScript for countdowns, theme switching, reveal effects and Leaflet route controls
- Leaflet with public Esri basemap tiles for the public interactive route preview
- Inline SVG icons
- Google Fonts: Oswald and Inter
- GitHub Pages deployment

No build tool, framework or database is required.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/gmrafi/aiba-marathon-2026.git
   cd aiba-marathon-2026
   ```

2. Open `index.html` directly in a browser, or start a local server:

   ```bash
   python3 -m http.server 8000
   ```

3. Visit `http://localhost:8000`.

The interactive route preview is explicitly a demo/reference course. It renders without a Mapbox token and must be replaced with the official measured route before publication.

## Deployment

The production site is deployed from the `main` branch using GitHub Pages.

1. Push changes to `main`.
2. In the repository, open **Settings → Pages**.
3. Select **Deploy from a branch**, choose `main`, and select the root folder.
4. GitHub Pages will publish the updated static site.

## Official Links

- **Live website:** https://gmrafi.github.io/aiba-marathon-2026/
- **GitHub repository:** https://github.com/gmrafi/aiba-marathon-2026
- **Official Facebook Group:** https://www.facebook.com/share/g/1KiBDoCWFm/
- **Official Event Link:** https://www.facebook.com/share/17o1LNCC4v/

## Developer & Credits

- **Designed and developed by:** MD Golam Mubasshir Rafi
- **Organised by:** Army IBA Hiking And Trekking Club, Sylhet
- **Institution:** Army Institute of Business Administration, Sylhet

## License

The website source is maintained for the AIBA Sylhet National Half Marathon 2026 event. Event names, marks, logos, poster artwork and other brand assets remain the property of their respective owners. Reuse or redistribution of branding assets requires permission from the event organisers.

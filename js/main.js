/* main.js – navigation, footer, JSON rendering, filters, forms. Media helpers live in media.js */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const PAGES = [['index', 'Home'], ['expeditions', 'Expeditions'], ['destinations', 'Destinations'], ['mountaineering', 'Field guide'], ['guides', 'Guides'], ['gallery', 'Gallery'], ['safety', 'Safety'], ['about', 'About'], ['faq', 'FAQ'], ['contact', 'Contact']];
// JSON contracts: route/destination arrays hold mountain facts and images; guides hold bios, FAQs hold q/a pairs,
// gallery holds captions/categories, and mountaineering groups titled entries into named section arrays.
const load = async f => { const r = await fetch('data/' + f + '.json'); if (!r.ok) throw new Error(f); return r.json() };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fail = (el, m) => el && (el.innerHTML = `<p class="note" role="alert">${m || 'Could not load data. Run via a local server (e.g. VS Code Live Server), not file://.'}</p>`);
const cur = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
// Keep every destination available; phones use a menu button while tablets retain the swipeable link rail.
$('#nav').innerHTML = `<header><div class="wrap"><div class="brand-group"><a class="logo" href="index.html" aria-label="Alpine Ascents home"><img src="assets/images/climbing/fav.webp" alt=""><span>Alpine</span>Ascents</a><div class="visit-counter" title="A count saved in this browser only"><small>LOCAL VISITS</small><strong id="visit-count">—</strong></div></div><nav id="primary-navigation" class="site-nav" aria-label="Main navigation"><ul>${PAGES.map(([p, t]) => `<li><a href="${p}.html"${p === cur ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}<li><a class="btn pri" href="booking.html">Plan a trip</a></li></ul></nav><button id="menu" class="nav-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primary-navigation"><span></span><span></span><span></span></button></div></header>`;
const navButton = $('#menu');
const siteNav = $('.site-nav');
const setNavigationOpen = open => {
   navButton.setAttribute('aria-expanded', String(open));
   navButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
   siteNav.classList.toggle('open', open);
};
navButton.addEventListener('click', () => setNavigationOpen(navButton.getAttribute('aria-expanded') !== 'true'));
siteNav.addEventListener('click', event => {
   if (event.target.closest('a')) setNavigationOpen(false);
});
document.addEventListener('keydown', event => {
   if (event.key === 'Escape') setNavigationOpen(false);
});
addEventListener('resize', () => {
   if (innerWidth > 860) setNavigationOpen(false);
});
// This privacy-friendly counter is stored in this browser only, not reported as total site traffic.
try {
   const visits = Number(localStorage.getItem('aa-local-visits') || 0);
   const nextVisit = Number.isSafeInteger(visits) && visits >= 0 ? visits + 1 : 1;
   localStorage.setItem('aa-local-visits', String(nextVisit));
   $('#visit-count').textContent = nextVisit.toLocaleString();
} catch (error) {
   console.warn('Local visit count is unavailable in this browser.', error);
}
// Group key destinations in the footer and keep the site-wide safety disclaimer visible.
$('#foot').innerHTML = `
   <footer class="site-footer">
      <div class="wrap">
         <div class="footer-main">
            <div class="footer-brand">
               <a class="footer-brand-mark" href="index.html">
                  <img src="assets/images/climbing/fav.webp" alt="">
                  <span>Alpine</span> Ascents
               </a>
               <p>An independent field guide for thoughtful mountain travel, climbing knowledge and better-prepared decisions.</p>
            </div>
            <nav class="footer-links" aria-label="Explore the mountains">
               <h2>Explore</h2>
               <ul>
                  <li><a href="expeditions.html">Expeditions</a></li>
                  <li><a href="destinations.html">Destinations</a></li>
                  <li><a href="mountaineering.html">Mountaineering field guide</a></li>
               </ul>
            </nav>
            <nav class="footer-links" aria-label="Learn and prepare">
               <h2>Learn &amp; prepare</h2>
               <ul>
                  <li><a href="guides.html">Climbing guides</a></li>
                  <li><a href="safety.html">Mountain safety</a></li>
                  <li><a href="faq.html">Frequently asked questions</a></li>
                  <li><a href="gallery.html">Photo gallery</a></li>
               </ul>
            </nav>
            <nav class="footer-links" aria-label="About Alpine Ascents">
               <h2>About</h2>
               <ul>
                  <li><a href="about.html">Our approach</a></li>
                  <li><a href="contact.html">Contact</a></li>
                  <li><a href="booking.html">Enquiry form</a></li>
               </ul>
            </nav>
         </div>
         <div class="footer-bottom">
            <p>General information only—not guiding, booking or emergency support. Check current local forecasts, conditions, permits and qualified professional advice before every climb.</p>
            <p class="footer-copyright">&copy; ${new Date().getFullYear()} Alpine Ascents</p>
         </div>
      </div>
   </footer>
   <div class="live-ticker" role="group" aria-label="Current date, time and optional location">
      <span class="ticker-pulse" aria-hidden="true"></span>
      <strong>FIELD NOTES</strong>
      <time id="live-now"></time>
      <button id="ticker-location" type="button">Set location</button>
      <span id="live-location">Location not shared</span>
      <span class="ticker-marquee" aria-hidden="true"><span>LEAVE NO TRACE&nbsp; · &nbsp;CHECK LOCAL CONDITIONS&nbsp; · &nbsp;LOOK OUT FOR YOUR TEAM&nbsp; · &nbsp;LEAVE NO TRACE&nbsp; · &nbsp;CHECK LOCAL CONDITIONS&nbsp; · &nbsp;LOOK OUT FOR YOUR TEAM&nbsp; · &nbsp;</span></span>
   </div>
   <button id="top" aria-label="Back to top">↑</button>`;
$('#top').onclick = () => scrollTo({ top: 0 }); addEventListener('scroll', () => $('#top').style.display = scrollY > 600 ? 'block' : 'none');
const liveNow = $('#live-now');
// Refresh the local clock without repeatedly changing the page layout.
const updateClock = () => {
   if (!liveNow) return;
   liveNow.dateTime = new Date().toISOString();
   liveNow.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
   }).format(new Date());
};
updateClock();
setInterval(updateClock, 30000);
// Coordinates are only read after the visitor opts in; the ticker never stores them.
$('#ticker-location').onclick = () => {
   const status = $('#live-location');
   if (!navigator.geolocation) {
      status.textContent = 'Location is not supported by this browser.';
      return;
   }
   status.textContent = 'Waiting for location permission…';
   navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude.toFixed(2), lon = position.coords.longitude.toFixed(2);
      status.textContent = `Approx. ${lat}°, ${lon}° · location stays in this browser`;
   }, error => {
      status.textContent = error.code === error.PERMISSION_DENIED
         ? 'Location permission was not granted.'
         : 'Could not read your location. Try again outdoors.';
   }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
};
// Animate only marked content entering the viewport; reduced-motion users get the CSS fallback.
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))));
const reveal = () => $$('.rv:not(.in)').forEach(e => io.observe(e)); reveal();
// Read each photo from its local file and show its plain-text photographer/license credit.
const ph = (n, m) => `<div class="ph"><img src="${esc(imgSrc(m))}" alt="${esc(m.alt || n)}" loading="lazy" decoding="async" onerror="this.remove()"></div>${credit(m)}`;
const card = e => `<article class="card rv">${ph(e.name, e.image)}<div class="body"><span class="tag">${esc(e.difficulty)}</span><h3>${esc(e.name)}</h3><dl><dt>Country</dt><dd>${esc(e.country)}</dd><dt>Altitude</dt><dd>${Number(e.altitude).toLocaleString()} m</dd><dt>Typical duration</dt><dd>~${Number(e.days)} days</dd><dt>Season</dt><dd>${esc(e.season)}</dd></dl><a class="btn" href="expedition-details.html?id=${encodeURIComponent(e.id)}">Route details</a></div></article>`;
const P = document.body.dataset.page;
if (P === 'home') heroMedia();
else pagePhoto();
(async () => {
   const g = $('#grid');
   if (P === 'home') {
      try {
         const expeditions = await load('expeditions');
         g.innerHTML = expeditions.slice(0, 6).map(card).join('');
         $('#route-count').textContent = String(expeditions.length).padStart(2, '0');
         reveal();
      } catch {
         fail(g);
      }

      try {
         const guide = await load('mountaineering');
         const guideSections = ['history', 'styles', 'techniques', 'shelter', 'hazards', 'records', 'stories', 'organizations', 'developments', 'guidelines'];
         const topicCount = guideSections.filter(section => Array.isArray(guide[section])).length;
         $('#topic-count').textContent = String(topicCount).padStart(2, '0');
         $('#organization-count').textContent = String((guide.organizations || []).length).padStart(2, '0');
         $('#home-notes-grid').innerHTML = (guide.stories || []).slice(0, 3).map(note => `<article class="home-note-card"><img src="${esc(imgSrc(note.image))}" alt="${esc(note.image.alt || note.title)}" loading="lazy" decoding="async"><div><span class="field-tag">${esc(note.category)}</span><h3>${esc(note.title)}</h3><p>${esc(note.text)}</p></div></article>`).join('');
         if (!guide.stories || !guide.stories.length) $('#home-notes-grid').innerHTML = '<p class="note">No field notes are currently available.</p>';
      } catch (error) {
         console.error('Could not load homepage field notes.', error);
         $('#topic-count').textContent = '—';
         $('#organization-count').textContent = '—';
         fail($('#home-notes-grid'), 'Could not load mountain field notes. Run the website through a local server.');
      }
   }
   if (P === 'expeditions') {
      try {
         const all = await load('expeditions');
         $('#country').innerHTML += [...new Set(all.flatMap(e => e.country.split(' / ')))].sort().map(c => `<option>${c}</option>`).join('');
         const run = () => {
            const q = $('#q').value.toLowerCase(), d = $('#diff').value, c = $('#country').value, m = +$('#dur').value, s = $('#sort').value;
            let l = all.filter(e => (!q || (e.name + e.country).toLowerCase().includes(q)) && (!d || e.difficulty === d) && (!c || e.country.includes(c)) && (!m || e.days <= m));
            l.sort((a, b) => s === 'alt' ? b.altitude - a.altitude : s === 'dur' ? a.days - b.days : a.name.localeCompare(b.name));
            g.innerHTML = l.map(card).join('') || '<p>No expeditions match.</p>'; reveal()
         };
         $$('.tools input,.tools select').forEach(x => x.oninput = run); run()
      } catch { fail(g) }
   }
   if (P === 'details') {
      const a = $('#app'); try {
         const id = new URLSearchParams(location.search).get('id'), e = (await load('expeditions')).find(x => x.id === id);
         if (!e) return fail(a, 'Expedition not found. <a href="expeditions.html">Browse expeditions</a>'); document.title = e.name + ' – Alpine Ascents';
         a.innerHTML = `<h1>${esc(e.name)}</h1><p>${esc(e.overview)}</p>${ph(e.name, e.image)}<div class="split"><div><h2>Key facts</h2><dl><dt>Altitude</dt><dd>${Number(e.altitude).toLocaleString()} m</dd><dt>Country</dt><dd>${esc(e.country)}</dd><dt>Difficulty</dt><dd>${esc(e.difficulty)}</dd><dt>Season</dt><dd>${esc(e.season)}</dd><dt>Indicative duration</dt><dd>~${Number(e.days)} days; operator dependent</dd></dl><h2>Before you climb</h2><p class="note">Confirm current permits, itinerary, costs, insurance, accommodation and route conditions with official authorities and a qualified operator.</p></div><div><h2>Preparation prompts</h2><ul class="chk"><li>Build relevant experience and fitness well before departure.</li><li>Confirm that boots, crampons, ice axe, harness and helmet are appropriate for the route and team.</li><li>Carry layered clothing, weather protection, navigation, communication and first-aid supplies.</li><li>Plan gradual acclimatization when the route reaches high altitude.</li><li>Agree on a turnaround time and emergency plan with the whole team.</li></ul><h2>Safety</h2><p>Altitude illness, weather, avalanche, rockfall and cold risks vary by route and conditions. Stop ascent and descend if altitude symptoms worsen.</p><a class="btn pri" href="booking.html?id=${encodeURIComponent(e.id)}">Enquiry form demo</a></div></div>`
      } catch { fail(a) }
   }
   if (P === 'destinations') { try { const all = await load('destinations'), r = () => { const q = $('#q').value.toLowerCase(); g.innerHTML = all.filter(d => (d.name + d.country + d.range).toLowerCase().includes(q)).map(d => `<article class="card rv">${ph(d.name, d.image)}<div class="body"><h3>${esc(d.name)}</h3><dl><dt>Country</dt><dd>${esc(d.country)}</dd><dt>Range</dt><dd>${esc(d.range)}</dd><dt>Altitude</dt><dd>${Number(d.altitude).toLocaleString()} m</dd><dt>Season</dt><dd>${esc(d.season)}</dd><dt>Difficulty</dt><dd>${esc(d.difficulty)}</dd></dl><p>Plan acclimatization and gain relevant experience before climbing.</p></div></article>`).join('') || '<p>No destinations match your search.</p>'; reveal() }; $('#q').oninput = r; r() } catch { fail(g) } }
   if (P === 'guides') { try { g.innerHTML = (await load('guides')).map(x => `<article class="card rv">${ph(x.name, x.image)}<div class="body"><h3>${esc(x.name)}</h3><span class="tag">${esc(x.role)}</span><p>${esc(x.bio)}</p><a class="text-link" href="mountaineering.html#field-techniques">Explore field guide ↗</a></div></article>`).join(''); reveal() } catch { fail(g) } }
   if (P === 'gallery') {
      try {
         const all = await load('gallery'), dlg = $('#lb'); $('#cat').innerHTML += [...new Set(all.map(x => x.cat))].map(c => `<option>${c}</option>`).join('');
         const r = () => { const visible = all.filter(x => !$('#cat').value || x.cat === $('#cat').value); g.innerHTML = visible.map((x, i) => `<article class="card gallery-card">${ph(x.caption, x.image)}<div class="body"><h3>${esc(x.caption)}</h3><button class="btn gallery-trigger" type="button" data-index="${i}">View photo <span aria-hidden="true">↗</span></button></div></article>`).join('') || '<p>No gallery photos match this category.</p>'; $$('.gallery-trigger', g).forEach(b => b.onclick = () => { const entry = visible[Number(b.dataset.index)]; $('#cap').textContent = entry.caption; $('#lb-image').src = imgSrc(entry.image); $('#lb-image').alt = entry.image.alt || entry.caption; dlg.showModal() }) }; $('#cat').onchange = r; r(); dlg.onclick = e => e.target === dlg && dlg.close()
      } catch { fail(g) }
   }
   if (P === 'faq') { const f = $('#faq'); try { f.innerHTML = (await load('faqs')).map((x, i) => `<article class="faq-item"><button aria-expanded="false" aria-controls="a${i}"><img src="${esc(imgSrc(x.image))}" alt="" loading="lazy" decoding="async"><span class="faq-question">${esc(x.q)}</span><span class="faq-toggle" aria-hidden="true">+</span></button><div class="a" id="a${i}">${esc(x.a)}</div></article>`).join(''); $$('button', f).forEach(b => b.onclick = () => { const o = b.classList.toggle('open'); b.setAttribute('aria-expanded', o); $('.faq-toggle', b).textContent = o ? '−' : '+' }) } catch { fail(f) } }
   if (P === 'about' || P === 'safety') {
      try {
         const guide = await load('mountaineering');
         const entries = P === 'about'
            ? [...guide.history, ...guide.styles, ...guide.guidelines]
            : [...guide.hazards, ...guide.guidelines, ...guide.techniques];
         const grid = P === 'about' ? $('#about-grid') : $('#safety-grid');
         grid.innerHTML = entries.map(item => `<article class="card">${ph(item.title, item.image)}<div class="body"><span class="tag">${esc(item.category)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></div></article>`).join('');
      } catch (error) {
         console.error(`Could not load ${P} page guide cards.`, error);
         fail(P === 'about' ? $('#about-grid') : $('#safety-grid'), 'Could not load the guide cards. Run the website through a local server.');
      }
   }
   if (P === 'mountaineering') {
      try {
         const guide = await load('mountaineering');
         const sections = [
            ['history', 'history-grid'], ['styles', 'styles-grid'], ['techniques', 'techniques-grid'],
            ['shelter', 'shelter-grid'], ['hazards', 'hazards-grid'], ['records', 'records-grid'],
            ['stories', 'stories-grid'], ['organizations', 'organizations-grid'],
            ['developments', 'developments-grid'], ['guidelines', 'guidelines-grid']
         ];
         const renderInfoCard = item => `<article class="field-card">${item.image ? `<img src="${esc(imgSrc(item.image))}" alt="${esc(item.image.alt || item.title)}" loading="lazy" decoding="async">` : ''}<div class="field-card-body"><span class="field-tag">${esc(item.category)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p>${item.region ? `<p class="field-region">${esc(item.region)}</p>` : ''}</div></article>`;
         sections.forEach(([key, target]) => {
            const container = $('#' + target);
            container.innerHTML = (guide[key] || []).map(renderInfoCard).join('') || '<p>No entries are available.</p>';
         });

         const status = $('#nearby-status'), results = $('#nearby-results'), map = $('#nearby-map');
         $('#nearby-search').onclick = () => {
            if (!navigator.geolocation) {
               status.textContent = 'Location search is not supported by this browser.';
               return;
            }
            status.textContent = 'Waiting for location permission…';
            results.replaceChildren();
            navigator.geolocation.getCurrentPosition(async position => {
               const lat = Number(position.coords.latitude.toFixed(2));
               const lon = Number(position.coords.longitude.toFixed(2));
               const bbox = `${lon - 0.18},${lat - 0.18},${lon + 0.18},${lat + 0.18}`;
               const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
               map.innerHTML = `<iframe title="OpenStreetMap around the approximate shared location" src="${esc(mapUrl)}" loading="lazy" referrerpolicy="no-referrer"></iframe><a href="https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}" target="_blank" rel="noopener noreferrer">Open larger map ↗</a>`;
               status.textContent = `Searching within about 30 km of ${lat.toFixed(2)}°, ${lon.toFixed(2)}°…`;
               const query = `[out:json][timeout:20];(node(around:30000,${lat},${lon})[club~"climbing|mountaineering"];way(around:30000,${lat},${lon})[club~"climbing|mountaineering"];relation(around:30000,${lat},${lon})[club~"climbing|mountaineering"];node(around:30000,${lat},${lon})[sport=mountaineering];way(around:30000,${lat},${lon})[sport=mountaineering];);out center tags;`;
               try {
                  const response = await fetch('https://overpass-api.de/api/interpreter', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                     body: `data=${encodeURIComponent(query)}`
                  });
                  if (!response.ok) throw new Error(`OpenStreetMap search returned ${response.status}.`);
                  const data = await response.json();
                  const entries = (data.elements || []).filter(entry => entry.tags && entry.tags.name);
                  if (!entries.length) {
                     status.textContent = 'No named climbing clubs were found in the map data nearby. Try the map or official organization links above.';
                     return;
                  }
                  results.innerHTML = `<h3>Mapped clubs nearby</h3>${entries.slice(0, 8).map(entry => {
                     const point = entry.center || entry;
                     return `<a href="https://www.openstreetmap.org/?mlat=${point.lat}&mlon=${point.lon}#map=16/${point.lat}/${point.lon}" target="_blank" rel="noopener noreferrer">${esc(entry.tags.name)} <span>↗</span></a>`;
                  }).join('')}`;
                  status.textContent = `${Math.min(entries.length, 8)} mapped result${entries.length === 1 ? '' : 's'} shown. Confirm details with each club.`;
               } catch (error) {
                  console.error('Nearby club search failed.', error);
                  status.textContent = 'The public club search is temporarily unavailable. The map and official organization links are still available.';
               }
            }, error => {
               console.warn('Location permission was unavailable.', error);
               status.textContent = error.code === error.PERMISSION_DENIED
                  ? 'Location permission was not granted. No location was shared.'
                  : 'Could not read your location. Check browser permissions and try again.';
            }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
         };
      } catch (error) {
         console.error('Could not load mountaineering field-guide data.', error);
         sections.forEach(([, target]) => fail($('#' + target), 'Could not load the field guide. Run the website through a local server.'));
      }
   }
   const sel = $('#exp'); if (sel) { try { const all = await load('expeditions'); sel.innerHTML = '<option value="">Select…</option>' + all.map(e => `<option value="${e.id}">${e.name}</option>`).join(''); sel.value = new URLSearchParams(location.search).get('id') || '' } catch { sel.innerHTML = '<option value="">Unavailable</option>' } }
   $$('form[data-form]').forEach(f => f.onsubmit = e => {
      e.preventDefault(); let bad = 0; $$('[required]', f).forEach(i => {
         const er = i.nextElementSibling, v = i.value.trim(); let m = '';
         if (!v) m = 'Required.'; else if (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) m = 'Enter a valid email.'; else if (i.type === 'number' && (+v < 1 || +v > 20)) m = 'Enter 1–20.';
         if (er) er.textContent = m; i.setAttribute('aria-invalid', !!m); bad += !!m
      });
      $('.ok', f).textContent = bad ? '' : 'This form is not connected. Your message was not sent.'
   });
})();

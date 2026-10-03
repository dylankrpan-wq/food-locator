import { search } from './engine.js';
import { fetchNearby, geocode } from './places.js';
import { GOALS } from './scoring.js';

const $ = (sel) => document.querySelector(sel);
const els = {
  search: $('#search'), query: $('#query'), mic: $('#mic'),
  locLabel: $('#loc-label'), locGps: $('#loc-gps'), locForm: $('#loc-form'), locInput: $('#loc-input'),
  prefs: $('#prefs'), goalChips: $('#goal-chips'),
  status: $('#status'), results: $('#results'), title: $('#results-title'),
  cards: $('#cards'), table: $('#table'),
};

const STORE_KEY = 'food-locator';
const state = {
  loc: null,        // { lat, lon, label }
  places: null,     // places fetched for placesKey
  placesKey: '',
  output: null,     // last search() result
  view: 'cards',
  sort: { key: 'overall', dir: -1 },
  searched: false,
};

// ---------- helpers ----------

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function setStatus(text, isError = false) {
  els.status.textContent = text;
  els.status.classList.toggle('error', isError);
}

function loadSaved() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ prefs: readPrefs(), view: state.view }));
  } catch { /* storage unavailable; preferences just won't persist */ }
}

const formatMiles = (mi) => (mi < 0.1 ? '< 0.1 mi' : `${mi.toFixed(1)} mi`);
const scoreClass = (s) => (s >= 70 ? 'good' : s >= 45 ? 'mid' : 'low');

function safeUrl(url) {
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch { return ''; }
}

// ---------- preferences ----------

function buildGoalChips() {
  els.goalChips.innerHTML = Object.entries(GOALS)
    .map(([id, g]) => `<label><input type="radio" name="goal" value="${id}">${escapeHtml(g.label)}</label>`)
    .join('');
}

function readPrefs() {
  const f = els.prefs.elements;
  const num = (name) => Math.max(0, Number(f[name].value) || 0);
  return {
    goal: f.goal.value || 'balanced',
    vegetarian: f.vegetarian.checked,
    vegan: f.vegan.checked,
    glutenFree: f.glutenFree.checked,
    maxCal: num('maxCal'),
    minProtein: num('minProtein'),
    maxSodium: num('maxSodium'),
    maxCarbs: num('maxCarbs'),
    radiusMi: Number(f.radiusMi.value) || 2,
    openOnly: f.openOnly.checked,
  };
}

function applyPrefs(p = {}) {
  const f = els.prefs.elements;
  f.goal.value = GOALS[p.goal] ? p.goal : 'balanced';
  for (const name of ['vegetarian', 'vegan', 'glutenFree', 'openOnly']) f[name].checked = !!p[name];
  for (const name of ['maxCal', 'minProtein', 'maxSodium', 'maxCarbs']) f[name].value = p[name] || '';
  if (p.radiusMi) f.radiusMi.value = String(p.radiusMi);
}

// ---------- location ----------

function setLocation(loc) {
  state.loc = loc;
  els.locLabel.textContent = `Near ${loc.label}`;
}

function locateByGps() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('This browser has no location support.'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'your location' }),
      () => reject(new Error("Couldn't get your location. Enter a city, address or ZIP instead.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

// ---------- search ----------

async function runSearch() {
  state.searched = true;
  try {
    if (!state.loc) {
      setStatus('Finding your location…');
      setLocation(await locateByGps());
    }
    const prefs = readPrefs();
    const key = `${state.loc.lat.toFixed(4)},${state.loc.lon.toFixed(4)},${prefs.radiusMi}`;
    if (key !== state.placesKey) {
      setStatus('Scanning nearby places…');
      state.places = await fetchNearby(state.loc.lat, state.loc.lon, prefs.radiusMi);
      state.placesKey = key;
    }
    state.output = search(state.places, els.query.value, prefs);
    render(prefs);
  } catch (err) {
    els.results.hidden = true;
    setStatus(err.message || 'Something went wrong. Please try again.', true);
  }
}

// ---------- rendering ----------

function whyBest(r, prefs, count) {
  const goal = GOALS[prefs.goal].label.toLowerCase();
  const strengths = r.pros.length ? `: ${r.pros.join(', ')}` : '';
  const others = count > 1 ? ` of ${count} menu items with published nutrition` : '';
  return `Top pick${others} for a ${goal} goal${strengths}. ${formatMiles(r.place.distanceMi)} away.`;
}

function macrosHtml(item) {
  const macros = [
    ['Calories', item.cal], ['Protein', `${item.protein} g`], ['Carbs', `${item.carbs} g`],
    ['Fat', `${item.fat} g`], ['Sodium', `${item.sodium} mg`],
  ];
  return `<dl class="macros">${macros.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
}

function tagsHtml(r) {
  const { item } = r;
  const tags = [
    ...r.violations.map((t) => ['violation', t]),
    ...r.pros.map((t) => ['pro', t]),
    ...r.cons.map((t) => ['con', t]),
    ['', r.source === 'chain' ? 'Menu item' : 'Estimate'],
    ...(r.matchFrac < 1 ? [['', 'Closest match']] : []),
    ...(item.vg ? [['', 'Vegan']] : item.v ? [['', 'Vegetarian']] : []),
    ...(item.gf ? [['', 'Gluten-free']] : []),
  ];
  return `<ul class="tags">${tags.map(([cls, t]) => `<li class="${cls}">${escapeHtml(t)}</li>`).join('')}</ul>`;
}

function scoreHtml(r) {
  return `<div class="score ${scoreClass(r.health)}" title="Health score for your goal (0-100)"
    aria-label="Health score ${r.health} out of 100">${r.health}</div>`;
}

function linksHtml(place) {
  const website = safeUrl(place.website);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`;
  return `
    <a href="${directions}" target="_blank" rel="noopener">Directions</a>
    ${website ? `<a href="${escapeHtml(website)}" target="_blank" rel="noopener">Website</a>` : ''}
    ${place.phone ? `<a href="tel:${escapeHtml(place.phone.replace(/[^\d+]/g, ''))}">${escapeHtml(place.phone)}</a>` : ''}`;
}

const extraLine = (item) => `Sat fat ${item.sat} g · Fiber ${item.fiber} g · Sugar ${item.sugar} g`;

// One card for a dish we only have a generic estimate for, listing every
// nearby place likely to serve it. The numbers describe a typical serving,
// not any one restaurant, so these places are not ranked against each other.
function estimateGroupHtml(rows) {
  const first = rows[0];
  const places = [...rows].sort(
    (a, b) => (a.status.state === 'closed') - (b.status.state === 'closed') || a.place.distanceMi - b.place.distanceMi
  );
  return `
    <article class="card">
      <div class="card-head">
        <div>
          <h3>${escapeHtml(first.item.name)}</h3>
          <p class="place">Typical restaurant serving. These places don't publish nutrition, so the real numbers will differ from place to place.</p>
        </div>
        ${scoreHtml(first)}
      </div>
      ${macrosHtml(first.item)}
      ${tagsHtml(first)}
      <p class="meta">${escapeHtml(extraLine(first.item))}</p>
      <h4 class="places-title">${places.length} nearby place${places.length === 1 ? '' : 's'} likely to serve it</h4>
      <ul class="places">${places.map(({ place, status }) => `
        <li>
          <div><strong>${escapeHtml(place.name)}</strong> · ${formatMiles(place.distanceMi)} ·
            <span class="${status.state}">${escapeHtml(status.text)}</span></div>
          <div class="meta">${escapeHtml([place.address, place.cuisineLabel].filter(Boolean).join(' · '))}</div>
          <div class="links">${linksHtml(place)}</div>
        </li>`).join('')}
      </ul>
    </article>`;
}

// Chain items get a card each; estimates are grouped per dish.
function cardsHtml(results, prefs) {
  const chainRows = results.filter((r) => r.source === 'chain');
  const blocks = chainRows.map((r, i) => ({ rank: r.overall, html: cardHtml(r, i === 0, prefs, chainRows.length) }));
  const groups = new Map();
  for (const r of results) {
    if (r.source !== 'estimate') continue;
    if (!groups.has(r.item.name)) groups.set(r.item.name, []);
    groups.get(r.item.name).push(r);
  }
  for (const rows of groups.values()) blocks.push({ rank: rows[0].overall, html: estimateGroupHtml(rows) });
  return blocks.sort((a, b) => b.rank - a.rank).map((b) => b.html).join('');
}

function cardHtml(r, best, prefs, count) {
  const { item, place, status } = r;
  const meta = [place.address, place.cuisineLabel, ...place.features].filter(Boolean).join(' · ');
  const extra = extraLine(item);

  return `
    <article class="card${best ? ' best' : ''}">
      ${best ? `<span class="best-label">Best pick</span><p class="why">${escapeHtml(whyBest(r, prefs, count))}</p>` : ''}
      <div class="card-head">
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <p class="place">${escapeHtml(place.name)} · ${formatMiles(place.distanceMi)} ·
            <span class="${status.state}">${escapeHtml(status.text)}</span></p>
        </div>
        ${scoreHtml(r)}
      </div>
      ${macrosHtml(item)}
      ${tagsHtml(r)}
      <p class="meta">${escapeHtml(extra)}${meta ? `<br>${escapeHtml(meta)}` : ''}</p>
      <p class="links">${linksHtml(place)}</p>
    </article>`;
}

const COLUMNS = [
  ['name', 'Item', (r) => r.item.name],
  ['place', 'Place', (r) => r.place.name],
  ['health', 'Score', (r) => r.health],
  ['cal', 'Cal', (r) => r.item.cal],
  ['protein', 'Protein', (r) => r.item.protein],
  ['carbs', 'Carbs', (r) => r.item.carbs],
  ['fat', 'Fat', (r) => r.item.fat],
  ['sat', 'Sat fat', (r) => r.item.sat],
  ['sodium', 'Sodium', (r) => r.item.sodium],
  ['fiber', 'Fiber', (r) => r.item.fiber],
  ['distance', 'Miles', (r) => r.place.distanceMi],
  ['status', 'Hours', (r) => r.status.text],
];

function tableHtml(results) {
  const { key, dir } = state.sort;
  const col = COLUMNS.find((c) => c[0] === key);
  const rows = col
    ? [...results].sort((a, b) => {
        const x = col[2](a), y = col[2](b);
        return (typeof x === 'string' ? x.localeCompare(y) : x - y) * dir;
      })
    : results;
  const head = COLUMNS.map(([k, label]) => {
    const sort = k === key ? ` aria-sort="${dir === 1 ? 'ascending' : 'descending'}"` : '';
    return `<th${sort}><button type="button" data-sort="${k}">${label}</button></th>`;
  }).join('');
  const body = rows.map((r) => `<tr>${COLUMNS.map(([k, , get]) => {
    const v = get(r);
    if (k === 'name') return `<td class="item">${escapeHtml(v)}${r.source === 'estimate' ? ' <small>(est.)</small>' : ''}</td>`;
    if (k === 'distance') return `<td>${v.toFixed(1)}</td>`;
    if (k === 'status') return `<td class="${r.status.state}">${escapeHtml(v)}</td>`;
    return `<td>${escapeHtml(v)}</td>`;
  }).join('')}</tr>`).join('');
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function render(prefs = readPrefs()) {
  const { results } = state.output;
  const what = els.query.value.trim() || 'food';
  if (!results.length) {
    els.results.hidden = true;
    setStatus(
      state.places.length
        ? `No match for "${what}" within ${prefs.radiusMi} mi (${state.places.length} places scanned). Try a wider distance, a simpler search, or fewer filters.`
        : `No restaurants found within ${prefs.radiusMi} mi. Try a wider distance.`
    );
    return;
  }
  setStatus(
    `Scanned ${state.places.length} places within ${prefs.radiusMi} mi.` +
      (state.places.truncated ? ' This area is dense, so some were skipped. Choose a smaller distance to cover everything nearby.' : '')
  );
  const placeCount = new Set(results.map((r) => r.place.id)).size;
  els.title.textContent = `${placeCount} place${placeCount === 1 ? '' : 's'} for "${what}"`;
  els.cards.innerHTML = cardsHtml(results, prefs);
  els.table.innerHTML = tableHtml(results);
  els.cards.hidden = state.view !== 'cards';
  els.table.hidden = state.view !== 'table';
  for (const b of document.querySelectorAll('.toggle button')) {
    b.setAttribute('aria-pressed', String(b.dataset.view === state.view));
  }
  els.results.hidden = false;
}

// ---------- voice ----------

function setupVoice() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return;
  els.mic.hidden = false;
  let rec = null;
  els.mic.addEventListener('click', () => {
    if (rec) return rec.stop();
    rec = new Recognition();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = false;
    rec.onresult = (e) => {
      els.query.value = e.results[0][0].transcript.replace(/[.?!]+$/, '');
      runSearch();
    };
    rec.onerror = (e) => {
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setStatus("Couldn't use the microphone. Check the browser's mic permission or type your search.", true);
      }
    };
    rec.onend = () => {
      rec = null;
      els.mic.classList.remove('listening');
    };
    els.mic.classList.add('listening');
    setStatus('Listening…');
    rec.start();
  });
}

// ---------- wiring ----------

function init() {
  buildGoalChips();
  const saved = loadSaved();
  applyPrefs(saved.prefs);
  if (saved.view === 'table') state.view = 'table';
  setupVoice();

  els.search.addEventListener('submit', (e) => {
    e.preventDefault();
    runSearch();
  });

  els.prefs.addEventListener('submit', (e) => e.preventDefault());
  els.prefs.addEventListener('change', () => {
    save();
    if (state.searched && state.loc) runSearch();
  });

  els.locGps.addEventListener('click', async () => {
    try {
      setStatus('Finding your location…');
      setLocation(await locateByGps());
      setStatus('');
      if (state.searched) runSearch();
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  els.locForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = els.locInput.value.trim();
    if (!text) return;
    try {
      setStatus('Looking up that location…');
      const loc = await geocode(text);
      if (!loc) return setStatus(`Couldn't find "${text}". Try adding a city or state.`, true);
      setLocation(loc);
      setStatus('');
      if (state.searched) runSearch();
    } catch (err) {
      setStatus(err.message || 'Location lookup failed. Please try again.', true);
    }
  });

  document.querySelector('.toggle').addEventListener('click', (e) => {
    const view = e.target.dataset?.view;
    if (!view) return;
    state.view = view;
    save();
    if (state.output) render();
  });

  els.table.addEventListener('click', (e) => {
    const key = e.target.dataset?.sort;
    if (!key) return;
    state.sort = { key, dir: state.sort.key === key ? -state.sort.dir : 1 };
    els.table.innerHTML = tableHtml(state.output.results);
  });
}

init();

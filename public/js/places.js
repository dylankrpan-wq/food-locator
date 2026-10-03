// Nearby places and geocoding from OpenStreetMap (Overpass + Nominatim).
// Both are free, keyless and CORS-enabled, so this runs straight from the browser.

import { normalizeName } from './text.js';

const OVERPASS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const MAX_PLACES = 600;
const REQUEST_TIMEOUT_MS = 20000;

// OSM cuisine values -> the cuisine names used in data/dishes.js.
const CUISINE_MAP = {
  mexican: ['mexican'], 'tex-mex': ['mexican'], burrito: ['mexican'], taco: ['mexican'], latin_american: ['mexican'],
  burger: ['burger'], hamburger: ['burger'],
  american: ['american'], diner: ['american', 'breakfast'], pub: ['american'], regional: ['american'], international: ['american'],
  chicken: ['chicken'], wings: ['chicken'], fried_chicken: ['chicken'],
  sandwich: ['sandwich'], deli: ['sandwich'], sub: ['sandwich'], bagel: ['sandwich', 'breakfast'],
  salad: ['salad'], healthy: ['salad'],
  pizza: ['pizza'], italian: ['italian'], pasta: ['italian'],
  chinese: ['chinese'], dim_sum: ['chinese'], asian: ['chinese'],
  japanese: ['japanese'], sushi: ['japanese'], ramen: ['japanese'],
  noodle: ['chinese', 'japanese', 'vietnamese'],
  thai: ['thai'], vietnamese: ['vietnamese'], pho: ['vietnamese'], korean: ['korean'],
  indian: ['indian'], pakistani: ['indian'], nepalese: ['indian'],
  mediterranean: ['mediterranean'], greek: ['mediterranean'], kebab: ['mediterranean'], middle_eastern: ['mediterranean'],
  lebanese: ['mediterranean'], turkish: ['mediterranean'], falafel: ['mediterranean'],
  barbecue: ['bbq'], bbq: ['bbq'],
  seafood: ['seafood'], fish_and_chips: ['seafood'], fish: ['seafood'],
  steak_house: ['steak'], steak: ['steak'],
  breakfast: ['breakfast'], pancake: ['breakfast'], brunch: ['breakfast'],
  coffee_shop: ['cafe'], coffee: ['cafe'], cafe: ['cafe'], bakery: ['cafe'], tea: ['cafe'],
  donut: ['dessert', 'cafe'], doughnut: ['dessert', 'cafe'], ice_cream: ['dessert'], frozen_yogurt: ['dessert'], dessert: ['dessert'],
  juice: ['juice'], smoothie: ['juice'], bubble_tea: ['juice'],
  poke: ['poke'], hawaiian: ['poke'],
};

// Words in a place's name that hint at a cuisine when OSM has no cuisine tag.
const NAME_HINTS = [
  [/\b(taqueria|tacos?|burritos?|mexican|cantina|tortilla)\b/, 'mexican'],
  [/\b(pizza|pizzeria)\b/, 'pizza'],
  [/\bburgers?\b/, 'burger'],
  [/\b(sushi|ramen|hibachi|teriyaki)\b/, 'japanese'],
  [/\b(china|chinese|wok|szechuan|hunan|dumpling)\b/, 'chinese'],
  [/\bthai\b/, 'thai'],
  [/\b(pho|vietnamese|banh)\b/, 'vietnamese'],
  [/\bkorean\b/, 'korean'],
  [/\b(indian|india|curry|tandoor|tandoori|masala)\b/, 'indian'],
  [/\b(kebab|gyros?|shawarma|mediterranean|falafel|greek)\b/, 'mediterranean'],
  [/\b(deli|subs?|sandwich|sandwiches)\b/, 'sandwich'],
  [/\b(bbq|barbecue|barbeque|smokehouse)\b/, 'bbq'],
  [/\b(wings?|chicken)\b/, 'chicken'],
  [/\b(seafood|fish|crab|oyster|lobster)\b/, 'seafood'],
  [/\bsteak ?house\b/, 'steak'],
  [/\b(diner|grill|grille|tavern)\b/, 'american'],
  [/\b(cafe|coffee|espresso|bakery)\b/, 'cafe'],
  [/\b(bagels?|pancakes?|waffles?|breakfast)\b/, 'breakfast'],
  [/\b(italian|trattoria|ristorante|pasta)\b/, 'italian'],
  [/\b(salads?|greens)\b/, 'salad'],
  [/\bpoke\b/, 'poke'],
  [/\b(ice cream|creamery|gelato|donuts?|froyo)\b/, 'dessert'],
  [/\b(juice|smoothies?)\b/, 'juice'],
];

export function canonicalCuisines(tags) {
  const out = new Set();
  for (const raw of String(tags.cuisine || '').toLowerCase().split(/[;,]/)) {
    for (const c of CUISINE_MAP[raw.trim()] || []) out.add(c);
  }
  // Only guess from the name when OSM's own cuisine tag tells us nothing;
  // otherwise "El Kiche Mexican Grill" would also count as an American grill.
  if (!out.size) {
    const name = normalizeName(tags.name);
    for (const [pattern, cuisine] of NAME_HINTS) if (pattern.test(name)) out.add(cuisine);
  }
  if (!out.size && tags.amenity === 'cafe') out.add('cafe');
  return [...out];
}

export function haversineMiles(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(a));
}

const yes = (v) => v === 'yes' || v === 'only';

export function toPlace(el, lat, lon) {
  const t = el.tags || {};
  const pLat = el.lat ?? el.center?.lat;
  const pLon = el.lon ?? el.center?.lon;
  if (!t.name || pLat == null) return null;
  return {
    id: `${el.type}/${el.id}`,
    name: t.name,
    brand: t.brand || '',
    lat: pLat,
    lon: pLon,
    distanceMi: haversineMiles(lat, lon, pLat, pLon),
    cuisineLabel: String(t.cuisine || '').replace(/_/g, ' ').split(';').filter(Boolean).join(', '),
    cuisines: canonicalCuisines(t),
    hours: t.opening_hours || '',
    phone: t.phone || t['contact:phone'] || '',
    website: t.website || t['contact:website'] || '',
    address: [[t['addr:housenumber'], t['addr:street']].filter(Boolean).join(' '), t['addr:city']]
      .filter(Boolean)
      .join(', '),
    features: [
      yes(t.drive_through) && 'Drive-through',
      yes(t.takeaway) && 'Takeout',
      yes(t.delivery) && 'Delivery',
      yes(t.outdoor_seating) && 'Outdoor seating',
      t.wheelchair === 'yes' && 'Wheelchair accessible',
      yes(t['diet:vegan']) && 'Vegan options',
      yes(t['diet:vegetarian']) && 'Vegetarian options',
      yes(t['diet:gluten_free']) && 'Gluten-free options',
    ].filter(Boolean),
  };
}

export async function fetchNearby(lat, lon, radiusMi) {
  const meters = Math.round(radiusMi * 1609.34);
  const query =
    `[out:json][timeout:25];` +
    `nwr["amenity"~"^(restaurant|fast_food|cafe|food_court)$"](around:${meters},${lat},${lon});` +
    `out center tags ${MAX_PLACES};`;
  // The public servers are shared and often answer 504 or hang when busy, so
  // every attempt is time-boxed and the main server gets a second try.
  for (const url of [OVERPASS[0], ...OVERPASS]) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`Place search returned ${res.status}`);
      const json = await res.json();
      const places = json.elements
        .map((el) => toPlace(el, lat, lon))
        .filter(Boolean)
        .sort((a, b) => a.distanceMi - b.distanceMi);
      // Overpass doesn't return nearest-first, so a full page means some
      // places inside the radius were left out.
      places.truncated = json.elements.length >= MAX_PLACES;
      return places;
    } catch {
      // try the next server
    }
  }
  throw new Error('The OpenStreetMap place search is busy right now. Please try again in a moment.');
}

export async function geocode(text) {
  const url = `${NOMINATIM}?${new URLSearchParams({ format: 'jsonv2', limit: '1', q: text })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Location lookup returned ${res.status}`);
  const [hit] = await res.json();
  if (!hit) return null;
  return { lat: +hit.lat, lon: +hit.lon, label: hit.display_name.split(',').slice(0, 3).join(',') };
}

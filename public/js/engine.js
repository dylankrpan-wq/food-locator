// Ties the pieces together: places + craving + preferences -> ranked options.

import { openStatus } from './hours.js';
import { findOptions, matchChain, parseQuery } from './nutrition.js';
import { passesDiet, scoreOption } from './scoring.js';

const PER_PLACE = 2;
const MAX_RESULTS = 40;

export function search(places, queryText, prefs, now = new Date()) {
  const query = parseQuery(queryText);
  const diets = {
    vegetarian: prefs.vegetarian || query.diets.vegetarian,
    vegan: prefs.vegan || query.diets.vegan,
    glutenFree: prefs.glutenFree || query.diets.glutenFree,
    lowCarb: query.diets.lowCarb,
  };

  const rows = [];
  for (const place of places) {
    if (place.distanceMi > prefs.radiusMi) continue;
    const status = openStatus(place.hours, now);
    if (prefs.openOnly && status.state === 'closed') continue;

    let options = findOptions(place, query).filter((o) => passesDiet(o.item, diets));
    if (!options.length) continue;
    // Only keep this place's closest matches, so "chicken burrito" doesn't
    // also list the steak burrito from the same menu.
    const best = Math.max(...options.map((o) => o.matchFrac));
    options = options.filter((o) => o.matchFrac === best);

    const chainId = matchChain(place)?.id;
    rows.push(
      ...options
        .map((o) => scoreOption({ ...o, place, status, chainId }, prefs))
        .sort((a, b) => b.overall - a.overall)
        .slice(0, PER_PLACE)
    );
  }

  rows.sort((a, b) => b.overall - a.overall);

  // Several branches of one chain serve the same item; keep the best-ranked one.
  const seen = new Set();
  const results = rows.filter((r) => {
    const key = `${r.chainId || r.place.id}|${r.item.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { query, diets, results: results.slice(0, MAX_RESULTS) };
}

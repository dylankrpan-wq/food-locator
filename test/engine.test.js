import assert from 'node:assert/strict';
import { test } from 'node:test';

import { search } from '../public/js/engine.js';
import { openStatus, parseOpeningHours } from '../public/js/hours.js';
import { findOptions, matchChain, parseQuery } from '../public/js/nutrition.js';
import { canonicalCuisines, toPlace } from '../public/js/places.js';
import { healthScore } from '../public/js/scoring.js';

const place = (name, cuisine, distanceMi, extra = {}) => ({
  id: name, name, brand: '', distanceMi, hours: '', features: [],
  cuisines: canonicalCuisines({ name, cuisine }), ...extra,
});
const prefs = { goal: 'balanced', radiusMi: 2 };
// A Wednesday at 12:30 local time.
const noon = new Date(2026, 9, 7, 12, 30);

test('parseQuery strips filler words and finds dish type, cuisine and diet', () => {
  const q = parseQuery("I'm looking for some gluten-free chicken burritos near me");
  assert.deepEqual(q.tokens.sort(), ['burrito', 'chicken']);
  assert.deepEqual(q.heads, ['burrito']);
  assert.equal(q.diets.glutenFree, true);
  assert.deepEqual(parseQuery('healthy mexican food').cuisines, ['mexican']);
  assert.deepEqual(parseQuery('cheeseburgers').tokens.sort(), ['burger', 'cheese']);
});

test('matchChain recognises chains by name or brand', () => {
  assert.equal(matchChain(place("McDonald's", 'burger', 1)).id, 'mcdonalds');
  assert.equal(matchChain(place('Chipotle Mexican Grill', 'mexican', 1)).id, 'chipotle');
  assert.equal(matchChain(place('Store 12', '', 1, { brand: 'Chick-fil-A' })).id, 'chickfila');
  assert.equal(matchChain(place("Rosa's Taqueria", 'mexican', 1)), null);
});

test('findOptions requires the dish type and prefers full matches', () => {
  const q = parseQuery('chicken burrito');
  const chipotle = findOptions(place('Chipotle', 'mexican', 1), q);
  assert.ok(chipotle.some((o) => o.item.name === 'Chicken Burrito' && o.matchFrac === 1));
  assert.ok(chipotle.every((o) => o.item.tokens.has('burrito')));
  assert.equal(findOptions(place("Wendy's", 'burger', 1), q).length, 0);
  // McDonald's only burrito is the Sausage Burrito: offered, but as a partial match.
  assert.deepEqual(findOptions(place("McDonald's", 'burger', 1), q).map((o) => [o.item.name, o.matchFrac]),
    [['Sausage Burrito', 0.5]]);
  assert.equal(findOptions(place("Tony's Pizza", 'pizza', 1), q).length, 0);

  const local = findOptions(place("Rosa's Taqueria", '', 1), q);
  assert.ok(local.length > 0);
  assert.ok(local.every((o) => o.source === 'estimate'));
});

test('search ranks, dedupes chain branches and applies diet filters', () => {
  const places = [
    place('Chipotle', 'mexican', 0.3),
    place('Chipotle', 'mexican', 1.5, { id: 'chipotle-2' }),
    place('Taco Bell', 'mexican', 0.5),
    place("Rosa's Taqueria", 'mexican', 0.4),
    place("Tony's Pizza", 'pizza', 0.1),
  ];
  const { results } = search(places, 'chicken burrito', prefs, noon);
  assert.ok(results.length >= 3);
  assert.ok(results.every((r) => r.item.tokens.has('burrito') && r.item.tokens.has('chicken')));
  for (let i = 1; i < results.length; i++) assert.ok(results[i - 1].overall >= results[i].overall);
  const chipotleBurritos = results.filter((r) => r.chainId === 'chipotle' && r.item.name === 'Chicken Burrito');
  assert.equal(chipotleBurritos.length, 1);
  assert.equal(chipotleBurritos[0].place.id, 'Chipotle');

  const vegan = search(places, 'vegan burrito', prefs, noon).results;
  assert.ok(vegan.every((r) => r.item.vg));

  const limited = search(places, 'chicken burrito', { ...prefs, maxCal: 500 }, noon).results;
  assert.ok(limited[0].item.cal <= 500);
  assert.ok(limited.at(-1).violations.length > 0);
});

test('search honours radius and open-now', () => {
  const places = [
    place('Chipotle', 'mexican', 0.3, { hours: 'Mo-Su 17:00-22:00' }),
    place('Taco Bell', 'mexican', 3),
  ];
  assert.equal(search(places, 'burrito', prefs, noon).results.length, 2);
  assert.equal(search(places, 'burrito', { ...prefs, openOnly: true }, noon).results.length, 0);
});

test('healthScore reflects the goal', () => {
  const grilled = { cal: 130, protein: 25, carbs: 1, fat: 3, sat: 0.5, sodium: 440, fiber: 0, sugar: 1 };
  const burrito = { cal: 980, protein: 58, carbs: 118, fat: 30, sat: 9.5, sodium: 2210, fiber: 13, sugar: 4 };
  assert.ok(healthScore(grilled, 'lose') > healthScore(burrito, 'lose'));
  assert.ok(healthScore(grilled, 'heart') > healthScore(burrito, 'heart'));
  assert.ok(healthScore(grilled, 'lowcarb') > healthScore(burrito, 'lowcarb'));
  for (const goal of ['balanced', 'lose', 'protein', 'heart', 'lowcarb']) {
    const s = healthScore(burrito, goal);
    assert.ok(s >= 0 && s <= 100);
  }
});

test('opening hours parsing and status', () => {
  assert.equal(openStatus('24/7', noon).text, 'Open 24 hours');
  assert.deepEqual(openStatus('Mo-Fr 08:00-20:00; Sa 09:00-17:00; Su off', noon),
    { state: 'open', text: 'Open · closes 8 PM' });
  assert.deepEqual(openStatus('Mo-Su 17:00-22:30', noon), { state: 'closed', text: 'Closed · opens 5 PM' });
  assert.deepEqual(openStatus('Mo,Tu 11:00-14:00; Fr-Su 11:00-21:00', noon),
    { state: 'closed', text: 'Closed · opens Fri 11 AM' });
  assert.equal(openStatus('Mo-Su 11:00-14:00,17:00-22:00', noon).state, 'open');
  // Open past midnight: Tuesday's 18:00-02:00 still covers Wednesday 01:00.
  assert.equal(openStatus('Tu 18:00-02:00', new Date(2026, 9, 7, 1, 0)).state, 'open');
  assert.equal(openStatus('We 10:00-12:00', noon).text, 'Closed · opens Wed 10 AM');
  assert.equal(parseOpeningHours('Mo-Fr 08:00-20:00; PH off')[1].length, 1);
  assert.equal(openStatus('Mo-Th 17:00-22:00, Fr-Su 11:30-22:00', noon).text, 'Closed · opens 5 PM');
  assert.equal(openStatus('sunrise-sunset', noon).state, 'unknown');
  assert.equal(openStatus('', noon).text, 'Hours not listed');
});

test('name hints are ignored when the cuisine tag is known', () => {
  assert.deepEqual(canonicalCuisines({ name: 'El Kiche Mexican Grill', cuisine: 'mexican' }), ['mexican']);
  assert.deepEqual(canonicalCuisines({ name: "Sam's Grill" }), ['american']);
  const wings = parseQuery('chicken wings');
  assert.equal(findOptions(place('El Kiche Mexican Grill', 'mexican', 1), wings).length, 0);
});

test('queries without a dish type must match every word', () => {
  const q = parseQuery('ice cream');
  assert.equal(findOptions(place('Day 6 Coffee Company', 'coffee_shop', 1), q).length, 0);
  assert.equal(findOptions(place('Firehouse Subs', 'sandwich', 1), q).length, 0);
  assert.equal(findOptions(place('Sharetea', 'bubble_tea', 1), q).length, 0);
  assert.deepEqual(findOptions(place('Scoops', 'ice_cream', 1), q).map((o) => o.item.name), ['Ice Cream (2 scoops)']);
  const names = findOptions(place("Sam's Grill", 'american', 1), parseQuery('grilled chicken')).map((o) => o.item.name);
  assert.ok(names.length > 0 && names.every((n) => /Grilled Chicken/.test(n)));
});

test('wing chains use their published menu items', () => {
  const q = parseQuery('chicken wings');
  for (const [name, cuisine, id] of [['Buffalo Wild Wings', 'wings', 'bww'], ['Wingstop', 'chicken', 'wingstop']]) {
    const p = place(name, cuisine, 1);
    assert.equal(matchChain(p).id, id);
    const options = findOptions(p, q);
    assert.ok(options.length >= 6);
    assert.ok(options.every((o) => o.source === 'chain' && o.matchFrac === 1 && o.item.tokens.has('wing')));
  }
  const { results } = search([place('Buffalo Wild Wings', 'wings', 1)], 'chicken wings', prefs, noon);
  assert.equal(results.length, 2);
});

test('toPlace maps OSM tags', () => {
  const p = toPlace({
    type: 'way', id: 7, center: { lat: 40.001, lon: -75 },
    tags: { name: 'Burrito Barn', amenity: 'fast_food', cuisine: 'tex-mex;burger', takeaway: 'yes',
      'addr:housenumber': '12', 'addr:street': 'Main St', 'addr:city': 'Springfield' },
  }, 40, -75);
  assert.deepEqual(p.cuisines.sort(), ['burger', 'mexican']);
  assert.equal(p.address, '12 Main St, Springfield');
  assert.deepEqual(p.features, ['Takeout']);
  assert.ok(p.distanceMi > 0.05 && p.distanceMi < 0.1);
  assert.equal(toPlace({ type: 'node', id: 1, lat: 1, lon: 1, tags: {} }, 1, 1), null);
});

// Turns a free-text craving into a structured query and finds the menu items
// at a place that satisfy it.

import { CHAINS } from './data/chains.js';
import { DISHES } from './data/dishes.js';
import { normalizeName, tokenize } from './text.js';

const STOPWORDS = new Set(tokenize(
  'i im we want wanna need a an the some any looking for with and or of in on at to near me my nearby around here ' +
  'food meal eat eating get find show give good best great nice please would like craving something anything ' +
  'place restaurant option healthy healthier high low protein calorie carb fat light lunch dinner now'
));

// Dish-type words. If the query names one, a menu item must be that kind of
// dish; the remaining words ("chicken", "spicy") only refine the match.
const HEADS = new Set(tokenize(
  'burrito taco bowl quesadilla fajita enchilada nacho burger sandwich wrap salad pizza pasta soup nugget tender ' +
  'wing fries sushi roll ramen pho noodle curry rice omelette pancake bagel muffin donut oatmeal coffee latte ' +
  'smoothie gyro kebab shawarma falafel hummus rib lasagna chili potato croissant toast'
));

const CUISINE_WORDS = {
  mexican: 'mexican', chinese: 'chinese', italian: 'italian', thai: 'thai', indian: 'indian',
  japanese: 'japanese', korean: 'korean', vietnamese: 'vietnamese', greek: 'mediterranean',
  mediterranean: 'mediterranean', american: 'american', bbq: 'bbq', seafood: 'seafood',
  breakfast: 'breakfast', dessert: 'dessert',
};

const DIET_PATTERNS = [
  ['vegan', /\bvegan\b/g],
  ['vegetarian', /\bvegetarian\b/g],
  ['glutenFree', /\bgluten[\s-]?free\b/g],
  ['lowCarb', /\b(keto|low[\s-]?carb)\b/g],
];

const withTokens = (item) => ({ ...item, tokens: new Set(tokenize(`${item.name} ${item.kw}`)) });
const chains = CHAINS.map((c) => ({ ...c, items: c.items.map(withTokens) }));
const dishes = DISHES.map(withTokens);

export function parseQuery(text) {
  let rest = String(text || '').toLowerCase();
  const diets = {};
  for (const [key, pattern] of DIET_PATTERNS) {
    if (pattern.test(rest)) diets[key] = true;
    rest = rest.replace(pattern, ' ');
  }
  const tokens = [];
  const cuisines = [];
  for (const t of new Set(tokenize(rest))) {
    if (STOPWORDS.has(t)) continue;
    if (CUISINE_WORDS[t]) cuisines.push(CUISINE_WORDS[t]);
    else tokens.push(t);
  }
  return { tokens, heads: tokens.filter((t) => HEADS.has(t)), cuisines, diets };
}

export function matchChain(place) {
  const names = [place.brand, place.name].map((n) => ` ${normalizeName(n)} `);
  return chains.find((c) => c.aliases.some((a) => names.some((n) => n.includes(` ${a} `)))) || null;
}

// Returns [{ item, source: 'chain' | 'estimate', matchFrac }] where matchFrac
// is the share of query words the item satisfies (1 = everything asked for).
export function findOptions(place, query) {
  const chain = matchChain(place);
  const placeCuisines = new Set([...place.cuisines, ...(chain?.cuisines || [])]);
  if (query.cuisines.length && !query.cuisines.some((c) => placeCuisines.has(c))) return [];

  let pool = chain ? chain.items : dishes.filter((d) => d.cuisines.some((c) => placeCuisines.has(c)));
  if (!chain && query.cuisines.length) {
    pool = pool.filter((d) => d.cuisines.some((c) => query.cuisines.includes(c)));
  }

  const options = [];
  for (const item of pool) {
    if (!query.heads.every((h) => item.tokens.has(h))) continue;
    const hits = query.tokens.filter((t) => item.tokens.has(t)).length;
    // With a dish type in the query ("chicken burrito") the other words only
    // refine, so a bean burrito is still a fair "closest match". Without one
    // ("ice cream") every word must match, or "cream" alone would pull in a
    // bagel with cream cheese.
    if (hits < (query.heads.length ? 1 : query.tokens.length)) continue;
    options.push({
      item,
      source: chain ? 'chain' : 'estimate',
      matchFrac: query.tokens.length ? hits / query.tokens.length : 1,
    });
  }
  return options;
}

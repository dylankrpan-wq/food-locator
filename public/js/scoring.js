// Rule-based health scoring. Each nutrient is mapped to 0..1 (1 = best) and
// combined with weights that depend on the chosen goal.

export const GOALS = {
  balanced: { label: 'Balanced', w: { cal: 0.25, proteinDensity: 0.2, sodium: 0.15, sat: 0.15, fiber: 0.15, sugar: 0.1 } },
  lose: { label: 'Weight loss', w: { cal: 0.45, proteinDensity: 0.2, fiber: 0.15, sugar: 0.1, sat: 0.1 } },
  protein: { label: 'High protein', w: { protein: 0.4, proteinDensity: 0.35, cal: 0.1, sat: 0.1, sodium: 0.05 } },
  heart: { label: 'Heart healthy', w: { sodium: 0.4, sat: 0.35, fiber: 0.15, cal: 0.1 } },
  lowcarb: { label: 'Low carb', w: { carbs: 0.5, proteinDensity: 0.2, sugar: 0.15, sat: 0.15 } },
};

const LOW_CARB_MAX = 35;

// Linear scale: `good` scores 1, `bad` scores 0, clamped outside that range.
const scale = (x, good, bad) => Math.min(1, Math.max(0, (x - bad) / (good - bad)));

export function subScores(item) {
  return {
    cal: scale(item.cal, 400, 1200),
    protein: scale(item.protein, 45, 5),
    proteinDensity: scale((item.protein / item.cal) * 100, 9, 2),
    sodium: scale(item.sodium, 500, 2300),
    sat: scale(item.sat, 2, 15),
    fiber: scale(item.fiber, 10, 0),
    sugar: scale(item.sugar, 5, 40),
    carbs: scale(item.carbs, 20, 100),
  };
}

export function healthScore(item, goalId) {
  const parts = subScores(item);
  const { w } = GOALS[goalId] || GOALS.balanced;
  return Math.round(Object.entries(w).reduce((sum, [k, weight]) => sum + parts[k] * weight, 0) * 100);
}

export function passesDiet(item, diets) {
  if (diets.vegan && !item.vg) return false;
  if (diets.vegetarian && !item.v) return false;
  if (diets.glutenFree && !item.gf) return false;
  if (diets.lowCarb && item.carbs > LOW_CARB_MAX) return false;
  return true;
}

function limitViolations(item, prefs) {
  const out = [];
  if (prefs.maxCal && item.cal > prefs.maxCal) out.push(`over your ${prefs.maxCal} cal limit`);
  if (prefs.minProtein && item.protein < prefs.minProtein) out.push(`under your ${prefs.minProtein} g protein target`);
  if (prefs.maxSodium && item.sodium > prefs.maxSodium) out.push(`over your ${prefs.maxSodium} mg sodium limit`);
  if (prefs.maxCarbs && item.carbs > prefs.maxCarbs) out.push(`over your ${prefs.maxCarbs} g carb limit`);
  return out;
}

function highlights(item) {
  const pros = [];
  const cons = [];
  if (item.protein >= 30) pros.push(`${item.protein} g protein`);
  if (item.cal <= 500) pros.push(`${item.cal} cal`);
  if (item.sodium <= 600) pros.push('low sodium');
  if (item.sat <= 3) pros.push('low saturated fat');
  if (item.fiber >= 8) pros.push(`${item.fiber} g fiber`);
  if (item.cal >= 900) cons.push(`${item.cal} cal`);
  if (item.sodium >= 1500) cons.push(`high sodium (${item.sodium} mg)`);
  if (item.sat >= 12) cons.push(`high saturated fat (${item.sat} g)`);
  if (item.sugar >= 30) cons.push(`${item.sugar} g sugar`);
  return { pros, cons };
}

// `option` is { item, source, matchFrac, place, status }. `overall` is what
// results are ranked by: the health score minus penalties for a loose match,
// distance, being closed, estimated data and broken personal limits.
export function scoreOption(option, prefs) {
  const { item, place, status, matchFrac, source } = option;
  const health = healthScore(item, prefs.goal);
  const violations = limitViolations(item, prefs);
  const overall =
    health -
    (1 - matchFrac) * 20 -
    Math.min(1, place.distanceMi / prefs.radiusMi) * 10 -
    (status.state === 'closed' ? 15 : 0) -
    (source === 'estimate' ? 2 : 0) -
    violations.length * 20;
  return { ...option, health, overall, violations, ...highlights(item) };
}

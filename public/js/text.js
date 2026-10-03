// Shared text normalisation so queries and menu items tokenize identically.

const SYNONYMS = {
  hamburger: ['burger'],
  cheeseburger: ['burger', 'cheese'],
  sub: ['sandwich'],
  hoagie: ['sandwich'],
  fry: ['frie'],
  mcnugget: ['nugget'],
  finger: ['tender'],
  strip: ['tender'],
  barbecue: ['bbq'],
  vegetable: ['veggie'],
  omelet: ['omelette'],
  doughnut: ['donut'],
};

export function stem(word) {
  if (/(ch|sh|x|o)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
}

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/['’.]/g, '')
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(stem)
    .flatMap((w) => SYNONYMS[w] || [w]);
}

// Lowercase, punctuation-free form used to compare place names to chain names.
export function normalizeName(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ'’.]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

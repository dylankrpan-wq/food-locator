// Parser for the common subset of OpenStreetMap's opening_hours syntax, e.g.
// "Mo-Fr 08:00-20:00; Sa,Su 10:00-02:00; Tu off". Anything it doesn't
// understand yields an "unknown" status and the raw string is shown instead.

const DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY = '(?:mo|tu|we|th|fr|sa|su)';
const RULE = new RegExp(`^(${DAY}(?:\\s*[-,]\\s*${DAY})*)?\\s*:?\\s*(.*)$`);
const TIME = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\+?$/;

function parseDays(part) {
  if (!part) return [0, 1, 2, 3, 4, 5, 6];
  const days = new Set();
  for (const chunk of part.split(',')) {
    const [a, b] = chunk.split('-').map((d) => DAYS.indexOf(d.trim()));
    if (b === undefined) days.add(a);
    else for (let d = a; ; d = (d + 1) % 7) { days.add(d); if (d === b) break; }
  }
  return [...days];
}

// Returns an array of 7 interval lists ([startMin, endMin], end may pass 1440
// when a place stays open after midnight), or null if the string is unsupported.
export function parseOpeningHours(str) {
  if (!str) return null;
  // "Mo-Th 17:00-22:00, Fr-Su 11:30-22:00" separates rules with a comma; a
  // comma between a time and a day name always starts a new rule.
  const s = str.trim().toLowerCase().replace(new RegExp(`(\\d|off|closed)\\s*,\\s*(?=${DAY}\\b)`, 'g'), '$1;');
  const week = Array.from({ length: 7 }, () => []);
  if (s === '24/7') return week.map(() => [[0, 1440]]);

  for (let rule of s.split(';')) {
    rule = rule.trim();
    if (!rule || /^(ph|sh)\b/.test(rule)) continue;
    rule = rule.replace(/\s*,\s*(ph|sh)\b/g, '');
    const m = RULE.exec(rule);
    if (!m) return null;
    const days = parseDays(m[1]);
    const times = m[2].trim();
    let intervals;
    if (times === 'off' || times === 'closed') {
      intervals = [];
    } else {
      intervals = [];
      for (const range of times.split(',')) {
        const t = TIME.exec(range.trim());
        if (!t) return null;
        const start = +t[1] * 60 + +t[2];
        let end = +t[3] * 60 + +t[4];
        if (end <= start) end += 1440;
        intervals.push([start, end]);
      }
    }
    for (const d of days) week[d] = intervals;
  }
  return week;
}

function formatTime(min) {
  min %= 1440;
  const h = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h < 12 ? 'AM' : 'PM';
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${suffix}`;
}

// state is 'open', 'closed' or 'unknown'; text is ready to display.
export function openStatus(str, now = new Date()) {
  const week = parseOpeningHours(str);
  if (!week) return { state: 'unknown', text: str ? `Hours: ${str}` : 'Hours not listed' };
  if (week.every((d) => d.length === 1 && d[0][0] === 0 && d[0][1] === 1440)) {
    return { state: 'open', text: 'Open 24 hours' };
  }

  const day = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  for (const [start, end] of week[day]) {
    if (min >= start && min < end) return { state: 'open', text: `Open · closes ${formatTime(end)}` };
  }
  for (const [, end] of week[(day + 6) % 7]) {
    if (end > 1440 && min < end - 1440) return { state: 'open', text: `Open · closes ${formatTime(end)}` };
  }
  for (let offset = 0; offset <= 7; offset++) {
    const d = (day + offset) % 7;
    const starts = week[d].map(([s]) => s).filter((s) => offset > 0 || s > min);
    if (starts.length) {
      const when = offset === 0 ? '' : offset === 1 ? 'tomorrow ' : DAY_LABELS[d] + ' ';
      return { state: 'closed', text: `Closed · opens ${when}${formatTime(Math.min(...starts))}` };
    }
  }
  return { state: 'closed', text: 'Closed' };
}

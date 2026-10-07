// Every figure shown in the interactive demos comes from this file.
//
// All of it is invented. None of it is a real person's data, and the page says
// so wherever a demo appears. The arithmetic mirrors the rules the app follows:
//   - amounts are whole cents, never floating point;
//   - the margin is income, minus outflows recorded, minus set-asides still to
//     cover, minus recurring outflows still expected;
//   - the four terms always add up to the margin shown;
//   - a comparison covers the same number of days in both periods, and its
//     contributions add up exactly to the difference at every level.
//
// This file has no imports on purpose: it can be run by plain Node for checks.

export type Cents = number;

const sum = (values: Cents[]): Cents => values.reduce((total, value) => total + value, 0);

// ---------------------------------------------------------------------------
// The cycle behind the Today screen and the cycle strip
// ---------------------------------------------------------------------------

export const CYCLE_DAYS = 30;
export const CYCLE_MONTH = 'Sep';
export const INCOME: Cents = 185000;
export const SET_ASIDE: Cents = 10000;
export const DEFAULT_DAY = 18;

export interface Outflow {
  day: number;
  description: string;
  cents: Cents;
  recurring: boolean;
}

const r = (day: number, description: string, cents: Cents): Outflow => ({ day, description, cents, recurring: true });
const v = (day: number, description: string, cents: Cents): Outflow => ({ day, description, cents, recurring: false });

export const OUTFLOWS: readonly Outflow[] = [
  r(1, 'Rent', 48000),
  v(1, 'Supermarket', 6420),
  v(1, 'Coffee', 180),
  v(2, 'Lunch', 1250),
  v(3, 'Coffee', 180),
  v(3, 'Pharmacy', 1650),
  v(4, 'Fuel', 5400),
  v(5, 'Restaurant', 5800),
  v(6, 'Coffee', 180),
  r(6, 'Electricity', 6800),
  v(7, 'Supermarket', 4860),
  v(7, 'Lunch', 1180),
  v(8, 'Cinema', 1400),
  v(9, 'Coffee', 180),
  v(9, 'Supermarket', 3940),
  v(10, 'Lunch', 1220),
  v(10, 'Clothing', 5900),
  v(11, 'Restaurant', 4600),
  v(12, 'Coffee', 180),
  v(12, 'Supermarket', 5575),
  v(13, 'Lunch', 1300),
  v(13, 'Bookshop', 2400),
  v(14, 'Fuel', 4900),
  v(14, 'Coffee', 180),
  v(15, 'Restaurant', 3800),
  r(15, 'Internet', 2990),
  v(16, 'Supermarket', 5206),
  v(17, 'Lunch', 1250),
  v(17, 'Coffee', 180),
  v(18, 'Lunch', 1840),
  v(19, 'Supermarket', 5320),
  v(20, 'Coffee', 180),
  r(20, 'Phone', 1299),
  v(21, 'Restaurant', 4100),
  v(22, 'Lunch', 1210),
  v(23, 'Supermarket', 4780),
  v(24, 'Coffee', 180),
  r(24, 'Gym', 3500),
  v(25, 'Clothing', 4900),
  v(26, 'Lunch', 1260),
  v(27, 'Supermarket', 5650),
  v(28, 'Coffee', 180),
  v(29, 'Fuel', 5100),
  v(30, 'Lunch', 1300),
];

export interface CycleState {
  day: number;
  income: Cents;
  /** Outflows recorded so far, user-added ones included. */
  spent: Cents;
  setAside: Cents;
  /** Recurring outflows still expected and not yet recorded. */
  expected: Cents;
  margin: Cents;
  spentToday: Cents;
  daysLeft: number;
  next: Outflow | null;
  /** Share of the initial margin used, over share of the cycle gone. */
  pace: number | null;
  marginUsedPercent: number;
  cycleGonePercent: number;
}

/** Margin at the start of the cycle: income minus set-asides minus all expected recurring outflows. */
export function initialMargin(): Cents {
  return INCOME - SET_ASIDE - sum(OUTFLOWS.filter((o) => o.recurring).map((o) => o.cents));
}

/**
 * `extra` is what the visitor added on top of the invented history, all of it
 * dated on the current day.
 */
export function cycleState(day: number, extra: Cents = 0): CycleState {
  const recorded = OUTFLOWS.filter((o) => o.day <= day);
  const upcoming = OUTFLOWS.filter((o) => o.recurring && o.day > day);
  const spent = sum(recorded.map((o) => o.cents)) + extra;
  const expected = sum(upcoming.map((o) => o.cents));
  const margin = INCOME - spent - SET_ASIDE - expected;
  const spentToday = sum(OUTFLOWS.filter((o) => o.day === day).map((o) => o.cents)) + extra;
  const next = [...upcoming].sort((a, b) => a.day - b.day)[0] ?? null;

  const m0 = initialMargin();
  const consumed = (m0 - margin) / m0;
  const gone = day / CYCLE_DAYS;
  return {
    day,
    income: INCOME,
    spent,
    setAside: SET_ASIDE,
    expected,
    margin,
    spentToday,
    daysLeft: Math.max(1, CYCLE_DAYS - day + 1),
    next,
    pace: gone > 0 ? consumed / gone : null,
    marginUsedPercent: Math.round(consumed * 100),
    cycleGonePercent: Math.round(gone * 100),
  };
}

export const PACE_THRESHOLD = 1.25;

/** The pace note appears only past the middle of the cycle and above the threshold. */
export function paceNoticeVisible(state: CycleState): boolean {
  return state.day > CYCLE_DAYS / 2 && state.pace !== null && state.pace > PACE_THRESHOLD;
}

// ---------------------------------------------------------------------------
// Comparing two periods over the same number of days
// ---------------------------------------------------------------------------

export const WINDOW_DAYS = 12;
export const PERIOD_DAYS = 30;

export type Period = 'observed' | 'reference';

export interface Entry {
  id: string;
  period: Period;
  day: number;
  description: string;
  category: string;
  cents: Cents;
}

const e = (id: string, period: Period, day: number, description: string, category: string, cents: Cents): Entry => ({
  id,
  period,
  day,
  description,
  category,
  cents,
});

export const ENTRIES: readonly Entry[] = [
  // Previous cycle, first 12 days
  e('r1', 'reference', 1, 'Rent', 'Home and utilities', 48000),
  e('r2', 'reference', 6, 'Electricity', 'Home and utilities', 6140),
  e('r3', 'reference', 3, 'Supermarket', 'Groceries', 3580),
  e('r4', 'reference', 7, 'Supermarket', 'Groceries', 4410),
  e('r5', 'reference', 11, 'Greengrocer', 'Groceries', 4160),
  e('r6', 'reference', 5, 'Fuel', 'Transport', 4600),
  e('r7', 'reference', 9, 'Metro tickets', 'Transport', 900),
  e('r8', 'reference', 8, 'Restaurant', 'Restaurants', 3000),
  e('r9', 'reference', 4, 'Lunch', 'Restaurants', 1250),
  e('r10', 'reference', 9, 'Lunch', 'Restaurants', 1180),
  e('r11', 'reference', 10, 'Pharmacy', 'Health', 3300),
  e('r12', 'reference', 3, 'Streaming', 'Subscriptions', 1099),
  // Current cycle, first 12 days
  e('o1', 'observed', 1, 'Rent', 'Home and utilities', 48000),
  e('o2', 'observed', 6, 'Electricity', 'Home and utilities', 6800),
  e('o3', 'observed', 2, 'Supermarket', 'Groceries', 4120),
  e('o4', 'observed', 6, 'Supermarket', 'Groceries', 2860),
  e('o5', 'observed', 11, 'Greengrocer', 'Groceries', 3940),
  e('o6', 'observed', 5, 'Fuel', 'Transport', 5400),
  e('o7', 'observed', 9, 'Metro tickets', 'Transport', 900),
  e('o8', 'observed', 7, 'Restaurant', 'Restaurants', 3800),
  e('o9', 'observed', 12, 'Restaurant', 'Restaurants', 2750),
  e('o10', 'observed', 3, 'Lunch', 'Restaurants', 1250),
  e('o11', 'observed', 9, 'Lunch', 'Restaurants', 1180),
  e('o12', 'observed', 10, 'Pharmacy', 'Health', 1650),
  e('o13', 'observed', 3, 'Streaming', 'Subscriptions', 1099),
  e('o14', 'observed', 9, 'Shoes', 'Clothing', 4900),
];

export interface Contribution {
  key: string;
  label: string;
  /** Observed minus reference. Positive means outflows went up. */
  cents: Cents;
}

export type Level = { by: 'category' } | { by: 'description'; category: string } | { by: 'entry'; category: string; description: string };

/** Total of the observed period minus total of the reference period. */
export function totals() {
  const observed = sum(ENTRIES.filter((x) => x.period === 'observed').map((x) => x.cents));
  const reference = sum(ENTRIES.filter((x) => x.period === 'reference').map((x) => x.cents));
  return { observed, reference, difference: observed - reference };
}

/**
 * Splits the difference at the given level. Observed amounts count with a plus
 * sign and reference amounts with a minus sign, so at every level the
 * contributions add up to exactly the difference of that level.
 */
export function contributions(level: Level): Contribution[] {
  const scope = ENTRIES.filter((x) => {
    if (level.by === 'category') return true;
    if (x.category !== level.category) return false;
    return level.by === 'description' ? true : x.description === level.description;
  });

  if (level.by === 'entry') {
    return scope
      .map((x) => ({
        key: x.id,
        label: `${x.description}, day ${x.day} (${x.period === 'observed' ? 'this cycle' : 'previous cycle'})`,
        cents: x.period === 'observed' ? x.cents : -x.cents,
      }))
      .sort((a, b) => Math.abs(b.cents) - Math.abs(a.cents) || a.label.localeCompare(b.label));
  }

  const keyOf = (x: Entry) => (level.by === 'category' ? x.category : x.description);
  const map = new Map<string, Cents>();
  for (const x of scope) {
    map.set(keyOf(x), (map.get(keyOf(x)) ?? 0) + (x.period === 'observed' ? x.cents : -x.cents));
  }
  return [...map.entries()]
    .map(([key, cents]) => ({ key, label: key, cents }))
    .sort((a, b) => Math.abs(b.cents) - Math.abs(a.cents) || a.label.localeCompare(b.label));
}

export function levelTotal(level: Level): Cents {
  return sum(contributions(level).map((c) => c.cents));
}

// ---------------------------------------------------------------------------
// Recurring expenses and subscriptions
// ---------------------------------------------------------------------------

export interface Recurrence {
  id: string;
  description: string;
  category: string;
  cadence: string;
  day: number;
  cents: Cents;
  /** Distinct periods in which the pattern was seen, and how many were observed. */
  seen?: { cycles: number; of: number };
}

export const ACTIVE_RECURRENCES: readonly Recurrence[] = [
  { id: 'rent', description: 'Rent', category: 'Home and utilities', cadence: 'monthly', day: 1, cents: 48000 },
  { id: 'electricity', description: 'Electricity', category: 'Home and utilities', cadence: 'monthly', day: 6, cents: 6800 },
  { id: 'internet', description: 'Internet', category: 'Home and utilities', cadence: 'monthly', day: 15, cents: 2990 },
];

export const DETECTED_RECURRENCES: readonly Recurrence[] = [
  { id: 'gym', description: 'Gym', category: 'Personal care', cadence: 'monthly', day: 24, cents: 3500, seen: { cycles: 9, of: 9 } },
  { id: 'streaming', description: 'Streaming', category: 'Subscriptions', cadence: 'monthly', day: 27, cents: 1099, seen: { cycles: 6, of: 6 } },
];

// ---------------------------------------------------------------------------
// Adding a movement
// ---------------------------------------------------------------------------

export interface Suggestion {
  description: string;
  category: string;
  account: string;
  /** The median amount of earlier entries with this description. */
  cents: Cents;
}

/** Already ordered by how often and how recently each description was used. */
export const SUGGESTIONS: readonly Suggestion[] = [
  { description: 'Coffee', category: 'Restaurants', account: 'Card', cents: 180 },
  { description: 'Lunch', category: 'Restaurants', account: 'Card', cents: 1250 },
  { description: 'Supermarket', category: 'Groceries', account: 'Card', cents: 4200 },
  { description: 'Fuel', category: 'Transport', account: 'Card', cents: 4800 },
  { description: 'Pharmacy', category: 'Health', account: 'Cash', cents: 1650 },
];

export function suggest(text: string): Suggestion[] {
  const needle = text.trim().toLowerCase();
  const found = needle === '' ? SUGGESTIONS : SUGGESTIONS.filter((s) => s.description.toLowerCase().includes(needle));
  return found.slice(0, 5);
}

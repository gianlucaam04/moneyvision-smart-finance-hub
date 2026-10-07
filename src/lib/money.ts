// Money is handled as whole cents everywhere on this site, the same rule the
// app follows: no floating point ever enters a calculation, only formatting.

export type Cents = number;

const MINUS = '\u2212'; // U+2212, the sign the app uses for negative amounts.

export function groupThousands(whole: number): string {
  return String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function splitCents(cents: Cents) {
  const abs = Math.abs(cents);
  return {
    negative: cents < 0,
    whole: Math.floor(abs / 100),
    frac: String(abs % 100).padStart(2, '0'),
  };
}

/**
 * "€1,234.56", "−€12.50" and, when `sign` is set, "+€12.50".
 * Hand-rolled on purpose: Intl output can differ between the Node used to
 * pre-render and the browser that hydrates, and a mismatch breaks hydration.
 */
export function formatMoney(cents: Cents, opts: { sign?: boolean } = {}): string {
  const { negative, whole, frac } = splitCents(cents);
  const sign = negative ? MINUS : opts.sign && cents > 0 ? '+' : '';
  return `${sign}€${groupThousands(whole)}.${frac}`;
}

export function sum(values: Cents[]): Cents {
  return values.reduce((total, value) => total + value, 0);
}

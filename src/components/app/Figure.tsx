import { formatMoney, groupThousands, splitCents, type Cents } from '@/lib/money';
import { cn } from '@/lib/utils';

interface FigureProps {
  cents: Cents;
  /** hero: the app's dominant figure. xl: page-level numeral. md: supporting. */
  size?: 'hero' | 'xl' | 'md' | 'sm';
  /** Prefix positive amounts with "+", for differences and contributions. */
  signed?: boolean;
  className?: string;
}

/**
 * A money amount in the app's style: whole part large, decimals at half size
 * in the secondary ink. Screen readers get one plain string instead of the
 * visual pieces.
 */
export function Figure({ cents, size = 'hero', signed = false, className }: FigureProps) {
  const { negative, whole, frac } = splitCents(cents);
  return (
    <span className={cn('mv-figure', `mv-figure--${size}`, className)}>
      <span className="mv-sr">{formatMoney(cents, { sign: signed })}</span>
      <span className="mv-figure-vis" aria-hidden="true">
        {negative && <span className="mv-figure-sign">{'\u2212'}</span>}
        {signed && !negative && cents > 0 && <span className="mv-figure-sign">+</span>}
        <span className="mv-figure-cur">€</span>
        <span className="mv-figure-whole">{groupThousands(whole)}</span>
        <span className="mv-figure-dec">.{frac}</span>
      </span>
    </span>
  );
}

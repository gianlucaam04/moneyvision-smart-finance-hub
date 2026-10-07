import type { CSSProperties } from 'react';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { CycleState } from '@/lib/demoModel';

const ORDER = ['spent', 'committed', 'expected', 'free'] as const;
type SegmentKey = (typeof ORDER)[number];

// The four labels the app prints under the bar.
const LABEL: Record<SegmentKey, string> = {
  spent: 'spent',
  committed: 'committed',
  expected: 'expected',
  free: 'free',
};

interface CapacityBarProps {
  state: CycleState;
  /** Hide the legend only where the surrounding layout already lists the four terms. */
  legend?: boolean;
  className?: string;
}

/**
 * The app's signature component: the income of the cycle drawn as a volume,
 * split into what is spent, committed, expected and still free. Only the last
 * segment is coloured. The order is fixed and the legend is part of the
 * component, because colour must never be the only carrier of meaning.
 */
export function CapacityBar({ state, legend = true, className }: CapacityBarProps) {
  const values: Record<SegmentKey, number> = {
    spent: state.spent,
    committed: state.setAside,
    expected: state.expected,
    free: Math.max(0, state.margin),
  };
  const over = state.margin < 0;
  const summary = ORDER.map((k) => `${LABEL[k]} ${formatMoney(values[k])}`).join(', ');

  return (
    <div className={cn('mv-cap', className)}>
      <div className={cn('mv-capbar', over && 'is-over')} role="img" aria-label={`Income of the cycle, split into: ${summary}`}>
        {ORDER.map((key, i) => (
          <i
            key={key}
            className={cn('mv-seg', `mv-seg--${key}`, values[key] <= 0 && 'is-empty')}
            style={{ flexGrow: values[key], '--i': i } as CSSProperties}
          />
        ))}
      </div>
      {legend && (
        <ul className="mv-legend">
          {ORDER.map((key) => (
            <li key={key}>
              <span className={cn('mv-swatch', `mv-seg--${key}`)} aria-hidden="true" />
              <span className="mv-legend-label">{LABEL[key]}</span>
              <span className="mv-legend-value">{formatMoney(values[key])}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

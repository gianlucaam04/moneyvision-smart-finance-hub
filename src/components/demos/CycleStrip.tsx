import { useId, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { CapacityBar } from '@/components/app/CapacityBar';
import { Figure } from '@/components/app/Figure';
import { CYCLE_DAYS, CYCLE_MONTH, DEFAULT_DAY, cycleState, paceNoticeVisible } from '@/lib/demoModel';
import { formatMoney } from '@/lib/money';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

const DINNER = 4500;

function Term({ label, sign, cents, tone }: { label: string; sign: '' | '+' | '\u2212'; cents: number; tone?: 'total' }) {
  const shown = useAnimatedNumber(cents);
  return (
    <div className={tone === 'total' ? 'mv-term mv-term--total' : 'mv-term'}>
      <dt>{label}</dt>
      <dd>
        {tone === 'total' ? (
          <Figure cents={shown} size="xl" />
        ) : (
          <>
            <span className="mv-term-sign" aria-hidden="true">
              {sign}
            </span>
            <Figure cents={shown} size="md" />
          </>
        )}
      </dd>
    </div>
  );
}

/**
 * The formula of the app, laid out wide: four terms and the margin they leave.
 * Drag through the cycle and the terms move while the equation keeps balancing.
 */
export function CycleStrip() {
  const [day, setDay] = useState(DEFAULT_DAY);
  const [extra, setExtra] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const sliderId = useId();

  const state = cycleState(day, extra);
  const note = justAdded && paceNoticeVisible(state);

  const reset = () => {
    setDay(DEFAULT_DAY);
    setExtra(0);
    setJustAdded(false);
  };

  return (
    <div className="mv-glass mv-strip">
      <div className="mv-strip-head">
        <label className="mv-strip-label" htmlFor={sliderId}>
          Day of the cycle
        </label>
        <output className="mv-strip-day" htmlFor={sliderId}>
          {CYCLE_MONTH} {day} · day {day} of {CYCLE_DAYS}
        </output>
      </div>

      <input
        id={sliderId}
        className="mv-range"
        type="range"
        min={1}
        max={CYCLE_DAYS}
        step={1}
        value={day}
        onChange={(event) => {
          setDay(Number(event.target.value));
          setJustAdded(false);
        }}
        aria-valuetext={`Day ${day} of ${CYCLE_DAYS}. Margin left ${formatMoney(state.margin)}.`}
      />

      <dl className="mv-equation">
        <Term label="income of the cycle" sign="+" cents={state.income} />
        <Term label="outflows recorded" sign={'\u2212'} cents={state.spent} />
        <Term label="set-asides to cover" sign={'\u2212'} cents={state.setAside} />
        <Term label="recurring outflows expected" sign={'\u2212'} cents={state.expected} />
        <Term
          label={state.margin < 0 ? `margin left, over by ${formatMoney(-state.margin)}` : 'margin left'}
          sign=""
          cents={state.margin}
          tone="total"
        />
      </dl>

      <CapacityBar state={state} />

      <div className="mv-strip-actions">
        <button
          type="button"
          className="mv-btn mv-btn--primary mv-btn--sm"
          onClick={() => {
            setExtra((value) => value + DINNER);
            setJustAdded(true);
          }}
        >
          <Plus size={16} strokeWidth={2.8} aria-hidden="true" />
          Add a {formatMoney(DINNER)} dinner
        </button>
        <button type="button" className="mv-btn mv-btn--ghost mv-btn--sm" onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </button>
        <p className="mv-strip-note" role="status" aria-live="polite">
          {note
            ? `${state.marginUsedPercent}% of the margin used with ${state.cycleGonePercent}% of the cycle gone; ${formatMoney(state.margin)} left`
            : ''}
        </p>
      </div>

      <p className="mv-fine">
        Invented numbers, calculated the way the app calculates them. The note above appears only after saving a movement,
        only past the middle of the cycle, and only when the pace is above the threshold. Try the dinner button around day 18.
      </p>
    </div>
  );
}

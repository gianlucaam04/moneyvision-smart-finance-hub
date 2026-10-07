import { useEffect, useRef, useState } from 'react';
import { Check, Plus, RotateCcw, X } from 'lucide-react';
import { Figure } from '@/components/app/Figure';
import { CapacityBar } from '@/components/app/CapacityBar';
import { PhoneFrame, TabBar } from '@/components/app/PhoneFrame';
import { CYCLE_MONTH, DEFAULT_DAY, cycleState } from '@/lib/demoModel';
import { formatMoney } from '@/lib/money';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

const LUNCH = 1250;

/**
 * The Today tab. Tap the figure and the four terms open; add a movement and
 * the margin follows. The confirmation appears only after the state has
 * changed, which is the rule the app itself follows for every write.
 */
export function HeroPhone() {
  const [extra, setExtra] = useState(0);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const state = cycleState(DEFAULT_DAY, extra);
  const margin = useAnimatedNumber(state.margin);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = () => {
    setExtra((value) => value + LUNCH);
    setToast(`Saved: lunch, ${formatMoney(-LUNCH)}`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2600);
  };

  const reset = () => {
    setExtra(0);
    setToast(null);
  };

  const over = state.margin < 0;

  return (
    <div className="mv-demo">
      <PhoneFrame label="Interactive demo of the Today tab, with invented numbers">
        <div className="mv-screen mv-screen--today">
          <div className="mv-card mv-card--hero">
            <button
              type="button"
              className="mv-figure-btn"
              aria-expanded={open}
              aria-controls="hero-breakdown"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="mv-eyebrow">{over ? `over by ${formatMoney(-state.margin)}` : 'left'}</span>
              <Figure cents={margin} size="hero" />
              <span className="mv-sr">. {open ? 'Hide' : 'Show'} the breakdown.</span>
            </button>
            <CapacityBar state={state} />
          </div>

          <div className="mv-card mv-rows">
            <div className="mv-row">
              <span className="mv-row-label">spent today</span>
              <span className="mv-row-value">{formatMoney(state.spentToday)}</span>
            </div>
            <div className="mv-row">
              <span className="mv-row-label">to the next pay, estimated</span>
              <span className="mv-row-value">
                {state.daysLeft} {state.daysLeft === 1 ? 'day' : 'days'}
              </span>
            </div>
            <div className="mv-row">
              <span className="mv-row-label">next outflow expected</span>
              <span className="mv-row-value">
                {state.next ? `${state.next.description}, ${formatMoney(state.next.cents)} on ${CYCLE_MONTH} ${state.next.day}` : '—'}
              </span>
            </div>
          </div>

          <button type="button" className="mv-gradbtn" onClick={add}>
            <Plus size="1.1em" strokeWidth={2.8} aria-hidden="true" />
            Add movement
          </button>

          {open && (
            <div id="hero-breakdown" className="mv-sheet" role="region" aria-label="Breakdown of the margin">
              <div className="mv-sheet-head">
                <span className="mv-eyebrow">breakdown</span>
                <button type="button" className="mv-iconbtn" onClick={() => setOpen(false)} aria-label="Close the breakdown">
                  <X size="1.1em" aria-hidden="true" />
                </button>
              </div>
              <dl className="mv-terms">
                <div>
                  <dt>income of the cycle</dt>
                  <dd>{formatMoney(state.income, { sign: true })}</dd>
                </div>
                <div>
                  <dt>outflows recorded</dt>
                  <dd>{formatMoney(-state.spent)}</dd>
                </div>
                <div>
                  <dt>set-asides to cover</dt>
                  <dd>{formatMoney(-state.setAside)}</dd>
                </div>
                <div>
                  <dt>recurring outflows expected</dt>
                  <dd>{formatMoney(-state.expected)}</dd>
                </div>
                <div className="mv-terms-total">
                  <dt>margin left</dt>
                  <dd>{formatMoney(state.margin)}</dd>
                </div>
              </dl>
              <p className="mv-fine">The four terms add up to the figure, to the cent.</p>
            </div>
          )}

          <div className={`mv-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
            {toast && (
              <>
                <Check size="1.05em" strokeWidth={3} aria-hidden="true" />
                {toast}
              </>
            )}
          </div>

          <TabBar active="today" />
        </div>
      </PhoneFrame>

      <p className="mv-caption">
        Demo with invented numbers. Tap the figure to see where it comes from, or add a movement.
        {extra > 0 && (
          <>
            {' '}
            <button type="button" className="mv-linkbtn" onClick={reset}>
              <RotateCcw size={14} aria-hidden="true" /> Reset
            </button>
          </>
        )}
      </p>
    </div>
  );
}

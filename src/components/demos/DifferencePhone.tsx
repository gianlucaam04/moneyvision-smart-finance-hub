import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Figure } from '@/components/app/Figure';
import { PhoneFrame, TabBar } from '@/components/app/PhoneFrame';
import { WINDOW_DAYS, contributions, levelTotal, totals, type Contribution, type Level } from '@/lib/demoModel';
import { formatMoney } from '@/lib/money';

function levelFor(path: readonly string[]): Level {
  if (path.length === 0) return { by: 'category' };
  if (path.length === 1) return { by: 'description', category: path[0] };
  return { by: 'entry', category: path[0], description: path[1] };
}

/** Bars for each contribution, then one for the sum: the "waterfall" of the app. */
function Cascade({ items, total }: { items: readonly Contribution[]; total: number }) {
  const steps = items.filter((item) => item.cents !== 0);
  let running = 0;
  const bars = steps.map((item) => {
    const from = running;
    running += item.cents;
    return { key: item.key, from, to: running, up: item.cents > 0 };
  });
  bars.push({ key: 'total', from: 0, to: total, up: true });

  const points = bars.flatMap((bar) => [bar.from, bar.to]).concat(0);
  const low = Math.min(...points);
  const high = Math.max(...points);
  const span = Math.max(1, high - low);

  return (
    <div className="mv-cascade" aria-hidden="true">
      {bars.map((bar, index) => {
        const bottom = ((Math.min(bar.from, bar.to) - low) / span) * 100;
        const height = Math.max(2.5, (Math.abs(bar.to - bar.from) / span) * 100);
        const isTotal = bar.key === 'total';
        return (
          <span key={bar.key} className="mv-cascade-col">
            <span
              className={`mv-cascade-bar ${isTotal ? 'is-total' : bar.up ? 'is-up' : 'is-down'}`}
              style={{ bottom: `${bottom}%`, height: `${height}%`, '--i': index } as CSSProperties}
            />
          </span>
        );
      })}
      <span className="mv-cascade-zero" style={{ bottom: `${((0 - low) / span) * 100}%` }} />
    </div>
  );
}

/**
 * The Analysis tab. The same twelve days of two periods are compared, the
 * difference is split into contributions, and every level adds up exactly to
 * the one above it, down to the single movement.
 */
export function DifferencePhone() {
  const [path, setPath] = useState<string[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const level = levelFor(path);
  const items = contributions(level);
  const total = path.length === 0 ? totals().difference : levelTotal(level);
  const drillable = path.length < 2;
  const changed = items.filter((item) => item.cents !== 0);
  const unchanged = items.filter((item) => item.cents === 0);

  // Move focus to the new level so a screen reader announces where it went.
  useEffect(() => {
    if (moved.current) heading.current?.focus();
    moved.current = true;
  }, [path]);

  const title = path.length === 0 ? 'All outflows' : path.join(' › ');
  const label = path.length === 0 ? 'difference in outflows' : 'total of this level';

  return (
    <div className="mv-demo">
      <PhoneFrame label="Interactive demo of the Analysis tab, with invented numbers">
        <div className="mv-screen mv-screen--analysis">
          <div className="mv-card">
            <div className="mv-segmented" aria-hidden="true">
              <span className="is-on">Cycles</span>
              <span>Months</span>
              <span>Years</span>
            </div>
            <h3 className="mv-screen-title" tabIndex={-1} ref={heading}>
              {title}
            </h3>
            <span className="mv-eyebrow">{label}</span>
            <Figure cents={total} size="hero" signed />
            <p className="mv-fine">The comparison uses the same {WINDOW_DAYS} days from the start of each period.</p>
          </div>

          <div className="mv-card mv-card--list">
            <Cascade items={items} total={total} />
            <ul className="mv-list">
              {changed.map((item) => (
                <li key={item.key}>
                  {drillable ? (
                    <button type="button" className="mv-listbtn" onClick={() => setPath([...path, item.label])}>
                      <span className="mv-list-label">{item.label}</span>
                      <span className={`mv-list-value ${item.cents > 0 ? 'is-more' : 'is-less'}`}>
                        {formatMoney(item.cents, { sign: true })}
                      </span>
                      <ChevronRight size="1em" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="mv-listbtn is-static">
                      <span className="mv-list-label">{item.label}</span>
                      <span className={`mv-list-value ${item.cents > 0 ? 'is-more' : 'is-less'}`}>
                        {formatMoney(item.cents, { sign: true })}
                      </span>
                    </div>
                  )}
                </li>
              ))}
              {unchanged.length > 0 && (
                <li className="mv-list-muted">
                  <div className="mv-listbtn is-static">
                    <span className="mv-list-label">unchanged</span>
                    <span className="mv-list-value">{unchanged.map((item) => item.label).join(', ')}</span>
                  </div>
                </li>
              )}
            </ul>
            <p className="mv-check">
              <Check size="1em" strokeWidth={3} aria-hidden="true" />
              sum of the contributions matches the difference shown
            </p>
          </div>

          {path.length > 0 && (
            <button type="button" className="mv-back" onClick={() => setPath(path.slice(0, -1))}>
              <ChevronLeft size="1.1em" aria-hidden="true" />
              Go back
            </button>
          )}

          <TabBar active="analysis" />
        </div>
      </PhoneFrame>
      <p className="mv-caption">Demo with invented numbers. Tap a row to go one level down, from category to description to the single movement.</p>
    </div>
  );
}

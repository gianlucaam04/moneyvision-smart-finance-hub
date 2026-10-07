import { useState } from 'react';
import { Plus, Repeat, RotateCcw, X } from 'lucide-react';
import { PhoneFrame, TabBar } from '@/components/app/PhoneFrame';
import { ACTIVE_RECURRENCES, DETECTED_RECURRENCES, type Recurrence } from '@/lib/demoModel';
import { formatMoney } from '@/lib/money';

function Row({ item, fresh }: { item: Recurrence; fresh?: boolean }) {
  return (
    <li className={`mv-recrow${fresh ? ' is-fresh' : ''}`}>
      <span className="mv-glyph" aria-hidden="true">
        <Repeat size="1.05em" />
      </span>
      <span className="mv-recrow-text">
        <span className="mv-recrow-name">{item.description}</span>
        <span className="mv-recrow-sub">
          {item.cadence}, expected on day {item.day}
        </span>
      </span>
      <span className="mv-recrow-amount">{formatMoney(item.cents)}</span>
    </li>
  );
}

/**
 * Recurring expenses as the app lays them out: confirmed ones first, then the
 * ones the detector has only suggested, drawn with a dashed outline because a
 * suggestion is not yet a fact. Add and Ignore carry equal weight, and an
 * ignored suggestion can be put back.
 */
export function RecurringPhone() {
  const [added, setAdded] = useState<string[]>([]);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [showIgnored, setShowIgnored] = useState(false);

  const detected = DETECTED_RECURRENCES.filter((item) => !added.includes(item.id) && !ignored.includes(item.id));
  const addedItems = DETECTED_RECURRENCES.filter((item) => added.includes(item.id));
  const ignoredItems = DETECTED_RECURRENCES.filter((item) => ignored.includes(item.id));

  const reset = () => {
    setAdded([]);
    setIgnored([]);
    setShowIgnored(false);
  };

  return (
    <div className="mv-demo">
      <PhoneFrame label="Interactive demo of recurring expenses, with invented numbers">
        <div className="mv-screen mv-screen--recurring">
          <div className="mv-screen-scroll">
            <h3 className="mv-screen-title">Recurring expenses</h3>

            <section aria-labelledby="rec-active">
              <h4 id="rec-active" className="mv-eyebrow">
                active
              </h4>
              <ul className="mv-card mv-reclist">
                {ACTIVE_RECURRENCES.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
                {addedItems.map((item) => (
                  <Row key={item.id} item={item} fresh />
                ))}
              </ul>
            </section>

            {detected.length > 0 && (
              <section aria-labelledby="rec-detected">
                <h4 id="rec-detected" className="mv-eyebrow">
                  detected
                </h4>
                <ul className="mv-detectlist">
                  {detected.map((item) => (
                    <li key={item.id} className="mv-detected">
                      <div className="mv-detected-top">
                        <span className="mv-recrow-name">{item.description}</span>
                        <span className="mv-recrow-amount">{formatMoney(item.cents)}</span>
                      </div>
                      <p className="mv-detected-proof">
                        {item.seen?.cycles} cycles out of {item.seen?.of} · median {formatMoney(item.cents)} · expected on day {item.day}
                      </p>
                      <div className="mv-detected-actions">
                        <button type="button" className="mv-pill" onClick={() => setAdded([...added, item.id])}>
                          <Plus size="1em" strokeWidth={2.6} aria-hidden="true" />
                          Add<span className="mv-sr"> {item.description} to the active ones</span>
                        </button>
                        <button type="button" className="mv-pill" onClick={() => setIgnored([...ignored, item.id])}>
                          <X size="1em" strokeWidth={2.6} aria-hidden="true" />
                          Ignore<span className="mv-sr"> {item.description}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {ignoredItems.length > 0 && (
              <section>
                <button
                  type="button"
                  className="mv-ignored"
                  aria-expanded={showIgnored}
                  aria-controls="rec-ignored"
                  onClick={() => setShowIgnored((value) => !value)}
                >
                  Ignored ({ignoredItems.length})
                </button>
                {showIgnored && (
                  <ul id="rec-ignored" className="mv-ignoredlist">
                    {ignoredItems.map((item) => (
                      <li key={item.id}>
                        <span>{item.description}</span>
                        <button type="button" className="mv-linkbtn" onClick={() => setIgnored(ignored.filter((id) => id !== item.id))}>
                          Put it back among the detected ones
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
          <TabBar active="settings" />
        </div>
      </PhoneFrame>
      <p className="mv-caption">
        Demo with invented numbers. Add or ignore a detected expense; an ignored one can be put back.
        {(added.length > 0 || ignored.length > 0) && (
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

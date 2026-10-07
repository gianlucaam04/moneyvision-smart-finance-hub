import { useEffect, useId, useRef, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { Figure } from '@/components/app/Figure';
import { PhoneFrame } from '@/components/app/PhoneFrame';
import { DEFAULT_DAY, cycleState, suggest, type Suggestion } from '@/lib/demoModel';
import { formatMoney, type Cents } from '@/lib/money';
import { useAnimatedNumber } from '@/lib/useAnimatedNumber';

/**
 * Reads "12", "12.5" or "12,50" as whole cents with string arithmetic, so the
 * rule "no floating point in a monetary calculation" holds even at the edge.
 */
function parseAmount(text: string): Cents | null {
  const match = /^(\d{1,6})(?:[.,](\d{0,2}))?$/.exec(text.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return cents > 0 ? cents : null;
}

const toField = (cents: Cents) => `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;

type Status = 'editing' | 'saving' | 'saved';

/**
 * Adding a movement. Typing a description suggests earlier ones and fills
 * category, usual amount and account. Saving takes a moment, and the
 * confirmation appears only once the margin has actually changed.
 */
export function CapturePhone() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState('');
  const [status, setStatus] = useState<Status>('editing');
  const [spent, setSpent] = useState(0);
  const [last, setLast] = useState<{ description: string; cents: Cents } | null>(null);
  const timers = useRef<number[]>([]);
  const ids = { description: useId(), amount: useId() };

  const base = cycleState(DEFAULT_DAY, spent);
  const margin = useAnimatedNumber(base.margin);
  const cents = parseAmount(amount);
  const suggestions = suggest(description);
  const canSave = status === 'editing' && description.trim() !== '' && cents !== null;

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  const pick = (suggestion: Suggestion) => {
    setDescription(suggestion.description);
    setAmount(toField(suggestion.cents));
    setCategory(suggestion.category);
    setAccount(suggestion.account);
  };

  const save = () => {
    if (!canSave || cents === null) return;
    setStatus('saving');
    timers.current.push(
      window.setTimeout(() => {
        setSpent((value) => value + cents);
        setLast({ description: description.trim(), cents });
        setStatus('saved');
        setDescription('');
        setAmount('');
        setCategory('');
        setAccount('');
        timers.current.push(window.setTimeout(() => setStatus('editing'), 2400));
      }, 450),
    );
  };

  const reset = () => {
    setSpent(0);
    setLast(null);
    setStatus('editing');
    setDescription('');
    setAmount('');
    setCategory('');
    setAccount('');
  };

  return (
    <div className="mv-demo">
      <PhoneFrame label="Interactive demo of adding a movement, with invented numbers">
        <div className="mv-screen mv-screen--capture">
          <div className="mv-capture-head">
            <span className="mv-eyebrow">margin left</span>
            <Figure cents={margin} size="sm" />
          </div>

          <form
            className="mv-card mv-form"
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <h3 className="mv-screen-title">Add movement</h3>

            <div className="mv-field">
              <label htmlFor={ids.description}>Description</label>
              <input
                id={ids.description}
                type="text"
                autoComplete="off"
                inputMode="text"
                placeholder="Try “Lu”"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={status !== 'editing'}
              />
            </div>

            <ul className="mv-chips" aria-label="Suggestions from earlier movements">
              {suggestions.map((suggestion) => (
                <li key={suggestion.description}>
                  <button type="button" className="mv-chip" onClick={() => pick(suggestion)} disabled={status !== 'editing'}>
                    {suggestion.description}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mv-field">
              <label htmlFor={ids.amount}>Amount (€)</label>
              <input
                id={ids.amount}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={status !== 'editing'}
                aria-invalid={amount !== '' && cents === null}
              />
            </div>

            <dl className="mv-prefill">
              <div>
                <dt>Category</dt>
                <dd>{category || 'Filled from the suggestion'}</dd>
              </div>
              <div>
                <dt>Account</dt>
                <dd>{account || 'Last one you used'}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>Today</dd>
              </div>
            </dl>

            <button type="submit" className="mv-gradbtn" disabled={!canSave}>
              {status === 'saving' ? 'Saving…' : 'Save'}
            </button>
          </form>

          <div className={`mv-toast${status === 'saved' ? ' is-on' : ''}`} role="status" aria-live="polite">
            {status === 'saved' && last && (
              <>
                <Check size="1.05em" strokeWidth={3} aria-hidden="true" />
                Saved: {last.description}, {formatMoney(-last.cents)}
              </>
            )}
          </div>
        </div>
      </PhoneFrame>
      <p className="mv-caption">
        Demo with invented numbers. Pick a suggestion or type your own, then save.
        {last && (
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

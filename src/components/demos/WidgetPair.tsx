import { Figure } from '@/components/app/Figure';
import { DEFAULT_DAY, cycleState } from '@/lib/demoModel';

/**
 * The two states of the Home Screen widget that matter. When the margin is
 * gone the widget shows a sentence and no number: a negative figure on the
 * Home Screen at every unlock would worry without helping.
 * Texts are the ones the app uses.
 */
export function WidgetPair() {
  const state = cycleState(DEFAULT_DAY);
  return (
    <div className="mv-widgets" role="group" aria-label="The Home Screen widget, in its two states">
      <figure className="mv-widget">
        <div className="mv-widget-body">
          <span className="mv-eyebrow">Margin</span>
          <Figure cents={state.margin} size="md" />
          <span className="mv-widget-sub">{state.daysLeft} days</span>
        </div>
        <figcaption>While there is margin: the figure and the days left. Tap to add a movement.</figcaption>
      </figure>

      <figure className="mv-widget">
        <div className="mv-widget-body mv-widget-body--gone">
          <span className="mv-eyebrow">Margin</span>
          <strong className="mv-widget-title">The margin for this cycle is gone</strong>
          <span className="mv-widget-sub">Put off what can wait until the next pay.</span>
        </div>
        <figcaption>When it is gone: a sentence and one action, never a negative number.</figcaption>
      </figure>
    </div>
  );
}

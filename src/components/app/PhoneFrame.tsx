import type { ReactNode } from 'react';
import { BarChart3, BatteryFull, Gauge, List, Settings, Signal, Target, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneFrameProps {
  /** Announced to screen readers when they reach the demo. */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * A generic phone shape that scales with its container. Everything inside is
 * sized in em, and the em is derived from the width of the wrapper, so the
 * layout is identical at 280px and at 360px.
 */
export function PhoneFrame({ label, children, className }: PhoneFrameProps) {
  return (
    <div className={cn('mv-phone-wrap', className)}>
      <div className="mv-phone" role="group" aria-label={label}>
        <div className="mv-phone-screen">
          <span className="mv-island" aria-hidden="true" />
          <div className="mv-status" aria-hidden="true">
            <span>9:41</span>
            <span className="mv-status-icons">
              <Signal size="0.95em" strokeWidth={2.4} />
              <Wifi size="0.95em" strokeWidth={2.4} />
              <BatteryFull size="1.1em" strokeWidth={2.2} />
            </span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'today', label: 'Today', Icon: Gauge },
  { key: 'movements', label: 'Movements', Icon: List },
  { key: 'analysis', label: 'Analysis', Icon: BarChart3 },
  { key: 'goals', label: 'Goals', Icon: Target },
  { key: 'settings', label: 'Settings', Icon: Settings },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

/** The five tabs of the app. Purely visual: the demos do not navigate. */
export function TabBar({ active }: { active: TabKey }) {
  return (
    <div className="mv-tabbar" aria-hidden="true">
      {TABS.map(({ key, label, Icon }) => (
        <span key={key} className={cn('mv-tab', key === active && 'is-active')}>
          <Icon size="2em" strokeWidth={key === active ? 2.4 : 2} />
          <span>{label}</span>
        </span>
      ))}
    </div>
  );
}

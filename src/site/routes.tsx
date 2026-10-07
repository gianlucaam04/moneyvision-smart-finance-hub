import type { ComponentType } from 'react';
import About from '@/pages/About';
import Changelog from '@/pages/Changelog';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import Privacy from '@/pages/Privacy';
import Support from '@/pages/Support';
import Terms from '@/pages/Terms';

export type PageKind = 'home' | 'about' | 'page';

export interface RouteDef {
  path: string;
  title: string;
  description: string;
  Component: ComponentType;
  kind: PageKind;
  noindex?: boolean;
}

export const routes: readonly RouteDef[] = [
  {
    path: '/',
    title: "MoneyVision: know what's left until your next pay",
    description:
      'MoneyVision is an iPhone app in development. It answers one question: how much can I still spend until the next pay? No account, no bank connection.',
    Component: Home,
    kind: 'home',
  },
  {
    path: '/about',
    title: 'About · MoneyVision',
    description:
      'MoneyVision is an independent project from Italy: a web app used for a year, now rebuilt as a native iPhone app around numbers you can check.',
    Component: About,
    kind: 'about',
  },
  {
    path: '/changelog',
    title: 'Build log · MoneyVision',
    description: "Dated milestones in the making of MoneyVision for iPhone, newest first, written from the project's real history.",
    Component: Changelog,
    kind: 'page',
  },
  {
    path: '/privacy',
    title: 'Privacy · MoneyVision',
    description:
      'How MoneyVision handles data: no cookies or analytics on this site, and an app that keeps your data on your iPhone with no account.',
    Component: Privacy,
    kind: 'page',
  },
  {
    path: '/terms',
    title: 'Terms · MoneyVision',
    description: 'Terms for using the MoneyVision website. The iPhone app is in development and every figure in the demos is invented.',
    Component: Terms,
    kind: 'page',
  },
  {
    path: '/support',
    title: 'Support · MoneyVision',
    description: 'How to reach MoneyVision with a question. The iPhone app is in development and not yet available.',
    Component: Support,
    kind: 'page',
  },
];

export const notFound: RouteDef = {
  path: '/404',
  title: 'Page not found · MoneyVision',
  description: 'The page you asked for does not exist.',
  Component: NotFound,
  kind: 'page',
  noindex: true,
};

/** Matches a browser path to a route, ignoring a trailing slash or ".html". */
export function findRoute(pathname: string): RouteDef {
  const clean = pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  return routes.find((route) => route.path === clean) ?? notFound;
}

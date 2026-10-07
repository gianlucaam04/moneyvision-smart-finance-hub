import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { buildHead } from './site/head';
import { findRoute, notFound, routes } from './site/routes';

/** Renders one page to static HTML plus the tags that belong in its <head>. */
export function render(path: string) {
  const route = findRoute(path);
  const html = renderToString(
    <StrictMode>
      <route.Component />
    </StrictMode>,
  );
  return { html, head: buildHead(route) };
}

/** The pages to write to disk, and the one used for unknown URLs. */
export const pages = routes.map((route) => route.path);
export const notFoundPath = notFound.path;
export { notFound };

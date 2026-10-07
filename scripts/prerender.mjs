// Turns the single-page build into plain HTML files.
//
// Why: a visitor, a link preview or a crawler that does not run JavaScript must
// still read the page. The Vite client build produces dist/index.html with an
// empty <div id="root">. This script renders every route with the server
// bundle (dist-ssr/) and writes the result next to it:
//
//   /          -> dist/index.html
//   /about     -> dist/about.html          (Netlify serves it at /about)
//   unknown    -> dist/404.html
//
// It also writes sitemap.xml and removes dist-ssr/. React then hydrates each
// page in the browser, so the interactive demos work as before.

import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');
const origin = 'https://moneyvision.it';

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const marker of ['<!--app-head-->', '<!--app-html-->']) {
  if (!template.includes(marker)) {
    throw new Error(`dist/index.html has lost the ${marker} marker, so nothing can be injected.`);
  }
}

const entry = (await readdir(ssrDir)).find((file) => /^entry-server\.m?js$/.test(file));
if (!entry) throw new Error('dist-ssr has no entry-server bundle. Run the SSR build first.');
const { render, pages, notFound } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

// The only font file the pages need, preloaded so text does not reflow late.
const assets = await readdir(path.join(dist, 'assets'));
const font = assets.find((file) => /^inter-latin-wght-normal-.+\.woff2$/.test(file));
const preload = font ? `\n    <link rel="preload" href="/assets/${font}" as="font" type="font/woff2" crossorigin />` : '';

function build(routePath) {
  const { html, head } = render(routePath);
  // Function replacers: the HTML may contain "$" sequences that String.replace
  // would otherwise interpret.
  return template.replace('<!--app-head-->', () => head + preload).replace('<!--app-html-->', () => html);
}

const written = [];
for (const routePath of pages) {
  const file = routePath === '/' ? 'index.html' : `${routePath.slice(1)}.html`;
  await writeFile(path.join(dist, file), build(routePath));
  written.push(file);
}
await writeFile(path.join(dist, '404.html'), build(notFound.path));
written.push('404.html');

const today = new Date().toISOString().slice(0, 10);
const urls = pages
  .map((routePath) => `  <url>\n    <loc>${origin}${routePath === '/' ? '/' : routePath}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join('\n');
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
written.push('sitemap.xml');

await rm(ssrDir, { recursive: true, force: true });

// A pre-rendered page that lost its heading or kept a marker is a broken build.
for (const file of written.filter((name) => name.endsWith('.html'))) {
  const html = await readFile(path.join(dist, file), 'utf8');
  if (!/<h1[\s>]/.test(html)) throw new Error(`${file} has no <h1>: pre-rendering produced an empty page.`);
  if (html.includes('<!--app-')) throw new Error(`${file} still contains a template marker.`);
}

console.log(`Pre-rendered ${written.length} files: ${written.join(', ')}`);

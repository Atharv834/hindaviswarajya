import { readFile, writeFile, copyFile } from 'node:fs/promises';

// Keep the exact icons used by the site in one small, local SVG sprite.
const names = [
  'arrow-right', 'arrow-up', 'arrow-up-right', 'arrows-angle-expand',
  'bank', 'book', 'bookshelf', 'diamond', 'envelope',
  'file-earmark-text', 'globe2', 'list', 'stars', 'x-lg',
];

const symbols = await Promise.all(names.map(async name => {
  const svg = await readFile(new URL(`../node_modules/bootstrap-icons/icons/${name}.svg`, import.meta.url), 'utf8');
  const body = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]?.trim();
  if (!body) throw new Error(`Invalid Bootstrap icon: ${name}`);
  return `  <symbol id="${name}" viewBox="0 0 16 16">${body}</symbol>`;
}));

await writeFile(new URL('../public/icons/bootstrap.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">\n${symbols.join('\n')}\n</svg>\n`);
await copyFile(new URL('../node_modules/bootstrap-icons/LICENSE', import.meta.url),
  new URL('../public/icons/BOOTSTRAP-LICENSE.txt', import.meta.url));

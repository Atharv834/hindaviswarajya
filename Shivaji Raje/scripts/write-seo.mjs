import { readFile, writeFile } from 'node:fs/promises';
import manifest from '../src/content/manifest.json' with { type: 'json' };

const origin = 'https://atharv834.github.io/hindaviswarajya/';
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for (const [slug, page] of Object.entries(manifest)) {
  const filename = `${slug}.html`;
  const html = await readFile(`dist/${filename}`, 'utf8');
  const canonical = new URL(filename, origin).href;
  const tags = [
    `<link rel="canonical" href="${escape(canonical)}">`,
    '<meta property="og:type" content="article">',
    `<meta property="og:title" content="${escape(page.title)}">`,
    `<meta property="og:description" content="${escape(page.description)}">`,
    `<meta property="og:url" content="${escape(canonical)}">`,
    `<meta property="og:image" content="${origin}images/hero-raigad-1600.webp">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'WebPage',name:page.title,description:page.description,url:canonical}).replaceAll('<','\\u003c')}</script>`
  ].join('');
  await writeFile(`dist/${filename}`, html.replace('</head>',`${tags}</head>`));
}
const urls = Object.keys(manifest).map(slug=>`  <url><loc>${origin}${slug}.html</loc></url>`).join('\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${origin}sitemap.xml\n`);
console.log(`SEO metadata and sitemap written for ${Object.keys(manifest).length} routes.`);

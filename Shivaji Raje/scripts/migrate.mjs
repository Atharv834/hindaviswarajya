import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import sharp from 'sharp';

// The archived pages are the content source of truth. This migration keeps their
// text and links while removing imperative scripts and presentation-only styles.
const pages = (await fs.readdir('archive')).filter(f => f.endsWith('.html'));
const contentOnly = process.argv.includes('--content-only');
const images = contentOnly ? JSON.parse(await fs.readFile('src/content/images.json','utf8')) : {};
let originalBytes = 0, optimizedBytes = 0;
for (const file of contentOnly ? [] : await fs.readdir('assets/img')) {
  if (!/\.(jpe?g|png)$/i.test(file)) continue;
  const input = path.join('assets/img', file);
  const name = path.parse(file).name;
  try {
    const meta = await sharp(input).metadata();
    const variants = [];
    for (const width of [480, 960, 1600]) {
      const dest = `images/${name}-${width}.webp`;
      const result = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 79, effort: 5 }).toFile(`public/${dest}`);
      variants.push({ src: dest, width: result.width });
      if (width === 1600) optimizedBytes += result.size;
    }
    originalBytes += (await fs.stat(input)).size;
    images[`assets/img/${file}`] = { variants, width: meta.width, height: meta.height };
  } catch (error) { console.warn(`Skipping invalid source image ${file}: ${error.message}`); }
}
// This original file contains a 522 error response, not a photograph.
// Reuse the valid photograph of the same fort already supplied by the site.
images['assets/img/pratapgad-fort.jpg'] = images['assets/img/pratapgad-thumb.jpg'];
await fs.writeFile('src/content/images.json', JSON.stringify(images, null, 2));
const allCSS = (await Promise.all((await fs.readdir('styles')).filter(f=>f.endsWith('.css')).map(f=>fs.readFile(`styles/${f}`, 'utf8')))).join('\n');
const manifest = {};
const attributeNames = { class:'className', tabindex:'tabIndex', viewbox:'viewBox', 'stroke-width':'strokeWidth', 'stroke-linecap':'strokeLinecap', 'stroke-linejoin':'strokeLinejoin', 'fill-rule':'fillRule', 'clip-rule':'clipRule', 'xlink:href':'href', 'xml:space':'xmlSpace' };
for (const file of pages) {
  const html = await fs.readFile(`archive/${file}`, 'utf8');
  const $ = load(html);
  const slug = file.replace('.html','');
  manifest[slug] = { title:$('title').text(), description:$('meta[name="description"]').attr('content') || $('title').text() };
  // Materialize old CSS background artwork into lazy-loadable React images.
  const css = allCSS + $('style').text();
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*url\(['"]?([^'"\)]+)['"]?\)[^{}]*)\}/g)) {
    const selector = match[1].trim();
    const image = match[3].replace(/^\.\.\//, '');
    if (!images[image] || selector.startsWith('@')) continue;
    try { $(selector).each((_,el)=>{ if (!$(el).attr('style')?.includes('url(')) $(el).attr('data-image',image); }); } catch {}
  }
  $('script, style, .site-header, #seal-intro-overlay').remove();
  const hero = slug === 'index' ? $('#hero') : null;
  if (hero) hero.remove();
  const footer = $('.site-footer').first();
  const pageHeading = slug !== 'index' && !$('h1').length ? $('h2').first()[0] : null;
  function convert(node) {
    if (node.type === 'text') return node.data.replace(/\s+/g,' ');
    if (node.type !== 'tag') return null;
    const props = {};
    for (const [key,value] of Object.entries(node.attribs || {})) {
      if (key === 'style' || /^on/.test(key) || key === 'data-image') continue;
      props[attributeNames[key] || key] = value;
    }
    let tag = node.name === 'main' ? 'div' : node.name;
    if (node === pageHeading) tag = 'h1';
    if (props.href?.startsWith('assets/icons/')) props.href = props.href.replace('assets/icons/', 'icons/');
    if (props.href?.startsWith('http')) { props.target = '_blank'; props.rel = 'noreferrer noopener'; }
    if (tag === 'input') { props.defaultValue = props.value; delete props.value; }
    const style = node.attribs?.style || '';
    const bg = style.match(/url\(['"]?([^'"\)]+)['"]?\)/)?.[1] || node.attribs?.['data-image'];
    const children = (node.children || []).map(convert).filter(x=>x !== null);
    if (bg && images[bg]) {
      props.className = `${props.className || ''} artwork`;
      children.unshift({ tag:'img', props:{ src:bg, alt:'', className:'artwork-image' }, children:[] });
    }
    if (props.className?.includes('map-pin')) {
      props.style = Object.fromEntries([...style.matchAll(/(top|bottom|left|right):\s*([^;]+)/g)].map(m=>[m[1],m[2]]));
      tag = 'a'; props.href = `${props['data-fort-id']}.html`;
    }
    if (!children.some(c=>typeof c !== 'string' || c.trim()) && !['img','svg','use','path','circle','line','rect','polygon','input','br','hr'].includes(tag) && !props.className?.includes('image')) return null;
    return { tag, props, children };
  }
  const footerData = convert(footer[0]);
  footer.remove();
  const content = $('body').contents().toArray().map(convert).filter(x=>x !== null && (typeof x !== 'string' || x.trim()));
  await fs.writeFile(`src/content/${slug}.json`, JSON.stringify({ content, footer:footerData },null,2));
  const preload = slug==='index' ? '<link rel="preload" as="image" href="./images/hero-raigad-960.webp" imagesrcset="./images/hero-raigad-480.webp 480w, ./images/hero-raigad-960.webp 960w, ./images/hero-raigad-1600.webp 1600w" imagesizes="(max-width: 760px) 100vw, 48vw" fetchpriority="high">' : '';
  await fs.writeFile(file, `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f5f1e8"><meta name="description" content="${manifest[slug].description.replaceAll('"','&quot;')}"><title>${manifest[slug].title}</title><link rel="icon" href="./favicon.svg" type="image/svg+xml">${preload}</head><body><div id="root"></div><noscript>Please enable JavaScript to explore this React site.</noscript><script type="module" src="/src/main.jsx"></script></body></html>\n`);
}
await fs.writeFile('src/content/manifest.json',JSON.stringify(manifest,null,2));
if (!contentOnly) await fs.writeFile('image-report.json',JSON.stringify({images:Object.keys(images).length-1,originalBytes,optimizedBytes,savingPercent:Math.round((1-optimizedBytes/originalBytes)*100)},null,2));
console.log(`Migrated ${pages.length} pages. ${contentOnly ? 'Reused optimized images.' : `Full-size WebP savings: ${Math.round((1-optimizedBytes/originalBytes)*100)}%.`}`);
const {curateImages}=await import('./curate-images.mjs');
await curateImages();

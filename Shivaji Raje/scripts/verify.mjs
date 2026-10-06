import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { chromium } from '@playwright/test';

const manifest = JSON.parse(await fs.readFile('src/content/manifest.json','utf8'));
const images = JSON.parse(await fs.readFile('src/content/images.json','utf8'));
const normalized = text => text.replace(/\s+/g,'');
function textOf(node){return typeof node==='string'?node:(node.children||[]).map(textOf).join('');}
function walk(node,fn){if(typeof node==='string'||!node)return;fn(node);node.children?.forEach(n=>walk(n,fn));}
for(const slug of Object.keys(manifest)){
  const original = load(await fs.readFile(`archive/${slug}.html`,'utf8'));
  original('script,style,.site-header,#seal-intro-overlay').remove();
  if(slug==='index')original('#hero').remove();
  const data = JSON.parse(await fs.readFile(`src/content/${slug}.json`,'utf8'));
  assert.equal(normalized([...data.content,data.footer].map(textOf).join('')),normalized(original('body').text()),`${slug}: text must be preserved`);
  for(const node of [...data.content,data.footer])walk(node,n=>{
    if(n.tag==='img')assert.ok(images[n.props.src],`${slug}: image must be optimized: ${n.props.src}`);
    const href=n.props.href;
    if(href&&!/^(https?:|#|mailto:|icons\/)/.test(href))assert.ok(manifest[href.split('#')[0].replace('.html','')],`${slug}: invalid internal link ${href}`);
  });
}
console.log('PASS: exact narrative/footer text, optimized image references, and links for all 13 pages.');
if(process.argv.includes('--content-only'))process.exit(0);
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const page=await context.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const base=process.env.TEST_URL||'http://127.0.0.1:5173';
await fs.mkdir('test-results',{recursive:true});
for(const slug of Object.keys(manifest)){
  await page.goto(`${base}/${slug}.html`);
  await page.locator('.site-footer').waitFor();
  assert.ok(await page.locator('main').innerText());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}: desktop overflow`);
  // Trigger lazy images and verify their load, including the lower-page content.
  await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}scrollTo(0,0);});
  await page.waitForFunction(()=>[...document.images].filter(i=>i.getBoundingClientRect().height>0).every(i=>i.complete&&i.naturalWidth>0));
  await page.screenshot({path:`test-results/${slug}-desktop.png`,fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>[...document.images].filter(i=>i.getBoundingClientRect().height>0).every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}: mobile overflow`);
  await page.screenshot({path:`test-results/${slug}-mobile.png`,fullPage:true});
  await page.getByRole('button',{name:'मराठी',exact:true}).click();
  assert.equal(await page.locator('html').getAttribute('lang'),'mr');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${slug}: Marathi overflow`);
  await page.getByRole('button',{name:'EN',exact:true}).click();
  await page.setViewportSize({width:1440,height:1000});
}
await page.goto(`${base}/timeline.html`);
await page.getByRole('button',{name:'1674',exact:true}).click();
assert.equal(await page.locator('.timeline-year-display').textContent(),'1674');
assert.equal(await page.locator('#milestone-1674').getAttribute('data-selected'),'true');
await page.locator('input[type=range]').focus();
await page.keyboard.press('ArrowRight');
assert.equal(await page.locator('.timeline-year-display').textContent(),'1680');
await page.goto(`${base}/galleries.html`);
await page.locator('.map-pin').first().focus();
assert.ok((await page.locator('.fort-card').first().getAttribute('class')).includes('highlighted'));
await page.evaluate(()=>{window.__navigationMarker='same document';});
await page.locator('.map-pin').first().click();
await page.waitForURL('**/fort-raigad.html');
await page.locator('main.page-fort-raigad').waitFor();
assert.equal(await page.evaluate(()=>window.__navigationMarker),'same document','Internal links must change React pages without reloading');
await page.goto(`${base}/index.html`);
await page.locator('#torna').waitFor();
await page.evaluate(()=>document.querySelector('#torna').scrollIntoView({behavior:'instant'}));
const beforeRefresh=await page.evaluate(()=>scrollY);
await page.reload();
await page.locator('#torna').waitFor();
assert.ok(Math.abs(await page.evaluate(()=>scrollY)-beforeRefresh)<10,'Reload must preserve the reading position');
await page.goto(`${base}/index.html#birth`);
await page.locator('#birth').waitFor();
await page.waitForFunction(()=>Math.abs(document.getElementById('birth').getBoundingClientRect().top-110)<10);
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:'Open navigation'}).click();
assert.equal(await page.locator('#main-nav').isVisible(),true);
await page.keyboard.press('Escape');
assert.equal(await page.locator('#main-nav').isVisible(),false);
await page.getByRole('button',{name:'मराठी',exact:true}).click();
await page.reload();
assert.equal(await page.locator('html').getAttribute('lang'),'mr');
await page.getByRole('button',{name:'EN',exact:true}).click();
await page.goto(`${base}/index.html`);
await page.locator('.site-footer').waitFor();
await page.setViewportSize({width:1779,height:900});
const tornaDesktop=await page.evaluate(()=>{
  const image=document.querySelector('#torna .split__image').getBoundingClientRect();
  const panel=document.querySelector('#torna .split__panel').getBoundingClientRect();
  return {imageRight:image.right,panelLeft:panel.left};
});
assert.ok(tornaDesktop.imageRight+20<tornaDesktop.panelLeft,'Torna image must remain inside its desktop column');
await page.setViewportSize({width:1440,height:1000});
await page.locator('.portrait-frame img').evaluate(img=>img.decode());
await page.screenshot({path:'test-results/home-desktop.png'});
await page.setViewportSize({width:390,height:844});
const tornaMobile=await page.evaluate(()=>{
  const image=document.querySelector('#torna .split__image').getBoundingClientRect();
  const panel=document.querySelector('#torna .split__panel').getBoundingClientRect();
  const cards=[...document.querySelectorAll('#torna .info-card')].map(card=>card.getBoundingClientRect());
  return {imageBottom:image.bottom,panelTop:panel.top,cardsStacked:cards[1].top>cards[0].bottom};
});
assert.ok(tornaMobile.imageBottom<tornaMobile.panelTop&&tornaMobile.cardsStacked,'Torna image and cards must stack on mobile');
await page.locator('.portrait-frame img').evaluate(img=>img.decode());
await page.screenshot({path:'test-results/home-mobile.png'});
assert.deepEqual(errors,[],'Browser errors');
await browser.close();
console.log('PASS: all pages desktop/mobile/Marathi, image loading, timeline, map, mobile menu, deep links, language persistence, and no browser errors.');

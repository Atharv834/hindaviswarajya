import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import manifest from '../src/content/manifest.json' with { type: 'json' };

const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const width of [1440,390,360]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/index.html');
  await page.locator('.site-footer').waitFor();
  if(width<900)await page.getByRole('button',{name:'Open navigation'}).click();
  await page.locator('.explore-menu summary').click();
  assert.equal(await page.locator('.explore-menu__links').getByRole('link',{name:'Southern campaign'}).count(),1);
  await page.locator('.explore-menu__links').getByRole('link',{name:'Southern campaign'}).click();
  await page.getByRole('heading',{name:'Reading the Southern Campaign'}).waitFor();
  assert.equal(await page.locator('#main-content').evaluate(el=>el===document.activeElement),true,'route focus');
  await page.locator('.breadcrumbs').getByRole('link',{name:'Home',exact:true}).click();
  await page.getByRole('link',{name:'View timeline'}).click();
  await page.locator('#milestone-1659 .timeline-card__select').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#milestone-1659').getAttribute('data-selected'),'true');
  assert.equal(await page.locator('.timeline-year-display').innerText(),'1659');
  await page.goto('http://127.0.0.1:5173/fort-raigad.html');
  await page.getByRole('heading',{name:'Raigad as a capital'}).waitFor();
  await page.getByText('Evidence & references').click();
  assert.equal(await page.getByText('Maharashtra State Gazetteers').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px overflow`);
  assert.deepEqual(errors,[],`${width}px browser errors`);
  await context.close();
 }
 for(const slug of Object.keys(manifest)){
  const html=await readFile(`dist/${slug}.html`,'utf8');
  assert.ok(html.includes(`<link rel="canonical" href="https://atharv834.github.io/hindaviswarajya/${slug}.html">`),`${slug}: canonical`);
  assert.ok(html.includes('application/ld+json'),`${slug}: structured data`);
 }
 const sitemap=await readFile('dist/sitemap.xml','utf8');
 assert.equal((sitemap.match(/<url>/g)||[]).length,13);
 console.log('PASS: navigation, route focus, timeline keyboard selection, fort evidence, mobile width, metadata and 13-route sitemap.');
} finally {await browser.close();}

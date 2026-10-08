import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import manifest from '../src/content/manifest.json' with { type: 'json' };

const browser=await chromium.launch({channel:'chrome',headless:true});
const violations=[];
try {
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  for(const slug of Object.keys(manifest)){
   const page=await context.newPage();
   await page.goto(`http://127.0.0.1:5173/${slug}.html`);
   await page.locator('.site-footer').waitFor();
   for(const lang of ['en','mr']){
    if(lang==='mr')await page.getByRole('button',{name:'मराठी'}).click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
    for(const violation of result.violations)violations.push({slug,width,lang,id:violation.id,impact:violation.impact,targets:violation.nodes.map(node=>node.target)});
   }
   await page.close();
  }
  await context.close();
 }
 assert.deepEqual(violations,[],`WCAG-tagged axe violations: ${JSON.stringify(violations)}`);
 console.log('PASS: axe WCAG-tagged rules on all 13 routes in English and Marathi at desktop and mobile widths.');
} finally {await browser.close();}

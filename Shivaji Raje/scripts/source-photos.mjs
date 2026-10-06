import fs from 'node:fs/promises';
import { load } from 'cheerio';

const articleMap={ 'Gingee Fort':'jinji', 'Thanjavur Maratha Palace':'thanjavur', 'Raigad Fort':'raigad', 'Pratapgad':'pratapgad', 'Shivneri Fort':'shivneri', 'Sindhudurg Fort':'sindhudurg', 'Panhala Fort':'panhala', 'Sinhagad':'sinhagad', 'Rajgad':'rajgad', 'Torna Fort':'torna', 'Lal Mahal':'lal-mahal', 'Purandar Fort':'purandar', 'Shivrai':'coins', 'Modi script':'modi', 'INS Shivaji':'ins-shivaji', 'Naval Ensign of India':'naval-ensign' };
const headers={'User-Agent':'ShivajiHeritageSite/2.0 (educational local development; image attribution retained)'};
async function json(url){const res=await fetch(url,{headers});if(!res.ok)throw new Error(`${res.status} ${url}`);return res.json();}
await fs.mkdir('assets/curated',{recursive:true});
let credits={};try{credits=JSON.parse(await fs.readFile('assets/curated/photo-credits.json','utf8'));}catch{}
const data=await json('https://en.wikipedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',titles:Object.keys(articleMap).join('|'),prop:'pageimages',piprop:'original',redirects:'1'}));
const aliases={...articleMap,'Rajgad Fort':'rajgad','Indian Naval Ensign':'naval-ensign'};
for(const page of Object.values(data.query.pages)){
 const id=aliases[page.title];
 if(credits[id])continue;
 if(!id||!page.original){console.log('NO IMAGE',page.title);continue;}
 const original=new URL(page.original.source);original.search='';
 const filename=decodeURIComponent(original.pathname.split('/').pop());
 try{
  const meta=await json('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',titles:`File:${filename}`,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'1600'}));
  const info=Object.values(meta.query.pages)[0].imageinfo?.[0];
  if(!info)throw new Error('No Commons metadata');
  const m=info.extmetadata;
  const license=m.LicenseShortName?.value||'';
  if(!/CC|Public domain/i.test(license))throw new Error(`Review license ${license}`);
  const strip=x=>load(x||'').text();
  const url=info.url;
  const res=await fetch(url,{headers});if(!res.ok)throw new Error(`Image ${res.status}`);
  const ext=filename.toLowerCase().endsWith('.svg')?'svg':'jpg';
  const file=`assets/curated/${id}.${ext}`;
  await fs.writeFile(file,Buffer.from(await res.arrayBuffer()));
  credits[id]={file,title:page.title,alt:`${page.title} — ${strip(m.ImageDescription?.value).slice(0,180)}`,author:strip(m.Artist?.value),license,licenseUrl:m.LicenseUrl?.value,source:info.descriptionurl,kind:'photograph',changes:'Resized and converted to WebP; responsive display cropping.'};
  console.log('SAVED',id,license);
 }catch(e){console.log('FAILED',page.title,e.message);}
 await new Promise(r=>setTimeout(r,2000));
}
await fs.writeFile('assets/curated/photo-credits.json',JSON.stringify(credits,null,2));


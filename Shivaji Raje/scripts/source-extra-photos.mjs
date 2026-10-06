import fs from 'node:fs/promises';
import {load} from 'cheerio';
const files={'bhavani-alt':'Aai tuljabhavani.jpg','ins-training':'Training Camp Abhyas-21 at INS Shivaji, Lonavala 01.jpg',coins:'Shivrai Hon 01 (cropped).jpg', 'modi-letter':'Modi Letter, Sawantwadi, 1604 AD.jpg', 'raigad-statue':'Chhatrapati Shivaji Maharaj Statue Raigad.jpg', 'ins-shivaji':'INS Shivaji (indiannavy.nic.in) 01.jpg', 'sindhudurg-walls':'Sindhudurg Fortress.jpg'};
const headers={'User-Agent':'ShivajiHeritageSite/2.0 (educational website; image attribution retained)'};
const query=async params=>{const r=await fetch('https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',format:'json',...params}),{headers});if(!r.ok)throw Error(r.status);return r.json();};
const credits=JSON.parse(await fs.readFile('assets/curated/photo-credits.json','utf8'));
const data=await query({titles:Object.values(files).map(f=>'File:'+f).join('|'),prop:'imageinfo',iiprop:'url|extmetadata'});
const pages=Object.values(data.query.pages);
for(const [id,title] of Object.entries(files)){
 if(credits[id])continue;
 const info=pages.find(p=>p.title==='File:'+title)?.imageinfo?.[0];
 if(!info){console.log('MISSING',id);continue;}
 const m=info.extmetadata,strip=s=>load(s||'').text();
 const license=m.LicenseShortName?.value||'';
 if(!/CC|Public domain|GODL-India/i.test(license)){console.log('REVIEW',id,license);continue;}
 try{const r=await fetch(info.url,{headers});if(!r.ok)throw Error(r.status);
 const file=`assets/curated/${id}.jpg`;await fs.writeFile(file,Buffer.from(await r.arrayBuffer()));
 credits[id]={file,title:strip(m.ImageDescription?.value).split('मराठी')[0].replace(/^English:\s*/,''),alt:strip(m.ImageDescription?.value).slice(0,200),author:strip(m.Artist?.value),source:info.descriptionurl,license,licenseUrl:m.LicenseUrl?.value,kind:'photograph',changes:'Resized and converted to WebP; responsive display cropping. Derivatives retain the source license.'};
 console.log('SAVED',id,license);
 }catch(e){console.log('FAILED',id,e.message);}
 await new Promise(r=>setTimeout(r,2000));
}
await fs.writeFile('assets/curated/photo-credits.json',JSON.stringify(credits,null,2));


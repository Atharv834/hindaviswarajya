import fs from 'node:fs/promises';
import sharp from 'sharp';

// Contextual overrides run after migration; the portrait files are never read or written here.
export async function curateImages(){
 const photos=JSON.parse(await fs.readFile('assets/curated/photo-credits.json','utf8'));
 const titles={'gold-throne':'Gold ceremonial throne — artistic reconstruction','ashtapradhan-council':'Shivaji with the Ashtapradhan council — artistic reconstruction','sahyadri-sunrise':'Dawn over the Sahyadri and Maval valleys',coronation:'The coronation durbar at Raigad, 1674 — artistic reconstruction','maratha-navy':'Maratha coastal fleet — artistic reconstruction','maval-cavalry':'Maval cavalry — artistic reconstruction','maval-arms':'Talwar, dagger and shield — illustrated arms study'};
 const credits={};
 for(const [id,title] of Object.entries(titles))credits[id]={file:`assets/curated/${id}.png`,title,alt:title,kind:'generated',author:'Created with OpenAI built-in ImageGen',changes:'Original illustration; resized to responsive WebP. Historical scenes are interpretations, not documentary photographs.'};
 const photoTitles={coins:'Shivrai gold Hon — exhibition photograph','sindhudurg-walls':'Sea walls of Sindhudurg Fort','raigad-statue':'Statue of Shivaji Maharaj at Raigad','bhavani-alt':'Tulja Bhavani idol, Tuljapur — photograph'};
 for(const [id,c] of Object.entries(photos))if(id!=='modi')credits[id]={...c,title:photoTitles[id]||c.title,alt:photoTitles[id]||c.alt,changes:`${c.changes} Source-license terms apply to the derivative photographs.`};
 await fs.mkdir('public/images',{recursive:true});
 const images=JSON.parse(await fs.readFile('src/content/images.json','utf8'));
 delete images['curated/bhavani'];
 for(const width of [480,960,1600])await fs.rm(`public/images/curated-bhavani-${width}.webp`,{force:true});
 const refs={},sizes={};
 for(const [id,c] of Object.entries(credits)){
  const key=`curated/${id}`;refs[id]=key;
  const meta=await sharp(c.file).metadata();
  const variants=[];let optimizedBytes=0;
  for(const width of [480,960,1600]){
   const dest=`images/curated-${id}-${width}.webp`;
   const r=await sharp(c.file).rotate().resize({width,withoutEnlargement:true}).webp({quality:79,effort:5}).toFile(`public/${dest}`);
   variants.push({src:dest,width:r.width});if(width===1600)optimizedBytes+=r.size;
  }
  sizes[id]={sourceBytes:(await fs.stat(c.file)).size,optimizedBytes};
  images[key]={variants,width:meta.width,height:meta.height};
 }
 const diagram=(id,svg,width,height,title)=>{refs[id]=`curated/${id}`;images[refs[id]]={variants:[480,960,1600].map(w=>({src:`images/curated-${id}.svg`,width:w})),width,height};credits[id]={title,kind:'diagram',author:'Project illustration',changes:'Schematic illustration, not a surveyed plan or original historical artifact.'};return fs.writeFile(`public/images/curated-${id}.svg`,svg);};
 await diagram('fort-map',`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" preserveAspectRatio="none"><defs><pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#a7b3a2" opacity=".3"/></pattern></defs><rect width="800" height="1000" fill="#dde3dc"/><path d="M300 0Q370 140 300 280T285 560Q260 680 350 1000H800V0Z" fill="#f0e9d5" stroke="#b5b29b" stroke-width="3"/><rect width="800" height="1000" fill="url(#grid)"/><g fill="none" stroke="#9f9d78" opacity=".6"><path d="M470 40Q420 170 440 250T450 430T420 610T470 850" stroke-width="25"/><path d="M530 20Q480 230 510 340T505 550T540 820" stroke-width="12"/><path d="M610 80Q550 250 595 410T625 760" stroke-width="8"/></g><g fill="#5c6a60" font-family="Georgia,serif" font-size="18" letter-spacing="4"><text x="75" y="450" transform="rotate(-90 75 450)">ARABIAN SEA</text><text x="420" y="115">SAHYADRI</text></g><g stroke="#ae703e" fill="none" stroke-width="2" stroke-dasharray="6 7"><path d="M450 220L420 370L325 405L345 510L435 640L315 755"/></g><text x="25" y="960" font-family="sans-serif" font-size="13" fill="#556056">SCHEMATIC FORT NETWORK · NOT TO SCALE</text></svg>`,800,1000,'Sahyadri fort network — schematic, not to scale');
 await diagram('torna-plan',`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650" viewBox="0 0 1000 650"><rect width="1000" height="650" fill="#efe7d3"/><g fill="none" stroke="#aaa386" stroke-width="2"><path d="M80 380Q160 220 290 285T530 190T860 245L940 405Q790 525 650 465T370 490T80 380Z"/><path d="M135 380Q200 275 305 325T530 245T820 290L875 392Q740 460 655 410T370 438T135 380Z"/><path d="M190 380Q260 320 360 367T560 290T770 340L810 392Q690 409 650 375T380 390T190 380Z"/></g><path d="M180 378L305 320L420 352L540 280L665 350L800 320L820 375L660 390L550 335L420 395L305 365L210 410Z" fill="#d7c7a4" stroke="#7d6543" stroke-width="5"/><g fill="#7d6543"><circle cx="305" cy="320" r="9"/><circle cx="420" cy="352" r="9"/><circle cx="540" cy="280" r="9"/><circle cx="665" cy="350" r="9"/><circle cx="800" cy="320" r="9"/></g><g font-family="Georgia,serif" fill="#5c503d"><text x="55" y="80" font-size="32">TORNA · PRACHANDAGAD</text><text x="200" y="470" font-size="18">Zunjar Machi</text><text x="475" y="230" font-size="18">Balekilla</text><text x="700" y="450" font-size="18">Budhla Machi</text><text x="55" y="595" font-size="14">INTERPRETIVE RIDGE DIAGRAM · NOT A SURVEYED PLAN</text></g></svg>`,1000,650,'Torna ridge diagram — interpretive illustration');
 const sealLines=['प्रतिपच्चंद्रलेखेव','वर्धिष्णुर्विश्ववंदिता ।','शाहसूनोः शिवस्यैषा','मुद्रा भद्राय राजते ॥'];
 await diagram('rajmudra',`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="#efe7d3"/><path d="M260 80H540L720 260V540L540 720H260L80 540V260Z" fill="#d9b97a" stroke="#91622d" stroke-width="12"/><path d="M270 105H530L695 270V530L530 695H270L105 530V270Z" fill="none" stroke="#91622d" stroke-width="3"/><g text-anchor="middle" font-family="Nirmala UI,serif" font-size="39" fill="#5b3b20">${sealLines.map((s,i)=>`<text x="400" y="310" dy="${i*64}">${s}</text>`).join('')}</g></svg>`,800,800,'Rajmudra Sanskrit inscription — recreated seal');
 const mapping={
  'prologue-raigad-sunset.jpg':'sahyadri-sunrise','maval-valleys.jpg':'sahyadri-sunrise','shivneri-fort.jpg':'shivneri','shivneri-thumb.jpg':'shivneri','torna-fort.jpg':'torna','torna-sketch.jpg':'torna-plan','rajgad-fort.jpg':'rajgad','sinhagad-fort.jpg':'sinhagad','sinhagad-thumb.jpg':'sinhagad','pratapgad-fort.jpg':'pratapgad','pratapgad-thumb.jpg':'pratapgad','lal-mahal.jpg':'lal-mahal','purandar-fort.jpg':'purandar','coronation-seat.jpg':'gold-throne','coronation-seal.jpg':'rajmudra','gold-hon-coin.jpg':'coins','raigad-coronation.jpg':'raigad','raigad-thumb.jpg':'raigad','raigad-unesco.jpg':'raigad','sindhudurg-thumb.jpg':'sindhudurg-walls','panhala-thumb.jpg':'panhala','warship-illustration.jpg':'maratha-navy','warship.jpg':'maratha-navy','ashtapradhan-illustration.jpg':'ashtapradhan-council','shivaji-statue.jpg':'raigad-statue','map-sketch.jpg':'fort-map','hero-raigad.jpg':'raigad'
 };
 const gallery={'Royal Durbar':'ashtapradhan-council','Maval Arms':'maval-arms','Goddess Bhavani':'bhavani-alt','Rajgad Bastion':'rajgad','Naval Ships':'maratha-navy','Cavalry Charge':'maval-cavalry','Sindhudurg Walls':'sindhudurg-walls','Coronation':'coronation'};
 const years={1630:'shivneri',1646:'torna',1659:'pratapgad',1665:'purandar',1674:'coronation',1680:'raigad'};
 const pages=Object.keys(JSON.parse(await fs.readFile('src/content/manifest.json','utf8')));
 const used=new Set();
 for(const slug of pages){
  const data=JSON.parse(await fs.readFile(`src/content/${slug}.json`,'utf8'));let today=0,photo=0,campaign=0;
  function walk(node,override){
   if(typeof node==='string'||!node)return;
   const cls=node.props?.className||'';
   if(cls.includes('legacy-today-card__img'))override=['naval-ensign','raigad','ashtapradhan-council','ins-training'][today++];
   if(cls.includes('legacy-photo__image'))override=['raigad-statue','raigad','modi-letter','coins'][photo++];
   if(cls.includes('timeline-map-img'))override=years[node.props['data-year']];
   if(node.tag==='img'){
    const old=node.props.src.split('/').pop();
    const id=override|| (slug==='galleries'&&gallery[node.props.alt]) || (slug==='campaign'?['jinji','thanjavur'][campaign++]:null) ||(node.props.src.startsWith('curated/')?old:mapping[old]);
    if(!refs[id])throw Error(`Missing image ${id} for ${slug}: ${old}`);
    node.props.src=refs[id];node.props.alt=credits[id].alt||credits[id].title;
    if(['naval-ensign','rajmudra','coins','modi-letter','torna-plan','fort-map'].includes(id))node.props.className=(node.props.className||'')+' image-contain';
    if(id==='coronation'&&old==='coronation-seat.jpg')node.props.style={objectPosition:'50% 35%'};
    used.add(id);
   }
   if(cls==='map-pin'){
    const positions={'fort-shivneri':[22,56],'fort-sinhagad':[37,52],'fort-raigad':[40,40],'fort-pratapgad':[51,43],'fort-panhala':[64,54],'fort-sindhudurg':[75,39]};
    const [top,left]=positions[node.props['data-fort-id']];node.props.style={top:top+'%',left:left+'%'};
   }
   node.children?.forEach(c=>walk(c,override));
  }
  [...data.content,data.footer].forEach(n=>walk(n));
  await fs.writeFile(`src/content/${slug}.json`,JSON.stringify(data,null,2));
 }
 await fs.writeFile('src/content/images.json',JSON.stringify(images,null,2));
 await fs.writeFile('src/content/credits.json',JSON.stringify(Object.fromEntries([...used].map(id=>[id,credits[id]])),null,2));
 const sourceBytes=[...used].reduce((sum,id)=>sum+(sizes[id]?.sourceBytes||0),0);
 const optimizedBytes=[...used].reduce((sum,id)=>sum+(sizes[id]?.optimizedBytes||0),0);
 await fs.writeFile('curated-image-report.json',JSON.stringify({images:used.size,bitmapImages:[...used].filter(id=>sizes[id]).length,sourceBytes,optimizedBytes,savingPercent:Math.round((1-optimizedBytes/sourceBytes)*100)},null,2));
 console.log(`Curated ${used.size} images across ${pages.length} pages; main portrait unchanged.`);
}
if(process.argv[1]?.endsWith('curate-images.mjs'))await curateImages();

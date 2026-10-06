import React, { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useTransition, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import images from './content/images.json';
import manifest from './content/manifest.json';
import './styles.css';
import './motion.css';
import './refinements.css';
import './details.css';
import { useStoryMotion, useTimelineScroll, ReadingProgress, GalleryTile } from './motion';
import credits from './content/credits.json';
import BootstrapIcon from './BootstrapIcon';

const Language = createContext('en');
const Interaction = createContext(null);
const Route = createContext('index');
const years = [1630, 1646, 1659, 1665, 1674, 1680];
const routeSlug = pathname => decodeURIComponent(pathname.split('/').pop() || 'index.html').replace(/\.html$/, '') || 'index';
const initialSlug = routeSlug(location.pathname);
const scrollStorageKey='shivaji-scroll-position';
let initialScrollY=(()=>{
  try{
    const saved=JSON.parse(sessionStorage.getItem(scrollStorageKey)||'null');
    sessionStorage.removeItem(scrollStorageKey);
    return saved?.url===location.pathname+location.search&&Date.now()-saved.time<120000?saved.y:null;
  }catch{return null;}
})();
const loaders = import.meta.glob(['./content/*.json','!./content/images.json','!./content/manifest.json','!./content/credits.json']);
const dataCache = new Map();
const componentCache = new Map();
function loadPage(slug){
  const id=manifest[slug]?slug:'index';
  if(!dataCache.has(id)) dataCache.set(id,loaders[`./content/${id}.json`]().then(module=>module.default));
  return dataCache.get(id);
}
function pageComponent(slug){
  if(!componentCache.has(slug)) componentCache.set(slug,lazy(async()=>{
    const data=await loadPage(slug);
    return {default:()=> <DocumentContent data={data}/>};
  }));
  return componentCache.get(slug);
}
const pageDirectory=location.pathname.slice(0,location.pathname.lastIndexOf('/')+1);
function internalPage(anchor){
  if(!anchor || anchor.hasAttribute('download') || (anchor.target && anchor.target!=='_self')) return null;
  const url=new URL(anchor.href);
  if(url.origin!==location.origin || url.pathname.slice(0,url.pathname.lastIndexOf('/')+1)!==pageDirectory) return null;
  const slug=routeSlug(url.pathname);
  return manifest[slug]?{slug,url}:null;
}
const nav = [['index','The Life','जीवनपट'],['legacy','The Legacy','वारसा'],['galleries','Forts & Gallery','किल्ले व दालन'],['timeline','Timeline','कालपट'],['letters','Quotes & Sources','विचार व साधने']];
function T({en,mr}) { return useContext(Language)==='mr' ? mr : en; }
function Seal({className=''}) { return <svg className={className} aria-hidden="true"><use href="icons/sprite.svg#icon-rajmudra"/></svg>; }

function Picture({src,alt='',className='',priority=false,...rest}) {
  const item = images[src];
  if (!item) return <img src={src} alt={alt} className={className} loading={priority?'eager':'lazy'} {...rest}/>;
  return <img {...rest} src={item.variants[1].src} srcSet={item.variants.map(v=>`${v.src} ${v.width}w`).join(', ')} sizes="(max-width: 760px) 100vw, 48vw" width={item.width} height={item.height} alt={alt} className={className} loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} decoding="async"/>;
}
function Header({lang,setLang}) {
  const slug=useContext(Route);
  const [open,setOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(()=>{
    const close = e=>{if(e.key==='Escape' && open){setOpen(false);menuRef.current?.focus();}};
    document.addEventListener('keydown',close);
    return ()=>document.removeEventListener('keydown',close);
  },[open]);
  return <header className="site-header"><ReadingProgress chapters={slug==='index'?chapters:null} marathi={lang==='mr'}/><a className="brand" href="index.html" aria-label="Shivaji Maharaj home"><Seal/><span><small>CHHATRAPATI</small><strong>Shivaji Maharaj</strong></span></a>
    <button ref={menuRef} className="menu-button" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="main-nav" aria-label={open?'Close navigation':'Open navigation'}>{open?'Close':'Menu'} <BootstrapIcon name={open?'x-lg':'list'}/></button>
    <nav id="main-nav" className={open?'navigation is-open':'navigation'} aria-label="Main navigation">{nav.map(([id,en,mr])=><a key={id} href={`${id}.html`} onClick={()=>setOpen(false)} aria-current={(slug===id || (slug.startsWith('fort-')&&id==='galleries'))?'page':undefined}><T en={en} mr={mr}/></a>)}</nav>
    <div className="language-switch" aria-label="Language"><button onClick={()=>setLang('en')} aria-pressed={lang==='en'}>EN</button><span>/</span><button onClick={()=>setLang('mr')} aria-label="मराठी" aria-pressed={lang==='mr'}>मराठी</button></div>
  </header>;
}
function Hero(){
  return <><section className="hero" id="hero"><div className="hero-copy"><div className="eyebrow"><span/> <T en="THE LIFE · 1630 — 1680" mr="जीवनपट · १६३० — १६८०"/></div><p className="hero-honorific"><T en="Chhatrapati" mr="छत्रपती"/></p><h1><T en={<>Shivaji<br/><em>Maharaj.</em></>} mr={<>शिवाजी<br/><em>महाराज.</em></>}/></h1><div className="hero-rule"/><p className="hero-tagline"><T en="Founder of Hindavi Swarajya" mr="हिंदवी स्वराज्याचे संस्थापक"/></p><p className="hero-description"><T en="A visionary strategist, administrator, and warrior king who forged an independent empire from basalt and blood, establishing self-rule and dignity for his people." mr="सह्याद्रीच्या कुशीतून, शून्यातून स्वराज्य निर्माण करणारे युगपुरुष, कुशल प्रशासक आणि नीतिशास्त्रसंपन्न राजे छत्रपती शिवाजी महाराज यांचा गौरवशाली इतिहास."/></p><div className="hero-actions"><a className="button-primary" href="#prologue"><T en="Explore His Journey" mr="प्रवास अनुभवा"/><span><BootstrapIcon name="arrow-up-right"/></span></a><a className="text-link" href="timeline.html"><T en="View timeline" mr="कालपट पहा"/> <span><BootstrapIcon name="arrow-right"/></span></a></div><div className="hero-footnote"><span>॥ श्री ॥</span><T en="A life of courage. A legacy of self-rule." mr="शौर्याचे जीवन. स्वराज्याचा वारसा."/></div></div>
    <figure className="hero-art"><div className="portrait-frame"><Picture priority src="assets/img/hero-raigad.jpg" alt="Portrait of Chhatrapati Shivaji Maharaj"/><div className="portrait-label"><span>छत्रपती शिवाजी महाराज</span><span>1630 — 1680</span></div></div><figcaption><span><T en="THE FOUNDER OF SWARAJYA" mr="स्वराज्याचे संस्थापक"/></span><span>01 / 06</span></figcaption><div className="portrait-stamp"><Seal/></div></figure></section><ChapterNav/></>;
}
const chapters = [['prologue','The Vision','स्वराज्य'],['birth','Early Life','बालपण'],['torna','The Beginning','सुरुवात'],['building','The Kingdom','राज्यनिर्मिती'],['conflicts','The Conflicts','संघर्ष'],['coronation','The Coronation','राज्याभिषेक']];
function ChapterNav(){return <nav className="chapters" aria-label="Life chapters">{chapters.map(([id,en,mr],i)=><a key={id} href={`#${id}`}><small>0{i+1}</small><T en={en} mr={mr}/><span><BootstrapIcon name="arrow-up-right"/></span></a>)}</nav>;}

// Content is rendered as native React elements, never injected HTML. Keeping the
// source text separate lets all thirteen pages share the same accessible UI.
function Content({node}) {
  const state = useContext(Interaction);
  if (typeof node==='string') return node;
  if (!node) return null;
  let { tag,props: original={},children=[] } = node;
  const props = {...original};
  const cls = props.className || '';
  if (tag==='img') return <Picture {...props}/>;
  if (cls==='gallery-tile') return <GalleryTile label={children.find(c=>c?.tag==='img')?.props?.alt||'Gallery image'}>{children.map((child,i)=><Content key={i} node={child}/>)}</GalleryTile>;
  if (cls==='seal-interactive') return <RoyalSeal/>;
  if (cls.includes('timeline-map-img') && Number(props['data-year'])!==state.year) return null;
  if (cls.includes('timeline-year-display')) return <div {...props} aria-live="polite">{state.year}</div>;
  if (cls==='timeline-year') {
    const value=Number(children.join('').trim());
    return <button className={`timeline-year ${value===state.year?'active':''}`} aria-pressed={value===state.year} onClick={()=>state.selectYear(value)}>{value}</button>;
  }
  if (tag==='input' && props.type==='range') {
    delete props.defaultValue;
    props.value=state.year;
    props.onChange=e=>state.selectYear(years.reduce((best,y)=>Math.abs(y-Number(e.target.value))<Math.abs(best-Number(e.target.value))?y:best));
    // Step through milestone indices so arrow keys always move to a new event.
    props.min=0; props.max=years.length-1; props.value=years.indexOf(state.year);
    props.onChange=e=>state.selectYear(years[Number(e.target.value)]);
    props['aria-valuetext']=String(state.year);
  }
  if (cls.includes('milestone-card')) {
    const value=Number(props.id?.split('-')[1]);
    props.className=`${cls.replace(/\bactive\b/g,'')} ${value===state.year?'active':''}`;
    props['data-selected']=value===state.year;
    // Every milestone remains readable, and selecting one updates the artwork.
    props.onClick=()=>state.selectYear(value);
  }
  if (props['data-fort-id']) {
    const id=props['data-fort-id'];
    props.onMouseEnter=()=>state.setFort(id); props.onMouseLeave=()=>state.setFort(null);
    props.onFocus=()=>state.setFort(id); props.onBlur=()=>state.setFort(null);
    props.className=cls+(state.fort===id?' highlighted':'');
  }
  const renderedChildren=children.map((child,i)=><Content key={i} node={child}/>);
  if (tag==='a' && /\b(btn-outline|timeline-card__link)\b/.test(cls)) renderedChildren.push(<BootstrapIcon key="link-icon" name="arrow-up-right"/>);
  return React.createElement(tag,props,...renderedChildren);
}
function RoyalSeal(){
  const [pressed,setPressed]=useState(false);
  return <button className={`royal-seal-button ${pressed?'pressed':''}`} aria-label="Press the Rajmudra" onClick={()=>setPressed(true)} onAnimationEnd={()=>setPressed(false)}><Seal className="seal-interactive"/></button>;
}
function DocumentContent({data}){
  const slug=useContext(Route);
  useStoryMotion(data);
  const state=useContext(Interaction);
  useTimelineScroll(slug==='timeline',state.setYear,state.manualYearUntil);
  useLayoutEffect(()=>{
    if(location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant',block:'start'});
    else if(slug===initialSlug&&initialScrollY!==null){
      scrollTo({top:initialScrollY,behavior:'instant'});
      initialScrollY=null;
    }
  },[]);
  return <>{data.content.map((node,i)=><Content key={i} node={node}/>)}<nav className="explore-next" aria-label="Continue exploring"><span className="eyebrow"><T en="THE STORY CONTINUES" mr="पुढील प्रवास"/></span><a href={slug==='legacy'?'galleries.html':'legacy.html'}><T en={slug==='legacy'?'Forts of Swarajya':'Discover the legacy'} mr={slug==='legacy'?'स्वराज्याचे किल्ले':'वारसा अनुभवा'}/><span><BootstrapIcon name="arrow-up-right"/></span></a></nav><Content node={data.footer}/><MediaCredits/></>;
}
function MediaCredits(){return <details className="media-credits"><summary><T en="About the imagery & image credits" mr="चित्रांविषयी आणि छायाचित्रांचे श्रेय"/></summary><p><T en="Historic scenes are artistic reconstructions. Fort photographs are credited to their photographers below. The original main portrait is preserved." mr="ऐतिहासिक प्रसंगांची चित्रे कलात्मक पुनर्निर्मिती आहेत. किल्ल्यांच्या छायाचित्रांचे श्रेय खाली दिले आहे. मुख्य चित्र मूळ स्वरूपात जपले आहे."/></p><div className="credits-grid">{Object.entries(credits).map(([id,c])=><div key={id}><span className="media-kind">{c.kind==='generated'?'AI-created illustration':c.kind==='diagram'?'Schematic illustration':'Source photograph / artwork'}</span><p><strong>{c.title}</strong></p><p>{c.author}</p>{c.source&&<a href={c.source} target="_blank" rel="noreferrer">Source</a>}{c.license&&<p>{c.licenseUrl?<a href={c.licenseUrl} target="_blank" rel="noreferrer">{c.license}</a>:c.license}</p>}<p>{c.changes}</p></div>)}</div></details>;}
class ErrorBoundary extends React.Component {
  state={error:false};
  static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<div className="error-page"><h1>This page could not load.</h1><p>Please check your connection and try again.</p><button onClick={()=>location.reload()}>Try again</button></div>:this.props.children;}
}
function App(){
  const [slug,setSlug]=useState(initialSlug);
  const [,startTransition]=useTransition();
  const navigation=useRef(0);
  const scrollTarget=useRef(null);
  const [lang,setLang]=useState(()=>{try{return localStorage.getItem('maratha-lang')==='mr'?'mr':'en';}catch{return 'en';}});
  const [year,setYear]=useState(1630);
  const manualYearUntil=useRef(0);
  const selectYear=value=>{manualYearUntil.current=performance.now()+700;setYear(value);};
  const [fort,setFort]=useState(null);
  useEffect(()=>{document.documentElement.lang=lang;document.documentElement.classList.toggle('lang-mr',lang==='mr');try{localStorage.setItem('maratha-lang',lang);}catch{}},[lang]);
  useEffect(()=>{if(manifest[slug])document.title=manifest[slug].title;},[slug]);
  useEffect(()=>{
    const previous=history.scrollRestoration;
    history.scrollRestoration='manual';
    const save=()=>{
      try{sessionStorage.setItem(scrollStorageKey,JSON.stringify({url:location.pathname+location.search,y:scrollY,time:Date.now()}));}catch{}
      history.scrollRestoration=previous;
    };
    addEventListener('pagehide',save);
    return ()=>{removeEventListener('pagehide',save);history.scrollRestoration=previous;};
  },[]);
  useLayoutEffect(()=>{
    const target=scrollTarget.current;
    if(!target||target.slug!==slug)return;
    scrollTarget.current=null;
    if(target.hash){
      const element=document.getElementById(decodeURIComponent(target.hash.slice(1)));
      if(element)element.scrollIntoView({behavior:'instant',block:'start'});
      else scrollTo({top:0,behavior:'instant'});
    }else scrollTo({top:target.y||0,behavior:'instant'});
    document.documentElement.classList.remove('route-pending');
  },[slug]);
  useEffect(()=>{
    const navigate=(next,url,fromHistory=false,restoreY=0)=>{
      const token=++navigation.current;
      document.documentElement.classList.add('route-pending');
      loadPage(next).then(()=>{
        if(token!==navigation.current)return;
        if(!fromHistory){
          history.replaceState({...history.state,scrollY},'',location.href);
          history.pushState({scrollY:0},'',url.pathname+url.search+url.hash);
        }
        scrollTarget.current={slug:next,hash:url.hash,y:restoreY};
        startTransition(()=>setSlug(next));
      }).catch(()=>{location.assign(url.href);});
    };
    const onClick=event=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const anchor=event.target.closest?.('a[href]');
      const route=internalPage(anchor);
      if(!route)return;
      if(route.slug===slug){
        navigation.current++;
        document.documentElement.classList.remove('route-pending');
        if(route.url.pathname===location.pathname&&route.url.hash)return;
        event.preventDefault();
        history.replaceState({...history.state,scrollY},'',location.href);
        history.pushState({scrollY:0},'',route.url.pathname+route.url.search+route.url.hash);
        if(route.url.hash)document.getElementById(decodeURIComponent(route.url.hash.slice(1)))?.scrollIntoView();
        else scrollTo({top:0,behavior:'instant'});
        return;
      }
      event.preventDefault();
      navigate(route.slug,route.url);
    };
    const prefetch=event=>{
      const route=internalPage(event.target.closest?.('a[href]'));
      if(route&&route.slug!==slug)loadPage(route.slug).catch(()=>{});
    };
    const onPopState=()=>{
      const next=routeSlug(location.pathname);
      if(!manifest[next]){location.reload();return;}
      const y=history.state?.scrollY||0;
      if(next===slug){
        navigation.current++;
        document.documentElement.classList.remove('route-pending');
        if(location.hash)document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({behavior:'instant'});
        else scrollTo({top:y,behavior:'instant'});
      }else navigate(next,new URL(location.href),true,y);
    };
    document.addEventListener('click',onClick);
    document.addEventListener('pointerover',prefetch,{passive:true});
    document.addEventListener('focusin',prefetch);
    addEventListener('popstate',onPopState);
    return ()=>{
      document.removeEventListener('click',onClick);
      document.removeEventListener('pointerover',prefetch);
      document.removeEventListener('focusin',prefetch);
      removeEventListener('popstate',onPopState);
    };
  },[slug,startTransition]);
  const pageExists=Boolean(manifest[slug]);
  const Page=pageComponent(slug);
  return <Route.Provider value={slug}><Language.Provider value={lang}><Interaction.Provider value={{year,setYear,selectYear,manualYearUntil,fort,setFort}}><a href="#main-content" className="skip-link"><T en="Skip to content" mr="मुख्य मजकुराकडे जा"/></a><Header lang={lang} setLang={setLang}/><main id="main-content" className={`page page-${slug}`} tabIndex={-1}>{!pageExists?<section className="error-page"><h1>Page not found</h1><a href="index.html">Return to The Life <BootstrapIcon name="arrow-right"/></a></section>:<>{slug==='index'&&<Hero/>}<ErrorBoundary><Suspense fallback={<div className="loading" role="status"><T en="Opening the archives…" mr="माहिती उघडत आहे…"/></div>}><Page/></Suspense></ErrorBoundary></>}</main><a href="#main-content" className="back-top" aria-label="Back to top"><BootstrapIcon name="arrow-up"/></a></Interaction.Provider></Language.Provider></Route.Provider>;
}
createRoot(document.getElementById('root')).render(<App/>);

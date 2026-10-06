import { useEffect, useRef, useState } from 'react';
import BootstrapIcon from './BootstrapIcon';

const ease = 'cubic-bezier(.16,1,.3,1)';

/** One observer for the page: nothing is hidden while JS or images are loading. */
export function useStoryMotion(dependency) {
  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const active = new Set();
    let observer;
    function setup() {
      observer?.disconnect();
      active.forEach(a=>a.cancel()); active.clear();
      document.documentElement.classList.toggle('motion-enabled', !preference.matches);
      if (preference.matches || !('IntersectionObserver' in window)) return;
      const targets = document.querySelectorAll('.split__image, .band__image, .ashtapradhan-image__frame, .navy-ship-img, .legacy-photo, .gallery-tile, .fort-card, .quote-card, .commander-card, .strategy-card, .economy-card, .impact-stat, .honeycomb__node, .legacy-today-card, .split__panel, .band__panel, .timeline-header, .quotes-header, .sources-header, .legacy-hero__content, .commanders-hero, .ashtapradhan-intro, .military-intro, .navy-content, .tolerance-text, .culture-quote-box, .explore-next, .footer-main');
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const el = entry.target;
          el.dataset.revealed = 'true';
          const image = el.matches('.split__image,.band__image,.ashtapradhan-image__frame,.navy-ship-img');
          const frames = image
            ? [{opacity:.65,transform:'translateY(16px) scale(.99)'},{opacity:1,transform:'translateY(0) scale(1)'}]
            : [{opacity:.75,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}];
          const animation=el.animate(frames,{duration:image?720:560,delay:Number(el.dataset.stagger||0),easing:ease,fill:'backwards'});
          active.add(animation);animation.finished.then(()=>active.delete(animation)).catch(()=>{});
        }
      },{threshold:.12,rootMargin:'0px 0px -25px 0px'});
      targets.forEach((el,i)=>{
        const rect=el.getBoundingClientRect();
        if(rect.top<innerHeight*.85&&rect.bottom>0){el.dataset.revealed='true';return;}
        el.dataset.stagger=el.matches('[class*=card],.impact-stat,.honeycomb__node,.gallery-tile')?String((i%3)*55):'0';
        observer.observe(el);
      });
    }
    setup(); preference.addEventListener('change',setup);
    return ()=>{observer?.disconnect();active.forEach(a=>a.cancel());preference.removeEventListener('change',setup);};
  },[dependency]);
}

/** Advance the timeline when readers scroll through its six milestones. */
export function useTimelineScroll(enabled,setYear,manualUntil){
  useEffect(()=>{
    if(!enabled)return;
    const cards=[...document.querySelectorAll('.timeline-card[data-selected]')];
    if(cards.length!==6)return;
    let frame=0;
    const update=()=>{
      frame=0;
      if(performance.now()<manualUntil.current)return;
      const readingLine=innerHeight*.58;
      let current=1630;
      for(const card of cards){
        if(card.getBoundingClientRect().top<=readingLine)current=Number(card.id.split('-')[1]);
      }
      setYear(previous=>previous===current?previous:current);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const unlock=()=>{manualUntil.current=0;};
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule);
    addEventListener('wheel',unlock,{passive:true});
    addEventListener('touchmove',unlock,{passive:true});
    schedule();
    return()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);removeEventListener('wheel',unlock);removeEventListener('touchmove',unlock);cancelAnimationFrame(frame);};
  },[enabled,setYear,manualUntil]);
}

export function ReadingProgress({chapters,marathi=false}) {
  const ref=useRef(null);
  const [current,setCurrent]=useState(-1);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    let frame=0;
    const update=()=>{
      frame=0;
      const max=document.documentElement.scrollHeight-innerHeight;
      ref.current?.style.setProperty('--read-progress',String(max>0?scrollY/max:0));
      setVisible(scrollY>550);
      if(chapters?.length){
        let found=-1;
        chapters.forEach(([id],i)=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.45)found=i;});
        setCurrent(found);
      }
    };
    const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);update();
    return ()=>{removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};
  },[chapters]);
  useEffect(()=>{
    document.querySelectorAll('.chapters a').forEach((a,i)=>{
      if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
    });
  },[current]);
  const chapter=chapters?.[current];
  return <><div ref={ref} className="reading-progress" aria-hidden="true"/>{chapter&&<a href={`#${chapter[0]}`} className={`reading-chapter ${visible?'is-visible':''}`}><span className="chapter-orbit" aria-hidden="true"/><small>{String(current+1).padStart(2,'0')} / 06</small><span>{chapter[marathi?2:1]}</span></a>}</>;
}

export function GalleryTile({children,label}){
  const dialog=useRef(null);
  const opener=useRef(null);
  const [selected,setSelected]=useState(null);
  useEffect(()=>{
    if(selected){dialog.current?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=previous;};}
  },[selected]);
  const close=()=>{dialog.current?.close();setSelected(null);requestAnimationFrame(()=>opener.current?.focus());};
  return <><div className="gallery-tile"><button ref={opener} className="gallery-open" aria-label={`Enlarge ${label}`} onClick={e=>{const img=e.currentTarget.querySelector('img');const full=img.srcset?.split(',').at(-1).trim().split(/\s+/)[0];setSelected({src:full||img.currentSrc,alt:label});}}>{children}<span className="gallery-zoom" aria-hidden="true"><BootstrapIcon name="arrows-angle-expand"/></span></button></div>{selected&&<dialog className="image-dialog" ref={dialog} onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget)close();}}><button className="dialog-close" onClick={close} aria-label="Close image"><BootstrapIcon name="x-lg"/></button><img src={selected.src} alt={selected.alt}/><p>{selected.alt}</p></dialog>}</>;
}

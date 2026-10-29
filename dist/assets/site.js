// Motion is progressive: all content remains visible without JavaScript.
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const activeAnimations=new Set();
const canAnimate=()=>!motionPreference.matches&&typeof Element.prototype.animate==='function';
function animateElement(element,keyframes,options={}){
  if(!element||!canAnimate())return null;
  const animation=element.animate(keyframes,{duration:720,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards',...options});
  activeAnimations.add(animation);
  animation.finished.then(()=>{activeAnimations.delete(animation);animation.cancel();},()=>activeAnimations.delete(animation));
  return animation;
}
motionPreference.addEventListener('change',()=>{
  if(motionPreference.matches)activeAnimations.forEach(animation=>animation.cancel());
});

if(/^\/research\/?$/.test(window.location.pathname)&&['#paveguard','#floodguard','#sand-battery'].includes(window.location.hash)){
  window.location.replace('/journey/'+window.location.hash);
}
const menuButton=document.querySelector('.menu-button');
const menu=document.querySelector('.main-nav');
if(menuButton&&menu){
  menuButton.addEventListener('click',()=>{
    const isOpen=menuButton.getAttribute('aria-expanded')==='true';
    menuButton.setAttribute('aria-expanded',String(!isOpen));
    menuButton.querySelector('.menu-label').textContent=isOpen?'Menu':'Close';
    menu.classList.toggle('open',!isOpen);
  });
  menu.addEventListener('click',e=>{if(e.target.closest('a')){menuButton.setAttribute('aria-expanded','false');menu.classList.remove('open');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){menuButton.click();menuButton.focus();}});
}
const siteHeader=document.querySelector('.site-header');
const sectionNav=document.querySelector('.section-index');
if(siteHeader){
  const sectionLinks=sectionNav?[...sectionNav.querySelectorAll('a')]:[];
  const sections=sectionLinks.map(link=>({link,target:document.getElementById(link.hash.slice(1))})).filter(item=>item.target);
  let sectionFrame=0;
  function updateSection(){
    sectionFrame=0;
    let current=sections[0];
    const threshold=siteHeader.getBoundingClientRect().height+32;
    for(const section of sections){
      if(section.target.getBoundingClientRect().top<=threshold)current=section;
      else break;
    }
    sections.forEach(section=>{
      if(section===current)section.link.setAttribute('aria-current','location');
      else section.link.removeAttribute('aria-current');
    });
  }
  function requestSectionUpdate(){
    if(!sectionFrame)sectionFrame=requestAnimationFrame(updateSection);
  }
  function syncHeaderOffset(){
    document.documentElement.style.setProperty('--header-height',`${siteHeader.getBoundingClientRect().height}px`);
    requestSectionUpdate();
  }
  syncHeaderOffset();
  new ResizeObserver(syncHeaderOffset).observe(siteHeader);
  window.addEventListener('scroll',requestSectionUpdate,{passive:true});
  window.addEventListener('hashchange',requestSectionUpdate);
  sectionLinks.forEach(link=>link.addEventListener('click',()=>{
    if(menuButton?.getAttribute('aria-expanded')==='true')menuButton.click();
    syncHeaderOffset();
  }));
}
document.querySelectorAll('.video-player').forEach(player=>{
  const frame=player.querySelector('iframe');
  const original=player.querySelector('.video-original');
  const choices=player.querySelectorAll('[data-video-id],[data-video-src]');
  choices.forEach(button=>{
    button.addEventListener('click',()=>{
      if(button.getAttribute('aria-pressed')==='true')return;
      frame.src=button.dataset.videoSrc||'https://drive.google.com/file/d/'+button.dataset.videoId+'/preview';
      frame.title=button.dataset.videoLabel;
      original.href=button.dataset.videoUrl||'https://drive.google.com/file/d/'+button.dataset.videoId+'/view';
      choices.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    });
  });
});
const viewer=document.querySelector('.lightbox');
if(viewer){
  const viewImage=viewer.querySelector('.lightbox-image');
  const caption=viewer.querySelector('.lightbox-caption');
  const count=viewer.querySelector('.lightbox-count');
  const previous=viewer.querySelector('[data-previous]');
  const next=viewer.querySelector('[data-next]');
  let photos=[];
  let active=0;
  let closing=false;
  function closeViewer(){
    if(closing)return;
    if(!canAnimate()){viewer.close();return;}
    closing=true;
    const animation=animateElement(viewer,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.985)'}],{duration:160,easing:'ease-out',fill:'forwards'});
    animation.finished.then(()=>viewer.close(),()=>viewer.close());
  }
  function show(index){
    active=(index+photos.length)%photos.length;
    const photo=photos[active];
    const img=photo.querySelector('img');
    viewImage.src=img.src;
    viewImage.alt=img.alt;
    caption.textContent=photo.dataset.caption||img.alt;
    count.textContent=`${active+1} / ${photos.length}`;
    previous.hidden=next.hidden=photos.length<2;
    viewer.querySelector('.lightbox-bottom').classList.toggle('single',photos.length<2);
    if(viewer.open){
      const expectedSource=img.src;
      viewImage.decode().catch(()=>{}).then(()=>{
        if(viewer.open&&viewImage.src===expectedSource)animateElement(viewImage,[{opacity:.25},{opacity:1}],{duration:260});
      });
    }
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-gallery]');
    if(!target)return;
    const group=target.dataset.gallery;
    photos=[...document.querySelectorAll('[data-gallery]')].filter(item=>item.dataset.gallery===group);
    show(photos.indexOf(target));
    viewer.showModal();
    document.documentElement.classList.add('no-scroll');
    animateElement(viewer,[{opacity:0,transform:'translateY(12px) scale(.975)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:340});
  });
  previous.addEventListener('click',()=>show(active-1));
  next.addEventListener('click',()=>show(active+1));
  viewer.querySelector('[data-close]').addEventListener('click',closeViewer);
  viewer.addEventListener('cancel',event=>{if(canAnimate()){event.preventDefault();closeViewer();}});
  viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeViewer();}});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(active-1);}if(event.key==='ArrowRight'){event.preventDefault();show(active+1);}});
  viewer.addEventListener('close',()=>{closing=false;document.documentElement.classList.remove('no-scroll');viewImage.removeAttribute('src');});
}

// A single, staggered welcome; no looping motion competes with the photographs.
if(canAnimate()){
  const opening=document.querySelector('.home-hero')?
    ['.hero-copy .eyebrow','.hero-copy h1','.hero-roles','.hero-motto','.motto-translation','.hero-copy .actions']:
    ['.page-intro .eyebrow','.page-intro h1','.page-intro .lede'];
  opening.forEach((selector,i)=>{
    const element=document.querySelector(selector);
    animateElement(element,[{opacity:0,translate:'0 22px'},{opacity:1,translate:'0 0'}],{delay:60+i*75,duration:820});
  });
  const portrait=document.querySelector('.hero-portraits');
  animateElement(portrait,[{opacity:0,transform:'translateY(35px) scale(1.025)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:1100,delay:160});
}

// Reveal groups once as they enter the viewport. Original photo rotations remain intact.
if(canAnimate()&&'IntersectionObserver' in window){
  const selector=[
    '.center-heading','.personal-copy p','.preview-copy','.photo-composition','.community-photo',
    '.section-head','.feature-project','.project-card','.recognition-card','.beyond-panel',
    '.chapter-label','.chapter-content h2','.chapter-layout>.prose','.chapter-media',
    '.case-header','.product-layout>.prose','.product-layout>.gallery','.tracker-lead-media',
    '.internship-story>.gallery','.internship-story>figcaption','.internship-confirmation',
    '.blueprint-heading','.blueprint-card','.award-feature','.award-entry','.club-heading',
    '.event-collection','.story-photos','.story-spread>figcaption','.music-festival','.music-caption',
    '.beyond-story>div','.beyond-gallery','.beyond-film>div:first-child','.beyond-cover',
    '.page-intro .portrait-pair','.next-chapter'
  ].join(',');
  const candidates=[...document.querySelectorAll(selector)];
  const candidateSet=new Set(candidates);
  const targets=candidates.filter(element=>{
    for(let parent=element.parentElement;parent;parent=parent.parentElement){
      if(candidateSet.has(parent))return false;
    }
    return true;
  });
  const observer=new IntersectionObserver(entries=>{
    const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);
    visible.forEach((entry,i)=>{
      observer.unobserve(entry.target);
      if(canAnimate())animateElement(entry.target,[{opacity:0,translate:'0 24px'},{opacity:1,translate:'0 0'}],{duration:760,delay:Math.min(i,3)*75});
    });
  },{threshold:0,rootMargin:'0px 0px -35px 0px'});
  targets.forEach(element=>observer.observe(element));
  motionPreference.addEventListener('change',()=>{if(motionPreference.matches)observer.disconnect();});
}

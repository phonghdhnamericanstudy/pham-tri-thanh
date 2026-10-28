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
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-gallery]');
    if(!target)return;
    const group=target.dataset.gallery;
    photos=[...document.querySelectorAll('[data-gallery]')].filter(item=>item.dataset.gallery===group);
    show(photos.indexOf(target));
    viewer.showModal();
    document.documentElement.classList.add('no-scroll');
  });
  previous.addEventListener('click',()=>show(active-1));
  next.addEventListener('click',()=>show(active+1));
  viewer.querySelector('[data-close]').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();}});
  viewer.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(active-1);}if(event.key==='ArrowRight'){event.preventDefault();show(active+1);}});
  viewer.addEventListener('close',()=>{document.documentElement.classList.remove('no-scroll');viewImage.removeAttribute('src');});
}

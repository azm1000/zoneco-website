/* ZoneCo site scripts. No dependencies. */
(function(){
  // Header state, progress line, section label in the pill
  const hdr=document.getElementById('top-bar'),bar=document.getElementById('progress-bar'),lab=document.getElementById('pill-label');
  const secs=[...document.querySelectorAll('main section[id][data-name]')];
  const home=lab?lab.textContent:'ZoneCo';
  function upd(){
    const y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    if(bar) bar.style.width=(h>0?Math.min(100,y/h*100):0)+'%';
    if(hdr) hdr.classList.toggle('solid',y>40);
    if(secs.length&&lab){
      let cur=null;
      for(const s of secs){ if(s.getBoundingClientRect().top<=innerHeight*.4) cur=s; }
      lab.textContent=cur?cur.dataset.name:home;
    }
  }
  addEventListener('scroll',upd,{passive:true}); upd();
})();

(function(){
  // Overlay menu
  const btn=document.getElementById('menu-btn'),ov=document.getElementById('overlay');
  if(!btn||!ov) return;
  function set(open){ov.hidden=!open;btn.setAttribute('aria-expanded',open);document.body.classList.toggle('menu-open',open);document.body.style.overflow=open?'hidden':'';}
  btn.addEventListener('click',()=>set(ov.hidden));
  ov.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>set(false)));
  addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
  // Mark the current page in the overlay
  const here=location.pathname.split('/').pop()||'index.html';
  ov.querySelectorAll('a[href]').forEach(a=>{ if(a.getAttribute('href')===here) a.setAttribute('aria-current','page'); });
})();

(function(){
  // Hero video rotation (home only). Crossfades between two players.
  const v0=document.getElementById('v0'),v1=document.getElementById('v1');
  if(!v0||!v1) return;
  const clips=[
    {src:'assets/video/hero-1.mp4',poster:'assets/img/hero-1-poster.jpg',credit:'Street with people walking at dusk'},
    {src:'assets/video/hero-2.mp4',poster:'assets/img/hero-2-poster.jpg',credit:'People walking on a busy city street'},
    {src:'assets/video/hero-3.mp4',poster:'assets/img/hero-3-poster.jpg',credit:'People walking slowly across town'}
  ];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v=[v0,v1],still=document.getElementById('still'),credit=document.getElementById('vid-credit');
  let i=0,active=0,timer=null,playing=false;
  function showStill(clip){still.style.backgroundImage='url('+clip.poster+')';still.classList.add('on');}
  function load(el,clip){
    el.muted=true;el.defaultMuted=true;el.setAttribute('muted','');el.playsInline=true;
    el.poster=clip.poster;el.src=clip.src;el.load();
    const p=el.play();return p?p:Promise.resolve();
  }
  if(reduce){showStill(clips[0]);const a=document.getElementById('anim');if(a)a.style.display='none';}
  if(credit) credit.textContent='Video: Mixkit, '+clips[0].credit;
  if(reduce) return;
  function rotate(){
    i=(i+1)%clips.length; const nxt=1-active;
    load(v[nxt],clips[i]).then(()=>{v[nxt].classList.add('on');v[active].classList.remove('on');active=nxt;if(credit)credit.textContent='Video: Mixkit, '+clips[i].credit;}).catch(()=>{});
  }
  function start(){
    if(playing) return;
    load(v[0],clips[0]).then(()=>{playing=true;v[0].classList.add('on');still.classList.remove('on');timer=setInterval(rotate,9000);}).catch(()=>{});
  }
  start();
  ['touchstart','click','scroll'].forEach(ev=>addEventListener(ev,start,{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
})();

(function(){
  // Count-up on stats
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes=document.querySelectorAll('[data-count]');
  if(!nodes.length) return;
  const run=n=>{const t=+n.dataset.count;if(reduce){n.textContent=t;return;}
    const d=1100,s=performance.now();
    const step=now=>{const p=Math.min(1,(now-s)/d);const e=1-Math.pow(1-p,3);n.textContent=Math.round(t*e);if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);};
  if(!('IntersectionObserver' in window)){nodes.forEach(run);return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){run(e.target);io.unobserve(e.target);}}),{threshold:.4});
  nodes.forEach(n=>io.observe(n));
})();

(function(){
  // Portfolio filter (where we work)
  const inp=document.getElementById('pf-filter'); if(!inp) return;
  const items=[...document.querySelectorAll('.portfolio li')],secs=[...document.querySelectorAll('.portfolio section')],count=document.getElementById('pf-count');
  function apply(){
    const q=inp.value.trim().toLowerCase(); let n=0;
    items.forEach(li=>{const on=!q||li.textContent.toLowerCase().includes(q);li.hidden=!on;if(on)n++;});
    secs.forEach(s=>{s.hidden=![...s.querySelectorAll('li')].some(li=>!li.hidden);});
    if(count) count.textContent=n+' of '+items.length+' engagements';
  }
  inp.addEventListener('input',apply); apply();
})();

(function(){
  // News filter tabs
  const tabs=document.querySelectorAll('[data-filter]'); if(!tabs.length) return;
  const items=document.querySelectorAll('[data-kind]');
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>x.setAttribute('aria-pressed',x===t));
    const k=t.dataset.filter;
    items.forEach(i=>{i.hidden=!(k==='all'||i.dataset.kind===k);});
  }));
})();

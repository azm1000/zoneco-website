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

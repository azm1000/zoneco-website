/* ZoneCo project map: zoom, pan, labels at depth, and cluster tooltips.
   Works on every element with class "map-wrap" containing an .usmap svg. */
(function(){
  /* These must match the region list under the map (see the .regions block in
     index.html and where-we-work.html). The three Ohio regions there -- Midwest,
     Central Ohio, and Northeast Ohio and Western Pennsylvania -- are all inside
     one state, which the map cannot tell apart by state, so they share one
     button covering Ohio and the states grouped with it. */
  const REGIONS={
    'Ohio and neighbors':['Ohio','Kentucky','Indiana','Pennsylvania'],
    'Upper Midwest':['Illinois','Michigan','Minnesota','Wisconsin'],
    'National Capital Region':['Maryland','Virginia'],
    'New York and New England':['New York','Connecticut','Massachusetts','Vermont'],
    'South':['Alabama','Georgia','Florida','Mississippi','Tennessee','South Carolina'],
    'West':['Colorado','Missouri','Montana']
  };
  document.querySelectorAll('.map-wrap').forEach(init);

  function init(wrap){
    const svg=wrap.querySelector('svg.usmap'); if(!svg||svg.dataset.ready) return; svg.dataset.ready=1;
    const tip=wrap.querySelector('.tip');
    const base=(svg.getAttribute('viewBox')||'0 0 960 600').split(/\s+/).map(Number);
    let vb=base.slice(); const R0=3.8, MAXZ=14;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dots: pull data out of <title>, add labels
    const dots=[...svg.querySelectorAll('.dot')].map(d=>{
      const t=d.querySelector('title'); const raw=t?t.textContent:''; if(t) d.removeChild(t);
      const i=raw.indexOf(': '); const place=i>0?raw.slice(0,i):raw, work=i>0?raw.slice(i+2):'';
      const st=(place.split(', ').pop()||'').trim();
      const x=+d.getAttribute('cx'), y=+d.getAttribute('cy');
      d.setAttribute('tabindex','0'); d.setAttribute('role','button'); d.setAttribute('aria-label',place+': '+work);
      const lab=document.createElementNS('http://www.w3.org/2000/svg','text');
      lab.setAttribute('class','dotlab'); lab.setAttribute('x',x+5); lab.setAttribute('y',y+1.5); lab.textContent=place.split(',')[0];
      svg.appendChild(lab);
      return {el:d,lab,x,y,place,work,st};
    });
    // Sort labels so later (denser) ones don't matter; hide labels that would collide at a given zoom
    const zoom=()=>base[2]/vb[2];
    function render(){
      svg.setAttribute('viewBox',vb.join(' '));
      const z=zoom(), r=R0/Math.pow(z,.8), showLab=z>=2.6, fs=11/z;
      dots.forEach(o=>{o.el.setAttribute('r',r); o.el.style.r=r+'px'; o.el.style.strokeWidth=(1/z)+'px'; o.lab.style.fontSize=fs+'px'; o.lab.style.strokeWidth=(0.9/z)+'px'; o.lab.setAttribute('x',o.x+r+1.2/z*2); o.lab.setAttribute('y',o.y+fs*.35);});
      // label collision: greedy, in reading order, only if labels are on
      const taken=[];
      dots.forEach(o=>{
        if(!showLab){o.lab.style.display='none';return;}
        const w=o.lab.textContent.length*fs*.56, h=fs*1.1, x=o.x, y=o.y-h/2;
        const hit=taken.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y);
        o.lab.style.display=hit?'none':''; if(!hit) taken.push({x,y,w,h});
      });
      wrap.querySelectorAll('[data-map-zoom]').forEach(b=>b.disabled=(b.dataset.mapZoom==='in'&&z>=MAXZ)||(b.dataset.mapZoom==='out'&&z<=1.001));
      const rs=wrap.querySelector('[data-map-reset]'); if(rs) rs.hidden=z<=1.001;
    }
    function clamp(){
      const z=Math.min(MAXZ,Math.max(1,base[2]/vb[2])); vb[2]=base[2]/z; vb[3]=base[3]/z;
      vb[0]=Math.min(base[0]+base[2]-vb[2],Math.max(base[0],vb[0])); vb[1]=Math.min(base[1]+base[3]-vb[3],Math.max(base[1],vb[1]));
    }
    function zoomAt(factor,px,py){ // px,py in viewBox units
      const z=Math.min(MAXZ,Math.max(1,zoom()*factor)); const nw=base[2]/z, nh=base[3]/z;
      vb=[px-(px-vb[0])*(nw/vb[2]), py-(py-vb[1])*(nh/vb[3]), nw, nh]; clamp(); render(); hideTip();
    }
    function toVB(cx,cy){ const r=svg.getBoundingClientRect(); return [vb[0]+(cx-r.left)/r.width*vb[2], vb[1]+(cy-r.top)/r.height*vb[3]]; }
    function fitTo(list,pad){
      if(!list.length) return;
      let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9; list.forEach(o=>{x0=Math.min(x0,o.x);y0=Math.min(y0,o.y);x1=Math.max(x1,o.x);y1=Math.max(y1,o.y);});
      const w=Math.max(x1-x0,40)+pad*2, h=Math.max(y1-y0,25)+pad*2, ar=base[2]/base[3];
      let W=Math.max(w,h*ar), H=W/ar; const cx=(x0+x1)/2, cy=(y0+y1)/2;
      vb=[cx-W/2,cy-H/2,W,H]; clamp(); render(); hideTip();
    }

    // Wheel zoom
    svg.addEventListener('wheel',e=>{ e.preventDefault(); const [px,py]=toVB(e.clientX,e.clientY); zoomAt(e.deltaY<0?1.25:0.8,px,py); },{passive:false});
    svg.addEventListener('dblclick',e=>{ const [px,py]=toVB(e.clientX,e.clientY); zoomAt(1.8,px,py); });
    // Drag pan (mouse + touch via pointer events), pinch
    let drag=null, pinch=null, moved=false; const pts=new Map();
    svg.addEventListener('pointerdown',e=>{ pts.set(e.pointerId,[e.clientX,e.clientY]); if(pts.size===1){drag={x:e.clientX,y:e.clientY,vb:vb.slice()};moved=false;} else if(pts.size===2){drag=null;const a=[...pts.values()];pinch={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),z:zoom(),c:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]};} svg.setPointerCapture(e.pointerId); });
    svg.addEventListener('pointermove',e=>{
      if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,[e.clientX,e.clientY]);
      if(pinch&&pts.size===2){ const a=[...pts.values()]; const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]); const [px,py]=toVB(pinch.c[0],pinch.c[1]); const target=pinch.z*d/pinch.d; zoomAt(target/zoom(),px,py); return; }
      if(drag){ const r=svg.getBoundingClientRect(); const dx=(e.clientX-drag.x)/r.width*vb[2], dy=(e.clientY-drag.y)/r.height*vb[3]; if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>4) moved=true; vb[0]=drag.vb[0]-dx; vb[1]=drag.vb[1]-dy; clamp(); render(); if(moved) hideTip(); }
    });
    function up(e){ pts.delete(e.pointerId); if(pts.size<2) pinch=null; if(pts.size===0) drag=null; }
    svg.addEventListener('pointerup',up); svg.addEventListener('pointercancel',up); svg.addEventListener('lostpointercapture',up);
    svg.style.cursor='grab'; svg.style.touchAction='none';

    // Controls
    wrap.querySelectorAll('[data-map-zoom]').forEach(b=>b.addEventListener('click',()=>{ zoomAt(b.dataset.mapZoom==='in'?1.6:1/1.6, vb[0]+vb[2]/2, vb[1]+vb[3]/2); }));
    const rs=wrap.querySelector('[data-map-reset]'); if(rs) rs.addEventListener('click',()=>{vb=base.slice();render();hideTip();});
    wrap.querySelectorAll('[data-map-region]').forEach(b=>b.addEventListener('click',()=>{ const sts=REGIONS[b.dataset.mapRegion]||[]; fitTo(dots.filter(o=>sts.includes(o.st)),18); }));

    // Tooltips: hover/tap shows every project within a few screen pixels (clusters)
    function near(o){ const r=svg.getBoundingClientRect(); const pxPer=r.width/vb[2]; const lim=7/pxPer; return dots.filter(p=>Math.hypot(p.x-o.x,p.y-o.y)<=lim); }
    function show(o){
      if(!tip) return; const group=near(o); const w=wrap.getBoundingClientRect(), r=o.el.getBoundingClientRect();
      tip.innerHTML=(group.length>1?'<small>'+group.length+' projects here. '+(zoom()<MAXZ?'Zoom in to separate.':'')+'</small>':'')+group.map(p=>'<b>'+esc(p.place)+'</b>'+esc(p.work)).join('');
      tip.style.left=(r.left-w.left+r.width/2)+'px'; tip.style.top=(r.top-w.top)+'px'; tip.hidden=false;
    }
    function hideTip(){ if(tip) tip.hidden=true; }
    dots.forEach(o=>{
      o.el.addEventListener('mouseenter',()=>{if(!drag)show(o);}); o.el.addEventListener('focus',()=>show(o));
      o.el.addEventListener('mouseleave',hideTip); o.el.addEventListener('blur',hideTip);
      o.el.addEventListener('click',e=>{ e.stopPropagation(); if(moved) return; tip&&tip.hidden?show(o):hideTip(); });
      o.el.addEventListener('keydown',e=>{ if(e.key==='Enter'){ zoomAt(2,o.x,o.y); show(o);} });
    });
    document.addEventListener('click',hideTip);
    render();
  }
  function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
})();

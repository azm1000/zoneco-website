/* "How zoning spread" animated map on resources.html. Needs d3 (assets/js/vendor) and
   window.ZONING_SPREAD (assets/js/zoning-spread-data.js). Plays once when scrolled into view;
   visitors who prefer reduced motion see the final year with the controls still available. */
(function(){
  const D=window.ZONING_SPREAD, root=document.getElementById('spread-fig');
  if(!D||!root||!window.d3) return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const Y=D.years, last=Y.length-1;
  const names=Object.keys(D.counts);
  const fmt=d3.format(',');

  // cumulative[state][i] = municipalities zoned by the end of Y[i]
  const cum={}, first={};
  names.forEach(n=>{ let run=0; cum[n]=Y.map(y=>{ const c=D.counts[n][y]||0; if(c&&!first[n]) first[n]=y; return run+=c; }); });
  const perYear=Y.map(y=>d3.sum(names,n=>D.counts[n][y]||0));
  const totals=Y.map((y,i)=>d3.sum(names,n=>cum[n][i]));
  const states=Y.map((y,i)=>names.filter(n=>n!=='District of Columbia'&&cum[n][i]>0).length);

  const NOTES={
    1904:'Boston limits building heights by district.',
    1909:'Los Angeles sets aside residential districts.',
    1916:'New York City adopts the nation’s first comprehensive zoning ordinance.',
    1921:'Commerce Secretary Herbert Hoover forms the Advisory Committee on Zoning.',
    1922:'The committee’s Zoning Primer circulates nationwide.',
    1924:'The Standard State Zoning Enabling Act is published.',
    1926:'The Supreme Court upholds zoning in Euclid v. Ambler.',
    1932:'By January 1, 1933, zoning reaches all 48 states.'
  };

  const bins=[1,5,20,50,100];
  const color=d3.scaleThreshold().domain(bins).range(['#E4E1D7','#CFE0EC','#8DB6D6','#4F88B8','#1F5F96','#0B3A63']);
  const binLabels=['None','1–4','5–19','20–49','50–99','100+'];

  const yearEl=root.querySelector('.sp-year'), countEl=root.querySelector('.sp-count'),
        noteEl=root.querySelector('.sp-note'), tip=root.querySelector('.sp-tip'),
        btn=root.querySelector('.sp-play'), range=root.querySelector('.sp-range');
  range.max=last;

  // Map
  const svg=d3.select(root.querySelector('svg.sp-map'));
  const g=svg.append('g');
  const paths=g.selectAll('path').data(D.shapes).join('path')
    .attr('d',d=>d.d).attr('class','sp-st').attr('fill',color(0));
  const dc=g.append('circle').attr('cx',D.dc[0]).attr('cy',D.dc[1]).attr('r',4.5)
    .attr('class','sp-st').attr('fill',color(0)).datum({n:'District of Columbia'});

  // Legend
  const leg=root.querySelector('.sp-legend');
  leg.innerHTML='<span class="sp-legend-t">Municipalities zoned</span>'+color.range().map((c,i)=>'<span><i style="background:'+c+'"></i>'+binLabels[i]+'</span>').join('');

  // Bars: municipalities adopting zoning each year
  const bw=640, bh=150, m={t:10,r:4,b:24,l:30};
  const bsvg=d3.select(root.querySelector('svg.sp-bars')).attr('viewBox','0 0 '+bw+' '+bh);
  const x=d3.scaleBand().domain(Y).range([m.l,bw-m.r]).padding(0.18);
  const yS=d3.scaleLinear().domain([0,d3.max(perYear)]).nice().range([bh-m.b,m.t]);
  bsvg.append('g').attr('class','sp-grid').selectAll('line').data(yS.ticks(3)).join('line')
    .attr('x1',m.l).attr('x2',bw-m.r).attr('y1',d=>yS(d)).attr('y2',d=>yS(d));
  bsvg.append('g').attr('class','sp-axis').selectAll('text').data(yS.ticks(3)).join('text')
    .attr('x',m.l-6).attr('y',d=>yS(d)+4).attr('text-anchor','end').text(d=>d);
  bsvg.append('g').attr('class','sp-axis').selectAll('text').data(Y.filter(y=>[1904,1916,1920,1924,1928,1932].includes(y))).join('text')
    .attr('x',d=>x(d)+x.bandwidth()/2).attr('y',bh-6).attr('text-anchor','middle').text(d=>d);
  const bars=bsvg.append('g').selectAll('rect').data(Y.map((y,i)=>({y,i,v:perYear[i]}))).join('rect')
    .attr('x',d=>x(d.y)).attr('width',x.bandwidth())
    .attr('y',d=>Math.min(yS(d.v),yS(0)-1)).attr('height',d=>Math.max(1,yS(0)-yS(d.v))).attr('rx',2)
    .attr('class','sp-bar');
  // generous hit targets for the bars
  bsvg.append('g').selectAll('rect').data(Y.map((y,i)=>({y,i,v:perYear[i]}))).join('rect')
    .attr('x',d=>x(d.y)-x.step()*x.paddingInner()/2).attr('width',x.step()).attr('y',m.t).attr('height',bh-m.b-m.t)
    .attr('fill','transparent').style('cursor','pointer')
    .on('pointermove',(e,d)=>showTip(e,'<b>'+d.y+'</b>'+fmt(d.v)+' municipalit'+(d.v===1?'y':'ies')+' adopted zoning'))
    .on('pointerleave',hideTip)
    .on('click',(e,d)=>{ stop(); show(d.i,true); });

  let cur=-1;
  function show(i,animate){
    cur=i; range.value=i;
    const t=animate&&!reduce?d3.transition().duration(500):null;
    (t?paths.transition(t):paths).attr('fill',d=>color(cum[d.n][i]));
    (t?dc.transition(t):dc).attr('fill',color(cum['District of Columbia'][i]));
    bars.classed('on',d=>d.i<=i).classed('now',d=>d.i===i);
    yearEl.textContent=Y[i];
    countEl.innerHTML='<b>'+fmt(totals[i])+'</b> municipalit'+(totals[i]===1?'y':'ies')+' zoned in <b>'+states[i]+'</b> state'+(states[i]===1?'':'s')+(cum['District of Columbia'][i]?' and D.C.':'');
    noteEl.textContent=NOTES[Y[i]]||(perYear[i]+' adopted zoning in '+Y[i]+'.');
  }

  // Tooltip on states
  function showTip(e,html){
    const r=root.getBoundingClientRect();
    tip.innerHTML=html; tip.hidden=false;
    const w=tip.offsetWidth, h=tip.offsetHeight;
    let left=e.clientX-r.left+14, top=e.clientY-r.top-h-10;
    if(left+w>r.width) left=e.clientX-r.left-w-14;
    if(top<0) top=e.clientY-r.top+18;
    tip.style.left=left+'px'; tip.style.top=top+'px';
  }
  function hideTip(){ tip.hidden=true; }
  g.selectAll('.sp-st')
    .on('pointermove',(e,d)=>{ const c=cum[d.n][cur]; showTip(e,'<b>'+d.n+'</b>'+(c?fmt(c)+' zoned by the end of '+Y[cur]+'<br>First ordinance: '+first[d.n]:'None yet in '+Y[cur]+'<br>First ordinance: '+first[d.n])); })
    .on('pointerleave',hideTip);

  // Playback
  let timer=null;
  function stop(){ if(timer){ clearInterval(timer); timer=null; } btn.textContent='Play'; btn.setAttribute('aria-pressed','false'); }
  function play(){
    if(cur>=last) show(0,false);
    btn.textContent='Pause'; btn.setAttribute('aria-pressed','true');
    timer=setInterval(()=>{ if(cur>=last){ stop(); btn.textContent='Replay'; return; } show(cur+1,true); },900);
  }
  btn.addEventListener('click',()=>timer?stop():play());
  range.addEventListener('input',()=>{ stop(); show(+range.value,false); });

  if(reduce){ show(last,false); btn.textContent='Replay'; return; }
  show(0,false);
  const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ io.disconnect(); play(); } },{threshold:0.45});
  io.observe(root.querySelector('svg.sp-map'));
})();

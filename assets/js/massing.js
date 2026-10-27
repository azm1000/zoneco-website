/* Massing tool on massing.html: compares the largest building two sets of zoning standards
   allow on the same lot, side by side in 3D. Needs THREE (assets/js/vendor/three-r128.min.js).
   Adapted from ZoneCo's Infill Development Massing study. */
(function(){
"use strict";
const root=document.getElementById("massing"); if(!root||!window.THREE) return;
const FLOOR=11, DW=10, KEY="zoneco-massing-v1";
const DEF={
  shared:{lotW:70,lotD:130},
  a:{name:"Current code",front:30,side:7,rear:25,height:40,stories:3,units:1,park:2},
  b:{name:"Proposed code",front:15,side:5,rear:20,height:40,stories:3,units:6,park:1}
};
const FIELDS=[
  ["front","Front setback (ft)",1],["side","Side setback (ft)",1],["rear","Rear setback (ft)",1],
  ["height","Max height (ft)",1],["stories","Max stories",1],
  ["units","Units",1],["park","Parking spaces / unit",0.25]
];
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}
if(!S||!S.shared||!S.a||!S.b)S=JSON.parse(JSON.stringify(DEF));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const css=n=>getComputedStyle(root).getPropertyValue(n).trim();
const fmt=n=>Math.round(n).toLocaleString();
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function compute(s,sh){
  const W=sh.lotW,D=sh.lotD,A=W*D, bw=Math.max(0,W-2*s.side), bd=Math.max(0,D-s.front-s.rear);
  const stories=Math.max(0,Math.min(Math.floor(s.stories),Math.floor(s.height/FLOOR)));
  const units=Math.max(0,Math.min(300,Math.floor(s.units||0)));
  const spaces=Math.ceil(units*(s.park||0)-1e-9);
  const per=Math.max(1,Math.floor((W-2)/9)), rows=spaces?Math.ceil(spaces/per):0;
  const pd=rows?rows*18+Math.ceil(rows/2)*24:0;
  const pw=spaces?Math.min(per,spaces)*9:0;
  const bx0=-W/2+(spaces?Math.max(s.side,DW+2):s.side), bb=Math.max(0,W/2-s.side-bx0);
  const room=D-s.front-pd;
  let d=Math.max(0,Math.min(bd,room));
  if(bb<=0||stories<1)d=0;
  const f=bb*d, gfa=f*stories;
  let why="";
  if(room<=0)why="fit";
  else if(room<bd-0.01)why="room";
  return {units,spaces,per,rows,pd,pw,bw,bd,bb,bx0,stories,d,f,gfa,far:gfa/A,A,why};
}

const VIEWS={aerial:{theta:0.7,phi:0.72,r:1.55},street:{theta:0.28,phi:0.1,r:1.0},side:{theta:1.45,phi:0.32,r:1.45}};
const cam={view:"aerial",...VIEWS.aerial};
const views={};

class View{
  constructor(stage,key){
    this.key=key;this.stage=stage;
    this.r=new THREE.WebGLRenderer({antialias:true,alpha:true});
    this.r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    stage.appendChild(this.r.domElement);
    this.scene=new THREE.Scene();
    this.cam=new THREE.PerspectiveCamera(35,4/3,1,5000);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0x667766,0.75));
    const sun=new THREE.DirectionalLight(0xffffff,0.6);sun.position.set(-120,220,160);this.scene.add(sun);
    this.g=new THREE.Group();this.scene.add(this.g);
    if(window.ResizeObserver)new ResizeObserver(()=>this.size()).observe(stage);
    this.size();
  }
  size(){const w=this.stage.clientWidth,h=this.stage.clientHeight;if(!w||!h)return;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();this.render()}
  clear(){this.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});this.scene.remove(this.g);this.g=new THREE.Group();this.scene.add(this.g)}
  plane(w,d,x,z,y,color){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({color}));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);this.g.add(m);return m}
  rect(x0,z0,x1,z1,y,color,dashed){
    const pts=[[x0,z0],[x1,z0],[x1,z1],[x0,z1],[x0,z0]].map(p=>new THREE.Vector3(p[0],y,p[1]));
    const geo=new THREE.BufferGeometry().setFromPoints(pts);
    const mat=dashed?new THREE.LineDashedMaterial({color,dashSize:3,gapSize:2}):new THREE.LineBasicMaterial({color});
    const l=new THREE.Line(geo,mat);if(dashed)l.computeLineDistances();this.g.add(l);
  }
  build(s,sh,res){
    this.clear();
    const W=sh.lotW,D=sh.lotD,acc=css(this.key==="a"?"--current":"--proposed");
    this.plane(W*9,D*3+200,0,-D/2,0,css("--ground"));
    this.plane(W*9,30,0,25,0.05,css("--street"));
    this.plane(W*9,8,0,5,0.08,css("--walk"));
    for(let k=-2;k<=2;k++){
      const cx=k*W;
      this.plane(W-1,D-1,cx,-D/2,0.1,css("--lot"));
      this.rect(cx-W/2,0,cx+W/2,-D,0.15,css("--muted"));
      if(k===0)continue;
      const hw=Math.min(28,W-10),hd=40,hz=-30-hd/2;
      const body=new THREE.Mesh(new THREE.BoxGeometry(hw,20,hd),new THREE.MeshLambertMaterial({color:css("--house")}));
      body.position.set(cx,10,hz);this.g.add(body);
      const sh2=new THREE.Shape();sh2.moveTo(-hw/2-1,0);sh2.lineTo(hw/2+1,0);sh2.lineTo(0,9);sh2.closePath();
      const roof=new THREE.Mesh(new THREE.ExtrudeGeometry(sh2,{depth:hd,bevelEnabled:false}),new THREE.MeshLambertMaterial({color:css("--roof")}));
      roof.position.set(cx,20,-30-hd);this.g.add(roof);
    }
    if(res.bw>0&&res.bd>0)this.rect(-res.bw/2,-s.front,res.bw/2,-s.front-res.bd,0.25,acc,true);
    const eh=Math.max(1,s.height);
    if(res.bw>0&&res.bd>0){
      const eg=new THREE.BoxGeometry(res.bw,eh,res.bd);
      const ghost=new THREE.Mesh(eg,new THREE.MeshBasicMaterial({color:acc,transparent:true,opacity:0.07,depthWrite:false}));
      ghost.position.set(0,eh/2,-s.front-res.bd/2);this.g.add(ghost);
      const edges=new THREE.LineSegments(new THREE.EdgesGeometry(eg),new THREE.LineBasicMaterial({color:acc,transparent:true,opacity:0.7}));
      edges.position.copy(ghost.position);this.g.add(edges);
    }
    if(res.f>0){
      const col=new THREE.Color(acc),edge=col.clone().multiplyScalar(0.6);
      for(let i=0;i<res.stories;i++){
        const bg=new THREE.BoxGeometry(res.bb,FLOOR-0.4,res.d);
        const m=new THREE.Mesh(bg,new THREE.MeshLambertMaterial({color:col}));
        m.position.set(res.bx0+res.bb/2,i*FLOOR+FLOOR/2,-s.front-res.d/2);this.g.add(m);
        const e=new THREE.LineSegments(new THREE.EdgesGeometry(bg),new THREE.LineBasicMaterial({color:edge}));
        e.position.copy(m.position);this.g.add(e);
      }
    }
    if(res.f>0&&s.front>0)this.plane(4,s.front,res.bx0+res.bb/2,-s.front/2,0.3,css("--walk"));
    if(res.spaces>0){
      if(D-res.pd>0)this.plane(DW,D-res.pd,-W/2+1+DW/2,-(D-res.pd)/2,0.3,css("--park"));
      this.plane(res.pw,res.pd,-W/2+1+res.pw/2,-D+res.pd/2,0.3,css("--park"));
      const lc=css("--surface");
      for(let i=0;i<res.rows;i++){
        const z0=-D+Math.floor(i/2)*60+(i%2?42:0);
        const n=Math.min(res.per,res.spaces-i*res.per);
        for(let j=0;j<n;j++){const x0=-W/2+1+j*9;this.rect(x0+0.4,z0+0.4,x0+8.6,z0+17.6,0.4,lc)}
      }
    }
    this.render();
  }
  render(){
    const D=S.shared.lotD,t=new THREE.Vector3(0,cam.view==="street"?14:10,-D/2+(cam.view==="street"?10:0));
    const r=cam.r*D;
    this.cam.position.set(t.x+r*Math.cos(cam.phi)*Math.sin(cam.theta),t.y+r*Math.sin(cam.phi),t.z+r*Math.cos(cam.phi)*Math.cos(cam.theta));
    this.cam.lookAt(t);this.r.render(this.scene,this.cam);
  }
}

function panel(key){
  const el=document.getElementById("ms-panel-"+key);
  el.innerHTML=`<div class="ms-head"><span class="ms-swatch" style="background:var(${key==="a"?"--current":"--proposed"})"></span>
    <input class="ms-name" aria-label="Scenario name" value=""></div>
    <div class="ms-stage" aria-label="3D model, drag to rotate"></div>
    <div class="ms-stats"></div>
    <details><summary>Edit zoning standards</summary><div class="ms-form">${FIELDS.map(([k,l,st])=>
      `<label class="ms-field">${l}<input type="number" data-k="${k}" step="${st}" min="0"></label>`).join("")}</div></details>`;
  const nm=el.querySelector(".ms-name");nm.value=S[key].name;
  nm.addEventListener("input",()=>{S[key].name=nm.value||"Untitled";save();update()});
  el.querySelectorAll("[data-k]").forEach(inp=>{
    inp.value=S[key][inp.dataset.k];
    inp.addEventListener("input",()=>{const v=parseFloat(inp.value);if(!isNaN(v)&&v>=0){S[key][inp.dataset.k]=v;save();update()}});
  });
  const stage=el.querySelector(".ms-stage");
  views[key]=new View(stage,key);
  let drag=null;
  stage.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId)});
  stage.addEventListener("pointermove",e=>{
    if(!drag)return;
    cam.theta-=(e.clientX-drag.x)*0.008;
    if(e.pointerType==="mouse")cam.phi=Math.min(1.45,Math.max(0.04,cam.phi+(e.clientY-drag.y)*0.006));
    drag={x:e.clientX,y:e.clientY};setView(null);renderAll();
  });
  ["pointerup","pointercancel"].forEach(t=>stage.addEventListener(t,()=>drag=null));
}

function statsHTML(res){
  const it=[[res.units,res.units===1?"unit":"units"],[res.spaces,res.spaces===1?"parking space":"parking spaces"],[fmt(res.gfa),"sq ft floor area"],[res.far.toFixed(2),"floor area ratio"],[fmt(res.f),"sq ft footprint"]];
  const w={fit:"Required parking doesn't fit behind the front setback. Lower the parking ratio or units.",
    room:"The parking area is taking lot depth the building could otherwise use."}[res.why]||"";
  return it.map(([b,s])=>`<div class="ms-stat"><b>${b}</b><span>${s}</span></div>`).join("")+(w?`<p class="ms-warn">${w}</p>`:"");
}

function update(){
  const sh=S.shared,ra=compute(S.a,sh),rb=compute(S.b,sh);
  document.querySelector("#ms-panel-a .ms-stats").innerHTML=statsHTML(ra);
  document.querySelector("#ms-panel-b .ms-stats").innerHTML=statsHTML(rb);
  document.getElementById("ms-verdict").innerHTML=`${esc(S.a.name)}: <span class="a">${fmt(ra.gfa)} sq ft</span>. ${esc(S.b.name)}: <span class="b">${fmt(rb.gfa)} sq ft</span>.`;
  document.getElementById("ms-sub").textContent=`Maximum floor area on the same ${sh.lotW} × ${sh.lotD} ft lot (${fmt(sh.lotW*sh.lotD)} sq ft). ${S.a.name}: ${ra.units} ${ra.units===1?"unit":"units"}, ${ra.spaces} parking. ${S.b.name}: ${rb.units} ${rb.units===1?"unit":"units"}, ${rb.spaces} parking.`;
  views.a.build(S.a,sh,ra);views.b.build(S.b,sh,rb);
}
function renderAll(){views.a&&views.a.render();views.b&&views.b.render()}
function setView(v){
  if(v){Object.assign(cam,VIEWS[v]);cam.view=v}else cam.view="custom";
  root.querySelectorAll("[data-view]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.view===cam.view)));
}
function syncInputs(){
  ["lotW","lotD"].forEach(k=>document.getElementById("ms-"+k).value=S.shared[k]);
  ["a","b"].forEach(key=>{const el=document.getElementById("ms-panel-"+key);el.querySelector(".ms-name").value=S[key].name;
    el.querySelectorAll("[data-k]").forEach(i=>i.value=S[key][i.dataset.k])});
}

panel("a");panel("b");
["lotW","lotD"].forEach(k=>{const i=document.getElementById("ms-"+k);i.value=S.shared[k];
  i.addEventListener("input",()=>{const v=parseFloat(i.value);if(!isNaN(v)&&v>0){S.shared[k]=v;save();update()}})});
root.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>{setView(b.dataset.view);renderAll()}));
document.getElementById("ms-zin").onclick=()=>{cam.r=Math.max(0.5,cam.r*0.85);renderAll()};
document.getElementById("ms-zout").onclick=()=>{cam.r=Math.min(4,cam.r*1.18);renderAll()};
document.getElementById("ms-reset").onclick=()=>{S=JSON.parse(JSON.stringify(DEF));save();syncInputs();update()};
update();
})();

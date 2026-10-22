/* "Ordinance Lineage" on resources.html: how much of New York's 1916 Building Zone Resolution
   survives in Glen Ellyn, Illinois' 1923 ordinance, and how that code changed through 1993.
   Plain JavaScript, no dependencies. Renders into #lineage-app. */
(function(){
"use strict";
const root=document.getElementById("lineage-app"); if(!root) return;
const GROUPS = [
  {id:"structure", name:"Framework"},
  {id:"use", name:"Use districts"},
  {id:"height", name:"Height and setback"},
  {id:"area", name:"Yards and courts"},
  {id:"admin", name:"Administration"}
];
const MARKERS = [
  {id:"m1", g:"structure", w:2, name:"Three overlay maps",
   nyc:"Use, height and area were regulated through three separate district maps, so every lot carried three independent designations."},
  {id:"m2", g:"structure", w:1, name:"Maps adopted by reference",
   nyc:"The district maps were made part of the resolution, with rules for reading boundaries that follow streets and lot lines."},
  {id:"m3", g:"structure", w:1, name:"The 1916 definitional vocabulary",
   nyc:"Defined terms such as street wall, yard, outer court, inner court and height of building, with height measured from the curb."},
  {id:"m4", g:"use", w:2, name:"Residence, business, unrestricted",
   nyc:"Three use-district classes. Residence districts allowed apartments as well as houses; unrestricted districts took industry."},
  {id:"m5", g:"use", w:2, name:"Cumulative use hierarchy",
   nyc:"Each less-restricted district permits everything allowed in the more-restricted districts plus its own uses."},
  {id:"m6", g:"use", w:1, name:"Limits on industry in business districts",
   nyc:"Business districts excluded listed nuisance trades and capped manufacturing incidental to a business at a share of floor area."},
  {id:"m7", g:"height", w:2, name:"Height tied to street width",
   nyc:"Street-wall height limited to a multiple of the width of the street (one, one-and-a-quarter, one-and-a-half, two or two-and-a-half times)."},
  {id:"m8", g:"height", w:2, name:"Setback above the street wall",
   nyc:"Above the street-wall limit a building may rise further if it steps back at a fixed ratio — the source of the wedding-cake skyline."},
  {id:"m9", g:"height", w:1, name:"Tower exception",
   nyc:"A tower covering no more than a quarter of the lot could rise without height limit."},
  {id:"m10", g:"height", w:1, name:"Rooftop appurtenance exceptions",
   nyc:"Chimneys, tanks, bulkheads, spires and similar rooftop structures exempted from the height limits."},
  {id:"m11", g:"area", w:2, name:"Yards and courts sized by building height",
   nyc:"Area districts set yard and court dimensions as so many inches per foot of building height."},
  {id:"m12", g:"area", w:1, name:"Inner-court area formula",
   nyc:"Inner courts must have an area at least twice the square of their required least dimension (a carryover from tenement-house law)."},
  {id:"m13", g:"area", w:1, name:"Required rear yards",
   nyc:"A rear yard required on every lot, with its depth set by the area district."},
  {id:"m14", g:"admin", w:2, name:"Nonconforming uses",
   nyc:"Existing uses may continue and may change only to a use of the same or a more restricted class."},
  {id:"m15", g:"admin", w:2, name:"Board of appeals and variances",
   nyc:"A board of appeals may vary provisions where strict application causes practical difficulties or unnecessary hardship."},
  {id:"m16", g:"admin", w:1, name:"Owner protest on amendments",
   nyc:"A protest by owners of 20 percent of affected frontage forces a supermajority vote (three-fourths in New York)."},
  {id:"m17", g:"admin", w:1, name:"Minimum-requirements clause",
   nyc:"Provisions are minimum requirements for public health, safety and general welfare; the stricter rule controls in a conflict."}
];
const VERDICTS = {
  copied:{label:"Copied", value:1, desc:"Carried over nearly intact, often in the same words"},
  adapted:{label:"Adapted", value:0.5, desc:"Same idea, changed numbers or mechanics"},
  replaced:{label:"Replaced", value:0, desc:"The topic is handled by a different, non-New York device"},
  absent:{label:"Absent", value:0, desc:"Not in the ordinance"}
};

/* ---------- Built-in test case: Glen Ellyn, 1923 ---------- */
const GLEN_ELLYN = {
  id:"glen-ellyn-1923", pdf:"assets/docs/1923-Zoning-Code-Effective-04-18-1923-Glen-Ellyn-IL.pdf",
  title:"Ordinance No. 512", jurisdiction:"Glen Ellyn, Illinois", year:"1923",
  adopted:"Passed April 18, 1923. Published May 11, 1923. Signed by Village President Herbert S. Gilbert.",
  summary:"Glen Ellyn took New York’s administrative chassis almost whole: the definitions, the court arithmetic, the inner-court formula, the nonconforming-use rule, the 20 percent protest petition and the minimum-requirements clause all read like 1916. What it threw out was New York’s central invention. There are no height districts keyed to street width, no setback planes and no tower rule — just flat limits of 35 and 45 feet. In their place the village added suburban devices New York never used: lot coverage caps, families-per-acre density, front building lines, and an “A” district reserved for single-family houses.",
  findings:{
    m1:{v:"replaced", sec:"Sec. 2", ev:"The Use, Height and Area regulations are uniform in each class of district", note:"One map and four combined classes instead of three independent overlays. Every lot gets a single designation."},
    m2:{v:"copied", sec:"Sec. 2, Sec. 16", ev:"shall be as much a part of this ordinance as if the notations, references and other matters set forth by said map were all fully described herein", note:"Boundary rules in Sec. 16 (streets, alleys, lot lines, map scale) follow the New York pattern."},
    m3:{v:"copied", sec:"Sec. 1", ev:"Street Wall: The main wall nearest to and facing on a street", note:"Street wall, outer court, length of outer court, height of court or yard all appear. Height is measured from sidewalk grade, with added rules for mansard, gable and hip roofs suited to houses."},
    m4:{v:"adapted", sec:"Sec. 2–6", ev:"“A” Residence Districts, “B” Residence Districts, Local Business Districts, Commercial Districts", note:"Four classes, with residence split in two and no unrestricted or industrial district at all, so manufacturing has no home in the village."},
    m5:{v:"copied", sec:"Sec. 4–6", ev:"except for the uses permitted in the “A” Residence Districts and the following uses", note:"Each district inherits the uses of the more restricted ones; Commercial permits “the uses permitted in the other districts.”"},
    m6:{v:"adapted", sec:"Sec. 5", ev:"not more than forty (40) per cent of the floor area devoted to industry or storage purposes incidental to such primary use", note:"New York’s floor-area cap on incidental industry survives, with a five-employee limit added. Unlike New York’s exclusion approach, the 47 business uses are listed one by one."},
    m7:{v:"replaced", sec:"Sec. 3–6", ev:"thirty five (35) feet in height, or two and one half (2½) stories", note:"Flat limits (35 feet in “A”, 45 feet elsewhere) and story counts replace the street-width multiple."},
    m8:{v:"absent", sec:"", ev:"", note:"No setback ratio above a street-wall height."},
    m9:{v:"absent", sec:"", ev:"", note:"No tower provision. Sec. 8 does let public and semi-public buildings reach 60 feet with one extra foot of setback per foot of added height."},
    m10:{v:"copied", sec:"Sec. 8", ev:"Chimneys, cooling towers, elevator bulkheads, fire towers, monuments, pent houses, stacks, stage towers", note:"A near-match of the New York list, continuing through scenery lofts, tanks, water towers, ornamental towers, spires and wireless towers."},
    m11:{v:"adapted", sec:"Sec. 4–6", ev:"two and one half (2½) inches wide for each foot of height of such court", note:"Courts keep New York’s inches-per-foot arithmetic, but rear and side yards become percentages of lot depth and width, independent of building height."},
    m12:{v:"copied", sec:"Sec. 4–6", ev:"nor shall its area be less than twice the square of its required least dimension", note:"Verbatim formula, repeated in each district."},
    m13:{v:"adapted", sec:"Sec. 3", ev:"a rear yard having a depth of not less than fifteen (15) per cent of the depth of the lot", note:"Rear yards required, but as a percentage with a floor of 10 feet and a cap of 25 feet in the “A” district."},
    m14:{v:"copied", sec:"Sec. 7", ev:"may be changed to a use of the same or higher classification", note:"Includes the one-way ratchet (no return to a lower class) and the 50 percent damage rule for rebuilding."},
    m15:{v:"adapted", sec:"Sec. 10", ev:"review the actions of the Building Commissioner in order to determine whether they are in accordance with the provisions of this ordinance", note:"Three members with staggered terms, reviewing the Building Commissioner and recommending boundary changes. No hardship variance clause in 1923; it first appears in the 1955 revision, worded in the Illinois statutory form (“practical difficulties or particular hardship”)."},
    m16:{v:"adapted", sec:"Sec. 18", ev:"twenty (20) per cent of the frontage", note:"Same 20 percent trigger, but a two-thirds vote of the Village Board instead of three-fourths."},
    m17:{v:"copied", sec:"Sec. 13", ev:"shall be held to be the minimum requirements for the promotion of the public safety, health, convenience, comfort, morals, prosperity, and general welfare", note:"Also keeps the rule that the greater restriction controls."}
  },
  departures:[
    {name:"Single-family-only district", sec:"Sec. 3", ev:"Single Family Dwellings", note:"The “A” district permits only detached single-family homes plus civic uses; apartments are pushed to “B”. New York’s residence districts allowed apartments."},
    {name:"Lot coverage caps", sec:"Sec. 3–6", ev:"thirty per cent (30%) of the area of an interior lot", note:"30/35 percent in “A”, 50/60 percent in “B”, 90 percent for commercial buildings. New York controlled bulk through yards and courts, not coverage percentages."},
    {name:"Density by families per acre", sec:"Sec. 3–4", ev:"more than six (6) families on any acre of land", note:"Six families per acre in “A”, twenty in “B”, with a grandfather clause for lots under one-sixth acre recorded before passage."},
    {name:"Front building lines", sec:"Sec. 9", ev:"whose street wall is nearer than thirty feet from the street line", note:"A 30-foot front setback, adjusted to the block average and capped at 35 feet. New York 1916 required no front yards."},
    {name:"Accessory building separation", sec:"Sec. 8", ev:"no accessory building shall be located within ten feet of its rear or side lot line", note:"Applies where that line forms part of the front half of a neighbor’s side line."}
  ],
  lineage:"The pattern suggests Glen Ellyn worked from an intermediate model rather than the 1916 text directly: the New York administrative and court provisions arrive already fused with suburban devices (coverage caps, families per acre, building lines) that were circulating among Midwestern consultants and in early state-model drafts by 1922–23. Those are good places to look for the exact source."
};


function verdictOf(r,m){const f=r.findings[m.id];return f&&VERDICTS[f.v]?f.v:"absent"}
function scoreOf(r,group){
  let n=0,d=0;
  for(const m of MARKERS){if(group&&m.g!==group)continue;n+=m.w*VERDICTS[verdictOf(r,m)].value;d+=m.w}
  return d?Math.round(100*n/d):0;
}


function el(tag,attrs={},...kids){
  const e=document.createElement(tag);
  for(const[k,v]of Object.entries(attrs)){
    if(k==="class")e.className=v;else if(k==="text")e.textContent=v;
    else if(k.startsWith("on"))e.addEventListener(k.slice(2),v);
    else if(v!==false&&v!=null)e.setAttribute(k,v===true?"":v);
  }
  for(const k of kids.flat(Infinity)){if(k==null||k===false)continue;e.append(k.nodeType?k:document.createTextNode(k))}
  return e;
}
function sw(v,title){return el("span",{class:"sw "+v,title:title||VERDICTS[v].label,"aria-label":title||VERDICTS[v].label,role:"img"})}
function toast(msg){const t=document.getElementById("lineage-toast");if(!t)return;t.textContent=msg;t.classList.add("on");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("on"),2200)}
function legend(){return el("div",{class:"legend"},Object.entries(VERDICTS).map(([k,v])=>el("span",{},sw(k),`${v.label} — ${v.desc}`)))}

function renderReport(r){
  const sec=el("section");
  const total=scoreOf(r);
  sec.append(
    el("div",{class:"rep-head"},
      el("div",{},el("p",{class:"jur",text:`${r.jurisdiction}, ${r.year}`}),el("h2",{text:r.title}),r.adopted?el("p",{class:"adopt",text:r.adopted}):null),
      el("div",{class:"score"},el("b",{text:total+"%"}),el("small",{text:"New York 1916 inheritance"}))
    ),
    el("div",{class:"dna"},
      el("div",{class:"strip"},MARKERS.map(m=>{const v=verdictOf(r,m);const s=sw(v,`${m.name}: ${VERDICTS[v].label}`);s.tabIndex=0;
        const jump=()=>{const t=document.getElementById("mk-"+m.id);if(t){t.scrollIntoView({behavior:"smooth",block:"center"});t.classList.add("hl");setTimeout(()=>t.classList.remove("hl"),1600)}};
        s.addEventListener("click",jump);s.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();jump()}});return s})),
      el("div",{class:"cap",text:"Seventeen hallmarks of the 1916 Resolution. Select one to jump to the finding."}),
      legend()
    ),
    el("div",{class:"groups"},GROUPS.map(g=>{const p=scoreOf(r,g.id);return el("div",{class:"g"},el("div",{class:"gn",text:g.name}),el("div",{class:"bar"},el("i",{style:`width:${p}%`})),el("div",{class:"gp",text:p+"%"}))})),
    el("p",{class:"summary",text:r.summary||""})
  );
  sec.append(el("h3",{class:"sec",text:"Hallmark by hallmark"}),el("p",{class:"sec-note",text:"Left: what New York did in 1916. Right: what this ordinance says, with the section it comes from."}));
  for(const g of GROUPS){
    sec.append(el("div",{class:"grp-title",text:g.name}));
    for(const m of MARKERS.filter(x=>x.g===g.id)){
      const f=r.findings[m.id]||{v:"absent",note:"No finding recorded."};const v=verdictOf(r,m);
      sec.append(el("div",{class:"m",id:"mk-"+m.id},
        sw(v),
        el("div",{},el("div",{class:"name",text:m.name}),el("div",{class:"vd",text:VERDICTS[v].label}),el("div",{class:"nyc",text:"New York: "+m.nyc})),
        el("div",{class:"ev"},f.ev?el("q",{text:f.ev}):null,f.sec?el("div",{class:"secref",text:f.sec}):null,el("p",{text:f.note||""}))
      ));
    }
  }
  if(r.departures&&r.departures.length){
    sec.append(el("h3",{class:"sec",text:"Not from New York"}),el("p",{class:"sec-note",text:"Provisions with no counterpart in the 1916 Resolution — clues to the ordinance’s other sources."}));
    for(const d of r.departures)sec.append(el("div",{class:"dep"},el("div",{},el("div",{class:"name",text:d.name}),d.sec?el("div",{class:"secref",style:"color:var(--muted);font-size:14px",text:d.sec}):null),el("p",{},d.ev?el("q",{text:d.ev}):null,d.ev?" ":null,d.note||"")));
  }
  if(r.lineage)sec.append(el("h3",{class:"sec",text:"Where it may have come from"}),el("p",{class:"lineage",text:r.lineage}));
  sec.append(el("div",{class:"actions"},
    el("button",{class:"btn",onclick:()=>copyReport(r)},"Copy report as text"),
    r.pdf?el("a",{class:"btn ghost",href:r.pdf,rel:"noopener"},"Read the 1923 ordinance (PDF)"):null
  ));
  return sec;
}
function copyReport(r){
  const lines=[`${r.title} — ${r.jurisdiction}, ${r.year}`,`New York 1916 inheritance: ${scoreOf(r)}%`,"",r.summary||"",""];
  for(const g of GROUPS){lines.push(`${g.name.toUpperCase()} (${scoreOf(r,g.id)}%)`);
    for(const m of MARKERS.filter(x=>x.g===g.id)){const f=r.findings[m.id]||{};lines.push(`- ${m.name}: ${VERDICTS[verdictOf(r,m)].label}${f.sec?` (${f.sec})`:""}. ${f.note||""}${f.ev?` “${f.ev}”`:""}`)}lines.push("")}
  if(r.departures?.length){lines.push("NOT FROM NEW YORK");r.departures.forEach(d=>lines.push(`- ${d.name}${d.sec?` (${d.sec})`:""}: ${d.note}`));lines.push("")}
  if(r.lineage)lines.push(r.lineage);
  navigator.clipboard?.writeText(lines.join("\n")).then(()=>toast("Report copied"),()=>toast("Copy blocked by the browser"));
}


const EDITIONS=[
  {y:"1923",ord:"Ord. 512",d:"April 1923"},
  {y:"1955",ord:"Ord. 949, as amended to Ord. 1152",d:"May 9, 1955"},
  {y:"1961",ord:"Ord. 1319, full rewrite",d:"Feb. 27, 1961"},
  {y:"1974",ord:"Ord. 1904-Z, full rewrite",d:"Oct. 28, 1974"},
  {y:"1989",ord:"Ord. 3617-Z, Title 10 code",d:"May 8, 1989"},
  {y:"1993",ord:"3617-Z as amended through 4004-Z",d:"Mar. 22, 1993"}
];
const HISTORY=[
  {g:"Framework"},
  {r:"Districts",v:["4: “A” and “B” residence, local business, commercial","5: A single-family, B-1 two-family, B-2 multifamily, C local business, D commercial","7: R1–R3, B1–B3, O-C office-commercial","9 plus three PUD types: R1–R4, C1–C5","CR, R1–R5, C2–C6, with downtown split into C5A and C5B","1989 set plus a new RO estate district"]},
  {r:"How uses are listed",v:["Cumulative; business uses listed one by one","Cumulative; business districts allow anything not on an exclusion list","Permitted and special uses by district; houses barred from business districts","Schedule tables of permitted and special uses","Schedule tables of permitted and special uses","Schedule tables of permitted and special uses"]},
  {g:"Main single-family district"},
  {r:"Minimum lot",v:["None; density cap of 6 families per acre","8,712 sq ft, 66 ft wide","R1: 14,500 sq ft, 90 ft. R2: 8,712 sq ft, 66 ft","R1: 14,500 sq ft, 90 ft. R2: 8,712 sq ft, 66 ft","R1: 14,500 sq ft, 90 ft (108 ft corner). R2: 8,712 sq ft, 66 ft","RO: 18,000 sq ft, 100 ft. R1 and R2 as in 1989"]},
  {r:"Front yard",v:["30 ft, adjusted to block average, never over 35 ft","30 ft, or block average where 40% of frontage is built","R1: 40 ft. R2: 30 ft","R1: 40 ft. R2: 30 ft","R1: 40 ft. R2: 30 ft","R1: 40 ft. R2: 30 ft. Block average where half the frontage is built, up to 50 ft"]},
  {r:"Rear yard",v:["15% of lot depth, 10 to 25 ft","20 ft","R1: 50 ft. R2: 40 ft","R1: 50 ft. R2: 40 ft","R1: 50 ft. R2: 40 ft","R1: 50 ft. R2: 40 ft. RO: 60 ft"]},
  {r:"Side yards",v:["10% of lot width","10% of lot width, 3 to 6 ft","10% of lot width","10% of lot width","10% of lot width","10% of lot width (RO: 15%)"]},
  {r:"Lot coverage",v:["30% interior lot, 35% corner lot","None","None","None for houses (PUDs only)","None for houses (PUDs only)","None for houses (PUDs only)"]},
  {r:"Height",v:["35 ft or 2½ stories","35 ft or 2½ stories","35 ft or 2½ stories","35 ft","35 ft","35 ft"]},
  {g:"Accessory buildings and parking"},
  {r:"Detached garage",v:["10 ft from rear or side lines that border a neighbor’s front half","60 ft from front line; up to 4 cars; 3 ft from lines (6 ft if two stories); 30% of rear yard","One story, 17 ft; 5 ft from interior lot lines; 10 ft from house","450 sq ft plus 200 sq ft per 3,000 sq ft of lot over 6,000, cap 1,000 sq ft; 17 ft; 30% of rear yard","R1 and R2: no garage cap, all accessory buildings 1,000 sq ft total","660 sq ft and 15 ft in R1; all accessory buildings 1,000 sq ft total"]},
  {r:"Parking per house",v:["None","1 space (added by amendment)","1 to 4 spaces","2 spaces","2 spaces","2 spaces"]},
  {g:"Administration"},
  {r:"Nonconforming uses",v:["Continue indefinitely; change only upward; 50% damage rule","Same, plus lapse after 180 days; 60% damage rule","Amortization: removal on schedules of 2 to 40 years","Amortization retained","Amortization of buildings dropped","Amortization of buildings dropped"]},
  {r:"Variances",v:["None; board reviews the Building Commissioner","Hardship variations: board recommends, Trustees decide","Hardship variations","Hardship variations","Hardship variations","Hardship variations, with unique-circumstance and self-created tests"]}
];
const NYC_THREAD=[
  {r:"Courts sized in inches per foot of height",v:[1,0,0,0,0,0]},
  {r:"Inner-court area formula",v:[1,0,0,0,0,0]},
  {r:"Cumulative use hierarchy",v:[1,1,0.5,0.5,0.5,0.5]},
  {r:"Rooftop exception list",v:[1,1,0.5,0.5,0.5,0.5]},
  {r:"Minimum-requirements clause",v:[1,1,1,1,1,1]},
  {r:"20% owner protest, supermajority vote",v:[1,1,null,1,1,1]}
];
const ERAS=[
  {y:"1923",t:"New York’s chassis, suburban engine",p:"Four combined districts, flat 35- and 45-foot limits, and New York’s court arithmetic sitting alongside lot coverage caps and a families-per-acre density rule."},
  {y:"1955",t:"Minimum lots replace density",p:"The families-per-acre cap and the 30 percent coverage limit disappear, replaced by a minimum lot of 8,712 square feet (one-fifth acre) with a 66-foot frontage. New York’s court formulas are gone. Residence splits into single-family, two-family and multifamily districts, the board gains hardship-variation power, and off-street parking arrives by amendment."},
  {y:"1961",t:"The postwar rewrite",p:"A complete replacement in the permitted-use and special-use format of the era. A new R1 tier doubles the minimum lot to 14,500 square feet, rear yards jump from 20 to 40–50 feet, and business districts no longer allow houses, ending the cumulative pyramid. Nonconforming uses face amortization schedules keyed to construction type."},
  {y:"1974",t:"Schedules, PUDs and the garage formula",p:"Regulations move into district schedule tables. Planned unit developments, an office district and a central business district appear, and historic landmarks become a listed use. Garages get their first size formula, scaling from 450 square feet up to a 1,000-square-foot cap, and houses must provide two parking spaces."},
  {y:"1989",t:"The codified Title 10",p:"A consultant-assisted rewrite into chapter-and-section form. Downtown splits into a retail core and a service area capped at 55 feet and 800 feet above sea level. New rules govern substandard lots of record (50 feet and 6,534 square feet), lot mergers, driveways and flood hazards; building amortization disappears. Single-family garages lose their own size formula and fall under a 1,000-square-foot total for all accessory buildings."},
  {y:"1993",t:"Fine-tuning the big lots and the garages",p:"Three amendments add an RO estate district (18,000-square-foot lots, 100-foot width, 15 percent side yards), cap detached garages at 660 square feet in the single-family districts, cut R1 garage height to 15 feet, and tie front setbacks to the block average where half the frontage is built."}
];
function renderHistory(){
  const sec=el("section");
  sec.append(el("p",{class:"lib-intro"},"Six editions of the Glen Ellyn zoning code, read side by side. A shaded cell marks a change from the previous edition; the single-family rows follow the village’s main house district, “A” in 1923 and 1955, R1 and R2 after."),
    el("div",{class:"eds"},EDITIONS.map(e=>el("div",{class:"ed"},el("b",{text:e.y}),el("span",{text:e.ord}),el("span",{text:e.d})))));
  const head=el("tr",{},el("th",{scope:"col",text:""}),EDITIONS.map(e=>el("th",{scope:"col",text:e.y})));
  const body=el("tbody");
  for(const row of HISTORY){
    if(row.g){body.append(el("tr",{class:"grp"},el("th",{colspan:"7",scope:"rowgroup",text:row.g})));continue}
    body.append(el("tr",{},el("th",{scope:"row",text:row.r}),row.v.map((v,i)=>{const same=i>0&&v===row.v[i-1];return el("td",{class:i===0?"":same?"same":"chg",text:same?"No change":v})})));
  }
  sec.append(el("h3",{class:"sec",text:"Regulation by regulation"}),el("div",{class:"tscroll"},el("table",{class:"hx"},el("thead",{},head),body)));
  const nb=el("tbody");
  for(const row of NYC_THREAD)nb.append(el("tr",{},el("th",{scope:"row",text:row.r}),row.v.map(v=>el("td",{class:"mark"},v==null?el("span",{style:"color:var(--muted)",text:"not found in scan"}):sw(v===1?"copied":v===0.5?"adapted":"absent",v===1?"Present":v===0.5?"Present in altered form":"Gone")))));
  sec.append(el("h3",{class:"sec",text:"The New York thread"}),el("p",{class:"sec-note",text:"Which 1916 hallmarks are still visible in each edition. The court arithmetic was the first to go; the 20 percent protest petition and the minimum-requirements clause outlast everything else."}),
    el("div",{class:"tscroll"},el("table",{class:"hx"},el("thead",{},el("tr",{},el("th",{scope:"col",text:""}),EDITIONS.map(e=>el("th",{scope:"col",style:"text-align:center",text:e.y})))),nb)),legend());
  sec.append(el("h3",{class:"sec",text:"What changed in each edition"}),...ERAS.map(e=>{const ed=EDITIONS.find(x=>x.y===e.y);return el("div",{class:"era"},el("div",{class:"yr"},e.y,el("small",{text:ed.ord})),el("div",{},el("h4",{text:e.t}),el("p",{text:e.p})))}));
  sec.append(el("p",{class:"hint",style:"margin-top:22px",text:"Read from scanned copies of each edition of the village code."}));
  return sec;
}


function renderBaseline(){
  return el("section",{},
    el("p",{class:"lib-intro"},"These are the seventeen hallmarks every ordinance is scored against. Weight reflects how central the device was to New York’s scheme: the street-width height rule matters more than a list of rooftop exceptions."),
    el("div",{style:"border-top:1px solid var(--rule)"},
      GROUPS.map(g=>[el("div",{class:"grp-title",text:g.name}),
        MARKERS.filter(m=>m.g===g.id).map(m=>el("div",{class:"base-m"},el("div",{class:"name",text:m.name}),el("p",{text:m.nyc}),el("div",{class:"w",text:"weight "+m.w})))])
    )
  );
}


/* views */
const tabs=document.querySelectorAll("#lineage .ln-tabs button");
let view="report";
function render(){
  tabs.forEach(b=>b.setAttribute("aria-current",b.dataset.view===view?"page":"false"));
  root.replaceChildren(view==="history"?renderHistory():view==="baseline"?renderBaseline():renderReport(GLEN_ELLYN));
}
function go(v){view=v;render();document.getElementById("lineage").scrollIntoView({block:"start"})}
tabs.forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
render();
})();

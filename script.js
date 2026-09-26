const intro=document.getElementById('siteIntro');
const introVideo=document.getElementById('introVideo');
const introSkip=document.getElementById('introSkip');
const introProgress=intro?.querySelector('.site-intro-progress span');
const soundGate=document.getElementById('introSoundGate');
const soundBtn=document.getElementById('introSoundBtn');
const silentBtn=document.getElementById('introSilentBtn');

function finishIntro(){if(!intro||intro.classList.contains('is-done'))return;intro.classList.add('is-done');document.body.classList.remove('intro-active');setTimeout(()=>intro.remove(),950)}
function hideSoundGate(){soundGate?.classList.add('hidden')}
function showSoundGate(){soundGate?.classList.remove('hidden')}

if(introVideo){
  introVideo.addEventListener('timeupdate',()=>{if(introVideo.duration&&introProgress)introProgress.style.width=Math.min(100,introVideo.currentTime/introVideo.duration*100)+'%'});
  introVideo.addEventListener('ended',finishIntro);
  introVideo.addEventListener('error',finishIntro);
  introVideo.muted=false;
  const p=introVideo.play();
  if(p?.catch)p.catch(()=>{introVideo.muted=true;introVideo.play().catch(()=>{});showSoundGate()});
}
soundBtn?.addEventListener('click',()=>{if(!introVideo)return;introVideo.muted=false;introVideo.volume=1;introVideo.play().catch(()=>{});hideSoundGate()});
silentBtn?.addEventListener('click',()=>{if(introVideo)introVideo.muted=true;hideSoundGate()});
introSkip?.addEventListener('click',finishIntro);

const steps=[
 {n:'01',k:'SITE • WATER • VIABILITY',t:'Water<br><em>Selection</em>',p:'Start with the right water, land and environmental conditions. We assess the site before capital is committed.',scene:'scene-water'},
 {n:'02',k:'LAND • DESIGN • INFRASTRUCTURE',t:'Pond<br><em>Preparation</em>',p:'Turn a site into a production-ready pond system with layout, depth, aeration and infrastructure planning.',scene:'scene-pond'},
 {n:'03',k:'SEED • BIOSECURITY • QUALITY',t:'<em>Hatchery</em>',p:'Build a reliable seed pathway through broodstock, spawning, hatchery care and quality seed supply.',scene:'scene-hatchery'},
 {n:'04',k:'FEED • WATER • GROWTH',t:'Grow-out<br><em>Farming</em>',p:'Operate the farm with disciplined feeding, water monitoring, disease control and growth tracking.',scene:'scene-farm'},
 {n:'05',k:'QUALITY • TIMING • VALUE',t:'<em>Harvesting</em>',p:'Plan the harvest around optimal size, market timing, quality handling and better returns.',scene:'scene-harvest'},
 {n:'06',k:'PROCESS • COLD • VALUE',t:'Processing<br><em>& Value Addition</em>',p:'Move beyond raw output with grading, processing, cold storage and value-added products.',scene:'scene-processing'},
 {n:'07',k:'MARKETS • EXPORT • LOGISTICS',t:'Market &<br><em>Supply Chain</em>',p:'Connect production to domestic and global markets through coordinated logistics and market access.',scene:'scene-market'},
 {n:'08',k:'FARMERS • COMMUNITIES • PLANET',t:'The <em>Blue Economy</em>',p:'A connected aquaculture value chain that strengthens farmers, communities, sustainable fisheries and the wider blue economy.',scene:'scene-blue'}
];
const sticky=document.querySelector('.sequence-sticky');
const sequence=document.querySelector('.sequence');
const title=document.getElementById('stepTitle'),text=document.getElementById('stepText'),kicker=document.getElementById('stepKicker'),num=document.getElementById('stepNumber');
const dots=[...document.querySelectorAll('.progress-dot')];
let current=-1, ticking=false;
function renderStep(i){
  if(!title||!text||!kicker||!num||!steps[i]) return;
  if(i===current)return;
  current=i;const s=steps[i];
  title.innerHTML=s.t;text.textContent=s.p;kicker.textContent=s.k;num.textContent=s.n;
  document.querySelectorAll('.scene-object').forEach(x=>x.classList.remove('active'));
  document.querySelector('.'+s.scene)?.classList.add('active');
  document.querySelectorAll('.stage-video').forEach((v,j)=>{
    if(j===i){v.currentTime=0; v.play().catch(()=>{});}
    else {v.pause();}
  });
  dots.forEach((d,j)=>d.classList.toggle('active',j===i));
}
function updateSequence(){
  if(!sequence||!sticky){return;}
  const rect=sequence.getBoundingClientRect();
  const total=sequence.offsetHeight-sticky.offsetHeight;
  const progress=Math.min(1,Math.max(0,-rect.top/Math.max(1,total)));
  const i=Math.min(steps.length-1,Math.floor(progress*steps.length));
  renderStep(i);ticking=false;
}
if(sequence&&sticky&&title&&text&&kicker&&num){
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateSequence);ticking=true}},{passive:true});
  dots.forEach((d,i)=>d.addEventListener('click',()=>{const y=sequence.offsetTop+(sequence.offsetHeight-sticky.offsetHeight)*(i/(steps.length-1));window.scrollTo({top:y,behavior:'smooth'})}));
  renderStep(0);
}

const menu=document.querySelector('.menu'),nav=document.querySelector('.header nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const reveal=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}),{threshold:.1});
document.querySelectorAll('.journey-intro,.section,.service-grid article,.planning-card,.planning-strip>div,.step,.ops-grid>*,.cta-box').forEach(x=>{x.classList.add('reveal');reveal.observe(x)});
document.querySelector('.sequence-bg-video')?.pause();
const yearEl=document.getElementById('year'); if(yearEl) yearEl.textContent=new Date().getFullYear();

/* Project portfolio + interactive India state map */
const projectData = {
  "Kerala": [
    {name:"Establishment of Ready-to-Eat Tuna Canned Processing Unit", scheme:"PMMSY", image:"processing-facility.png"},
    {name:"Strengthening of Primary Fisheries Cooperatives", scheme:"PM-MKSSY", image:"hatchery-farm.png"}
  ],
  "Odisha": [
    {name:"Establishment of FRP Boats, Tanks and Aquarium Manufacturing Unit", scheme:"PMMSY", image:"aquaculture-complex.png"},
    {name:"Establishment of State-of-the-Art 100 TPD Feed Plant", scheme:"MKUY", image:"processing-facility.png"},
    {name:"Establishment of Shrimp Processing Facility", scheme:"PMMSY", image:"processing-facility.png"},
    {name:"Establishment of Intensive Black Soldier Fly Unit – Waste to Wealth", scheme:"CSR Fund", image:"aquaculture-complex.png"},
    {name:"Establishment of Aquatourism Project", scheme:"PMMSY", image:"aquaculture-overview.png"},
    {name:"Establishment of Cluster Biofloc Tanks for Magur and Singi Farming", scheme:"—", image:"ras-tanks.png"}
  ],
  "West Bengal": [
    {name:"Aquaculture Farm Planning", scheme:"—", image:"pond-farming.png"},
    {name:"Fisheries Infrastructure Advisory", scheme:"—", image:"aquaculture-complex.png"},
    {name:"Processing & Value Chain Planning", scheme:"—", image:"processing-facility.png"},
    {name:"DPR & Financial Consultancy", scheme:"—", image:"hatchery-farm.png"}
  ],
  "Telangana": [
    {name:"Establishment of Intensive Murrel Farming in HDPE-Lined Tanks with Retail Outlet", scheme:"PMMSY", image:"pond-farming.png"},
    {name:"Strengthening of Primary Fisheries Cooperatives", scheme:"PM-MKSSY", image:"hatchery-farm.png"},
    {name:"Establishment of RAS Farming Facility with Feed Mill and Retail Outlet", scheme:"PMMSY", image:"ras-tanks.png"},
    {name:"Establishment of Intensive Murrel Nursery Rearing and Grow-out Farming in HDPE-Lined Tanks with Retail Outlet", scheme:"PMMSY", image:"pond-farming.png"},
    {name:"Establishment of Biofloc Unit at KVK Mamnoor, Warangal", scheme:"—", image:"ras-tanks.png"}
  ],
  "Andhra Pradesh": [
    {name:"Establishment of Vannamei Nursery Facility in Biofloc System", scheme:"PMMSY", image:"ras-tanks.png"},
    {name:"Establishment of Intensive Fish Farming with Retail Outlet", scheme:"PMMSY", image:"pond-farming.png"},
    {name:"Establishment of Vannamei Processing Facility", scheme:"PMMSY", image:"processing-facility.png"},
    {name:"Establishment of Marine Finfish Hatchery Facility", scheme:"PMMSY", image:"hatchery-farm.png"},
    {name:"Establishment of Shrimp, Fish Processing and Value Addition Unit", scheme:"MoFPI", image:"processing-facility.png"},
    {name:"Establishment of 100 TPD Shrimp Feed Production Plant", scheme:"PMMSY", image:"processing-facility.png"}
  ]
};
const activeProjectStates = new Set(Object.keys(projectData));
const stateAliases = {
  "West Bengal": "West Bengal",
  "Odisha": "Odisha",
  "Orissa": "Odisha",
  "Telangana": "Telangana",
  "Andhra Pradesh": "Andhra Pradesh",
  "Kerala": "Kerala"
};

function projectStateName(props={}){
  const candidates = [props.ST_NM, props.State_Name, props.state_name, props.name, props.NAME_1, props.st_nm, props.shapeName, props.STATE, props.state, props.State];
  const raw = candidates.find(v => typeof v === 'string' && v.trim()) || '';
  const cleaned = raw.trim().replace(/\s+/g,' ');
  if (stateAliases[cleaned]) return stateAliases[cleaned];
  const key = cleaned.toLowerCase();
  const match = Object.keys(stateAliases).find(k => k.toLowerCase() === key);
  return match ? stateAliases[match] : cleaned;
}

function projectTotal(state){
  return (projectData[state]||[]).reduce((sum,p)=>sum+(p.count||1),0);
}

function renderStateProjects(state){
  const title=document.getElementById('selectedStateName');
  const count=document.getElementById('selectedStateCount');
  const list=document.getElementById('stateProjectList');
  const blueprints=document.getElementById('stateBlueprints');
  if(!title||!count||!list||!blueprints) return;

  const projects=projectData[state]||[];
  const total=projectTotal(state);
  title.textContent=state||'Select a state';
  count.textContent=`${total} project${total===1?'':'s'}`;

  if(!projects.length){
    list.innerHTML='<div class="state-project-empty">No completed project is listed for this state.</div>';
    blueprints.innerHTML='';
    return;
  }

  // Projects tab: clean list of project titles only.
  list.innerHTML=`<div class="project-title-list">${projects.map((p,index)=>`
    <article class="project-title-row">
      <span class="project-title-number">${String(index+1).padStart(2,'0')}</span>
      <div><h4>${p.name}</h4><small>${p.scheme && p.scheme!=='—' ? p.scheme : 'Completed project'}</small></div>
    </article>`).join('')}</div>`;

  // Blueprint tab: show each distinct blueprint image only once per state.
  // Several completed projects share the same visual; dedupe the image while retaining
  // the related project names so the gallery stays clean and informative.
  const uniqueBlueprints = [];
  const blueprintByImage = new Map();
  projects.forEach((p)=>{
    const image = p.image || 'aquaculture-overview.png';
    if(!blueprintByImage.has(image)){
      const entry = {image, names:[p.name]};
      blueprintByImage.set(image, entry);
      uniqueBlueprints.push(entry);
    } else {
      blueprintByImage.get(image).names.push(p.name);
    }
  });
  blueprints.innerHTML=`<div class="blueprint-grid">${uniqueBlueprints.map((p,index)=>`
    <article class="blueprint-card">
      <div class="blueprint-image-wrap">
        <img class="blueprint-image" src="assets/project-gallery/${p.image}" alt="Project blueprint visual for ${p.names[0]}" loading="lazy">
        <span class="blueprint-number">${String(index+1).padStart(2,'0')}</span>
      </div>
      <h4>${p.names[0]}</h4>
      ${p.names.length>1 ? `<p class="blueprint-related">Also covers ${p.names.length-1} related project${p.names.length-1===1?'':'s'} using this blueprint visual.</p>` : ''}
    </article>`).join('')}</div>`;
}

function setupProjectTabs(){
  const tabs=[...document.querySelectorAll('.project-view-tab')];
  const panels=[document.getElementById('stateProjectList'),document.getElementById('stateBlueprints')];
  if(!tabs.length||panels.some(p=>!p)) return;
  tabs.forEach((tab,index)=>tab.addEventListener('click',()=>{
    tabs.forEach((t,i)=>{
      const active=i===index;
      t.classList.toggle('active',active);
      t.setAttribute('aria-selected',String(active));
    });
    panels.forEach((panel,i)=>{
      const active=i===index;
      panel.classList.toggle('active',active);
      panel.hidden=!active;
    });
  }));
}


let projectMap=null;

function setupProjectMap(){
  const mapEl=document.getElementById('indiaProjectsMap');
  if(!mapEl) return;

  const states=[
    ['Kerala','48%','84%'],
    ['Andhra Pradesh','58%','77%'],
    ['Telangana','55%','67%'],
    ['Odisha','68%','62%'],
    ['West Bengal','78%','56%']
  ];
  const projectStates=new Set(Object.keys(projectData));

  mapEl.innerHTML=`
    <div class="static-india-map" aria-label="Interactive India map showing Blue Chain Aqua project states">
      <div class="static-map-title">INDIA · PROJECT COVERAGE</div>
      <img class="static-india-map-image" src="https://commons.wikimedia.org/wiki/Special:Redirect/file/India_states_and_union_territories_map.svg" alt="Map of India showing states and union territories" loading="eager">
      <div class="static-map-hotspots">
        ${states.map(([name,left,top])=>{
          const active=projectStates.has(name);
          const count=(projectData[name]||[]).reduce((sum,p)=>sum+(p.count||1),0);
          return `<button type="button" class="static-state-hotspot ${active?'has-projects':''}" data-state="${name}" style="left:${left};top:${top}" ${active?'':'disabled'} aria-label="${active?'View '+name+' projects':name+' has no listed projects'}"><span>${name}</span>${active?`<b>${count}</b>`:''}</button>`;
        }).join('')}
      </div>
      <div class="static-map-help">Hover a highlighted state for its projects · Click to keep the project list open</div>
      <div class="static-map-tooltip" aria-live="polite"></div>
    </div>`;

  const root=mapEl.querySelector('.static-india-map');
  const tooltip=mapEl.querySelector('.static-map-tooltip');
  const show=(state)=>{
    const projects=projectData[state]||[];
    const total=projects.reduce((sum,p)=>sum+(p.count||1),0);
    tooltip.innerHTML=`<strong>${state}</strong><span>${total} project${total===1?'':'s'}</span><ul>${projects.map(p=>`<li>${p.name}</li>`).join('')}</ul>`;
    tooltip.classList.add('show');
  };
  const hide=()=>tooltip.classList.remove('show');

  root.querySelectorAll('.static-state-hotspot.has-projects').forEach(btn=>{
    btn.addEventListener('mouseenter',()=>show(btn.dataset.state));
    btn.addEventListener('focus',()=>show(btn.dataset.state));
    btn.addEventListener('mouseleave',hide);
    btn.addEventListener('blur',hide);
    btn.addEventListener('click',()=>{
      renderStateProjects(btn.dataset.state);
      root.querySelectorAll('.static-state-hotspot').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');
      show(btn.dataset.state);
    });
  });

  root.querySelector('.static-state-hotspot[data-state="Andhra Pradesh"]')?.classList.add('selected');
  renderStateProjects('Andhra Pradesh');
}

setupProjectTabs();
setupProjectMap();

// Compact state selector used when the large project map is intentionally hidden.
(function(){
  const choices=[...document.querySelectorAll('.project-state-choice')];
  if(!choices.length) return;
  const select=(state)=>{
    choices.forEach(btn=>btn.classList.toggle('is-active',btn.dataset.state===state));
    renderStateProjects(state);
  };
  choices.forEach(btn=>{
    btn.addEventListener('mouseenter',()=>select(btn.dataset.state));
    btn.addEventListener('focus',()=>select(btn.dataset.state));
    btn.addEventListener('click',()=>select(btn.dataset.state));
  });
  select('Andhra Pradesh');
})();

// Keep the project metric linked to the single Projects section.
document.querySelectorAll('.ops-stats > div').forEach((card,index)=>{
  if(index!==1) return;
  card.setAttribute('role','button');
  card.setAttribute('tabindex','0');
  card.setAttribute('aria-label','View projects');
  const open=()=>document.getElementById('track')?.scrollIntoView({behavior:'smooth',block:'start'});
  card.addEventListener('click',open);
  card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
});

/* Blue Chain Aqua Farmer Assistant */
(function(){
  const s=document.createElement('script');
  s.src='chatbot.js';
  s.defer=true;
  document.head.appendChild(s);
})();




/* === Blue Chain Aqua polished interaction layer === */
(function(){
  const DATA={
    "Andhra Pradesh":["Aquaculture Development & Farm Planning","Integrated Fish Farm Development","Cold Chain & Processing Support","Fisheries Infrastructure Planning","Financial & DPR Advisory","Water & Farm Management"],
    "Telangana":["Aquaculture & Fisheries Consulting","Fish Farm Development Planning","Processing & Cold Chain Advisory","DPR & Financial Analysis","Technical Project Support"],
    "Odisha":["Aquaculture Infrastructure Planning","Hatchery & Farm Development","Fish Processing Support","Cold Chain Planning","DPR & Funding Advisory","Technical Consultancy"],
    "West Bengal":["Aquaculture Farm Planning","Fisheries Infrastructure Advisory","Processing & Value Chain Planning","DPR & Financial Consultancy"],
    "Kerala":["Aquaculture Project Planning","Fisheries Infrastructure Consultancy"]
  };

  function selectState(state){
    document.querySelectorAll('.bca-state-pin').forEach(b=>b.classList.toggle('is-active',b.dataset.state===state));
    const title=document.getElementById('bcaSelectedState'), count=document.getElementById('bcaSelectedCount'), list=document.getElementById('bcaProjectList');
    if(!title||!count||!list) return;
    const projects=DATA[state]||[];
    title.textContent=state;
    count.textContent=projects.length+' PROJECTS';
    list.innerHTML=projects.map((p,i)=>'<div class="bca-project-item" style="animation-delay:'+(i*60)+'ms">'+p+'</div>').join('');
  }

  document.querySelectorAll('.bca-state-pin').forEach(el=>{
    el.addEventListener('mouseenter',()=>selectState(el.dataset.state));
    el.addEventListener('click',()=>selectState(el.dataset.state));
  });
  if(document.getElementById('bcaIndiaMap')) selectState('Andhra Pradesh');

  // Large fish + water transition.
  const scene=document.createElement('div');
  scene.className='bca-fish-scene';
  scene.innerHTML=
    '<div class="bca-fish-bubble"></div>'+
    '<div class="bca-fish"><svg viewBox="0 0 330 180" aria-hidden="true">'+
    '<defs><linearGradient id="bcaFishG" x1="0" x2="1"><stop stop-color="#25ddd1"/><stop offset=".48" stop-color="#0796ad"/><stop offset="1" stop-color="#03445e"/></linearGradient></defs>'+
    '<ellipse cx="172" cy="90" rx="112" ry="60" fill="url(#bcaFishG)"/><path d="M66 90 L6 30 L25 90 L6 150 Z" fill="#07556d"/><path d="M135 33 Q170 2 202 35 Q175 45 151 53Z" fill="#12bfc2"/><path d="M136 147 Q172 176 207 143 Q175 137 151 127Z" fill="#087b98"/><ellipse cx="212" cy="73" rx="13" ry="16" fill="#fff"/><circle cx="216" cy="73" r="6" fill="#063b53"/><path d="M207 110 Q236 132 260 103" fill="none" stroke="#7af6e4" stroke-width="6" stroke-linecap="round"/></svg></div>'+
    '<div class="bca-nav-effect bca-nav-about"><i></i><i></i><i></i><i></i></div>'+
    '<div class="bca-nav-effect bca-nav-services"><span></span><span></span><span></span></div>'+
    '<div class="bca-nav-effect bca-nav-planning"><b></b><b></b><b></b><b></b></div>'+
    '<div class="bca-nav-effect bca-nav-process"><em>01</em><em>02</em><em>03</em><em>04</em><em>05</em></div>'+
    '<div class="bca-nav-effect bca-nav-projects"><i></i><i></i><i></i><i></i><i></i></div>'+
    '<div class="bca-nav-effect bca-nav-why"><span></span></div>'+
    '<div class="bca-nav-effect bca-nav-contact"><span>?</span><span>✦</span></div>'+
    '<div class="bca-nav-effect bca-nav-organizations"><i></i><i></i><i></i><i></i><strong></strong></div>';

  for(let i=0;i<18;i++){
    const p=document.createElement('span');
    p.className='bca-water-particle';
    p.style.left=(5+Math.random()*90)+'%';
    p.style.top=(40+Math.random()*55)+'%';
    p.style.animationDelay=(Math.random()*.5)+'s';
    p.style.animationDuration=(.9+Math.random()*.8)+'s';
    scene.appendChild(p);
  }
  document.body.appendChild(scene);

  document.querySelectorAll('a[href]').forEach(a=>{
    const href=a.getAttribute('href');
    if(!href||href.startsWith('#')||href.startsWith('http')||href.startsWith('mailto:')||href.startsWith('tel:')||a.target==='_blank') return;
    a.addEventListener('click',e=>{
      if(e.defaultPrevented) return;
      let dest;
      try{
        dest=new URL(href,location.href);
        if(dest.origin!==location.origin) return;
      }catch(_){return}
      e.preventDefault();
      const path=dest.pathname.toLowerCase();
      const key=path.endsWith('/')||path.endsWith('index.html')?'home':(path.match(/([^/]+)\.html$/)?.[1]||'home');
      scene.className='bca-fish-scene nav-'+key;
      scene.classList.add('is-active');
      setTimeout(()=>location.href=dest.href,760);
    });
  });

  document.querySelectorAll('section,.card,.info-card,.project-card,.service-card,.organization-card').forEach(el=>el.classList.add('bca-3d-card'));
  document.querySelector('main')?.classList.add('bca-page-enter');
})();


/* ===== Project Geography v2 interaction ===== */
(function(){
 const projects={
  "Andhra Pradesh":["Aquaculture Development & Farm Planning","Integrated Fish Farm Development","Cold Chain & Processing Support","Fisheries Infrastructure Planning","Financial & DPR Advisory","Water & Farm Management"],
  "Telangana":["Aquaculture & Fisheries Consulting","Fish Farm Development Planning","Processing & Cold Chain Advisory","DPR & Financial Analysis","Technical Project Support"],
  "Odisha":["Aquaculture Infrastructure Planning","Hatchery & Farm Development","Fish Processing Support","Cold Chain Planning","DPR & Funding Advisory","Technical Consultancy"],
  "West Bengal":["Aquaculture Farm Planning","Fisheries Infrastructure Advisory","Processing & Value Chain Planning","DPR & Financial Consultancy"],
  "Kerala":["Aquaculture Project Planning","Fisheries Infrastructure Consultancy"]
 };
 const counts={"Andhra Pradesh":"06","Telangana":"05","Odisha":"06","West Bengal":"04","Kerala":"02"};
 function activate(state){
  document.querySelectorAll('.bca-state-shape,.bca-map-label').forEach(x=>x.classList.toggle('is-active',x.dataset.state===state));
  const title=document.getElementById('bcaV2State'),count=document.getElementById('bcaV2Count'),list=document.getElementById('bcaV2Projects');
  if(!title||!count||!list)return;
  title.textContent=state; count.textContent=counts[state]||"00";
  list.innerHTML=(projects[state]||[]).map((p,i)=>`<div class="bca-v2-project" style="animation: bcaProjectIn .42s ease both;animation-delay:${i*55}ms"><small>PROJECT ${String(i+1).padStart(2,"0")}</small>${p}</div>`).join("");
 }
 document.querySelectorAll('.bca-state-shape,.bca-map-label').forEach(el=>{
   el.addEventListener('mouseenter',()=>activate(el.dataset.state));
   el.addEventListener('click',()=>activate(el.dataset.state));
 });
 activate("Andhra Pradesh");
})();


// Organization logo fallback: keep cards usable if a bundled logo file is unavailable.
document.querySelectorAll('.organization-logo').forEach(function(img){ img.addEventListener('error',function(){ var w=img.closest('.organization-logo-wrap'); if(w) w.classList.add('logo-broken'); }); });


/* Screenshot / print deterrents requested by site owner. */
(function(){
  document.addEventListener('contextmenu',function(e){e.preventDefault();},{capture:true});
  document.addEventListener('dragstart',function(e){e.preventDefault();},{capture:true});
  document.addEventListener('keydown',function(e){
    const k=(e.key||'').toLowerCase();
    const blocked = k==='printscreen' ||
      (e.ctrlKey && k==='p') || (e.metaKey && k==='p') ||
      (e.ctrlKey && e.shiftKey && (k==='s' || k==='i')) ||
      (e.metaKey && e.shiftKey && (k==='s' || k==='i'));
    if(blocked){ e.preventDefault(); e.stopPropagation(); }
  },{capture:true});
  window.addEventListener('beforeprint',function(){document.documentElement.classList.add('bca-print-blocked');});
})();

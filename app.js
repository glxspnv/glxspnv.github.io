const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
let selected=currentStory.entry,history=[],visited=new Set([currentStory.entry]),edgesVisited=new Set(),arrival='',zoom=.85,variantState={};
const NS='http://www.w3.org/2000/svg',W=currentStory.mapWidth,H=currentStory.mapHeight,NW=205,NH=92;
const svg=$('#graph'),scroll=$('#map-scroll');
svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
$('#work-title').textContent=currentStory.series+' / '+currentStory.title;
$('#work-count').textContent=(Object.keys(nodes).length-1)+'개 장면 · 조건 분기';
$('.stages').innerHTML=currentStory.stages.map(s=>`<button data-jump="${s.node}">${esc(s.label)}</button>`).join('');

const alternatesOf=choice=>choice.alternates||(choice.alternate?[choice.alternate]:[]);

const edgeData=[];
Object.values(nodes).forEach(node=>node.choices.forEach((choice,index)=>{
  const alts=alternatesOf(choice);

  // Conditional destinations are overrides, so draw them before fallback routes.
  alts.forEach(alt=>edgeData.push({
    from:node.id,
    to:alt.to,
    condition:alt.label,
    label:alt.label,
    index,
    alt:true
  }));

  if(choice.weighted){
    choice.outcomes.forEach(outcome=>edgeData.push({
      from:node.id,
      to:outcome.to,
      condition:alts.length?'조건 미충족 · 확률 분기':'확률 분기',
      label:outcome.percent+'%',
      index,
      alt:false,
      weighted:true
    }));
  }else{
    edgeData.push({
      from:node.id,
      to:choice.to,
      condition:choice.condition||(alts.length?'조건 미충족':''),
      index,
      alt:false
    });
  }
}));

function sEl(tag,attrs={},text){
  const e=document.createElementNS(NS,tag);
  Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));
  if(text!==undefined)e.textContent=text;
  return e;
}
function edgeLabel(e){return e.label||e.condition||'';}

function buildGraph(){
  svg.innerHTML='';
  const defs=sEl('defs');
  const marker=sEl('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'});
  marker.append(sEl('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:'#8b819f'}));
  defs.append(marker);svg.append(defs);

  const layers=sEl('g');svg.append(layers);
  edgeData.forEach(e=>{
    let [x1,y1]=positions[e.from],[x2,y2]=positions[e.to];
    x1+=NW/2;y1+=NH;x2+=NW/2;
    let d;
    if(y2<=y1){
      const lane=Math.max(x1,x2)+140;
      d=`M ${x1} ${y1} C ${lane} ${y1+60}, ${lane} ${y2-70}, ${x2} ${y2}`;
    }else{
      const mid=(y1+y2)/2;
      d=`M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`;
    }
    const p=sEl('path',{
      d,
      class:'edge'+(e.condition?' conditional':'')+(e.to==='F'?' ending':''),
      'marker-end':'url(#arrow)'
    });
    e.element=p;layers.append(p);
    const lab=edgeLabel(e);
    if(lab){
      const ly=y2-18,lx=x2;
      layers.append(sEl('text',{x:lx,y:ly,'text-anchor':'middle',class:'edge-label'},lab));
    }
  });

  currentStory.mapLabels.forEach(([t,y])=>svg.append(sEl('text',{x:38,y:y-20,class:'stage-label'},t)));

  Object.values(nodes).forEach(node=>{
    const [x,y]=positions[node.id];
    const group=sEl('g',{
      class:'scene',
      transform:`translate(${x},${y})`,
      tabindex:0,
      role:'button',
      'aria-label':`${node.id}번 ${node.title}`,
      'data-id':node.id
    });
    group.append(sEl('rect',{class:'main',width:NW,height:NH,rx:9}));
    group.append(sEl('text',{x:15,y:22,class:'node-id'},node.id==='F'?'END':`SCENE ${String(node.id).padStart(2,'0')}`));
    group.append(sEl('text',{x:15,y:49,class:'node-title'},node.title.length>17?node.title.slice(0,17)+'…':node.title));

    const weighted=node.choices.find(c=>c.weighted);
    const hasAlternate=node.choices.some(c=>alternatesOf(c).length);
    const meta=node.entry?'item_gun: · 총기 보유'
      :weighted&&hasAlternate?'조건 우선 · 확률 분기'
      :weighted?'확률 분기 · '+weighted.outcomes.map(o=>o.percent+'%').join(' / ')
      :node.choices.length>1?`${node.choices.length}개 선택지`
      :node.choices[0]&&alternatesOf(node.choices[0]).length?'조건에 따른 경로'
      :node.phase==='결말'?'결말'
      :node.id==='F'?'다른 경로 살펴보기'
      :'이야기 진행';

    group.append(sEl('text',{x:15,y:75,class:'node-meta'},meta));
    group.addEventListener('click',()=>select(node.id));
    group.addEventListener('keydown',e=>{
      if(e.key==='Enter'||e.key===' '){e.preventDefault();select(node.id);}
    });
    svg.append(group);
  });
}

function updateGraph(){
  svg.querySelectorAll('.scene').forEach(el=>{
    const id=el.dataset.id;
    el.classList.toggle('selected',String(selected)===id);
    el.classList.toggle('visited',visited.has(id==='F'?'F':Number(id)));
    el.setAttribute('aria-pressed',String(String(selected)===id));
  });
  edgeData.forEach(e=>{
    e.element.classList.toggle('near',String(e.from)===String(selected)||String(e.to)===String(selected));
    e.element.classList.toggle('visited',edgesVisited.has(`${e.from}-${e.to}`));
  });
  document.querySelectorAll('[data-jump]').forEach(b=>b.classList.toggle('active',String(b.dataset.jump)===String(selected)));
}

function variantsOf(text){
  const regex=/\$?\{_getItemCount\('([^']+)'\)([<>])(\d+)\?'([^']*)':'([^']*)'\}/g;
  return Array.from(text.matchAll(regex),m=>({raw:m[0],item:m[1],operator:m[2],value:m[3],yes:m[4],no:m[5]}));
}
function formatText(text,scope){
  let out='',last=0;
  const regex=/\$?\{_getItemCount\('([^']+)'\)([<>])(\d+)\?'([^']*)':'([^']*)'\}/g;
  let m,index=0;
  while((m=regex.exec(text))){
    out+=esc(text.slice(last,m.index));
    const chosen=variantState[scope+'-'+index]??false;
    out+=`<span class="inline-variant">${esc(chosen?m[4]:m[5])}<span class="variant-marker">[조건 ${index+1}]</span></span>`;
    last=regex.lastIndex;index++;
  }
  out+=esc(text.slice(last));
  return out.replace(/\$\{_getLocalVariable\(&#39;([^&]+)&#39;\)\}/g,'<span class="variable">[$1]</span>');
}
function variantDetails(text,scope){
  const variants=variantsOf(text);
  if(!variants.length)return '';
  return `<details class="variants"><summary>조건별 문장 보기 · ${variants.length}개</summary>${variants.map((v,i)=>`<div class="variant-item"><strong>${i+1}. ${esc(v.item)} ${v.operator==='>'&&v.value==='0'?'보유':esc(v.operator+' '+v.value)}</strong><div class="variant-row"><span>충족 시</span><div><p>${esc(v.yes.trim()||'(추가 문장 없음)')}</p><button data-variant="${scope}-${i}" data-value="true">이 문장으로 읽기</button></div></div><div class="variant-row"><span>미충족</span><div><p>${esc(v.no.trim()||'(추가 문장 없음)')}</p><button data-variant="${scope}-${i}" data-value="false">이 문장으로 읽기</button></div></div></div>`).join('')}</details>`;
}
function pickWeighted(pool,random=Math.random){
  return pool[Math.min(pool.length-1,Math.floor(random()*pool.length))];
}

function weightedMarkup(ch,i){
  const alts=alternatesOf(ch);
  const probabilityLabel=ch.outcomes.map(o=>`${o.to}번 ${o.percent}%`).join(' / ');

  if(alts.length){
    return `<div class="choice probability-choice">
      <div class="choice-main">
        <div class="choice-top">
          <span>${formatText(ch.text,`choice-${selected}-${i}`)}</span>
          <span class="choice-arrow">⑂</span>
        </div>
        ${ch.effect?`<div class="choice-meta"><span class="effect">${esc(ch.effect)}</span></div>`:''}
      </div>
      <div class="judgment">
        ${alts.map((alt,ai)=>`<button data-choice="${i}" data-alt-index="${ai}">${esc(alt.label)} <span class="destination">→ ${alt.to}</span></button>`).join('')}
        <button data-choice="${i}" data-fallback="weighted">${esc(alts.length===1?alts[0].base:'모든 조건 미충족')} <span class="destination">→ 확률 분기</span></button>
      </div>
      <div class="choice-meta probability-meta">
        <span class="condition">조건 미충족 시 · ${esc(probabilityLabel)}</span>
      </div>
      <div class="judgment probability-results">
        ${ch.outcomes.map(o=>`<button data-choice="${i}" data-outcome="${o.to}">${o.percent}% 결과 보기 <span class="destination">→ ${o.to}</span></button>`).join('')}
      </div>
    </div>${variantDetails(ch.text,`choice-${selected}-${i}`)}`;
  }

  return `<div class="choice probability-choice">
    <div class="choice-main">
      <div class="choice-top">
        <span>${formatText(ch.text,`choice-${selected}-${i}`)}</span>
        <span class="choice-arrow">⑂</span>
      </div>
      <div class="choice-meta">
        <span class="condition">확률 분기 · ${esc(probabilityLabel)}</span>
        ${ch.effect?`<span class="effect">${esc(ch.effect)}</span>`:''}
      </div>
    </div>
    <button class="roll-choice" data-choice="${i}">확률대로 진행하기 <span>↗</span></button>
    <div class="judgment">
      ${ch.outcomes.map(o=>`<button data-choice="${i}" data-outcome="${o.to}">${o.percent}% 결과 보기 <span class="destination">→ ${o.to}</span></button>`).join('')}
    </div>
  </div>${variantDetails(ch.text,`choice-${selected}-${i}`)}`;
}

function branchedMarkup(ch,i){
  const alts=alternatesOf(ch);
  const defaultLabel=alts.length===1?alts[0].base:'모든 조건 미충족';
  return `<div class="choice">
    <div class="choice-main">
      <div class="choice-top">
        <span>${formatText(ch.text,`choice-${selected}-${i}`)}</span>
        <span class="choice-arrow">⑂</span>
      </div>
      ${ch.condition||ch.effect?`<div class="choice-meta">${ch.condition?`<span class="condition">${esc(ch.condition)}</span>`:''}${ch.effect?`<span class="effect">${esc(ch.effect)}</span>`:''}</div>`:''}
    </div>
    <div class="judgment">
      ${alts.map((alt,ai)=>`<button data-choice="${i}" data-alt-index="${ai}">${esc(alt.label)} <span class="destination">→ ${alt.to}</span></button>`).join('')}
      <button data-choice="${i}">${esc(defaultLabel)} <span class="destination">→ ${ch.to}</span></button>
    </div>
  </div>${variantDetails(ch.text,`choice-${selected}-${i}`)}`;
}

function normalMarkup(ch,i){
  return `<div class="choice">
    <button class="choice-main" data-choice="${i}">
      <div class="choice-top">
        <span>${formatText(ch.text,`choice-${selected}-${i}`)}</span>
        <span class="choice-arrow">↗</span>
      </div>
      ${ch.condition||ch.effect?`<div class="choice-meta">${ch.condition?`<span class="condition">${esc(ch.condition)}</span>`:''}${ch.effect?`<span class="effect">${esc(ch.effect)}</span>`:''}</div>`:''}
    </button>
  </div>${variantDetails(ch.text,`choice-${selected}-${i}`)}`;
}

function renderReader(){
  const node=nodes[selected],scope='body-'+selected;
  const rawChoices=node.choices.map(ch=>ch.raw||`${ch.to} · ${ch.text}`).join('\n\n');

  $('#reader').innerHTML=`<article class="reader-content">
    <div class="scene-kicker">${node.id==='F'?'END OF ROUTE':`SCENE ${String(node.id).padStart(2,'0')}`}<span class="phase-badge">${node.phase}</span></div>
    <h2 class="scene-heading">${esc(node.title)}</h2>
    ${history.length?`<div class="trail">읽어온 장면 ${history.slice(-7).map((h,i)=>`<button data-history="${Math.max(0,history.length-7)+i}">${String(h.id).padStart(2,'0')}</button>`).join(' › ')} › ${String(selected).padStart(2,'0')}</div>`:''}
    ${node.entry?`<div class="entry-note">${esc(node.entry)}</div>`:''}
    ${arrival?`<div class="arrival">선택 결과 · ${esc(arrival)}</div>`:''}
    <div class="scene-text">${formatText(node.body,scope).split(/\n\n/).map(p=>`<p class="${p.trim().startsWith('“')?'dialogue':''}">${p}</p>`).join('')}</div>
    ${variantDetails(node.body,scope)}
    ${node.choices.length
      ? `<div class="choice-header"><h3>선택지</h3><span>선택하면 다음 장면으로</span></div>
         <div class="choices">${node.choices.map((ch,i)=>{
           if(ch.weighted)return weightedMarkup(ch,i);
           if(alternatesOf(ch).length)return branchedMarkup(ch,i);
           return normalMarkup(ch,i);
         }).join('')}</div>`
      : `<div class="end-actions"><button id="end-restart">처음부터 읽기</button><button id="end-reward">주요 선택으로 돌아가기</button></div>`}
    ${selected!=='F'?`<details class="source"><summary>대사 원문 · 분기 데이터</summary><pre>${esc(node.id+':: '+node.body)}</pre><pre>${esc(rawChoices)}</pre></details>`:''}
  </article>`;

  $('#back').disabled=!history.length;

  $('#reader').querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
    const ch=node.choices[Number(b.dataset.choice)];
    const alts=alternatesOf(ch);
    let to=ch.to;
    let effect=ch.effect||'';

    // Conditional destination always bypasses the weighted/default fallback.
    if(b.dataset.altIndex!==undefined){
      const alt=alts[Number(b.dataset.altIndex)];
      if(!alt)return;
      to=alt.to;
      effect=[effect,`${alt.label} → ${alt.to}번`].filter(Boolean).join(' / ');
    }else if(ch.weighted){
      to=b.dataset.outcome!==undefined
        ? (b.dataset.outcome==='F'?'F':Number(b.dataset.outcome))
        : pickWeighted(ch.weighted);
      const probability=ch.outcomes.find(o=>String(o.to)===String(to))?.percent;
      effect=[effect,`${b.dataset.outcome!==undefined?'결과 열람':'조건 미충족 · 확률 진행'} · ${probability}% 경로 → ${to}번`].filter(Boolean).join(' / ');
    }

    edgesVisited.add(`${selected}-${to}`);
    select(to,effect);
  }));

  $('#reader').querySelectorAll('[data-variant]').forEach(b=>b.addEventListener('click',()=>{
    const top=$('#reader-scroll').scrollTop;
    variantState[b.dataset.variant]=b.dataset.value==='true';
    renderReader();
    $('#reader').querySelectorAll('.variants').forEach(d=>d.open=true);
    $('#reader-scroll').scrollTop=top;
  }));

  $('#reader').querySelectorAll('[data-history]').forEach(b=>b.addEventListener('click',()=>{
    const ix=Number(b.dataset.history),h=history[ix];
    history=history.slice(0,ix);
    select(h.id,h.arrival,false);
  }));

  $('#end-restart')?.addEventListener('click',restart);
  $('#end-reward')?.addEventListener('click',()=>select(currentStory.rewardNode));
}

function select(id,effect='',push=true){
  if(!nodes[id])return;
  if(push&&String(id)!==String(selected))history.push({id:selected,arrival});
  selected=id;arrival=effect;visited.add(id);
  renderReader();updateGraph();
  $('#reader-scroll').scrollTop=0;
  focusNode();
  if(window.innerWidth<=760)$('#reader').scrollIntoView({behavior:'smooth',block:'start'});
}
function focusNode(){
  const [x,y]=positions[selected];
  scroll.scrollTo({left:(x+NW/2)*zoom-scroll.clientWidth/2,top:(y+NH/2)*zoom-scroll.clientHeight/2,behavior:'auto'});
}
function setZoom(z,focus=true){
  zoom=Math.max(.1,Math.min(1.5,z));
  $('#map-canvas').style.width=W*zoom+'px';
  $('#map-canvas').style.height=H*zoom+'px';
  $('#zoom-label').textContent=Math.round(zoom*100)+'%';
  if(focus)focusNode();
}
function restart(){
  history=[];visited=new Set([currentStory.entry]);edgesVisited.clear();arrival='';variantState={};
  select(currentStory.entry,'',false);
}

$('#back').addEventListener('click',()=>{const h=history.pop();if(h)select(h.id,h.arrival,false);});
$('#restart').addEventListener('click',restart);
$('#zoom-in').addEventListener('click',()=>setZoom(zoom+.15));
$('#zoom-out').addEventListener('click',()=>setZoom(zoom-.15));
$('#fit').addEventListener('click',()=>{setZoom(Math.min(scroll.clientWidth/W,scroll.clientHeight/H),false);scroll.scrollTo(0,0);});
$('#focus').addEventListener('click',()=>setZoom(.85));
document.querySelectorAll('[data-jump]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.jump))));

let drag=null;
scroll.addEventListener('pointerdown',e=>{
  if(e.target.closest('.scene')||e.pointerType==='touch')return;
  drag={x:e.clientX,y:e.clientY,left:scroll.scrollLeft,top:scroll.scrollTop};
  scroll.setPointerCapture(e.pointerId);
  scroll.classList.add('dragging');
});
scroll.addEventListener('pointermove',e=>{
  if(drag){
    scroll.scrollLeft=drag.left-(e.clientX-drag.x);
    scroll.scrollTop=drag.top-(e.clientY-drag.y);
  }
});
function stopDrag(){drag=null;scroll.classList.remove('dragging');}
scroll.addEventListener('pointerup',stopDrag);
scroll.addEventListener('pointercancel',stopDrag);

buildGraph();renderReader();updateGraph();setZoom(.85);
window.addEventListener('resize',focusNode);

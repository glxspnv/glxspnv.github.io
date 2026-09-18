const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeText;
function autoPreview(p){const first=Object.values(p.nodes).find(n=>n.choices.length>1)||p.nodes[p.entry];const children=[...new Set(first.choices.flatMap(c=>[...(c.weighted||[c.to]),...(c.alternate?[c.alternate.to]:[])]))].slice(0,3);const box=(n,x,y)=>`<g transform="translate(${x},${y})"><rect width="150" height="58" rx="5"/><text class="preview-id" x="12" y="19">${e(n.id)}</text><text x="12" y="42">${e(n.title.slice(0,10))}</text></g>`;return `<svg viewBox="0 0 560 320" role="img" aria-label="${e(p.title)} 주요 분기"><g class="connections">${children.map((id,i)=>`<path d="M280 81V102H${100+i*180}V160"/>`).join('')}</g>${box(first,205,23)}${children.map((id,i)=>box(p.nodes[id],25+i*180,160)).join('')}<text x="280" y="285" text-anchor="middle">${Object.keys(p.nodes).length-1}개 장면 · 클릭해서 대사 읽기</text></svg>`;}
(async()=>{
const gameId=new URLSearchParams(location.search).get('game');
const chosenGame=portfolioGames.find(g=>g.id===gameId);
const gameMeta=document.getElementById('game-meta');
if(gameMeta) gameMeta.style.display=chosenGame?.id==='seoul'?'flex':'none';
const {projects,errors,notice}=await loadProjects();
const gameProjects=projects.filter(p=>p.game===gameId);
document.getElementById('game-title').textContent=chosenGame?.name||'게임을 찾을 수 없습니다';
if(!chosenGame){document.getElementById('game-description').textContent='작품 목록에서 게임을 다시 선택해 주세요.';}
else if(chosenGame.id!=='seoul'){document.getElementById('game-description').textContent='게임별 시나리오와 작업물을 살펴보세요.';}
document.getElementById('game-work-count').textContent=gameProjects.length?gameProjects.length+'개 작업물':'';
document.title=(chosenGame?.name||'게임')+' — 게임 시나리오 포트폴리오';
document.getElementById('project-list').innerHTML=gameProjects.map((p,i)=>`<article class="project"><div class="project-copy"><div class="project-kicker"><span>${String(i+1).padStart(2,'0')}</span>${e(p.category)}</div><p class="series">${e(p.series)}</p><h3><a href="reader.html?story=${encodeURIComponent(p.slug)}">${e(p.title)}</a></h3><p class="description">${e(p.description)}</p><div class="tags">${p.tags.map(t=>`<span>${e(t)}</span>`).join('')}</div><a class="open-work" href="reader.html?story=${encodeURIComponent(p.slug)}">시나리오 펼쳐보기 <span aria-hidden="true">↗</span></a></div><a class="project-preview" href="reader.html?story=${encodeURIComponent(p.slug)}" aria-label="${e(p.title)} 분기도와 대사 열기"><div class="preview-top"><span>NARRATIVE MAP</span><span>주요 분기 일부</span></div>${autoPreview(p)}<div class="preview-bottom"><span>분기 구조</span><i></i><span>원문 대사</span><i></i><span>조건별 전개</span></div></a></article>`).join('');

if(chosenGame&&!gameProjects.length)document.getElementById('project-list').innerHTML='<div class="empty-works"><p>공개할 작업물을 준비 중입니다.</p><a href="/">다른 게임 보기 ↗</a></div>';

if(notice||errors.length){const note=document.createElement("p");note.setAttribute("role","status");note.textContent=[notice,...errors].filter(Boolean).join(" / ");document.getElementById("project-list").prepend(note);}
})().catch(error=>{document.getElementById("project-list").textContent="원고를 불러오지 못했습니다. "+error.message;});

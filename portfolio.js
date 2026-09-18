const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeText;
function previewMarkup(preview){if(!preview||preview.length!==5)return '';const box=(p,x,y,w)=>`<g transform="translate(${x},${y})"><rect width="${w}" height="58" rx="5"/><text class="preview-id" x="12" y="19">${e(p.id)}</text><text x="12" y="42">${e(p.title)}</text></g>`;return `<svg viewBox="0 0 560 320" role="img" aria-label="쥐 제압 방식 선택에서 총성, 캐리, 파이프질로 갈라진 뒤 소장 공격 장면으로 합류하는 주요 분기"><g class="connections"><path d="M280 81V102H100V132M280 102V132M280 102H460V132M100 190V218H280V248M280 190V248M460 190V218H280"/></g>${box(preview[0],175,23,210)}${box(preview[1],25,132,150)}${box(preview[2],205,132,150)}${box(preview[3],385,132,150)}${box(preview[4],175,248,210)}<g class="preview-condition"><text x="100" y="123">${e(preview[1].condition)}</text><text x="280" y="123">${e(preview[2].condition)}</text><text x="460" y="123">${e(preview[3].condition)}</text></g></svg>`;}
const gameId=new URLSearchParams(location.search).get('game');
const chosenGame=portfolioGames.find(g=>g.id===gameId);
const gameProjects=portfolioProjects.filter(p=>p.game===gameId);
document.getElementById('game-title').textContent=chosenGame?.name||'게임을 찾을 수 없습니다';
if(!chosenGame){document.getElementById('game-description').textContent='작품 목록에서 게임을 다시 선택해 주세요.';}
else if(chosenGame.id!=='seoul'){document.getElementById('game-description').textContent='게임별 시나리오와 작업물을 살펴보세요.';}
document.getElementById('game-work-count').textContent=gameProjects.length?gameProjects.length+'개 작업물':'';
document.title=(chosenGame?.name||'게임')+' — 게임 시나리오 포트폴리오';
document.getElementById('project-list').innerHTML=gameProjects.map((p,i)=>`<article class="project"><div class="project-copy"><div class="project-kicker"><span>${String(i+1).padStart(2,'0')}</span>${e(p.category)}</div><p class="series">${e(p.series)}</p><h3><a href="reader.html?story=${encodeURIComponent(p.slug)}">${e(p.title)}</a></h3><p class="description">${e(p.description)}</p><div class="tags">${p.tags.map(t=>`<span>${e(t)}</span>`).join('')}</div><a class="open-work" href="reader.html?story=${encodeURIComponent(p.slug)}">시나리오 펼쳐보기 <span aria-hidden="true">↗</span></a></div><a class="project-preview" href="reader.html?story=${encodeURIComponent(p.slug)}" aria-label="${e(p.title)} 분기도와 대사 열기"><div class="preview-top"><span>NARRATIVE MAP</span><span>주요 분기 일부</span></div>${previewMarkup(p.preview)}<div class="preview-bottom"><span>분기 구조</span><i></i><span>원문 대사</span><i></i><span>조건별 전개</span></div></a></article>`).join('');

if(chosenGame&&!gameProjects.length)document.getElementById('project-list').innerHTML='<div class="empty-works"><p>공개할 작업물을 준비 중입니다.</p><a href="/">다른 게임 보기 ↗</a></div>';

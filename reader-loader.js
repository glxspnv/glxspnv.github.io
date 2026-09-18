let currentStory,nodes,positions;
(async()=>{try{
document.querySelector('#reader').textContent='원고를 불러오는 중입니다…';
const result=await loadProjects();
const slug=new URLSearchParams(location.search).get('story');
currentStory=result.projects.find(p=>p.slug===slug)||(!slug?result.projects[0]:null);
if(!currentStory)throw Error(result.errors.join('\n')||'작품을 찾을 수 없습니다.\n작품 목록에서 다시 선택해 주세요.');
nodes=currentStory.nodes;positions=currentStory.positions;
document.querySelector('.home-link').href='game.html?game='+encodeURIComponent(currentStory.game);
document.title=currentStory.title+' — 게임 시나리오 포트폴리오';
const app=document.createElement('script');
app.src='app.js?v=condition-route-4';
app.onerror=()=>{document.querySelector('#reader').textContent='뷰어를 불러오지 못했습니다. 새로고침해 주세요.';};
document.body.append(app);
}catch(error){document.querySelector('#reader').textContent=error.message;}})();

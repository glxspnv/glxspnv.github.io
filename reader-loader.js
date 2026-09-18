const storySlug = new URLSearchParams(location.search).get('story');
const currentStory = portfolioProjects.find(p=>p.slug===storySlug) || (!storySlug ? portfolioProjects[0] : null);
if (!currentStory) {
document.title='작품을 찾을 수 없습니다';
document.querySelector('.workspace').innerHTML='<section style="padding:48px;background:#fff;grid-column:1/-1"><h2>작품을 찾을 수 없습니다.</h2><p><a href="/">작품 목록으로 돌아가기</a></p></section>';
} else {
document.querySelector('.home-link').href='game.html?game='+encodeURIComponent(currentStory.game);
document.title=currentStory.series+' · '+currentStory.title+' — 게임 시나리오 포트폴리오';
document.querySelector('meta[name="description"]').content=currentStory.description;
const script=document.createElement('script');script.src=currentStory.script;
script.onload=()=>{const app=document.createElement('script');app.src='app.js';document.body.append(app);};
script.onerror=()=>{document.querySelector('#reader').innerHTML='<div class="reader-content"><h2>시나리오를 불러오지 못했습니다.</h2><p>페이지를 새로고침하거나 <a href="/">작품 목록</a>으로 돌아가 주세요.</p></div>';};
document.body.append(script);
}

window.portfolioProjects = [{
slug:'yeppi-rat', game:'seoul', series:'예삐전', title:'괴물쥐 사냥', category:'분기형 시나리오',
description:'괴물쥐를 쫓던 사냥꾼이 폐허가 된 연구소에 도착한다. 쥐를 처분하려는 소장과 한 마리만은 살리고 싶은 연구원. 사냥 끝에 남는 것은 누구의 마음일까.',
tags:['블랙 코미디','포스트 아포칼립스','아이템·능력 분기'],script:'stories/yeppi-rat.js',entry:0,start:0,rewardNode:13,mapWidth:1260,mapHeight:2820,
stages:[{label:'도입',node:0},{label:'제압',node:7},{label:'사격',node:9},{label:'보상',node:13},{label:'결말',node:15}],
mapLabels:[['01 · 도입',65],['02 · 제압 방식',1000],['03 · 사격 판정',1520],['04 · 보상과 관계',2210]],
preview:[{id:'07',title:'쥐 제압 방식 선택'},{id:'08',title:'총성',condition:'총기 + 탄약'},{id:'23',title:'캐리의 몰이',condition:'캐리'},{id:'25',title:'파이프질',condition:'괴상함 성공'},{id:'09',title:'소장을 공격하는 쥐'}]
}];

window.portfolioProjects.push({
slug:'bitter-kim',game:'seoul',series:'기본 인카운터',title:'비터킴과 고디바양',category:'분기형 시나리오',
description:'개미 행렬을 따라 만난 쇼콜라티에 비터킴. 고디바 양을 향한 짝사랑과 라이벌에 대한 질투가 초콜릿 연구로 이어진다. 도움, 거래, 협박 중 어떤 선택을 할까.',
tags:['블랙 코미디','기존 인카운터 연계','가중 확률 분기'],script:'stories/bitter-kim.js',entry:0,rewardNode:10,mapWidth:1990,mapHeight:2770,
stages:[{label:'만남',node:0},{label:'선택',node:10},{label:'초콜릿',node:11},{label:'시식',node:18},{label:'중개',node:23},{label:'위협',node:28}],
mapLabels:[['01 · 만남',60],['02 · 도움과 위협',1140],['03 · 선택의 결과',2320]],
preview:[{id:'10',title:'비터킴의 부탁'},{id:'11',title:'초콜릿 건네기',condition:'초콜릿'},{id:'18',title:'특제 초콜릿',condition:'초콜릿 없음'},{id:'23',title:'발전기 소개',condition:'수리 아이템 + 무한동력'},{id:'',title:'선택마다 다른 결말'}],previewIndependent:true,
previewAlt:'비터킴의 부탁에서 초콜릿 건네기, 특제 초콜릿 시식, 발전기 소개로 갈라지는 분기'
});

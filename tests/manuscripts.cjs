const {strict:assert}=require('assert'),fs=require('fs'),vm=require('vm'),{parse}=require('../story-engine');
const read=name=>parse(fs.readFileSync(`stories/${name}.txt`,'utf8'),`stories/${name}.txt`);
const b=read('bitter-kim'),y=read('yeppi-rat');assert.equal(Object.keys(b.nodes).length,33);assert.equal(Object.keys(y.nodes).length,30);assert.equal(b.nodes[8].choices[1].to,26);assert.equal(b.nodes[22].choices[0].effect,'+돈,-초콜릿');assert.deepEqual(b.nodes[11].choices[0].outcomes.map(x=>x.percent),[60,40]);assert.equal(b.nodes[8].choices[2].alternate.to,27);assert.equal(y.nodes[10].choices[0].alternate.to,27);
for(const p of [b,y]){assert.equal(p.entry,0);assert.equal(new Set(Object.values(p.positions).map(String)).size,Object.keys(p.nodes).length);}
const newStory=parse('새 작품\n\n9::처음\n10//계속\n10::다시\n9//돌아간다\nf//끝','stories/student/새작품.txt');assert.equal(newStory.title,'새 작품');assert.equal(newStory.entry,9);assert.equal(newStory.game,'student');assert.equal(Object.keys(newStory.positions).length,3);assert.throws(()=>parse('0::시작\n5//없는 장면'),/없는 장면/);assert.throws(()=>parse('0::시작\n0::중복'),/중복/);
// Discovery includes a brand-new manuscript without adding it to a catalog.
(async()=>{let calls=[];const context={window:{},location:{hostname:'glxspnv.github.io',pathname:'/game.html'},AbortSignal,StoryEngine:{parse},fetch:async url=>{calls.push(url);return {ok:true,json:async()=>({tree:[{type:'blob',path:'stories/new.txt',sha:'abc'},{type:'blob',path:'stories/old.js'}]}),text:async()=>'0::새 원고\nf//끝'};}};vm.createContext(context);vm.runInContext(fs.readFileSync('projects.js','utf8'),context);const result=await context.window.loadProjects();assert.equal(result.projects.length,1);assert.equal(result.projects[0].slug,'new');assert.equal(calls.length,2);console.log('PASS: manuscripts, corrections, weights, gun routes, cycles, first node, validation, automatic discovery');})().catch(e=>{console.error(e);process.exitCode=1;});

assert.deepEqual(b.tags,['블랙 코미디','기존 인카운터 연계','가중 확률 분기']);
assert.deepEqual(y.tags,['블랙 코미디','포스트 아포칼립스','아이템·능력 분기']);
assert.deepEqual(parse('@tags #짝사랑, 거래, 짝사랑, , <태그>\n0::본문').tags,['짝사랑','거래','<태그>']);
assert.deepEqual(parse('@tags\n0::본문').tags,[]);
assert.equal(parse('@node 0 나만의 제목\n0::본문').nodes[0].title,'나만의 제목');
assert.equal(parse('0::본문').nodes[0].title,'본문');
console.log('PASS: editable tags, original tags, empty tags, custom node titles, title fallback');

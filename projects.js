/* Discover text files in this public GitHub Pages repository. */
window.loadProjects=async function(){
 const esc=s=>encodeURIComponent(s);let files,notice='';
 const owner=location.hostname.endsWith('.github.io')?location.hostname.split('.')[0]:'glxspnv';
 const repo=location.hostname.endsWith('.github.io')&&location.pathname.split('/').filter(Boolean).length>1?location.pathname.split('/')[1]:owner+'.github.io';
 try{
 if(!location.hostname.endsWith('.github.io')) throw Error('로컬 미리보기');
 const response=await fetch(`https://api.github.com/repos/${esc(owner)}/${esc(repo)}/git/trees/HEAD?recursive=1`,{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('목록 응답 '+response.status);const tree=await response.json();if(tree.truncated)throw Error('저장소 목록이 너무 큽니다.');files=tree.tree.filter(f=>f.type==='blob'&&/^stories\/.+\.txt$/i.test(f.path));
 }catch(error){const response=await fetch('stories/index.json',{cache:'no-store'});if(!response.ok)throw error;files=await response.json();notice=location.hostname.endsWith('.github.io')?'자동 목록을 확인하지 못해 기본 작품 목록을 표시합니다. 새 작품이 안 보이면 잠시 후 새로고침해 주세요.':'';}
 const results=await Promise.all(files.map(async f=>{try{const r=await fetch(f.path.split('/').map(esc).join('/')+'?v='+esc(f.sha||Date.now()),{cache:'no-store'});if(!r.ok)throw Error('원고 응답 '+r.status);return {project:StoryEngine.parse(await r.text(),f.path)};}catch(error){return {error:f.path+': '+error.message};}}));
 const projects=[],errors=[];for(const result of results){if(result.error){errors.push(result.error);continue;}if(projects.some(p=>p.slug===result.project.slug)){errors.push(result.project.path+': 작품 ID가 중복됩니다.');continue;}projects.push(result.project);}projects.sort((a,b)=>a.path.localeCompare(b.path));return {projects,errors,notice};
};

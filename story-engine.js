/* Manuscripts are data; expressions are displayed, never executed. */
(function(root){
const id=s=>/^f$/i.test(s)?'F':Number(s);
function parse(source,path='stories/story.txt'){
 source=source.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');const meta={},titles={},nodes={},order=[];let node=null,body=[],preamble=[];
 const finish=()=>{if(node)node.body=body.join('\n').trim();body=[];};
 for(const [offset,line] of source.split('\n').entries()){
 let m;if((m=line.match(/^@node\s+(\d+)\s+(.+)$/))){titles[m[1]]=m[2];continue;}
 if((m=line.match(/^@(id|game|title|series|description|tags)(?:[ \t]+(.*))?$/))){meta[m[1]]=m[2]||'';continue;}
 if((m=line.match(/^(\d+)::\s*(.*)$/))){finish();const key=Number(m[1]);if(nodes[key])throw Error(`${offset+1}행: ${key}번 장면이 중복됩니다.`);node=nodes[key]={id:key,body:'',choices:[],phase:'장면'};order.push(key);body.push(m[2]);continue;}
 if((m=line.match(/^((?:\d+|[fF])(?:,(?:\d+|[fF]))*)\//))){if(!node)throw Error(`${offset+1}행: 선택지 앞에 장면이 필요합니다.`);
 // Ignore slashes inside quoted expressions and parenthesized author notes.
 const fields=[];let part='',quote='',depth=0;for(const char of line){if(quote){part+=char;if(char===quote)quote='';continue;}if((char==="'"||char==='"')&&depth>0){quote=char;part+=char;continue;}if(char==='{'||char==='(')depth++;if(char==='}'||char===')')depth--;if(char==='/'&&depth===0){fields.push(part);part='';}else part+=char;}fields.push(part);
 const [dest,condition='',text='',effect='',alternate='']=fields;if(fields.length<3||fields.length>5)throw Error(`${offset+1}행: 선택지 구분자 /를 확인해 주세요.`);
 const c={to:id(dest.split(',')[0]),text,condition,effect,raw:line};
 const note=text.match(/\((?:#|hide if)[\s\S]*\)$/);if(note){c.condition=[condition,note[0].slice(1,-1)].filter(Boolean).join(' · ');c.text=text.slice(0,note.index).trim();}
 if(dest.includes(',')){c.weighted=dest.split(',').map(id);c.outcomes=[...new Set(c.weighted)].map(to=>({to,weight:c.weighted.filter(x=>x===to).length,percent:Number((c.weighted.filter(x=>x===to).length*100/c.weighted.length).toFixed(2))}));}
 if(alternate){const a=alternate.match(/^(.+):\s*(\d+|[fF])$/);if(!a)throw Error(`${offset+1}행: 조건:장면번호 형식을 확인해 주세요.`);c.alternate={to:id(a[2]),base:a[1]==='item_gun'?'총기 미보유':a[1]+' 미충족',label:a[1]==='item_gun'?'총기 보유 · item_gun:':a[1]+' 충족'};}
 node.choices.push(c);continue;}
 if(node)body.push(line);else if(line.trim())preamble.push(line.trim());
 }
 finish();if(!order.length)throw Error('숫자:: 형식의 장면이 없습니다.');nodes.F={id:'F',title:'이야기 종료',body:'이 경로의 이야기가 끝났습니다. 다른 선택지도 살펴보세요.',choices:[],phase:'종료'};
 for(const n of Object.values(nodes)){n.title=titles[n.id]||n.title||n.body.replace(/\$?\{[^}]*\}/g,'').replace(/\s+/g,' ').slice(0,19)||'장면 '+n.id;for(const c of n.choices)for(const target of [...(c.weighted||[c.to]),...(c.alternate?[c.alternate.to]:[])])if(!nodes[target])throw Error(`${n.id}번 선택지가 없는 장면 ${target}번으로 연결됩니다.`);}
 const basename=path.split('/').pop().replace(/\.txt$/i,'');const game=meta.game||(['seoul','maple','student','job'].includes(path.split('/')[1])?path.split('/')[1]:'seoul');
 const project={slug:meta.id||path.replace(/^stories\//,'').replace(/\.txt$/i,''),game,title:meta.title||preamble[0]||basename,series:meta.series||'시나리오',description:meta.description||nodes[order[0]].body.replace(/\$?\{[^}]*\}/g,'').slice(0,140),category:'분기형 시나리오',tags:meta.tags===undefined?[`${order.length}개 장면`,'원문 대사','조건별 전개']:[...new Set(meta.tags.split(',').map(t=>t.trim().replace(/^#+/, '').trim()).filter(Boolean))],entry:order[0],rewardNode:order.find(k=>nodes[k].choices.length>1)??order[0],stages:order.filter(k=>k===order[0]||nodes[k].choices.length>1).slice(0,6).map(k=>({label:k+'번',node:k})),mapLabels:[],nodes,path};
 Object.assign(project,layout(nodes,order));return project;
}
function targets(n){return n.choices.flatMap(c=>[...(c.weighted?[...new Set(c.weighted)]:[c.to]),...(c.alternate?[c.alternate.to]:[])]);}
function layout(nodes,order){
 // Collapse cycles before assigning longest-path ranks.
 let seq=0;const ix={},low={},stack=[],active=new Set(),components=[],group={};function visit(v){ix[v]=low[v]=seq++;stack.push(v);active.add(v);for(const w of targets(nodes[v])){if(ix[w]===undefined){visit(w);low[v]=Math.min(low[v],low[w]);}else if(active.has(w))low[v]=Math.min(low[v],ix[w]);}if(low[v]===ix[v]){let w,c=[];do{w=stack.pop();active.delete(w);group[w]=components.length;c.push(w);}while(w!==v);components.push(c);}}
 for(const k of [...order,'F'])if(ix[k]===undefined)visit(k);
 const edges=components.map(()=>new Set()),indeg=components.map(()=>0),rank=components.map(()=>0);for(const n of Object.values(nodes))for(const t of targets(n))if(group[n.id]!==group[t])edges[group[n.id]].add(group[t]);edges.forEach(e=>e.forEach(t=>indeg[t]++));const queue=indeg.flatMap((n,i)=>n===0?[i]:[]);for(let i=0;i<queue.length;i++){const g=queue[i];for(const t of edges[g]){rank[t]=Math.max(rank[t],rank[g]+1);if(!--indeg[t])queue.push(t);}}
 const rows=[];for(const k of [...order,'F']){const r=rank[group[k]];(rows[r]??=[]).push(k);}const width=Math.max(760,...rows.map(r=>r.length*260+80));const positions={};rows.forEach((row,r)=>row.forEach((k,i)=>positions[k]=[(width-row.length*260)/2+i*260+27,r*190+70]));return {positions,mapWidth:width,mapHeight:rows.length*190+100};
}
root.StoryEngine={parse,layout};if(typeof module!=='undefined')module.exports=root.StoryEngine;
})(typeof window==='undefined'?globalThis:window);

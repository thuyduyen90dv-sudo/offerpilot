import {jobs,seed,match,tailor,startRun,tick,submit,addInterview,stages} from './domain.js';
import {parseDocument,createDocx} from './documents.js';
const HTML=__HTML__;
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
export default {async fetch(request,env){try{
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return new Response(HTML,{headers:{'Content-Type':'text/html; charset=utf-8','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'"}});
 if(url.pathname==='/api/health')return json({ok:true,engine:'rules',storage:env.DB?'D1':'unavailable',realApplications:false});
 if(!env.DB)return json({error:'数据库未绑定，服务尚未就绪'},503);
 if(!['GET','POST','DELETE'].includes(request.method))return json({error:'不支持的方法'},405);
 if(request.method!=='GET'&&request.headers.get('origin')!==url.origin)return json({error:'仅允许同源操作'},403);
 let owner;let setCookie;const uid=request.headers.get('oai-authenticated-user-id');const cookie=request.headers.get('cookie')||'';const token=cookie.match(/(?:^|;\s*)op_demo=([a-f0-9-]{36})(?:;|$)/)?.[1];
 if(uid)owner='user:'+uid;else if(token)owner='demo:'+token;else{const id=crypto.randomUUID();owner='demo:'+id;setCookie='op_demo='+id+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800';}
 const headers=setCookie?{'Set-Cookie':setCookie}:{};
 let row=await env.DB.prepare('SELECT version,data FROM states WHERE owner = ?').bind(owner).first();
 if(!row){await env.DB.prepare('INSERT OR IGNORE INTO states(owner,version,data) VALUES(?,0,?)').bind(owner,JSON.stringify(seed())).run();row=await env.DB.prepare('SELECT version,data FROM states WHERE owner = ?').bind(owner).first();}
 const state=JSON.parse(row.data);const all=()=>[...jobs,...state.customJobs];const getJob=id=>{const j=all().find(j=>j.id===id);if(!j)throw Error('岗位不存在');return j;};
 if(request.method==='GET'){
  if(url.pathname==='/api/state')return json({state,jobs:all(),identity:uid?'signed-in':'demo',version:row.version},200,headers);
  if(url.pathname==='/api/export')return json(state,200,{'Content-Disposition':'attachment; filename="offerpilot-data.json"',...headers});
  if(url.pathname==='/api/docx'){const id=url.searchParams.get('version');const version=id?state.versions.find(v=>v.id===id):null;if(id&&!version)return json({error:'简历版本不存在'},404,headers);return new Response(createDocx(version?.text||state.resume),{headers:{'Content-Type':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','Content-Disposition':'attachment; filename="OfferPilot-resume.docx"','Cache-Control':'no-store',...headers}});}
  if(url.pathname==='/api/jobs'){let list=all();const q=(url.searchParams.get('q')||'').toLowerCase();if(q)list=list.filter(j=>(j.title+j.company+j.skills.join(' ')).toLowerCase().includes(q));const city=url.searchParams.get('city');if(city)list=list.filter(j=>j.city===city);return json(list.map(j=>({...j,match:match(state.profile,j,state.resume)})).sort((a,b)=>b.match.score-a.match.score),200,headers);}
  return json({error:'接口不存在'},404,headers);
 }
 if(request.method==='DELETE'){
  if(url.pathname!=='/api/account')return json({error:'接口不存在'},404,headers);
  await env.DB.prepare('DELETE FROM states WHERE owner = ?').bind(owner).run();return json({deleted:true},200,{'Set-Cookie':'op_demo=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
 }
 if(Number(request.headers.get('content-length')||0)>3*1024*1024)return json({error:'请求过大'},413,headers);
 const raw=await request.text();if(raw.length>3*1024*1024)return json({error:'请求过大'},413,headers);let body;try{body=JSON.parse(raw||'{}');}catch{return json({error:'JSON 格式无效'},400,headers);}
 let result={ok:true};
 switch(url.pathname){
 case '/api/profile':{for(const key of Object.keys(state.profile)){if(body[key]!==undefined){if(key==='salary'){const n=Number(body[key]);if(!Number.isFinite(n)||n<0||n>200)throw Error('薪资范围无效');state.profile[key]=n;}else{if(typeof body[key]!=='string'||body[key].length>10000)throw Error('档案字段无效');state.profile[key]=body[key].trim();}}}break;}
 case '/api/resume':{if(typeof body.text!=='string'||body.text.length>100000)throw Error('简历文本无效');state.resume=body.text;state.versions.unshift({id:crypto.randomUUID(),title:'手动保存简历',text:body.text,createdAt:new Date().toISOString(),engine:'用户提供'});state.versions=state.versions.slice(0,50);break;}
 case '/api/upload':{if(typeof body.name!=='string'||typeof body.base64!=='string'||body.base64.length>2800000)throw Error('文件无效或过大');const bytes=Uint8Array.from(atob(body.base64),c=>c.charCodeAt(0));const text=await parseDocument(bytes,body.name);if(!text.trim())throw Error('没有解析到文本');state.resume=text;state.versions.unshift({id:crypto.randomUUID(),title:body.name.slice(0,120),text,createdAt:new Date().toISOString(),engine:'文件文本提取 · 请核对'});state.versions=state.versions.slice(0,50);result={ok:true,text};break;}
 case '/api/jobs/add':{if(!body.company||!body.title||!body.jd||String(body.jd).length>20000)throw Error('请提供公司、岗位与 JD');if(body.url&&!/^https:\/\//.test(body.url))throw Error('岗位链接须使用 HTTPS');if(state.customJobs.length>=100)throw Error('自定义岗位已达到 100 个上限');if(state.customJobs.some(j=>body.url&&j.url===body.url))throw Error('此链接已存在');state.customJobs.push({id:crypto.randomUUID(),company:String(body.company).slice(0,100),title:String(body.title).slice(0,100),jd:String(body.jd),url:body.url||'',city:body.city||'上海',degree:body.degree||'本科',salary:Number(body.salary)||15,skills:String(body.skills||'').split(/[,，、]/).map(x=>x.trim()).filter(Boolean).slice(0,20),deadline:body.deadline||'2027-06-30',source:'用户手动录入 · 未联网核验',major:'以 JD 为准',experience:'以 JD 为准'});break;}
 case '/api/tailor':{const v=tailor(state,getJob(body.jobId));state.versions.unshift(v);state.versions=state.versions.slice(0,50);result=v;break;}
 case '/api/applications/create':{getJob(body.jobId);if(state.applications.some(a=>a.jobId===body.jobId))throw Error('此岗位已有投递任务');if(state.applications.length>=100)throw Error('投递任务已达到上限');const v=state.versions.find(v=>v.id===body.versionId);if(body.versionId&&!v)throw Error('简历版本不存在');state.applications.push({id:crypto.randomUUID(),jobId:body.jobId,versionId:v?.id,status:'待审核',authorized:false,notes:'',timeline:[{at:new Date().toISOString(),text:'用户创建任务'}]});break;}
 case '/api/applications/authorize':{const a=state.applications.find(a=>a.id===body.id);if(!a)throw Error('任务不存在');if(body.approved!==true||body.resumeConfirmed!==true)throw Error('请明确确认简历和模拟投递');a.authorized=true;a.status='待投递';a.timeline.push({at:new Date().toISOString(),text:'用户确认简历内容并授权本次模拟提交'});break;}
 case '/api/applications/submit':{result=submit(state,body.id);break;}
 case '/api/applications/update':{const a=state.applications.find(a=>a.id===body.id);if(!a)throw Error('任务不存在');if(body.status){if(!stages.includes(body.status))throw Error('无效状态');if(!a.receipt&&!['已发现','待审核','待投递','已结束'].includes(body.status))throw Error('请先通过模拟提交取得回执');a.status=body.status;a.timeline.push({at:new Date().toISOString(),text:'用户将状态更新为 '+body.status});}if(body.notes!==undefined)a.notes=String(body.notes).slice(0,2000);break;}
 case '/api/agent/start':result=startRun(state);break;
 case '/api/agent/tick':result=tick(state);break;
 case '/api/agent/control':{const r=state.runs[0];if(!r)throw Error('任务不存在');if(body.action==='pause'&&r.status==='running')r.status='paused';else if(body.action==='resume'&&['paused','failed'].includes(r.status)){r.status='running';r.error=null;}else if(body.action==='cancel'&&['running','waiting','paused','failed'].includes(r.status))r.status='cancelled';else if(body.action==='finish'&&r.status==='waiting'){if(r.results.some(x=>state.applications.find(a=>a.jobId===x.jobId)?.status==='待审核'||state.applications.find(a=>a.jobId===x.jobId)?.status==='待投递'))throw Error('请先提交或结束所有待审核任务');r.status='running';}else throw Error('当前状态不支持此操作');result=r;break;}
 case '/api/interviews':{addInterview(state,body);break;}
 case '/api/interviews/delete':{state.interviews=state.interviews.filter(i=>i.id!==body.id);break;}
 case '/api/settings':{const threshold=Number(body.threshold),limit=Number(body.limit);if(!Number.isFinite(threshold)||threshold<0||threshold>100||!Number.isInteger(limit)||limit<1||limit>10)throw Error('阈值须为 0–100，推荐数为 1–10');state.settings={threshold,limit,tailor:body.tailor===true,confirm:true};break;}
 case '/api/demo/reset':{if(uid)throw Error('登录档案不能通过 Demo 重置，请使用删除数据');Object.assign(state,seed());break;}
 default:return json({error:'接口不存在'},404,headers);
 }
 const update=await env.DB.prepare('UPDATE states SET data = ?, version = version + 1 WHERE owner = ? AND version = ?').bind(JSON.stringify(state),owner,row.version).run();if(!update.meta.changes)return json({error:'数据已在其他请求中更新，请重试'},409,headers);
 return json(result,200,headers);
 }catch(e){return json({error:e.message||'请求失败'},400);}}};

import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import vm from 'node:vm';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const client=readFileSync('src/client.js','utf8');new vm.Script(client);
const html=readFileSync('src/production.html','utf8').replace('__CLIENT__',client);
const modules=['interviews','documents','security','live-jobs','models','production-state','official-applications','scheduler','production'];
const source=modules.map(name=>readFileSync('src/'+name+'.js','utf8').replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/gm,'').replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class))/g,'')).join('\n\n');
const worker=source+'\nconst PRODUCTION_HTML='+JSON.stringify(html)+';\nexport default {fetch(request,env,ctx){return productionFetch(request,env,PRODUCTION_HTML);}};\n';
writeFileSync('dist/server/index.js',worker);writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
function copyTree(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){const src=from+'/'+entry.name,dst=to+'/'+entry.name;if(entry.isDirectory())copyTree(src,dst);else writeFileSync(dst,readFileSync(src));}}
copyTree('drizzle','dist/.openai/drizzle');console.log('Built production Worker + client + migrations');

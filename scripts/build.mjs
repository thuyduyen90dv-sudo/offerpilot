import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
const domain=readFileSync('src/domain.js','utf8').replaceAll('export ','');
const docs=readFileSync('src/documents.js','utf8').replaceAll('export ','');
const html=readFileSync('src/index.html','utf8');
let worker=readFileSync('src/worker.js','utf8').replace("import {jobs,seed,match,tailor,startRun,tick,submit,addInterview,stages} from './domain.js';",domain);
worker=worker.replace("import {parseDocument,createDocx} from './documents.js';",docs);
worker=worker.replace('__HTML__',JSON.stringify(html));
writeFileSync('dist/server/index.js',worker);writeFileSync('dist/.openai/hosting.json',readFileSync('.openai/hosting.json'));
function copyTree(from,to){mkdirSync(to,{recursive:true});for(const entry of readdirSync(from,{withFileTypes:true})){const source=from+'/'+entry.name,dest=to+'/'+entry.name;if(entry.isDirectory())copyTree(source,dest);else writeFileSync(dest,readFileSync(source));}}
copyTree('drizzle','dist/.openai/drizzle');
console.log('Built Worker + embedded UI');

import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
const ignored=new Set(['.git','.local','dist','node_modules','outputs']);const files=[];
function walk(dir='.',prefix=''){for(const f of readdirSync(dir,{withFileTypes:true})){if(ignored.has(f.name)||f.name.endsWith('.tar.gz')||(f.name.startsWith('.env')&&f.name!=='.env.example'))continue;const p=dir+'/'+f.name,relative=prefix+f.name;if(f.isDirectory())walk(p,relative+'/');else files.push({path:relative,mode:'100644',type:'blob',...(f.name.endsWith('.docx')?{binary:readFileSync(p).toString('base64')}:{content:readFileSync(p,'utf8')})});}}
walk();console.log(JSON.stringify(files));

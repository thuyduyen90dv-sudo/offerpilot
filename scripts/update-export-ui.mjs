import {readFileSync,writeFileSync} from 'node:fs';
const p='src/index.html';let h=readFileSync(p,'utf8');
h=h.replace("btn(icon('download')+'下载当前文本','download-resume')", "btn(icon('download')+'下载当前文本','download-resume')+btn('导出 DOCX','download-docx')");
h=h.replace("btn('下载 TXT','download-version',false,'data-id=\"'+v.id+'\"')", "btn('下载 TXT','download-version',false,'data-id=\"'+v.id+'\"')+btn('导出 DOCX','download-docx',false,'data-id=\"'+v.id+'\"')");
h=h.replace("if(a==='download-version'){", "if(a==='download-docx'){const r=await fetch('/api/docx'+(el.dataset.id?'?version='+encodeURIComponent(el.dataset.id):''));if(!r.ok)throw Error('导出失败');download('OfferPilot-简历.docx',new Uint8Array(await r.arrayBuffer()),'application/vnd.openxmlformats-officedocument.wordprocessingml.document');return;}if(a==='download-version'){");
h=h.replace('云端定时任务、DOCX 导出、OCR','云端定时任务、OCR');writeFileSync(p,h);

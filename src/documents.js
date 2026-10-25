export async function parseDocument(bytes,name){
 if(bytes.length>2*1024*1024)throw Error('文件超过 2 MB');
 const ext=name.toLowerCase().split('.').pop();const dec=new TextDecoder();
 if(ext==='txt')return dec.decode(bytes);
 if(ext==='docx'){
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let pos=-1;
  for(let i=bytes.length-22;i>=Math.max(0,bytes.length-65557);i--)if(view.getUint32(i,true)===0x06054b50){pos=i;break;}
  if(pos<0)throw Error('DOCX 不是有效 ZIP 文件');let offset=view.getUint32(pos+16,true);const count=view.getUint16(pos+10,true);if(count>2000)throw Error('DOCX 文件条目过多');
  for(let i=0;i<count;i++){if(view.getUint32(offset,true)!==0x02014b50)throw Error('DOCX 目录损坏');const method=view.getUint16(offset+10,true),packed=view.getUint32(offset+20,true),unpacked=view.getUint32(offset+24,true),nl=view.getUint16(offset+28,true),el=view.getUint16(offset+30,true),cl=view.getUint16(offset+32,true),local=view.getUint32(offset+42,true);const entry=dec.decode(bytes.subarray(offset+46,offset+46+nl));if(entry==='word/document.xml'){if(unpacked>4*1024*1024)throw Error('DOCX 解压内容过大');const start=local+30+view.getUint16(local+26,true)+view.getUint16(local+28,true);let data=bytes.slice(start,start+packed);if(method===8)data=await inflate(data,'deflate-raw');else if(method!==0)throw Error('不支持此 DOCX 压缩格式');return dec.decode(data).replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}offset+=46+nl+el+cl;}
  throw Error('未找到 DOCX 正文');
 }
 if(ext==='pdf'){
  if(dec.decode(bytes.slice(0,5))!=='%PDF-')throw Error('PDF 文件头无效');
  // Basic text PDFs only; complex font mappings and scanned PDFs require manual correction.
  const raw=new TextDecoder('latin1').decode(bytes);if(/\/Encrypt\b/.test(raw))throw Error('不支持加密 PDF，请使用可复制文本的文件');let text='';
  const extract=s=>[...s.matchAll(/\(((?:\\.|[^\\)])*)\)\s*(?:Tj|['"]|[-\d.\s]*\])/g)].map(m=>m[1].replace(/\\([()\\])/g,'$1').replace(/\\n/g,'\n')).join('\n');text+=extract(raw);
  for(const m of raw.matchAll(/stream\r?\n/g)){const start=m.index+m[0].length,end=raw.indexOf('endstream',start);if(end<0)continue;const head=raw.slice(Math.max(0,m.index-250),m.index);if(head.includes('/FlateDecode'))try{let stop=end;while(bytes[stop-1]===10||bytes[stop-1]===13)stop--;text+='\n'+extract(dec.decode(await inflate(bytes.slice(start,stop),'deflate')));}catch{}}
  if(text.trim().length<10)throw Error('此 PDF 为扫描件或复杂字体，暂不支持自动解析；请粘贴简历文本或上传 DOCX');return text.trim();
 }
 throw Error('仅支持 PDF、DOCX、TXT');
}
async function inflate(bytes,format){const reader=new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format)).getReader();let size=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4*1024*1024){await reader.cancel();throw Error('解压内容超过安全限制');}chunks.push(value);}const result=new Uint8Array(size);let pos=0;for(const x of chunks){result.set(x,pos);pos+=x.length;}return result;}
export function createDocx(text){
 const enc=new TextEncoder(),escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const files={
 '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
 '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
 'word/document.xml':'<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+String(text).split('\n').map(line=>'<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="Microsoft YaHei"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">'+escape(line)+'</w:t></w:r></w:p>').join('')+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>'};
 const chunks=[],central=[];let offset=0,centralSize=0;for(const [name,content] of Object.entries(files)){const filename=enc.encode(name),data=enc.encode(content);let crc=0xffffffff;for(const b of data){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;const local=new Uint8Array(30+filename.length+data.length),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,filename.length,true);local.set(filename,30);local.set(data,30+filename.length);const entry=new Uint8Array(46+filename.length),d=new DataView(entry.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,filename.length,true);d.setUint32(42,offset,true);entry.set(filename,46);chunks.push(local);central.push(entry);offset+=local.length;centralSize+=entry.length;}
 const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,central.length,true);e.setUint16(10,central.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);const result=new Uint8Array(offset+centralSize+22);let pos=0;for(const c of [...chunks,...central,end]){result.set(c,pos);pos+=c.length;}return result;
}

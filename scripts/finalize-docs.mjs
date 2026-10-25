import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
let p='README.md',s=readFileSync(p,'utf8');s=s.replace('TXT 下载和浏览器打印 PDF','TXT / DOCX 下载和浏览器打印 PDF').replace('无 DOCX 导出、OCR、通用复杂 PDF 解析','无 OCR、通用复杂 PDF 解析').replace('源码推送到平台专属仓库，尚未创建 GitHub 镜像；连接账号没有可访问仓库，工具不支持新建仓库。','源码推送到平台专属仓库；GitHub 交付仓库：https://github.com/thuyduyen90dv-sudo/offerpilot 。');writeFileSync(p,s);
p='TEST_REPORT.md';s=readFileSync(p,'utf8').replace('11 项通过','12 项通过').replace('未验证：ChatGPT','另已验证 DOCX 导出往返解析与跨用户版本权限。\n\n未验证：ChatGPT');writeFileSync(p,s);

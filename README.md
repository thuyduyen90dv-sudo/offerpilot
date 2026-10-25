# OfferPilot — AI 秋招智能求职助手

零模型密钥的大学课程项目。公开站点：https://offerpilot-career-agent.haleleaf3.chatgpt.site

## 运行

Node.js 24+，无需 npm 安装依赖。

```sh
npm test
npm run build
npm run dev
```

本地 SQLite 仅作开发；云端使用 Sites 托管的 D1。入口 `src/worker.js`，状态机和评分 `src/domain.js`，界面 `src/index.html`，迁移 `drizzle/0000_initial.sql`。构建会将所有代码合并为独立 Worker。平台远程构建执行 `npm run build`。

## 实现能力

- 独立匿名 Demo 会话；ChatGPT 登录入口与服务端身份隔离。
- 档案编辑、导出、删除；简历 TXT / DOCX / 基础文本 PDF 解析及人工校对、版本保存。
- 24 个虚构岗位；搜索、城市筛选、评分排序、手动录入与链接去重。
- 0–100 可解释规则评分，展示事实证据、缺少技能与硬条件。
- 基于已有事实整理岗位简历，不虚构经历；TXT / DOCX 下载和浏览器打印 PDF。
- 工具调用状态机、持久化执行日志、暂停、取消、失败恢复、日报。
- 每次投递逐项核对与授权；真实模拟 API 提交、回执、防重复、备注和看板。
- 面试日程、北京时间、冲突校验、ICS 日历提醒。
- 配置阈值及推荐数、手动每日任务、Demo 重置。

## 明确限制

本版本是规则驱动 Agent，并非大模型 Agent。没有预置评分结果，也没有假装调用模型。岗位均为虚构；手动链接不联网抓取。不投递真实招聘网站。

未配置云端定时任务；关闭页面会暂停逐步执行，重新打开可继续。未接入 Gemini / Ollama / 其他模型。无 OCR、通用复杂 PDF 解析。文件原始字节不保存，只持久化解析文本。投递表单提交通过项目 API，未包含 Playwright 自动填写真实招聘平台功能。

登录由 Sites 平台提供，需要 ChatGPT 账号；未实现独立邮箱密码注册。匿名老师可直接使用 Demo。Demo 状态在随机 HttpOnly 会话中隔离，清除 Cookie 后会产生新档案。

## 安全与部署

写 API 校验同源 Origin；所有记录按服务端身份绑定。使用乐观版本号避免并发覆盖。禁止向客户端提交 API 密钥。平台注入身份头仅在受信任的 Sites 入口使用；自行迁移时必须保证代理剥离访客伪造身份头。本地开发适配器会剥离该头。

部署使用 Sites Cloudflare Worker + D1，无购买或计费 API。官方 Sites 打包工具在本次 Windows 环境复制文件失败，已使用平台支持的远程构建。源码推送到平台专属仓库；GitHub 交付仓库：https://github.com/thuyduyen90dv-sudo/offerpilot 。

详细验收说明见 `DEMO_GUIDE.md`、`TEST_REPORT.md`、`COST_REPORT.md`。

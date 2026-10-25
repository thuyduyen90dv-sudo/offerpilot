# OfferPilot — 真实岗位与 AI 求职工作空间

网站：https://offerpilot-career-agent.haleleaf3.chatgpt.site
源码：https://github.com/thuyduyen90dv-sudo/offerpilot

当前为正式数据流程。新用户使用空白档案，通过登录保存私有简历和模型连接；不会自动生成虚构简历或模拟回执。

## 使用
1. 登录，填写真实档案和简历。
2. 在「模型连接」填写 Gemini、SiliconFlow、DashScope 或 ModelScope Key 与完整模型 ID；确认免费额度和数据发送授权后保存并执行连接测试。Key 仅在服务端按用户加密保存。
3. 查看官方公开招聘数据或导入目标企业的 Greenhouse / Lever 招聘板，也可手动录入官网链接和 JD。
4. 启动 Agent，实际调用模型匹配、引用原文证据、提出简历修改建议。核对后准备真实申请。
5. 普通用户前往官方页面完成实际申请，并保存提交证据；获企业接口授权的用户可配置 Greenhouse Job Board Key，逐项确认后通过官方接口提交。两种记录明确区分。
6. 在云端任务设置启用每日个人工作流。模型未连接、免费配额耗尽或官网不可用时明确失败，不用模拟结果替代。

## 已核验
两个官方来源当前共 447 个公开岗位，为控制资源每个保留 100 个，总计同步 200 个；源有时间戳和失败状态。GitHub Actions 云端调度已经实际运行成功。正式测试使用 Node SQLite 和明确标记的提供商替身，不将其冒充真实模型或真实申请成功。详情见 PRODUCTION_STATUS.md 和 TEST_REPORT.md。

## 开发
Node.js 24+，无 npm 依赖安装。运行 npm test、npm run build、npm run dev。本地 SQLite 仅用于开发，正式环境为 Cloudflare Worker + D1。构建入口 scripts/build-production.mjs，后端 src/production.js，浏览器 src/client.js。

## 边界
模型连接须由用户实际填写并验证 Key；项目作者尚未获得真实模型连接成功的验证证据。不是任意企业官网通用的无人值守自动投递。没有企业 API 授权时，最终提交在官方页面完成；本人确认记录不等同于官方接口受理。招聘方后续阅读/面试状态也不会凭空自动生成。

数据为定时同步快照，不保证秒级更新。云端调度可能延迟，每次最多处理 3 个到期账号，适合小规模使用。尚未支持 OCR、通用复杂字体 PDF、后台邮件推送。

本轮没有购买服务、充值或启用计费。继续遵守原定新增成本 0–10 元，模型 Key 须由用户确认仅用免费额度。

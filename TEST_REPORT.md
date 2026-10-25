# 正式版本测试报告

日期：2026-10-25。此前 Demo 报告已被本报告取代。

## 已执行
- npm test：15 项通过、0 失败。覆盖空白正式档案、登录权限、AES-GCM 隔离、真实源适配器、模型请求及结构化校验、状态机、无模拟回执、官网本人提交证据、授权 ATS 提交与防重复、失败处理、文件与版本隔离、同源保护、暂停恢复取消、面试冲突、GitHub OIDC 签名与固定身份、边缘重定向兼容、数字事实拦截、密钥及资料删除。提供商响应明确使用测试替身。
- 实际官网数据：云端同步 Greenhouse Figma 100/138、Lever Palantir 100/309，共 200 个真实岗位，包含官方申请 URL 和抓取时间。
- GitHub 正式版 CI 成功：https://github.com/thuyduyen90dv-sudo/offerpilot/actions/runs/40176867160
- GitHub 云端调度实际成功：https://github.com/thuyduyen90dv-sudo/offerpilot/actions/runs/40176867167
- 后台 scheduler_runs 回读 completed，两个真实来源成功，processed=0（当时尚无启用模型的个人任务），不是个人 AI 工作流验收成功。
- 实际浏览器手机视口：工作台与真实岗位页 DOM 宽度和 scrollWidth 均为 375，无页面横向溢出；导航可打开；搜索 Frontend 显示 4 个真实匹配结果，刷新与申请按钮可见。截图保存在本地 outputs/，不进公开仓库。

## 尚未通过的外部验收
- 用户尚未提供安全页面的真实模型连接成功证据，因此不能声明真实大模型推理已经验收。
- 未向任何真实企业发测试申请，也没有企业授予的 API Key。接口替身测试不代表真实 ATS 写入已验证。
- 完整登录、私人简历上传、模型编辑及真实投递的全浏览器路线，需用户实际账号和逐项授权后继续验证。

## 已修复
Cloudflare 不支持 redirect:error，已改为 manual 并拒绝非成功响应；首次云端请求失败没有被伪装成真实岗位。模型配置密钥仅服务端加密，无明文日志或 Git 内容。

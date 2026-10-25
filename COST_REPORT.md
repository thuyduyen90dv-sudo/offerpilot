# 成本报告（正式数据流程）

2026-10-25：本次未购买服务、充值、绑卡或启用付费升级，执行操作新增支出 0 元。没有可用模型 Key，因此没有调用真实计费模型。

已使用现有 Sites 托管连接（Worker、D1）、平台 HTTPS 二级域名，以及公开 GitHub 仓库标准 Ubuntu runner。GitHub 官方说明标准公开仓库 runner 免费：https://docs.github.com/en/billing/concepts/product-billing/github-actions 。不使用大规格 runner、付费缓存或付费存储附件。

真实岗位通过 Greenhouse / Lever 官方公开接口同步，未购买岗位数据。个人任务没有模型连接时不执行模型调用；连接时要求用户明确确认免费额度和数据发送授权，每用户每日请求限制为 20 次。平台的计费状态无法仅凭 API Key 自动证明，用户不能填写会产生费用的项目 Key，除非另行明确授权预算。

没有读取服务商账单，不承诺托管方永久不调整政策。保留原约束：新增费用控制在 0–10 元，默认 0 元。

# 工作负载需求 — 缺失接口字段汇总

> 用途：供后端接口调整参考。列出工作负载相关需求文档依赖、但当前 API 真源文档 `docs/input/source-api-runtime-workloads.md` 未提供或未定义结构的字段。
> 生成时间：2026-07-24
> 最后更新：2026-07-29
> 来源需求：`pod-detail-drawer.md` / `pod-list-content-area.md` / `delete-deployment-resource-dialog.md`
> 本次更新：`Container.lastTermination` 已提供，"上一次终止"标记为已解决。此前根据 2026-07-28 API 更新，Version、GPU、Container 子结构相关字段已标记为已解决。

前端处理原则：接口已返回的数据能用则用；未定义/未返回的字段本期以占位符展示，待接口补充后接入。

## 一、Pod 详情 — 基本信息卡片

| 字段       | 说明                                 | 现状                                        | 建议接口来源                |
| ---------- | ------------------------------------ | ------------------------------------------- | --------------------------- |
| 版本       | Pod 详情基本信息卡片"版本"           | ✅ 已解决：Workload `currentVersion` 已提供 | —                           |
| 暴露 / ENS | Pod 详情"暴露"、Pod 列表"服务暴露"列 | ❌ 接口未返回服务暴露字段                   | Pod 增加服务暴露 / ENS 字段 |

## 二、Pod 详情 — 资源用量 GPU

| 字段          | 说明                                            | 现状                                                                                | 建议接口来源 |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------- | ------------ |
| GPU 型号/品牌 | GPU 卡片展示型号（如 A100 80G）及按品牌切换图标 | ✅ 已解决：`gpus[]` 已包含 `vendor`/`model`/`profile`/`count`，ResourceQuota 已补充 | —            |

## 三、Pod 详情 — 容器详细信息（Container 子结构已补齐）

API 文档中 `containers[]` / `initContainers[]` 的元素结构已完整定义（`name` / `type` / `image` / `command` / `args` / `cmdline` / `resourceLimits` / `resourceRequests` / `resourceUsages` / `env` / `ports` / `volumeMounts` / `status` / `reason` / `message` / `restarts` / `lastStartedAt` / `lastTermination`）。

`ports[]`、`volumeMounts[]`、`env[]` 的数组元素子字段结构尚未独立定义，可直接按数组渲染现有数据。

## 四、Pod 详情 — 上一次终止

| 字段                                | 说明                                                  | 现状                                                                                                     | 建议接口来源 |
| ----------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------ |
| 原因 / 退出码 / 开始时间 / 结束时间 | 容器"上一次终止"区块（K8s lastState.terminated 语义） | ✅ 已解决：`Container.lastTermination {reason,exitCode,startedAt,finishedAt}` 已提供，前端按真实字段渲染 | —            |

## 五、删除部署资源接口（整体缺失，需求暂不实现）

`delete-deployment-resource-dialog.md` 依赖的删除部署资源触发接口后端尚未提供：

| 缺失项           | 说明                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| operation name   | `ApplicationUninstall` capability 对应的 operation name 未确定          |
| trigger 请求参数 | `targets` 结构及是否需要额外字段未明确                                  |
| trigger 路径     | `POST .../runtime/operations/:operation/trigger` 中 `:operation` 未确定 |
| 同步/异步语义    | 决定弹窗关闭时机（同步等返回 / 异步展示进度），待确认                   |

> 该需求文档已标注"暂不实现（阻塞）"，待上述接口与参数补齐后再进入实现。

## 附：已核对无误、无需补充的字段

- `clusterName`：接口「查询运行时工作负载（分组）」与「Workload 列表」的 `workloads[]` 已返回，早期"缺失 clusterName"的 Open Question 已作废。
- 版本列表 hover：使用 `workloads[].currentVersion`（早期误写为 `serverVersion`，已修正）。
- Pod 事件时间：使用 `lastSeen`（早期误写为 `lastTimestamp`，已修正）。
- 快捷筛选/状态统计：由 Pod 列表接口 `summary`（`totalCount` / `blockedCount` / `statuses[]`）提供。

# Workloads 操作全景总结

> 生成时间：2026-07-29
> 来源：需求文档（`docs/requirements/`）、实现计划（`docs/plans/`）、代码实现（`src/pages/Workloads/`）

## 操作对象（targetKind）语义

每个 RuntimeOperation 都有一个 `targetKind` 字段，决定操作的目标对象类型：

| targetKind | 语义                    | 接口参数特征                                                |
| ---------- | ----------------------- | ----------------------------------------------------------- |
| `Workload` | 操作目标是一个工作负载  | targets 需传 `clusterId` + `resourceType` + `name`          |
| `Pod`      | 操作目标是一个 Pod 实例 | targets 需传 `clusterId` + `resourceType` + `name`          |
| `None`     | 操作目标是集群/应用级别 | targets 仅需传 `clusterId`，不需要 `resourceType` 和 `name` |

> 示例：`ApplicationUninstall`（删除部署资源）的 targets 仅包含 `{ clusterId: 'cluster-a' }`，无需 resourceType 和 name，属于 None（集群级）操作。

## 操作能力枚举（OperationCapability）

共 9 个能力标识，以下按 targetKind 分组：

| 能力标识               | 语义                | targetKind     | 支持批量   |
| ---------------------- | ------------------- | -------------- | ---------- |
| `VerticalScale`        | 纵向扩缩            | Workload       | ❌         |
| `HorizontalScale`      | 横向扩缩            | Workload       | ❌         |
| `Restart`              | 重启（Workload 级） | Workload       | ❌         |
| `ApplicationUninstall` | 删除部署资源        | None（集群级） | ❌         |
| `PodRestart`           | 重启（Pod 级）      | Pod            | ✅         |
| `PodDelete`            | 删除重建            | Pod            | ✅         |
| `PodDeleteForce`       | 强制删除            | Pod            | ✅         |
| `PodBlock`             | 屏蔽                | Pod            | ✅（占位） |
| `PodUnblock`           | 解除屏蔽/接流       | Pod            | ✅（占位） |

## 操作汇总表

| 操作         | 对象     | 支持批量   | 弹窗/对话框                | 实现状态    | 备注                                                                                                                |
| ------------ | -------- | ---------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| 重启         | Workload | ❌         | RestartModal               | ✅ 已实现   | XState 状态机驱动                                                                                                   |
| 横向扩缩     | Workload | ❌         | HorizontalScaleModal       | ✅ 已实现   | XState 状态机驱动                                                                                                   |
| 纵向扩缩     | Workload | ❌         | VerticalScaleModal         | ✅ 已实现   | XState 状态机驱动                                                                                                   |
| 删除部署资源 | None     | ❌         | —                          | ❌ 阻塞     | 后端 trigger 接口未提供                                                                                             |
| 查看 YAML    | Workload | ❌         | —                          | ✅ 已实现   | GroupHeader 固定菜单项，点击行为待确认                                                                              |
| 应用临时授权 | Workload | ❌         | —                          | 🚧 后续开发 | 即将开发                                                                                                            |
| 开启调试     | Workload | ❌         | —                          | 🚧 后续开发 | 即将开发                                                                                                            |
| 详情         | Pod      | ❌         | PodDetailDrawer            | ✅ 已实现   | 右侧 980px 滑出抽屉                                                                                                 |
| 查看 YAML    | Pod      | ❌         | —                          | ❌ 未实现   | 仅查看数据，无需提交操作                                                                                            |
| 重启         | Pod      | ✅         | BatchRestartPodModal       | ✅ 已实现   | 批量弹窗可提交；行内无对应独立入口                                                                                  |
| 删除重建     | Pod      | ✅         | BatchPodDeleteRebuildModal | ✅ 已实现   | 批量弹窗可用；行内图标无 onClick                                                                                    |
| 强制删除     | Pod      | ✅         | BatchPodForceDeleteModal   | ✅ 已实现   | 红色危险操作                                                                                                        |
| 屏蔽         | Pod      | ✅（占位） | —                          | ❌ 占位     | 按钮已渲染，无弹窗实现， 弹窗内容和删除重建一致，接口参数同删除重建的接口参数也一致，但后端还未实现该功能的对应接口 |
| 解除屏蔽     | Pod      | ✅（占位） | —                          | ❌ 占位     | 同屏蔽                                                                                                              |
| 日志         | Pod      | ❌         | —                          | ⚠️ UI 展示   | 仅查看数据，无需提交操作                                                                                            |
| 终端         | Pod      | ❌         | —                          | ⚠️ UI 展示   | 仅查看数据，无需提交操作                                                                                            |

> **备注**：日志、终端、查看 YAML 这三个操作均无需提交操作，仅用于查看数据。后续实现时应将其加入 Pod 的操作列中。

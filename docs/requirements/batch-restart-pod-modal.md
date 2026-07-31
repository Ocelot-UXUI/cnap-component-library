# Feature: 批量重启 Pod 弹窗

> 状态：已实现（2026-07-25，plan `docs/plans/2026-07-25-workload-batch-operations-plan.md`）
> 范围说明（2026-07-25）：`restartPod` 为异步订单创建（订单生成即提交成功），逐集群执行结果为异步状态。故本期仅区分"提交成功 / 提交失败"；"部分集群重启失败"的**行级失败详情 UI 后置**到执行状态追踪切片，本切片不实现。
> 来源：Figma 设计稿「Frame 1912057557 — 批量重启Pod弹窗」
> 父需求：`docs/requirements/workloads-page.md`（子需求 3 — H 区域业务逻辑）

## Goal

在 Pod 列表页中，用户可选中多个 Pod 并通过底部批量操作栏触发批量重启，弹窗提供 Pod 预览清单、超时时间配置和集群参数配置（最大不可用可编辑，其余只读）。

与「重启弹窗」（`docs/requirements/app-restart-modal.md`）的区别：

| 对比项       | 重启弹窗                     | 批量重启 Pod 弹窗                   |
| ------------ | ---------------------------- | ----------------------------------- |
| 触发入口     | 页面标题栏「重启」按钮       | Pod 列表 BatchActionBar「重启」按钮 |
| 重启范围     | 所选环境、指定集群的所有实例 | 用户从 Pod 列表中勾选的特定 Pod     |
| Pod 列表预览 | 无                           | 有，展示待重启 Pod 清单             |
| 集群选择方式 | 从集群列表中勾选             | 自动根据所选 Pod 聚合出涉及的集群   |

## In Scope

- 弹窗布局：标题栏、温馨提示区、超时时间配置、待重启 Pod 列表、集群参数配置、底部操作栏
- 弹窗尺寸：800px × 756px，Modal，Pod 列表区域和集群参数区域各自内部滚动
- Pod 列表：只读预览表（Pod 名称、所属工作负载、集群、状态），行数由用户选择决定
- 集群参数：由所选 Pod 聚合集群，从对应 Workload 的 `updateStrategy` 和 `availabilityTarget` 读取参数。最大不可用可编辑（校验范围 1%~100%），最大可超出和可用度为只读展示
- 超时时间配置：数字输入框，默认 60 秒，范围 5~3600
- 提交接口 `runtimeOperationApi.restartPod()` 请求体组装
- 提交成功后关闭弹窗，展示成功提示含"查看执行详情"链接
- 从 Pod 列表页 BatchActionBar 的「重启」按钮触发

## Out Of Scope

- 重启进度追踪/状态轮询
- 重启后的自动健康检查
- 重启操作的回滚/撤销
- Pod 列表的搜索/过滤/排序
- 操作确认二次弹窗

## Main User Flows

### 流程 1：标准批量重启流程

1. 用户在 Pod 列表页勾选多个 Pod，底部 BatchActionBar 浮现
2. 用户点击 BatchActionBar 的「重启」按钮
3. 弹窗打开，展示：
   - 待重启 Pod 列表（只读预览）
   - 集群参数展示表格（正在加载 Workload 参数）
4. 集群参数加载完成后，用户可选：修改超时时间、修改各集群的最大不可用值
5. 用户点击"确定"，按钮进入 loading 态
6. 成功后：弹窗关闭 → 展示成功提示"批量重启命令已下发，查看执行详情"（含链接）
7. 失败时：
   - **全部失败**：弹窗保持打开，顶部展示内联错误信息，已填数据保留
   - **部分失败**：弹窗保持打开，底部/顶部展示"部分集群重启失败"提示及失败详情

### 流程 2：取消操作

1. 点击取消或关闭按钮 → 弹窗关闭，不执行任何操作，不做二次确认

## Business Rules

- **集群聚合规则**：从所选 Pod 中提取 `clusterId` 去重，确定集群参数表格行
- **集群参数数据链**：Pod（含 `clusterId`、`workloadName`）→ 通过 `workloadName` 匹配 WorkloadGroup 获取 `groupId` → 调用 `runtimeResourceApi.getRuntimeWorkloads()` 获取 `RuntimeWorkload[]` → 按 `clusterId` 匹配各集群的 `updateStrategy` / `availabilityTarget`
- **集群参数展示规则**：最大不可用可编辑，默认值从 Workload 的 `updateStrategy.maxUnavailable` 读取；最大可超出和可用度为只读展示
- **最大不可用校验**：百分比数值，范围 1%~100%
- **Workload 参数加载失败降级**：集群参数表格对应区域展示内联错误提示（如"参数加载失败"）
- **超时时间校验**：正整数，5~3600 秒，默认 60
- **校验失败行为**：对应输入框标红并显示内联错误文案；确定按钮在校验失败时不可点击
- **提交成功提示**：接口成功返回后提示"批量重启命令已下发，查看执行详情"，其中"查看执行详情"为链接，链接地址暂未确定
- **提交幂等性**：loading 期间确定按钮 disabled
- **appEnvID 来源**：由调用方（Pod 列表页）通过 props 传入

## Roles / Permissions

角色/权限对弹窗 UI 无差异化影响。操作权限由后端 API 校验，前端根据后端返回的权限错误码展示提示。本需求不涉及前端权限控制逻辑。【待确认】

## Edge Cases

| 状态                              | 表现                                                 |
| --------------------------------- | ---------------------------------------------------- |
| 仅选中 1 个 Pod                   | 标题显示"待重启Pod 1"，表格仅一行                    |
| 跨集群选中 Pod                    | 集群参数区展示所有涉及集群，每行参数从 Workload 读取 |
| 所有 Pod 在同一集群               | 集群参数区仅一行                                     |
| Workload 参数 API 加载中          | 集群参数区展示 loading 态（Spin）                    |
| Workload 参数 API 失败            | 集群参数区展示内联错误提示                           |
| 超时时间为空/非法                 | 输入框标红，内联错误提示                             |
| 最大不可用为空/非法               | 输入框标红，内联错误提示                             |
| 提交全部失败                      | 弹窗保持打开，展示错误信息，已填数据保留             |
| 提交部分失败                      | 弹窗保持打开，展示"部分集群重启失败"及失败详情       |
| 权限不足                          | 提交接口返回权限错误，弹窗内展示"无操作权限"提示     |
| 并发提交                          | loading 期间确定按钮 disabled                        |
| Pod 列表/集群参数列表超出固定高度 | 各自区域内滚动，底部操作栏固定                       |

## Acceptance Criteria

- [ ] Pod 列表页底部 BatchActionBar 的「重启」按钮可点击并打开弹窗
- [ ] 弹窗尺寸 800×756px，为 Modal 类型
- [ ] 标题栏正确显示"批量重启Pod"、环境信息、副标题
- [ ] 温馨提示区正确渲染暖色警告条
- [ ] 超时时间输入框默认值 60，范围校验 5~3600
- [ ] 待重启 Pod 列表正确展示所选 Pod：名称、所属工作负载、集群、状态
- [ ] 集群参数正确从 Pod → WorkloadGroup → RuntimeWorkload 数据链获取，按集群分组展示
- [ ] 最大不可用输入框默认值从 Workload 读取，可编辑，校验范围 1%~100%
- [ ] 最大可超出、可用度为只读展示
- [ ] 可用度为空时显示"未启用"
- [ ] 校验失败时对应输入框标红，确定按钮不可点击
- [ ] Workload 参数加载失败时集群参数区展示错误提示
- [ ] 提交成功后弹窗关闭，展示提示"批量重启命令已下发，查看执行详情"，含链接
- [ ] 提交全部失败时弹窗保持打开，展示错误信息，已填数据保留
- [ ] 提交部分失败时弹窗保持打开，展示"部分集群重启失败"提示
- [ ] 权限不足时弹窗内展示"无操作权限"提示
- [ ] 提交 loading 期间确定按钮 disabled
- [ ] 取消按钮点击后弹窗关闭不执行操作
- [ ] Pod 列表/集群参数列表超出固定高度时各自区域内滚动

## Open Questions

- **[非阻塞]** "查看执行详情"链接的目标地址暂未确定：不构成阻塞，实现时先以纯文字占位（不挂载真实跳转），待地址确定后再接入
- **[非阻塞]** 提交部分失败时，失败详情是否需要行级展示（精确到哪些集群/哪些 Pod）？
- **[非阻塞]** "温馨提示区"中 ENS 恢复状态——是否需要前端提供 ENS 状态查看跳转入口？

## Implementation Notes

### 弹窗布局

#### 头部信息区

| 元素     | 说明                                                                                                                       |
| -------- | -------------------------------------------------------------------------------------------------------------------------- |
| 标题     | "批量重启Pod"，字号 20px，字重 Medium                                                                                      |
| 分隔线   | 1px 竖线                                                                                                                   |
| 环境信息 | 格式"环境: {环境名}"，字号 14px，常规字重                                                                                  |
| 关闭按钮 | 右上角 X 图标                                                                                                              |
| 副标题   | "重启操作会按照部署并发度对所选 Pod 进行重启，且多个集群并行执行。重启过程中不销毁容器，仅重新拉起进程。"，字号 12px，灰色 |

#### 温馨提示区

暖色警告条（背景色 #FFF3E0，圆角 8px）：

1. 重启过程中不会销毁容器，仅重新拉起进程。
2. 重启过程中会对重启 Pod 进行流量屏蔽操作，请关注重启完成后 ENS 的恢复状态。

#### 超时时间配置

| 字段     | 类型       | 默认值 | 校验范围      |
| -------- | ---------- | ------ | ------------- |
| 超时时间 | 数字输入框 | 60     | 正整数 5~3600 |

输入框 80px×32px，圆角 8px，右侧显示"秒"标签。标签宽度 65px。

#### 待重启 Pod 列表

| 列           | 宽度  | 说明                              |
| ------------ | ----- | --------------------------------- |
| Pod名称      | 280px | Pod 名称文本                      |
| 所属工作负载 | 186px | 所属工作负载名称                  |
| 集群         | 186px | 集群图标 + 集群名称               |
| 状态         | 100px | Tag 组件展示状态（如绿色=运行中） |

行高 48px。数据来源：`runtimeResourceApi.getPods()`，字段映射：name / workloadName / clusterName / status。

#### 集群与参数展示

标题"集群与参数配置"，说明"最大不可用可修改，其余参数由系统自动推导不可修改"。

集群参数来源链路：`Pod.workloadName → WorkloadGroup.id (groupId) → runtimeResourceApi.getRuntimeWorkloads() → RuntimeWorkload[].updateStrategy / availabilityTarget`

按 Pod 的 `clusterId` 去重聚合集群后，每个集群匹配对应的 RuntimeWorkload 数据。

| 列         | 宽度    | 类型 | 说明                         | 数据来源                                          |
| ---------- | ------- | ---- | ---------------------------- | ------------------------------------------------- |
| 集群       | 280px   | 展示 | 集群图标 + 集群名称          | Pod → `clusterId` 去重                            |
| 最大不可用 | 141px   | 输入 | 可编辑百分比 + "%"，tip 图标 | RuntimeWorkload → `updateStrategy.maxUnavailable` |
| 最大可超出 | 165.5px | 展示 | 只读百分比, `maxSurge`       | RuntimeWorkload → `updateStrategy.maxSurge`       |
| 可用度     | 165.5px | 展示 | 只读, 空 → "未启用"          | RuntimeWorkload → `availabilityTarget`            |

行高 48px。提示图标 tooltip："扩缩过程中允许的最大不可用 Pod 比例"。

#### 底部操作栏

| 区域 | 元素     | 说明                         |
| ---- | -------- | ---------------------------- |
| 右侧 | 取消按钮 | 关闭弹窗                     |
| 右侧 | 确定按钮 | 提交，样式遵循组件库默认规范 |

### Modal Props

弹窗组件由 Pod 列表页调用，入参仅包含选中的 Pod 基本信息：

```ts
interface BatchRestartPodModalProps {
    appEnvID: number;
    pods: { clusterId: string; name: string; }[];
}
```

### 触发接口

提交时调用封装的 API 方法，参照源码 `src/api/runtimeOperation.ts:168`：

```ts
import runtimeOperationApi from '@/api/runtimeOperation';

runtimeOperationApi.restartPod({
    appEnvID: number,
    targets: [
        { clusterId: 'cluster-a', resourceType: 'v1/pods', name: 'pod-a' },
        { clusterId: 'cluster-a', resourceType: 'v1/pods', name: 'pod-b' },
    ],
    clusters: [
        { clusterId: 'cluster-a', maxUnavailable: '25%' },
    ],
    exitTimeoutSeconds: 60,
});
```

`operation: 'pod.restart'`，`targets[].resourceType` 默认为 `'v1/pods'`。

**请求体字段映射**：

| 字段                        | 来源                                   |
| --------------------------- | -------------------------------------- |
| `targets[].clusterId`       | 所选 Pod → `clusterId`                 |
| `targets[].resourceType`    | 默认 `'v1/pods'`                       |
| `targets[].name`            | 所选 Pod → `name`                      |
| `clusters[].clusterId`      | 由所选 Pod 聚合去重后的集群 ID         |
| `clusters[].maxUnavailable` | 该集群行最大不可用输入框用户修改后的值 |
| `exitTimeoutSeconds`        | 超时时间输入框的值                     |

### API 依赖

| 接口                                                                       | 用途                                                       |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `runtimeResourceApi.getPods()`（`src/api/runtimeResource.ts`）             | Pod 列表数据（name / workloadName / clusterName / status） |
| `runtimeResourceApi.getWorkloadGroups()`（`src/api/runtimeResource.ts`）   | 通过 workloadName 匹配获取 groupId                         |
| `runtimeResourceApi.getRuntimeWorkloads()`（`src/api/runtimeResource.ts`） | 集群参数（maxUnavailable / maxSurge / availabilityTarget） |
| `runtimeOperationApi.restartPod()`（`src/api/runtimeOperation.ts`）        | 触发批量重启                                               |

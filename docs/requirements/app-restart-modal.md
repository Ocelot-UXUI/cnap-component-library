# Feature: 重启弹窗

> 状态：已实现（2026-07-25，plan `docs/plans/2026-07-25-workload-operation-dialogs-plan.md`）
> 来源：Figma 设计稿 + API 文档 `docs/input/source-api-runtime-workloads.md`
> 父需求：`docs/requirements/workloads-page.md`（从标题栏操作按钮"重启"打开）

## Goal

在 CNAP 控制台中，用户可通过弹窗对指定工作负载（Group）下的 Workload 按集群维度执行批量重启操作，并支持自定义超时时间和最大不可用参数。

> **改名说明**：原名称"应用重启"已改为"重启"（对应 API `capability: Restart`），`targetKind` 为 `Workload`。

## In Scope

- 弹窗布局：标题栏、温馨提示区、Group选择器、容器选择器、超时时间配置区、集群与参数配置表格、底部操作栏
- 弹窗尺寸：800px × 606px，Modal 弹窗
- Group 选择 → 容器选择器 + Workload 表格联动加载
- 容器选择器：从所有 Workload 的 containers 聚合去重，默认选中第一个
- 超时时间配置：数字输入框，默认 60 秒，范围 5~3600 秒
- 表格列：复选框、集群名称、最大不可用（可编辑百分比）、最大可超出（只读）、可用度（只读）
- 底部操作栏：提示文字 + 取消/确定按钮，未选集群时确定按钮 disabled
- 提交接口 `runtimeOperationApi.restartWorkload()` 的请求体组装
- 提交成功后关闭弹窗并刷新 workloads-page

## Out Of Scope

- 单个 Pod 级别的重启（那是"批量重启 Pod"功能）
- 跨应用环境的批量重启
- 重启操作进度追踪/状态监控
- 重启操作的审计日志
- 重启操作的撤销/回滚
- 操作确认二次弹窗

## Main User Flows

### 流程 1：标准重启流程

1. 用户在 workloads-page 点击"重启"按钮
2. 弹窗打开，Group 下拉框开始加载
3. 用户选择 Group
4. 系统加载该 Group 下 Workload 列表，聚合容器名填充容器选择器（默认选中第一个），以当前选中容器过滤 Workload 后渲染集群表格
5. 用户可选：切换容器、修改超时时间、修改各行最大不可用值
6. 切换容器 → 以新选中容器名过滤 Workload 列表，重新渲染集群表格，清空已有勾选状态
7. 用户勾选目标 Workload 行后，"确定"按钮变为可点击
8. 用户点击"确定"，按钮进入 loading 态
9. 成功后关闭弹窗，刷新列表数据，显示成功提示
10. 失败时弹窗保持打开，显示错误信息，已填数据保留

### 流程 2：从 Group 操作菜单带入

1. 用户在 Group 操作菜单中点击"重启"
2. 弹窗打开，Group 下拉框预填为当前 Group，自动触发 Workload 列表加载
3. 后续步骤同流程 1 的第 4-9 步

### 流程 3：切换 Group

1. 用户切换 Group
2. 系统重新加载 Workload 列表，重新聚合容器列表并默认选中第一个，以当前选中容器过滤 Workload 后刷新表格

### 流程 4：取消操作

1. 用户直接点击取消按钮 → 关闭弹窗，不执行任何操作
2. （用户已做修改但点了取消：不做二次确认，直接关闭）

## Business Rules

- **Group → Workload 联动**：选择 Group 后自动查询其下 Workload 列表，切换 Group 时刷新
- **容器选择器聚合规则**：从所有 Workload 的 `containers[].name` 聚合，去重后作为下拉选项
- **容器切换联动表格**：切换容器后，以当前选中容器名为条件过滤 Workload 列表（只保留 `containers[]` 中包含该容器名的 Workload），按过滤后的 Workload 重新渲染集群表格，清空已有勾选状态
- **超时时间校验**：正整数，范围 5~3600 秒，默认 60 秒
- **最大不可用校验**：百分比数值，范围 1%~100%，输入框以百分比展示
- **选中集群与最大不可用的联动**：取消选中某行集群时，重置该集群的最大不可用值为原始值；当用户修改未选择集群的「最大不可用」值后，自动选中该集群
- **确定按钮可用条件**：至少选中一个集群
- **提交幂等性**：前端在 loading 期间禁用确定按钮，防止重复提交。后端幂等性由后端保证
- **appEnvID 来源**：由弹窗调用方（workloads-page）通过 props 传入，来源于当前路由的应用环境上下文

## Roles / Permissions

角色/权限对弹窗 UI 无差异化影响。操作权限由后端 API 校验，前端根据后端返回的权限错误码展示提示。本需求不涉及前端权限控制逻辑。【待确认】

## Edge Cases

| 状态                            | 表现                                                      |
| ------------------------------- | --------------------------------------------------------- |
| Group 列表为空                  | 工作负载 Select 展示空状态提示                            |
| 选中 Group 后容器聚合为空       | 容器 Select 展示空状态提示，表格仍正常渲染                |
| 选中 Group 后 Workload 列表为空 | 集群表格区域展示空状态提示                                |
| 超时时间为空                    | 输入框展示 placeholder                                    |
| 超时时间输入非法值              | 校验失败，输入框标红                                      |
| 最大不可用输入非法值            | 校验失败，输入框标红                                      |
| 接口请求中                      | 确定按钮展示 loading 态，禁用点击                         |
| Group/Workload 查询接口报错     | 对应区域展示内联错误提示（非全局 message）                |
| 提交接口报错                    | 弹窗保持打开，弹窗顶部/底部展示内联错误信息，已填数据保留 |
| 权限不足                        | 提交接口返回权限错误时，弹窗内展示"无操作权限"提示        |
| 并发提交                        | loading 期间确定按钮 disabled，防止重复提交               |

## Acceptance Criteria

- [ ] 点击 workloads-page"重启"按钮后弹窗正常打开（800×606px）
- [ ] 从 Group 操作菜单触发时 Group 下拉框正确预填并自动加载数据
- [ ] Group 下拉框数据正确加载自 `runtimeResourceApi.getWorkloadGroups()`
- [ ] 标题栏正确显示"重启"标题、环境信息和功能说明副标题
- [ ] 温馨提示区正确渲染暖色警告条
- [ ] 选择 Group 后容器选择器正确聚合去重容器名，默认选中第一个
- [ ] 选择 Group 后 Workload 表格正确加载，列展示：复选框、集群、最大不可用、最大可超出、可用度
- [ ] 可用度为空时显示"未启用"
- [ ] 超时时间输入框默认值 60，范围校验 5~3600
- [ ] 最大不可用输入框范围校验 1%~100%
- [ ] 未勾选任何行时确定按钮 disabled，底部提示"请选择一个集群后，再发起确定"
- [ ] 至少勾选一行后确定按钮可点击
- [ ] 切换 Group 后容器选择器和表格正确刷新
- [ ] 切换容器后以新容器名过滤 Workload，重新渲染表格，清空已有勾选状态
- [ ] 提交成功后弹窗关闭，显示成功提示，刷新列表数据
- [ ] 提交失败时弹窗保持打开，显示内联错误信息，已填数据保留
- [ ] 提交 loading 期间确定按钮 disabled
- [ ] 取消按钮点击后弹窗关闭，不执行任何操作

## Open Questions

以下问题需确认：

- **[非阻塞]** 用户已修改参数后点击取消是否需要二次确认？（当前设计：不需要）

## Implementation Notes

### 弹窗布局

#### 头部信息区

| 元素     | 说明                                                  |
| -------- | ----------------------------------------------------- |
| 标题     | "重启"，字号 20px，字重 Medium                        |
| 分隔线   | 1px 竖线                                              |
| 环境信息 | 展示当前所选环境名称，格式"环境: {环境名}"，字号 14px |
| 关闭按钮 | 右上角 X 图标，点击关闭弹窗                           |
| 副标题   | 重启行为说明文字，字号 12px，灰色                     |

**副标题文案**: "重启操作会按照部署并发度对所选工作负载下、指定集群的 Workload 进行重启，且多个集群并行执行。重启过程中不销毁容器，仅重新拉起进程。"

#### 温馨提示区

暖色警告条（背景色 #FFF3E0，圆角 8px），带两条提醒：

1. 重启过程中不会销毁容器，仅重新拉起进程。
2. 重启过程中会对重启 Pod 进行流量屏蔽操作，请关注重启完成后 ENS 的恢复状态。

#### 工作负载与容器选择（必选）

工作负载选择器与容器选择器**相邻放置**。

- **工作负载选择器**: Select 下拉框
  - **数据来源**: `runtimeResourceApi.getWorkloadGroups()`
  - **默认值**: 如外部带入，预填；否则为空，提示"请选择工作负载"
- **容器选择器**: Select 下拉框
  - **数据来源**: 选择 Group 后，从 Workload 列表聚合 `containers[].name`，去重
  - **默认值**: 默认选中第一个容器
- **联动关系**: 选 Group → 加载 Workload → 聚合容器列表 → 默认选中第一个 → 以当前容器过滤 Workload → 填充表格。切换容器时重新过滤并刷新表格，清空勾选状态

#### 超时时间配置

| 字段     | 类型       | 默认值 | 校验范围       |
| -------- | ---------- | ------ | -------------- |
| 超时时间 | 数字输入框 | 60     | 正整数, 5~3600 |

输入框宽 80px，右侧显示"秒"标签。

#### 集群与参数配置表格

| 列         | 类型 | 宽度  | 说明                                                |
| ---------- | ---- | ----- | --------------------------------------------------- |
| Checkbox   | 选择 | 40px  | 选中/取消选中该 Workload                            |
| 集群       | 展示 | 280px | 集群名称（`clusterName`），前带集群类型图标         |
| 最大不可用 | 输入 | 160px | 可编辑，字段 `updateStrategy.maxUnavailable`        |
| 最大可超出 | 展示 | 160px | 只读，字段 `updateStrategy.maxSurge`                |
| 可用度     | 展示 | 160px | 只读，字段 `availabilityTarget`，为空时显示"未启用" |

行高 48px。最大不可用列：数字输入框（80px × 32px）+ "%"后缀。

#### 底部操作栏

| 区域 | 元素     | 说明                                 |
| ---- | -------- | ------------------------------------ |
| 左侧 | 提示文字 | "请选择一个集群后，再发起确定"，灰色 |
| 右侧 | 取消按钮 | 点击关闭弹窗，不执行任何操作         |
| 右侧 | 确定按钮 | 提交重启操作，未选集群时 disabled    |

### 数据来源基线

| 表格列     | 类型 | 数据接口                                   | 字段                            |
| ---------- | ---- | ------------------------------------------ | ------------------------------- |
| Checkbox   | 选择 | --（前端状态）                             | --                              |
| 集群       | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `clusterName`                   |
| 最大不可用 | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `updateStrategy.maxUnavailable` |
| 最大可超出 | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `updateStrategy.maxSurge`       |
| 可用度     | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `availabilityTarget`            |

> 容器选择不在表格中，由弹窗级容器选择器统一决定，提交时作为 `targets[].container` 应用到所有选中 Workload。

### 触发接口

```ts
import runtimeOperationApi from '@/api/runtimeOperation';

runtimeOperationApi.restartWorkload({
    appEnvID: number,
    targets: [
        {
            clusterId: 'cluster-a',
            resourceType: 'apps.kruise.io/v1alpha1/clonesets',
            name: 'test-app',
            container: 'test-app',
            maxUnavailable: '25%',
        },
    ],
    exitTimeoutSeconds: 60,
});
```

通过封装好的 `runtimeOperationApi.restartWorkload()` 方法提交，前端不关心底层 operation name，仅依赖该 RESTful 封装接口。

**请求体字段映射**：

| 字段                       | 来源                              |
| -------------------------- | --------------------------------- |
| `targets[].clusterId`      | 勾选 Workload 行 → `clusterId`    |
| `targets[].resourceType`   | 勾选 Workload 行 → `resourceType` |
| `targets[].name`           | 勾选 Workload 行 → `name`         |
| `targets[].container`      | 弹窗级容器选择器当前选中值        |
| `targets[].maxUnavailable` | 该行最大不可用输入框的值          |
| `exitTimeoutSeconds`       | 超时时间输入框的值                |

### API 依赖

| 接口                                                                       | 用途               |
| -------------------------------------------------------------------------- | ------------------ |
| `runtimeResourceApi.getWorkloadGroups()`（`src/api/runtimeResource.ts`）   | 查询 Group 列表    |
| `runtimeResourceApi.getRuntimeWorkloads()`（`src/api/runtimeResource.ts`） | 查询 Workload 列表 |
| `runtimeOperationApi.restartWorkload()`（`src/api/runtimeOperation.ts`）   | 触发重启           |

### 与批量重启 Pod 的区别

| 项目       | 重启（本弹窗）                | 批量重启 Pod              |
| ---------- | ----------------------------- | ------------------------- |
| targetKind | Workload                      | Pod                       |
| 触发入口   | workloads-page 标题栏操作按钮 | Pod 列表批量操作栏        |
| 选择维度   | Group → Workload（集群+容器） | 直接选择 Pod 列表中的 Pod |
| 接口       | `runtime/workloads`           | Pod 列表接口              |
| capability | Restart                       | PodRestart                |

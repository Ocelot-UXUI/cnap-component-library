# Feature: 横向扩缩弹窗

> 状态：已实现（2026-07-25，plan `docs/plans/2026-07-25-workload-operation-dialogs-plan.md`）
> 来源：Figma 设计稿「Frame 1912057553」+ API 文档 `docs/input/source-api-runtime-workloads.md`
> 父需求：`docs/requirements/workloads-page.md`（从标题栏操作按钮"横向扩缩"打开）

## Goal

提供批量横向扩缩 Workload 期望副本数的弹窗交互流程：用户选择工作负载（Group）和目标容器，按容器过滤出包含该容器的 Workload（按集群维度），为选中的 Workload 分别设置期望副本数后提交。

## In Scope

- 弹窗结构：标题栏、Group 选择器、容器选择器、Workload 配置表格、底部操作栏
- Group 选择 → 容器选择器 + Workload 表格联动加载
- 容器选择器：从 Workload 列表聚合 `containers[].name` 去重，默认选中第一个
- 选中容器后按容器过滤 Workload，仅展示包含该容器的 Workload 的集群行
- 表格列：复选框、集群名称、当前副本数（只读）、期望副本数（可编辑）、最大不可用（只读）、可用度（只读）
- 期望副本数输入校验（正整数）
- 确定按钮可用性判定（至少选中一个集群且所有期望副本数合法）
- 提交接口 `runtimeOperationApi.horizontalScale()` 的请求体组装
- 弹窗尺寸：宽度 800px，高度自适应
- 从 workloads-page 标题栏"横向扩缩"按钮触发
- 从 Group 操作菜单带入预填 Group

## Out Of Scope

- 批量编辑期望副本数（全选后统一设值）
- 同步当前副本数到期望副本数的一键填充
- 扩缩操作的二次确认弹窗
- 扩缩进度/状态追踪
- 扩缩操作的撤销/回滚

## Main User Flows

### 流程 1：标准扩缩流程

1. 用户在 workloads-page 点击"横向扩缩"按钮
2. 弹窗打开，Group 下拉框显示，Workload 表格为空
3. 用户从下拉框选择一个 Group
4. 系统加载该 Group 下的 Workload 列表，聚合容器名填充容器选择器（默认选中第一个），以选中容器过滤 Workload（只保留包含该容器的），渲染到表格中（各行默认未选中）
5. 用户勾选目标 Workload 行，在期望副本数输入框中填入目标值
6. 所有选中行的期望副本数合法后，"确定"按钮变为可点击
7. 用户点击"确定"
8. 系统发送 `horizontalScale` 请求，按钮进入 loading 态
9. 提交成功后关闭弹窗并显示成功提示
10. 提交失败时弹窗保持打开，显示错误信息，已填数据保留

### 流程 2：从 Group 操作菜单带入

1. 用户在 Group 操作菜单中点击"横向扩缩"
2. 弹窗打开，Group 下拉框预填为当前 Group
3. 系统自动加载该 Group 下的 Workload 列表，聚合容器名填充容器选择器（默认选中第一个），以选中容器过滤 Workload
4. 后续步骤同流程 1 的第 4-10 步

### 流程 3：切换 Group 或容器

1. 切换 Group → 重新加载 Workload 列表 → 重新聚合容器列表并默认选中第一个 → 以选中容器过滤 Workload → 刷新表格，清空勾选状态
2. 切换容器 → 以新容器名过滤 Workload → 重新渲染表格，清空勾选状态

## Business Rules

- **容器选择器聚合规则**：从所有 Workload 的 `containers[].name` 聚合，去重后作为下拉选项
- **容器切换过滤表格**：切换容器后，以当前选中容器名为条件过滤 Workload 列表（只保留 `containers[]` 中包含该容器名的 Workload），按过滤后的 Workload 重新渲染集群表格，清空已有勾选状态
- **期望副本数校验规则**：必须为正整数（≥1），无上限（旧副本数不设上限）。上限由服务端校验，前端不做硬上限限制
- **期望副本数默认值**：输入框初始值为该行 Workload 的当前副本数（`replicas`）
- **提交策略**：该操作为**异步操作**。触发接口后服务端生成操作订单，只要操作订单成功生成即视为本次操作提交成功——弹窗关闭并展示成功提示，不需要等待各集群实际扩缩结果，也不需要处理多集群同步/部分失败。若触发接口本身返回错误（订单未生成），弹窗保持打开、保留已填数据并展示错误信息
- **确定按钮状态**：至少选中一个 Workload 且所有选中行的期望副本数均合法时可用

## Roles / Permissions

角色/权限对弹窗 UI 无差异化影响。操作权限由后端校验，前端仅根据后端返回的权限错误码展示提示。本需求不涉及前端权限控制逻辑。【待确认】

## Edge Cases

- Group 列表为空：下拉框显示空状态占位提示"暂无可用工作负载"
- 选中 Group 后容器聚合为空：容器 Select 展示空状态提示，集群表格展示空状态
- 选中 Group 下无 Workload：表格区域显示空状态"该工作负载下暂无集群"
- Workload 正在滚动更新中：仍可选择并设置期望副本数，后端负责处理冲突
- 期望副本数输入 0 或负数：校验失败，输入框标红并提示"请输入正整数"
- 期望副本数输入超大值（如 999999）：前端不限制，由后端返回校验错误
- 并发提交：用户快速双击"确定"按钮，前端在 loading 期间禁用按钮防止重复提交

## Acceptance Criteria

- [ ] 点击 workloads-page"横向扩缩"按钮后弹窗正常打开
- [ ] 从 Group 操作菜单触发时 Group 下拉框正确预填
- [ ] Group 下拉框数据正确加载自 `runtimeResourceApi.getWorkloadGroups()`
- [ ] 选择 Group 后 Workload 列表正确加载自 `runtimeResourceApi.getRuntimeWorkloads()`
- [ ] 选择 Group 后容器选择器正确聚合去重容器名，默认选中第一个
- [ ] 选中容器后表格仅展示包含该容器的 Workload 的集群行
- [ ] 未选择 Group 或 Group 下无 Workload 时，表格区域展示空状态
- [ ] 表格每行正确显示：集群名称、当前副本数、最大不可用、可用度
- [ ] 可用度为空时显示"未启用"
- [ ] 期望副本数输入框默认值为该行当前副本数（`replicas`）
- [ ] 期望副本数输入框：输入非正整数时有校验提示，输入框标红；无上限限制
- [ ] 未勾选任何行时确定按钮 disabled，底部提示"请选择一个集群后，再发起确定"
- [ ] 至少勾选一行且所有期望副本数均合法时确定按钮可点击
- [ ] 勾选行中有任一期望副本数不合法时确定按钮 disabled
- [ ] 提交成功后弹窗关闭，显示成功提示
- [ ] 提交失败时弹窗保持打开，显示错误信息，已填数据保留
- [ ] 提交 loading 期间确定按钮 disabled，防止重复提交
- [ ] 切换 Group 后表格和勾选状态正确重置
- [ ] 切换容器后以新容器名过滤 Workload，表格重新渲染，清空勾选状态

## Open Questions

- ~~期望副本数的默认值策略~~（已确认）：默认值为该行当前副本数 `replicas`。
- ~~期望副本数的上限约束~~（已确认）：无上限，仅要求 ≥1 的正整数，上限由服务端校验。
- ~~多集群提交失败时的行为~~（已确认）：本操作为异步操作，触发接口生成操作订单即视为成功，不处理多集群同步/部分失败。
- **[非阻塞]** 操作确认后是否需要二次确认弹窗？（当前 Out Of Scope）

## Implementation Notes

### 弹窗结构

#### 头部区域

- **标题**：显示"横向扩缩"，字号 20px，加粗
- **环境信息**：格式"环境 : {环境名称}"，位于标题右侧、以竖线分隔
- **关闭按钮**：右上角 X 图标
- **功能介绍文字**：字号 12px，灰色，"横向扩缩是在保持当前 Pod 配置和规格的前提下，调整集群内 Pod 的数量。"

#### 工作负载与容器选择（必选）

- **工作负载选择器**: Select 下拉框
  - **数据来源**: `runtimeResourceApi.getWorkloadGroups()`
  - **默认值**: 如外部带入已选中的工作负载，预填该值
- **容器选择器**: Select 下拉框
  - **数据来源**: 选择 Group 后，从 Workload 列表聚合 `containers[].name`，去重
  - **默认值**: 默认选中第一个容器
- **联动关系**: 选 Group → 加载 Workload → 聚合容器列表 → 默认选中第一个 → 以选中容器过滤 Workload → 填充表格。切换容器时重新过滤并刷新表格，清空勾选状态

#### 配置表格区域

表格每行代表一个 Workload（对应一个集群）。

| 列         | 类型 | 说明                                                                |
| ---------- | ---- | ------------------------------------------------------------------- |
| 复选框     | 选择 | 选中/取消选中该 Workload                                            |
| 集群       | 展示 | 集群名称（`clusterName`），前带供应商图标                           |
| 当前副本数 | 展示 | 该 Workload 当前的 Pod 副本数（`replicas`），只读                   |
| 期望副本数 | 输入 | 用户设定的目标 Pod 副本数，输入框编辑（宽 80px，高 32px，圆角 8px） |
| 最大不可用 | 展示 | `updateStrategy.maxUnavailable`，只读                               |
| 可用度     | 展示 | `availabilityTarget`，为空时显示"未启用"，只读                      |

行高 48px。

#### 底部操作栏

- **左侧**：提示文字，动态变化。未选中时"请选择一个集群后，再发起确定"
- **右侧**：取消按钮 + 确定按钮，样式遵循组件库默认规范

### 数据来源基线

| 表格列     | 类型 | 数据接口                                   | 字段                            |
| ---------- | ---- | ------------------------------------------ | ------------------------------- |
| 复选框     | 选择 | --（前端状态）                             | --                              |
| 集群       | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `clusterName`                   |
| 当前副本数 | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `replicas`                      |
| 期望副本数 | 输入 | --（用户输入）                             | --                              |
| 最大不可用 | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `updateStrategy.maxUnavailable` |
| 可用度     | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `availabilityTarget`            |

> 表格仅展示 `containers[]` 中包含当前选中容器名的 Workload。

### 触发接口

```ts
import runtimeOperationApi from '@/api/runtimeOperation';

runtimeOperationApi.horizontalScale({
    appEnvID: number,
    targets: [
        {
            clusterId: 'cluster-a',
            resourceType: 'apps/v1/deployments',
            name: 'api',
            replicas: 10,
        },
    ],
});
```

通过封装好的 `runtimeOperationApi.horizontalScale()` 方法提交（见 `src/api/runtimeOperation.ts:111`），前端仅依赖该 RESTful 封装接口，不关心底层 operation name。

**请求体字段映射**：

| 字段                     | 来源                                |
| ------------------------ | ----------------------------------- |
| `targets[].clusterId`    | 勾选的 Workload 行 → `clusterId`    |
| `targets[].resourceType` | 勾选的 Workload 行 → `resourceType` |
| `targets[].name`         | 勾选的 Workload 行 → `name`         |
| `targets[].replicas`     | 该行期望副本数输入框的值            |

> 容器选择器仅用于过滤集群表格中展示的 Workload，不传入 API 请求体。

### API 依赖

| 接口                                                                       | 用途               |
| -------------------------------------------------------------------------- | ------------------ |
| `runtimeResourceApi.getWorkloadGroups()`（`src/api/runtimeResource.ts`）   | 查询 Group 列表    |
| `runtimeResourceApi.getRuntimeWorkloads()`（`src/api/runtimeResource.ts`） | 查询 Workload 列表 |
| `runtimeOperationApi.horizontalScale()`（`src/api/runtimeOperation.ts`）   | 触发横向扩缩       |

### 与重启弹窗的差异

| 项目       | 横向扩缩                             | 重启                              |
| ---------- | ------------------------------------ | --------------------------------- |
| 可编辑字段 | 期望副本数                           | 最大不可用                        |
| 超时时间   | 无                                   | 有（exitTimeoutSeconds）          |
| 容器选择   | 弹窗级选择器（仅过滤表格，不入 API） | 弹窗级选择器（过滤表格 + 入 API） |
| 只读字段   | 当前副本数、最大不可用、可用度       | 最大可超出、可用度                |

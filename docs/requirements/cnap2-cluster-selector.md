# Feature: CNAP 2.0 Cluster Selector

## Status

已实现（2026-07-25，plan `2026-07-25-cnap2-cluster-selector-plan`）。剩余 Open Questions（"绑定新集群"流程、其他页面是否需要集群上下文）为非阻塞，保持占位。

## Source Inputs

- `docs/requirements/cnap2-breadcrumb-context-selectors.md` — 环境选择器参考实现
- `src/routers/AppLayout/topNavigation/breadcrumb/EnvironmentDropdown.tsx` — 参考交互模式
- `src/routers/AppLayout/topNavigation/breadcrumb/BreadcrumbContextSelectors.tsx` — 维度选择器编排
- `src/routers/AppLayout/topNavigation/breadcrumb/DimensionSelector.tsx` — 可复用的 Dropdown 触发器
- `src/interface/entities/applicationEnvironment.ts` — 现有 AppEnvironmentCluster 实体类型
- `src/api/applicationEnvironment.ts` — 现有 getClusters 接口 (GET /application-environments/{appEnvID}/clusters)
- `src/types/cluster.ts` — Cluster 类型 (含 pods.running / pods.total)

## Goal

在现有账户、应用、环境三维度选择器的面包屑链路中，新增**集群选择器**作为第四维度，使用户在选中环境后可进一步选定具体集群（单选），为后续运行时操作（工作负载等）提供集群上下文。默认选中"全部集群"，表示查看当前环境下所有集群的数据。

## In Scope

- 集群选择器在面包屑中的展示与交互（默认"全部集群"、单选/取消选中）
- Dropdown 面板以表格形式展示集群列表（集群名称、类型、期望副本/可用副本三列）
- 集群行的 hover、选中态
- "绑定新集群" footer 按钮占位
- 集群选择器与现有 NavigationContext 状态机的集成（新增 clusterId 维度）
- 面包屑宽度计算适配第四维度选择器
- ContextRequirements 扩展，支持页面按需显示集群选择器（当前仅工作负载路由需要，且需同时携带 `environmentId` 上下文）

## Out Of Scope

- "绑定新集群"功能的真实绑定流程实现（仅占位按钮）
- 集群详情页跳转或集群管理页集成
- 集群列表的分页、服务端搜索、表格排序
- 非表格形式的集群选择器变体
- 移动端或窄屏适配

## 规范映射与 Roles / Permissions

本文件针对面包屑维度选择器，章节组织与 `00-requirement-synthesis-guide.md` 骨架的对应关系：

- **Main User Flows** → 见 `Row Interaction`（单选/取消/hover/搜索）与 `Navigation Context Integration`（级联规则）。
- **Edge Cases** → 见 `Loading, Empty, Error States`。
- **Roles / Permissions**：集群选择器不涉及前端权限控制；集群列表可见性与数据由后端 `getClusters` 接口返回决定，本需求不做角色差异化处理。

## Minimal Data Model Requirements

### 集群选择器选项

直接使用已有 `GET /application-environments/{appEnvID}/clusters` 接口返回的 `AppEnvironmentCluster` 类型：

```typescript
interface AppEnvironmentCluster {
    id: number;
    applicationEnvironmentId: number;
    clusterId: string;
    clusterName: string;
    clusterConnector: string;
    desiredReplicas: number;
    availableReplicas: number;
}
```

| 表格列            | 对应字段                                | 说明                                                |
| ----------------- | --------------------------------------- | --------------------------------------------------- |
| 集群名称          | `clusterName`                           | 主要标识列                                          |
| 类型              | `clusterConnector`（如 EKS-CCE）        | 集群连接器/提供方                                   |
| 期望副本/可用副本 | `desiredReplicas` / `availableReplicas` | 展示为 `{availableReplicas}/{desiredReplicas}` 格式 |

### 维度状态扩展

`NavigationContextState` 需新增 `clusterId` 字段：

```typescript
export interface NavigationContextState {
    accountId?: number;
    applicationId?: number;
    environmentId?: number;
    clusterId?: string; // 新增
}
```

`ContextKey` 和 `ContextRequirements` 同步扩展：

```typescript
export type ContextKey = 'accountId' | 'applicationId' | 'environmentId' | 'clusterId';
```

## Breadcrumb Display Requirements

集群选择器作为面包屑的第四个维度段，位于环境选择器之后：

```
CNAP > [账户] > [应用] > [环境] > [集群]
```

- **默认值**：面包屑中集群选择器的默认显示文本为 **"全部集群"**。此时 `clusterId` 为 `undefined`，表示查询当前环境下所有集群的数据。
- **选中集群后**：触发按钮显示已选集群的 `clusterName`，附带下拉箭头。
- **取消选中**：用户可通过点击下拉面板中已选中的行取消选择，恢复为"全部集群"。
- 触发按钮样式与环境选择器一致。
- 最大宽度计算算法扩展现有的 `useBreadcrumbSelectorWidth`，将 `cluster` 纳入计数维度。
- 文本溢出时使用中间省略（`...`），行为与其他选择器一致。

## Cluster Dropdown Requirements

### Panel Structure

集群下拉面板整体布局沿用 `EnvironmentDropdown` 的 `DropdownPanel` 结构：

- **搜索框**：保留 `DimensionSearchBox`，placeholder 为"请输入集群名称"，对表格行做本地 `contains` 过滤。
- **无 Tabs 切换**：与环境选择器不同，集群下拉**没有**类型切换 Tab。
- **表格区域**：替代 `EnvironmentDropdown` 的 `DimensionOptionList`，使用 antd `Table` 展示集群数据。
- **Footer**：包含"绑定新集群"占位按钮。

面板尺寸参考环境选择器（约 480px 宽），高度根据表格行数自适应。

### Table Columns

| 列名              | 宽度建议 | 说明                                                |
| ----------------- | -------- | --------------------------------------------------- |
| 集群名称          | flex: 2  | 展示 `clusterName`，作为主要标识列                  |
| 类型              | flex: 1  | 展示 `clusterConnector`，如 `EKS-CCE`               |
| 期望副本/可用副本 | flex: 1  | 展示为 `{availableReplicas}/{desiredReplicas}` 格式 |

表格使用 antd `Table` 组件，配置 `size="small"`，**不带分页**（集群数量不会过大）。表格行按接口返回的原始顺序展示，不做排序。

### Row Interaction

- **单选**：用户只能在待选列表中单选某个集群，或取消选中。行为类似 radio group。
- **选中**：点击未选中的行 → 选中该集群，`clusterId` 更新为对应值，关闭下拉面板，面包屑显示集群名称。
- **取消选中**：点击已选中的行 → 取消选中，`clusterId` 设为 `undefined`，关闭下拉面板，面包屑恢复为"全部集群"。
- **hover 态**：整行背景变为浅灰（与现有 `#f7f7f7` hover 规则一致），指针变为手型。
- **选中态标识**：选中行背景使用浅绿色（与环境选中态一致的 `rgba(167, 243, 207, 0.2)`）。
- **搜索过滤**：搜索词对 `clusterName` 做本地 `contains` 匹配；若无匹配结果，表格区域显示 antd `Empty`。

### Footer

- 按钮文本：`绑定新集群`
- 图标：`PlusOutlined`
- 交互：占位按钮，点击后 `console.log` 占位，不绑定真实业务流程。

## Navigation Context Integration

### 级联规则

集群维度位于环境之下，形成四级层级链路：

```
账户 → 应用 → 环境 → 集群
```

- 选择账户 → 清除应用、环境、集群
- 选择应用 → 清除环境、集群
- 选择环境 → 清除集群，加载集群列表
- 选择集群 → 仅更新 clusterId

### 状态机扩展

在 `navigationContextMachine.ts` 中新增 `selectCluster` 事件和处理：

```typescript
selectCluster: {
    actions: ['applySelection', { type: 'notifyOptionGroup', params: { clusterChanged: true } }],
}
```

在 `navigationOptionGroupMachine.ts` 中新增 `cluster` 并行区域，监听 `environmentChanged` 事件（environmentId 变化时触发），当 environmentId 有效时加载对应集群列表。同时 `applicationChanged` 时 cluster 区域重置为空闲态并清空数据。

### API 调用

复用已有 `applicationEnvironmentApi.getClusters({ appEnvID })`。加载时机：用户选定环境后，由 `optionGroupMachine` 的 `cluster` 区域发起请求。

首次实现时，参考 `loadNavigationContextCandidates` 的预加载策略，在环境数据就绪后按需加载集群列表，不作为启动时的阻塞依赖。

## Loading, Empty, Error States

- **加载中**：表格区域展示 antd `Spin` 或 `Skeleton`。
- **空数据**：选定环境下无绑定集群时，表格区域显示 antd `Empty`，描述文案"暂无集群，请绑定新集群"。
- **接口错误**：表格区域显示错误提示，提供重试按钮重新调用 `getClusters`。
- **未选环境**：若环境尚未选定，集群选择器触发器显示为禁用态或占位文本，不展示下拉内容。

## Business Rules

- 集群选择器是四级上下文链路的最后一级，与账户→应用→环境保持同一层级关系。
- 仅当当前路由的 `contextRequirements` 包含 `clusterId` 时才在面包屑中显示集群选择器。**当前仅工作负载 (`applications.workloads`) 路由需要集群上下文，且因集群依赖环境，该路由需同时声明 `environmentId` 和 `clusterId`。**
- 集群选择器为**单选**：用户选中一个集群或取消选中。无选中时 `clusterId` 为 `undefined`。
- **"全部集群"概念**：
  - 面包屑默认显示"全部集群"，此时 `clusterId` 为 `undefined`。
  - `clusterId === undefined` 表示查看当前环境下**所有集群**的数据。
  - 对消费方（如工作负载页面）：不需要处理"全部集群"这一特殊概念。没有 `clusterId` 值时，接口查询自然不带集群过滤参数，即查询所有集群下的数据。
- 集群选择器选中值 (`clusterId`) 应持久化到 localStorage（跟随现有的 `storedContext` 机制）。
- 切换上层维度（账户/应用/环境）时，已选的 `clusterId` 应被清除，恢复为"全部集群"。

## Open Questions

1. **"绑定新集群"后续流程**：点击后具体交互流程（弹窗选集群、跳转绑定页等）待产品确认。
2. **其他需要集群上下文的页面**：当前仅确认工作负载路由需要 `clusterId`（同时需要 `environmentId`）。Pod 列表、日志等页面是否需要集群上下文？

## Acceptance Criteria

- 面包屑中新增集群选择器段，位于环境选择器之后，**默认显示"全部集群"**。
- `clusterId` 为 `undefined` 时，面包屑显示"全部集群"；选中某集群后显示对应集群名称。
- 集群下拉面板使用 antd `Table` 展示集群名称、类型、期望副本/可用副本三列，按接口原始顺序排列，无分页无排序。
- 期望副本/可用副本列以 `{availableReplicas}/{desiredReplicas}` 格式展示真实数据。
- 表格支持基于集群名称的本地搜索过滤。
- **单选交互**：点击行选中集群，点击已选中的行取消选中（恢复"全部集群"）。
- 表格行支持 hover 和选中态，选中/取消选中后关闭面板并更新面包屑显示。
- Footer 包含"绑定新集群"占位按钮。
- 选择器宽度计算适配四维度（账户、应用、环境、集群）。
- `ContextRequirements` 支持 `clusterId`，当前工作负载 (`applications.workloads`) 路由同时声明 `environmentId` 和 `clusterId` 需求。
- 集群选择器在环境未选定时不可用或显示占位态。
- 切换上层维度（账户/应用/环境）清除已选集群，恢复为"全部集群"。
- 消费方不感知"全部集群"概念：`clusterId` 为 `undefined` 时不传集群过滤参数，自然查询所有集群数据。
- 加载、空数据、接口错误状态均有合适展示。
- 搜索无结果时表格区域显示 antd `Empty`。
- 已确认的问题以明确决策记录，剩余 Open questions 以显式未决问题保留。

# Feature: 工作负载页面

> 状态：进行中（子需求 1）
> 来源：Figma 设计稿「工作负载-页面（方案1：灰色底bar，操作栏悬浮在上）」

## Goal

实现 CNAP 2.0 工作负载页面，展示应用下所有 Pod 实例的运行状态、资源用量和操作入口。页面采用分阶段实现，保持子需求细粒度，确保每步可验证、可回退。

## 页面整体结构

从 Figma 设计稿分析，页面分为以下区域（排除已由 AppLayout 提供的顶部导航和左侧主导航）：

| 区域              | 说明                                                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A. 页面标题栏     | "工作负载" 标题 + 分隔线 + WorkloadGroupSelector（工作负载分组选择器，默认"全部工作负载"）+ 右侧操作按钮区（最多外露 3 个，超出收纳到"更多" dropdown 中）。功能细化见下文「A 区域功能细化」 |
| B. 概览卡片区域   | 3 张卡片并排：最近部署（部署完成）、运行配置（v24）、资源总量（CPU / 内存 / GPU）                                                                                                           |
| C. Tab 切换区     | 全部Pod / 运行时 / 异常 / 已屏蔽，带选中下划线和计数                                                                                                                                        |
| D. 筛选工具栏     | 左侧：状态 Select + 屏蔽与解除屏蔽 Select + 搜索框；右侧：收起 / 展开 / 刷新 / 视图切换                                                                                                     |
| E. Pod 表格       | 列：Pod / 状态 / 灰度Pod / Pod IP / 端口 / 服务暴露 / 重启 / 存活 / CPU / 内存 / 操作                                                                                                       |
| F. 分页器         | 页码 + 每页条数选择                                                                                                                                                                         |
| G. 底部信息栏     | 灰色底 bar：服务名 + Rollout 标签 + 版本 + Pod 统计                                                                                                                                         |
| H. 悬浮批量操作栏 | 深色 bar：已选择 N 个实例 + 批量操作按钮。**具体操作集合、按钮可用性与交互见子需求 `batch-action-bar.md`，本文不重复描述**                                                                  |

## 子需求拆分

### 子需求 1：整体页面布局 + A/B/H 区域（当前）

#### In Scope

- **路由与导航注册**：在 `src/routes/`、`src/routers/index.tsx`、`src/navigation/` 中注册工作负载页面路由和侧边栏导航项
- **页面整体布局骨架**：flex column 结构，A/B 在顶部，内容区占剩余空间，H 在底部
- **A 区域（WorkloadsHeader）**：标题 + 分隔线 + "全部工作负载" 文本 + 右侧操作按钮区。按钮仅 UI 静态展示，点击为占位方法
  > 注：子需求 1 为静态壳子阶段。A 区域的功能化（WorkloadGroupSelector 真实数据 + 标题栏操作按需渲染与点击路由）见下文「A 区域功能细化」。
  - 操作按钮外露规则：最多外露 3 个按钮；超出 3 个时，剩余操作收纳到"更多"按钮的 dropdown 中
  - 外露按钮（前 3 个）：重启、横向扩缩、纵向扩缩
  - "更多" dropdown 操作项（从上到下）：
    1. 应用临时授权
    2. 开启调试
    3. ~~分隔线~~
    4. 删除部署资源（危险操作，红色文字，与上方操作之间有分隔线）
  - "更多"按钮交互：点击时显示 dropdown（antd Dropdown 组件）
- **B 区域（WorkloadsOverview）**：3 张卡片，mock 静态数据写死
  - 卡片 1：最近部署 → "部署完成"（品牌绿色文字）
  - 卡片 2：运行配置 → "v24"
  - 卡片 3：资源总量 → CPU 338c / 内存 887Gi / GPU 18卡
- **H 区域（BatchActionBar）**：仅提供占位壳子，用于验证浮现/消失交互。不实现内部业务逻辑（按钮集合与交互见子需求 `batch-action-bar.md`）
  - H 区域从页面底部浮现和消失，使用 framer-motion `AnimatePresence` 动画（与项目现有 Motion 模式一致）
  - H 出现时挤压内容区高度（flex 布局，H 作为 flex 子项占据底部空间）
  - H 的显隐通过判断 portal 目标容器是否有子元素来控制
  - 后续内容区实现时，通过 React `createPortal` 将 H 组件内容渲染到页面级 portal 目标容器
  - 壳子内部仅渲染占位内容（如"批量操作栏占位"文字），用于验证显隐效果
- **内容区占位**：一个占位 div（flex:1, overflow:auto），内部放临时 toggle 按钮触发 H 的浮现和消失。后续替换为真实内容区（C-G）

#### Out Of Scope

- C/D/E/F/G 区域的具体实现（后续子需求）
- H 区域内部的业务逻辑（按钮点击行为、选中计数等）
- A 区域操作按钮的具体业务逻辑
- B 区域卡片数据的 API 接入
- 页面数据的 API 对接

#### 技术决策

| 决策         | 选择                                                                  | 原因                                                                 |
| ------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 页面 padding | 使用 WorkspaceContentLayout 默认 padding（24px 32px）                 | 不需要 full-bleed 模式                                               |
| H 的定位方式 | flex 子项（非 fixed/absolute）                                        | H 出现时自然挤压内容区高度                                           |
| H 的显隐机制 | portal 目标容器检测子元素是否存在                                     | 内容区通过 createPortal 渲染 H 内容到目标容器，容器有子元素则 H 可见 |
| H 的动画     | framer-motion AnimatePresence + height/opacity                        | 与项目现有 Motion 模式一致                                           |
| A/B 数据来源 | mock 静态数据写死                                                     | 后续接入 API                                                         |
| A 操作按钮   | UI 静态展示 + 占位 onClick                                            | 后续实现业务逻辑                                                     |
| 样式方案     | `@emotion/styled` for 布局容器                                        | 遵循 AGENTS.md 布局规范                                              |
| 设计 Token   | `semantic.*` / `radius.*` / `spacing.*` / `shadow.*` / `typography.*` | 禁止 hex 字面量                                                      |

#### 页面布局结构

```
WorkloadsPage (flex column, height: 100%)
├── A: WorkloadsHeader          — 自然高度
├── B: WorkloadsOverview        — 自然高度
├── ContentArea (占位)           — flex: 1, overflow: auto
│   └── 临时 toggle 按钮          — 触发 H 显隐
└── PortalTarget                — H 通过 createPortal 渲染到此容器
    └── BatchActionBar (AnimatePresence)
```

#### 组件文件结构

```
src/pages/Workloads/
├── index.tsx                        # 页面入口，组装各区域 + portal 目标容器
├── WorkloadsHeader/
│   ├── index.tsx                    # A. 标题栏 + 操作按钮
│   └── WorkloadsHeader.style.ts     # 样式
├── WorkloadsOverview/
│   ├── index.tsx                    # B. 三卡片容器
│   ├── DeploymentCard.tsx           #   最近部署卡片
│   ├── ConfigCard.tsx               #   运行配置卡片
│   ├── ResourceCard.tsx             #   资源总量卡片
│   └── WorkloadsOverview.style.ts   # 样式
├── BatchActionBar/
│   ├── index.tsx                    # H. 悬浮操作栏容器 + 显隐动画
│   └── BatchActionBar.style.ts      # 样式
├── ContentAreaPlaceholder.tsx       # 内容区占位 + mock toggle
└── mockData.ts                      # mock 数据
```

#### 需修改的现有文件

| 文件                                                             | 修改内容                               |
| ---------------------------------------------------------------- | -------------------------------------- |
| `src/routes/workloads.ts`                                        | 新建，定义 workloads 路由              |
| `src/routes/index.ts`                                            | 注册 workloads 路由                    |
| `src/routers/index.tsx`                                          | 添加 lazy import + route 配置          |
| `src/navigation/types.ts`                                        | 扩展 WorkspaceKey 和 NavigationNodeKey |
| `src/navigation/registry.ts`                                     | 注册 workspace 和 navigation node      |
| `src/routers/AppLayout/workspace/navigation/navigationIcons.tsx` | 添加工作负载图标                       |

### 子需求 2：Pod 列表内容区域（D/E/F 区域）— 当前

详见 `docs/requirements/pod-list-content-area.md`

> 基于 Figma 设计稿的最新需求，将原 D/E/F 区域合并为一个子需求。
>
> **范围**：顶部工具栏（快捷筛选 + 操作图标）、筛选操作区（状态/屏蔽与解除屏蔽/搜索）、Pod 分组表格（每个 group 独立表格 + 独立分页）。**对接真实 API（2026-07-25 用户指示纳入本切片）。**
> **不在范围**：Tab 切换区（后续子需求）、底部信息栏 G（后续）、Pod 详情抽屉（后续）。

### 子需求 3（后续）

- C 区域（Tab 切换区）
- G 区域（底部信息栏）
- **H 区域内部业务逻辑**：
  - 详见 `docs/requirements/batch-action-bar.md`（批量操作栏）
  - 核心批量操作入口：详见 `docs/requirements/batch-restart-pod-modal.md`（批量重启 Pod 弹窗）
  - 删除重建弹窗：详见 `docs/requirements/batch-pod-delete-rebuild-dialog.md`
  - 强制删除弹窗：详见 `docs/requirements/batch-pod-force-delete-dialog.md`
  - 其余批量操作（屏蔽、解除屏蔽）待后续补充
- 表格排序

### 子需求 4（后续）

- API 对接
- 数据联调

## A 区域功能细化：WorkloadGroupSelector 与标题栏操作路由

> 承载 A 区域从"静态壳子（子需求 1）"到"功能化"的实现级需求，是纵向扩缩等 Workload 级操作弹窗的触发前置依赖。

### WorkloadGroupSelector（工作负载分组选择器）

- **改名**：原 A 区域"全部工作负载"下拉（代码内 `ScopeSelector`）更名为 **WorkloadGroupSelector**。
- **数据来源**：`GET /rest/v1/application-environments/:appEnvID/runtime/groups`（`runtimeResourceApi.getWorkloadGroups()`）；下拉项为返回的 WorkloadGroup 列表，展示 `name`、值取 `id`。
- **受集群参数影响**：随面包屑集群选择器的 `clusterId` 变化——选定集群时以 `clusterId` 作为 `getWorkloadGroups` 查询参数，仅展示该集群下的分组；未选集群（"全部集群"）时不带该参数，展示当前环境全部分组。集群切换时重新拉取并重置已选分组。
- **单选 + 默认**：单选；默认显示"全部工作负载"（未选中任何具体分组，`groupId` 为空）。
- **选中语义**：选中某分组后，其 `id`（groupId）作为**当前已选工作负载**，供 Workload 级操作弹窗（重启 / 横向扩缩 / 纵向扩缩）默认带入的 Group；未选中时弹窗内 Group 选择器为空、由用户在弹窗内选择。
- **状态、加载与空态**：加载中下拉展示 loading；无分组时展示空态；接口失败保留"全部工作负载"并可重试。

### 标题栏操作渲染与路由

- **数据来源**：`runtimeOperationApi.getOperations()`；按 `capability` 识别功能、`targetKind` 决定展示位置。
- **渲染范围**：标题栏（右上角操作区）**仅渲染 `targetKind` 为 `None` 或 `Workload` 的操作**；`targetKind` 为 `Pod` 的操作不在此渲染（属于 Pod 行内 / 批量操作，见 `pod-list-content-area.md` 与 `batch-action-bar.md`）。
- **外露与收纳**：最多外露 3 个，其余收纳至"更多"dropdown；`disabled=true` 置灰并 hover 展示 `reason`；危险操作（如删除部署资源）红色文字 + 与上方操作间加分隔线。
- **点击路由**：点击按 `capability` 路由到对应弹窗（重启→`app-restart-modal`、横向扩缩→`horizontal-scale-dialog`、纵向扩缩→`vertical-scale-dialog`、删除部署资源→`delete-deployment-resource-dialog`）；Workload 级弹窗打开时带入 WorkloadGroupSelector 当前已选分组作为默认 Group。

## 文档定位（父需求）

本文件是工作负载页面的**父需求 / hub 文档**，只负责页面整体结构、区域划分和子需求编排。按 `00-requirement-synthesis-guide.md` 骨架，各功能面的详细内容由对应子需求文档承载，本文不重复：

- **Main User Flows / Business Rules / Edge Cases / Acceptance Criteria**：见各子需求文档（`pod-list-content-area.md`、`pod-detail-drawer.md`、`batch-action-bar.md` 及各操作弹窗文档），本文仅描述区域关系与拆分。
- **子需求 1（本文承载的实现级需求）**：整体布局 + A/B/H 区域，其 In/Out Scope、技术决策、组件结构见上文「子需求 1」章节。

## Roles / Permissions

- 页面不做前端级权限控制，依赖已有 APISIX 路由级鉴权；操作可见性由后端返回的 `operations` 字段驱动（详见 `pod-list-content-area.md` 与 `batch-action-bar.md` 的 Roles/Permissions）。

## Open Questions

- 无阻塞项。各子需求的未决问题在其自身文档的 Open Questions 中维护。

## Acceptance Criteria（父需求层）

- [ ] 页面按 A/B/C/D/E/F/G/H 区域结构组织，各区域由对应子需求实现并通过其自身验收标准
- [ ] 子需求 1（布局 + A/B/H 壳子）已实现并通过验收
- [ ] 父需求不重复描述子需求内容，仅通过引用维护区域与子需求的映射关系

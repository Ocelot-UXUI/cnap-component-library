# 2026-07-25-cnap2-cluster-selector 集群选择器 + appEnvID 解析贯通

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）通过（有条件）；requirement 已定稿、B1/B2 已修。分阶段授权：Phase 1-2 可启动，Phase 3-5 gated 于评审门
> Review Gate: 2026-07-25 Phase 2 公共契约变更独立评审（General subagent）通过（PASS-WITH-NOTES，采纳 N1）
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）通过
> Verification: yarn lint-type ✅ / yarn build ✅ / yarn test 105/106（唯一失败 derive.test.ts 为既有回归，见 docs/bugs/03）
> Source: docs/requirements/cnap2-cluster-selector.md（已定稿）+ docs/plans/2026-07-24-workload-domain-model-vertical-scale-pilot-plan.md（Follow-up）

## Current Baseline

- `NavigationContextState`（`src/contexts/navigationContextData.ts`）含 `accountId/applicationId/environmentId`，**无 `clusterId`**。
- `NavigationContextSnapshot`（`src/contexts/navigationContextSnapshot.ts:21-29`）已暴露 `environments` / `availableEnvironments: AppEnvironment[]`；`AppEnvironment{id(=appEnvID), applicationId, environmentId, environmentName}`。候选加载器已拉全量环境（`navigationContextCandidates.ts:22-28`）。
- **appEnvID 可由现有快照解析**（按 `environmentId` 匹配 `availableEnvironments` 取 `id`），但无 selector 暴露；消费方 `WorkloadsHeader` 暂用占位 `appEnvID=0`。
- 面包屑账户/应用/环境三维选择器由 `2026-07-03-cnap2-breadcrumb-context-selectors-plan.md`（in progress）负责；集群第四维未纳入其范围。其可复用设施（`DimensionSelector` / `useBreadcrumbSelectorWidth`）已存在但仍在建设中。
- 工作负载路由 `contextRequirements` 现为 `{ accountId, applicationId }`（`src/navigation/registry.ts`），**尚未要求 environmentId**；appEnvID 解析与集群加载均依赖已选 environmentId，故 Phase 5 需补 `environmentId + clusterId` 需求。
- 集群选择器需求 `docs/requirements/cnap2-cluster-selector.md` 已**评审定稿（2026-07-25）**（含完整 AC，2 条非阻塞 Open Question）。
- 纵向扩缩 pilot 的 Header 占位 `appEnvID`、WorkloadGroupSelector 未随 `clusterId` 刷新（该 plan 的 Follow-up）。

## Goals

- 暴露 appEnvID 解析（`selectAppEnvID` selector），消除消费方占位 `0`。
- 新增 `clusterId` 第四维上下文：`NavigationContextState` / `ContextKey` / `ContextRequirements` 扩展、状态机 `selectCluster`、optionGroupMachine 集群区域、面包屑集群选择器。
- 工作负载路由声明 `environmentId + clusterId`；WorkloadGroupSelector 与纵向扩缩接入真实 appEnvID 且随 `clusterId` 刷新——关闭纵向扩缩 pilot Follow-up 的 **appEnvID / clusterId 接线部分**（端到端探索性验证仍留待，见 Non-Goals）。

## Non-Goals

- "绑定新集群"真实流程（仅占位按钮）。
- 集群详情跳转 / 集群管理页集成。
- 集群列表分页、服务端搜索、表格排序。
- Pod 列表 / 日志等其他页面的集群上下文接入。
- 端到端后端联调（依赖真实后端环境，非本 plan 关闭条件）。

## Task Route

- Type: architecture change（`NavigationContext` 公共契约扩展）+ app-layer design change
- Owner Docs: `docs/requirements/cnap2-cluster-selector.md`、`docs/architecture/navigation-system.md`、`docs/architecture/module-boundaries.md`
- 关联：`docs/plans/2026-07-24-workload-domain-model-vertical-scale-pilot-plan.md`（Follow-up 关闭）

## Execution Plan

### Phase 1 - appEnvID 解析 selector

Status: done

- Decision：appEnvID 由现有 `NavigationContextSnapshot.availableEnvironments` 按 `environmentId` 匹配解析（取 `AppEnvironment.id`），**非新增基础设施**。备选（新增 context 字段持久化 appEnvID）被拒：数据已在快照、派生更简单。Skill: none
- Add：新增 `selectAppEnvID(snapshot)` 选择器与 `useAppEnvID()` hook（`src/contexts/`）。Skill: none
- Proof：selector 单测（匹配/未选环境/无匹配返回 undefined）。Skill: none

[x] Exit Criteria:

- [x] `selectAppEnvID` 落地且有单测（`__tests__/appEnvID.test.ts` 3 项通过）
- [x] `docs/logs/` updated

### Phase 2 - clusterId 维度契约扩展

Status: done

- Decision：`NavigationContextState` 新增 `clusterId`、`ContextKey`/`ContextRequirements` 扩展。备选：(a) 不进 NavigationContextState、由工作负载页局部 state 持有 clusterId——被拒：集群是跨面包屑/路由的上下文维度，局部 state 无法参与级联清理与 localStorage 持久化；(b) 复用 `environmentId` 位承载——被拒：语义不同、会破坏归一化。剩余风险：属公共契约变更，影响所有读取快照的消费方与导航单测，需独立评审门通过后进入 Phase 3。Skill: none
- Add：扩展 state/键类型；`deriveRouteContext`、`getInvalidContext` 纳入 clusterId 语义（不破坏现有三维）。Skill: none
- Proof：现有导航单测全绿 + 新增 clusterId 归一化用例。Skill: none

[x] Exit Criteria:

- [x] 契约扩展经独立评审门通过（PASS-WITH-NOTES，采纳 N1）
- [x] 类型与归一化落地，`yarn lint-type` + 导航单测通过（`clusterContext.test.ts` 5 项 + 既有导航单测全绿）
- [x] `docs/logs/` updated

### Phase 3 - 状态机集群区域

Status: done

- Add：`navigationContextMachine` 新增 `selectCluster`，并**新增 `environmentChanged` 通知通道**（`selectEnvironment` → `notifyOptionGroup`）与向 optionGroup 注入 appEnvID 的数据通道（二者当前均不存在，为新增工作）；`navigationOptionGroupMachine` 新增 `cluster` 并行区域（收到 `environmentChanged` 且 appEnvID 有效时加载 `getClusters({appEnvID})`，`applicationChanged` 重置）；级联清理（选账户/应用/环境清 clusterId，`selectEnvironment` reducer 显式清）；`clusterId` 跟随 `storedContext` 持久化。Skill: none
- Proof：机器单测（选集群 / 上层变更清理 / 环境变更加载）。Skill: none

[x] Exit Criteria:

- [x] 集群区域与级联规则落地且有单测（`clusterNavigation.test.ts` 7 项通过）
- [x] `docs/logs/` updated

### Phase 4 - 面包屑集群选择器

Status: done

- Add：`ClusterDropdown`（复用 `DimensionSelector` 触发器 + antd `Table` 面板：集群名/类型/期望·可用副本；本地搜索；"绑定新集群"占位 footer）；宽度计算 `useBreadcrumbSelectorWidth` 纳入第四维；遵守 design tokens 与布局边界。**需求文档中的 hex 色值（`#f7f7f7` hover / `rgba(167,243,207,0.2)` 选中态）已映射到 `semantic.state.component.selectHover` / `semantic.state.component.selectActive`，未照搬 hex**。Skill: none
- Proof：Loading/Empty/Error 与单选/取消交互自测。Skill: none

[x] Exit Criteria:

- [x] 面包屑第四维展示与单选/取消/搜索/空错态符合 `cnap2-cluster-selector.md` AC
- [x] `docs/logs/` updated

### Phase 5 - 路由需求与 pilot 接线（关闭 Follow-up）

Status: done

- Fix：`applications.workloads` 路由 `contextRequirements` 声明 `environmentId + clusterId`。Skill: none
- Fix：`WorkloadsHeader` / `VerticalScaleModal` 用 `useAppEnvID()` 替换占位 `appEnvID=0`；WorkloadGroupSelector 与纵向扩缩 `loader` 接入 `clusterId` 并随其刷新（无 clusterId=全部集群）。Skill: none
- Proof：`yarn lint-type` / `yarn test` / `yarn build`。Skill: none

[x] Exit Criteria:

- [x] 工作负载路由显示集群选择器；appEnvID 为真实解析值
- [x] clusterId 变化时 WorkloadGroupSelector / 纵向扩缩数据随之刷新
- [x] 纵向扩缩 pilot 的 Follow-up（appEnvID / clusterId）关闭
- [x] 四条验证命令通过并记录（lint-type/build ✅；test 105/106，唯一失败为既有回归 docs/bugs/03；lint 既有仓库红）
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（appEnvID 解析 + clusterId 第四维 + 工作负载接线）
- [x] relevant docs are aligned（cluster-selector 需求状态=已实现；docs/logs 07-25；docs/bugs/03 记录既有回归）
- [x] verification has run（lint-type ✅ / build ✅ / test 105/106，失败项为既有无关回归）
- [x] closure audit was independent（General subagent）

## Risks & Open Questions

- **[需求门 ✅]** `cnap2-cluster-selector.md` 已评审定稿（2026-07-25），Phase 3+ 的需求前置已满足。
- **[评审门]** `NavigationContextState` 扩展 `clusterId` 为公共契约变更（Phase 2），进入 Phase 3 前需独立评审通过。
- **[非阻塞]** "绑定新集群"后续流程、其他页面是否需要集群上下文——沿用需求 Open Questions，保持占位。
- 依赖 `2026-07-03` 面包屑三维 plan 的选择器基础设施（`DimensionSelector` / 宽度计算）；建议将"面包屑三维 plan 达到可复用稳定态"作为 Phase 4 的显式进入条件。

# 2026-07-24-workload-domain-model-vertical-scale-pilot 工作负载领域模型（纵向扩缩试点）

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-24
> Draft Review: 2026-07-24 独立审计（General subagent）通过；Blocking B1 与建议 N2/N4 已在本版修订闭环
> Source: docs/architecture/workload-domain-model.md（目标设计）+ docs/requirements/vertical-scale-dialog.md + docs/requirements/workloads-page.md（A 区域功能细化）

## Current Baseline

- `docs/architecture/workload-domain-model.md` 已定义目标领域模型（五层 + 值对象 + 能力注册表 + 读写分离 + Session），标注为"目标设计，待实现"。
- 类型现状：`src/interface/entities/{workload,pod,runtimeOperation,runtimeSummary}.ts` 为贴近接口的 DTO；资源存在三套表示（`ResourceQuota` 数值 / `ResourceRequirements` 字符串 / `Record<string,string>`）。
- API 现状：`src/api/runtimeResource.ts`（getWorkloadGroups / getRuntimeWorkloads 等）与 `src/api/runtimeOperation.ts`（含 `verticalScale()`）已存在。
- 状态机现状：项目已用 XState v5（`src/contexts/navigationContextMachine.ts` 带单测）。
- **纵向扩缩弹窗尚未实现**：`src/pages/Workloads/` 仅有子需求 1 壳子（Header/Overview/BatchActionBar 占位 + ContentAreaPlaceholder + mockData），无任何操作弹窗。
- 标题栏现状：`WorkloadsHeader` 已调用 `getOperations()` 渲染操作按钮，但**只渲染 `targetKind==='None'`**、点击为 `console.log` 占位；`ScopeSelector`（"全部工作负载"）为静态占位，无真实分组数据与已选 group 状态。
- `src/domain/` 目录不存在；`docs/architecture/module-boundaries.md` 未包含 domain 层。

## Goals

- 建立 Workload **Domain 层最小基础件**（纵向扩缩所需子集）：`ResourceRef`、`ResourceSpec`+`Quantity`、DTO→Domain adapter、能力注册表雏形。
- 以**纵向扩缩弹窗**为首个垂直切片，用「loader（多接口顺序调用 + 聚合/过滤）+ XState 状态机（字段联动）+ build（提交组装）」的编排范式跑通，验证领域模型与编排分层可落地。
- 打通 workloads-page 标题栏**纵向扩缩触发入口**：WorkloadGroupSelector 接入 `runtime/groups` 真实数据（受 `clusterId` 影响）+ 标题栏渲染 `targetKind` 为 `None`/`Workload` 的操作 + 点击路由到纵向扩缩弹窗并带入当前已选 group（依据 `workloads-page.md`「A 区域功能细化」）。
- 弹窗行为满足 `docs/requirements/vertical-scale-dialog.md` 的可测验收标准。

## Non-Goals

- 其余操作弹窗（重启 / 横向扩缩 / 批量 Pod 操作 / 删除部署资源）的实现或改造。标题栏虽按 `None`/`Workload` 渲染全部操作按钮，但本切片仅将"纵向扩缩"点击接入功能弹窗；其余按钮点击保持占位。
- `PodStatusDescriptor` 状态注册表、Pod 列表内容区、快捷筛选（不在纵向扩缩路径上）。
- `PodOperation` 与 `RuntimeOperation` 的全量合并、`Workload` 与 `RuntimeWorkload` 两套实体的全量合一（本切片仅新增 Domain 侧统一模型，不删除/改写现有 DTO）。
- 引入查询缓存库（react-query/swr）。
- "查看执行详情"链接真实跳转（按需求文档以文字占位）。

## Task Route

- Type: architecture change + implementation-only change
- Owner Docs: `docs/architecture/workload-domain-model.md`、`docs/architecture/module-boundaries.md`、`docs/requirements/vertical-scale-dialog.md`、`docs/requirements/workloads-page.md`（A 区域功能细化）
- 关联真源：`docs/input/source-api-runtime-workloads.md`、缺口清单 `docs/analysis/workload-missing-api-fields.md`

## Execution Plan

### Phase 1 - Domain 层落位与边界

Status: done

- Decision：新增 `src/domain/workload/` 作为纯逻辑层（无 React）；确定依赖方向（pages/hooks 可依赖 domain，domain 不依赖 React/组件）。记录选择、备选（放 utils/ 被拒——utils 不得依赖业务；放 interface/ 被拒——不含运行时逻辑）、剩余风险。**该分层为公共契约变更，需独立评审门通过后方可进入 Phase 2**——本 plan 的独立 draft review（2026-07-24，General subagent）已作为该评审并通过。Skill: none
- Fix：在 `docs/architecture/module-boundaries.md` 的 Module Map 与依赖规则中补入 `domain/` 层。Skill: none

[x] Exit Criteria:

- [x] domain 分层经独立评审门通过（draft review 记录在案）
- [x] `src/domain/workload/` 目录约定确立
- [x] `module-boundaries.md` 含 domain 层依赖规则
- [x] `docs/logs/` updated

### Phase 2 - 值对象与适配器（纵向扩缩子集）

Status: done

- Add：`ResourceRef`、`ResourceSpec`+`Quantity`（含 parse/format/值单位拆分，覆盖 CPU c/nc、内存 Mi/Gi/Ti、存储 Gi）。Skill: none
- Add：`RuntimeWorkload`(DTO) → Domain 的 adapter（含容器资源 `Record<string,string>` → `ResourceSpec`）。Skill: none
- Proof：值对象解析/格式化/拆拼与 adapter 的单元测试（含单位不在枚举时的降级，对齐需求文档 Open Question）。Skill: none

[x] Exit Criteria:

- [x] 值对象与 adapter 落地（`src/domain/workload/{resource,model,adapters}.ts`），待 Phase 4 消费
- [x] `yarn test` 覆盖解析/格式化/拆拼与边界（`resource.test.ts` 13 项通过）
- [x] `docs/logs/` updated

### Phase 3 - 能力注册表雏形 + 纵向扩缩组装

Status: done

- Add：`CapabilityRegistry` 雏形（仅注册 `VerticalScale`），含 `buildVerticalScaleCommand` 纯函数，产出 `OperationCommand`（提交经现有 `runtimeOperationApi.verticalScale()`，映射在页面层）。Skill: none
- Proof：build 函数单测（数值+单位拼接、per-target container、只选中集群纳入 targets）。Skill: none

[x] Exit Criteria:

- [x] VerticalScale 的 build 纯函数落地且有单测（`capability.test.ts` 3 项通过）
- [x] `docs/logs/` updated

### Phase 4 - 纵向扩缩弹窗（编排 + UI）

Status: done

- Add：`loader.ts`（getWorkloadGroups → getRuntimeWorkloads → 聚合容器 → 按选中容器过滤 Workload），顺序依赖与 join 收敛于此。Skill: none
- Add：XState `machine.ts` 承载联动（selectGroup / selectContainer / toggleCluster / editField / toggleLimit / submit；容器切换重置、集群选中↔资源项启用、Limit↔Req 同步），联动纯逻辑抽至 `rows.ts`。Skill: none
- Add：`selectors.ts`（context → 确定按钮可用性、底部提示）；`submit.ts`（OperationCommand → `verticalScale()` 入参映射）。Skill: none
- Add：`VerticalScaleModal`（含 `ClusterTable` / `ResourceCell`）——仅渲染 + `send(event)`，遵守 design tokens 与 page-level layout 边界。Skill: none
- Add：触发入口改造——`ScopeSelector` 更名 `WorkloadGroupSelector` 接入 `getWorkloadGroups()`；`WorkloadsHeader` 操作渲染由 `None` 扩展为 `None`/`Workload`；"纵向扩缩"点击打开弹窗并带入当前已选 group。Skill: none
- Proof：联动纯逻辑单测 `rows.test.ts`（buildRows/toggleCluster/toggleLimit/editField/校验/映射）。Skill: none

[x] Exit Criteria:

- [x] 弹窗行为落地（分组/容器联动加载、集群选中↔字段、Limit↔Req、单位拆拼、提交组装、成功/失败）
- [~] WorkloadGroupSelector 展示 `runtime/groups` 真实分组、可选中/重置；**"随 clusterId 刷新"未接**（NavigationContext 尚无 clusterId，见 Follow-up）
- [x] 标题栏渲染 `None`/`Workload` 操作；点击"纵向扩缩"打开弹窗并带入当前已选 group
- [x] 组件内无业务编排逻辑（编排在 rows/loader/machine/submit）
- [x] 关键联动有单测（`rows.test.ts` 10 项）
- [x] `docs/logs/` updated

### Phase 5 - 验证与收口

Status: done

- Proof：运行 `yarn lint-type`、`yarn lint`、`yarn test`、`yarn build`。Skill: none
- Proof：探索性验证联动不回归（切容器重置、集群选中联动、Limit↔Req、单位拆拼提交）。记录到 `docs/testing/`。Skill: none

[x] Exit Criteria:

- [x] `yarn lint-type` 通过；`yarn build` 通过；新增文件 `yarn lint` 无告警；`yarn test` 新增 26 项通过
- [~] 探索性验证：因页面尚未接入真实 appEnvID（子需求4），端到端联调延后；联动以单测覆盖
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（Domain 基础件 + 纵向扩缩弹窗编排范式跑通；一处依赖降级见 Follow-up）
- [x] relevant docs are aligned（module-boundaries 含 domain 层；plan/log 已更新）
- [x] verification has run（lint-type / build 通过；新增 26 单测通过；新增文件 lint 无告警）
- [ ] closure audit was independent（待独立关闭审计）

## Follow-up

- **clusterId 联动 + 真实 appEnvID**：`NavigationContext` 目前无 `clusterId`、也不暴露 `appEnvID`（页面暂用占位 `appEnvID=0`）。WorkloadGroupSelector"随集群刷新"与端到端联调，待 cluster-selector 落地 + 子需求4 API 对接后接入。当前不带 `clusterId`（=全部集群，符合默认语义）。
- **端到端探索性验证**：待真实 appEnvID 可用后在 `docs/testing/` 补记。
- **既有失败（非本次回归）**：`src/navigation/__tests__/derive.test.ts > generates internal menu paths without basename` 在干净基线（stash 后）即失败，与本次改动无关。

## Risks & Open Questions

- `src/domain/` 为新分层（公共契约变更），已通过独立 draft review 评审门（2026-07-24）；Phase 1 落 `module-boundaries.md` 后方进入 Phase 2。
- 纵向扩缩弹窗为**首次实现**（非改造），无既有行为基线，验收以 `vertical-scale-dialog.md` 为准。
- 需求 `vertical-scale-dialog.md` 已于 2026-07-25 评审定稿；剩余 Open Questions（行级错误提示、单位枚举外处理）为非阻塞，实现期按需处理。
- 触发入口依赖面包屑集群选择器提供 `clusterId`（`cnap2-cluster-selector`）；WorkloadGroupSelector 随其变化刷新，需确认集群上下文在工作负载路由已就绪。
- 资源单位若返回不在枚举内（如 millicore `m`）——沿用需求文档 Open Question 的降级策略，在 Phase 2 值对象层处理。
- 本 plan 已由独立 draft review 收敛为 `planned`，可进入实现（AGENTS.md 规则 7）；关闭前需 independent closure audit。

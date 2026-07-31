# 2026-07-25-workload-operation-dialogs 标题栏工作负载操作弹窗补全（横向扩缩 + 重启）

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）PASS-WITH-NOTES；2 项 Blocking（需求状态一致性、两弹窗合一 Decision）与 5 项建议已在本版闭环
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）PASS，无阻塞项
> Source: docs/requirements/horizontal-scale-dialog.md + docs/requirements/app-restart-modal.md + docs/requirements/workloads-page.md（A 区域标题栏操作入口）

## Current Baseline

- 纵向扩缩弹窗已落地：`src/pages/Workloads/operations/verticalScale/`（`loader.ts` / `machine.ts` / `rows.ts` / `selectors.ts` / `submit.ts` + `VerticalScaleModal/`），采用「loader（多接口顺序调用 + 容器聚合/过滤）+ XState machine（联动）+ rows（纯逻辑）+ selectors + submit + Modal（仅渲染）」编排范式，`rows.test.ts` 10 项通过。
- `loader.ts`（`loadGroups` / `loadWorkloads` / `aggregateContainerNames` / `WorkloadsBundle`）实现上与操作无关，但当前物理位置在 `verticalScale/` 目录内。
- API 封装已就绪：`src/api/runtimeOperation.ts` 已导出 `horizontalScale()`（`application.scale-h`，`params.replicas`）与 `restartWorkload()`（`application.restart`，`targets[].container` + `params.maxUnavailable` + 顶层 `params.exitTimeoutSeconds`）。**本切片不改 API 契约。**
- 数据源就绪：`runtimeResourceApi.getWorkloadGroups()` / `getRuntimeWorkloads()`；`RuntimeWorkload` 含 `replicas` / `updateStrategy.{maxUnavailable,maxSurge}` / `availabilityTarget` / `containers[]`。
- 标题栏现状：`WorkloadsHeader`（`src/pages/Workloads/WorkloadsHeader/index.tsx`）`handleActionClick` 仅路由 `capability==='VerticalScale'` 打开弹窗，其余操作为 `console.log` 占位；已接入真实 `appEnvID` / `clusterId` / `environmentName` / 已选 `groupId`。
- Pod 列表、Tab 切换、底部信息栏、批量操作栏业务逻辑均未实现（后续切片）。

## Goals

- 「横向扩缩」弹窗可用，行为满足 `docs/requirements/horizontal-scale-dialog.md` 可测验收标准。
- 「重启」弹窗可用，行为满足 `docs/requirements/app-restart-modal.md` 可测验收标准。
- 将与操作无关的 Group/Workload/容器聚合 loader 提取为共享模块，供纵向扩缩、横向扩缩、重启三者复用（消除重复，不引入新抽象层）。
- 标题栏「横向扩缩」「重启」点击路由到各自弹窗，并带入当前已选 group 作为默认值。

## Non-Goals

- Pod 列表内容区 / Tab 切换区（C）/ 底部信息栏（G）/ Pod 详情抽屉 —— 后续切片。
- 批量操作栏（H 区）业务逻辑与批量 Pod 弹窗（重启/删除重建/强删）—— 最后切片。
- 删除部署资源弹窗（后端接口缺失，blocking）。
- 操作二次确认弹窗（两需求均列为 Out Of Scope）。
- **「Group 操作菜单带入」入口（两需求流程 2）**：Group 行内操作菜单随 Pod 列表/分组行切片实现，本切片仅接入标题栏按钮入口 + 带入标题栏当前已选 group。
- 修改 `runtimeOperation` / `runtimeResource` 的 API 契约。
- 抽象出「通用操作弹窗框架」——本切片仅做 loader 提取与按需复制编排文件，不做泛化框架。

## Task Route

- Type: implementation-only change（两需求已定稿，API 与数据源已就绪，无架构/契约变更）
- Owner Docs: `docs/requirements/horizontal-scale-dialog.md`、`docs/requirements/app-restart-modal.md`、`docs/requirements/workloads-page.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`

## Execution Plan

### Phase 1 - 共享 loader 提取（Refactor）

Status: done

- Add：新增 `src/pages/Workloads/operations/shared/loader.ts`，承载 `loadGroups` / `loadWorkloads` / `aggregateContainerNames` / `WorkloadsBundle`（与操作无关部分）。Skill: none
- Fix：`verticalScale/machine.ts` 改为从 `../shared/loader` 引入；删除 `verticalScale/loader.ts`（无残留 re-export，遵守"删除即彻底删除"）。Skill: none
- Decision：loader 提取到 `operations/shared/` 而非 `domain/` —— 该逻辑含 API 调用（IO），不属于纯领域层；备选（留在 verticalScale 被复制两份）拒绝，理由为三处重复。剩余风险：低（纯移动 + 改 import）。Skill: none
- Decision：横向扩缩与重启合入**一个 plan**（而非拆为「共享 loader plan + 两个弹窗 plan」）。选择：合一。理由：二者结构对称、共用 Phase 1 提取与表格范式、用户按"弹窗类"同批下达。备选：拆分为三个 plan（拒绝——共享提取会跨 plan 悬空、审计面碎片化）。剩余风险：本 plan 含两个独立关闭条件（guide 规则 4 的边界情形），任一弹窗未达其需求验收则整 plan 不关闭、可能延长打开周期；已在 Closure Gates 以两弹窗分别验收显式约束。Skill: none

[x] Exit Criteria:

- [x] 共享 loader 落位，`verticalScale` 引用切换且 `verticalScale/loader.ts` 删除
- [x] `yarn test`（含既有 `rows.test.ts`）与 `yarn lint-type` 通过
- [x] `docs/logs/` updated

### Phase 2 - 横向扩缩弹窗（Add）

Status: done

- Add：`operations/horizontalScale/` 下 `machine.ts` / `rows.ts` / `selectors.ts` / `submit.ts` + `HorizontalScaleModal/`（`index.tsx` / `ClusterTable.tsx` / `*.style.ts`）。行状态含只读列（当前副本数 `replicas`、最大不可用、可用度）+ 可编辑「期望副本数」（默认取该行 `replicas`，校验正整数 ≥1，无上限）；容器选择器仅过滤表格、不入 API。Skill: none
- Add：`WorkloadsHeader` `handleActionClick` 增加 `capability==='HorizontalScale'` 分支 + 弹窗渲染，带入 `defaultGroupId`。Skill: none
- Proof：`rows.test.ts` 覆盖 buildRows（按容器过滤）、期望副本数校验、`canSubmit`（至少选中一行且选中行全部合法）、选中行 → API targets 映射。Skill: none

[x] Exit Criteria:

- [x] 弹窗行为落地：Group→容器→表格联动、期望副本数默认/校验、确定按钮态、提交成功关闭+提示、失败保留数据、切换 Group/容器重置勾选
- [x] 空状态：Group 为空 / 无 Workload / 容器聚合为空 分别展示占位；可用度为空显示"未启用"；弹窗宽 800px
- [x] 提交失败以弹窗内联错误呈现（非全局），已填数据保留
- [x] 标题栏「横向扩缩」点击打开弹窗并带入已选 group
- [x] 组件仅渲染 + `send(event)`，编排在 rows/machine/submit；样式遵守 design tokens
- [x] 关键联动有单测
- [x] `docs/logs/` updated

### Phase 3 - 重启弹窗（Add）

Status: done

- Add：`operations/restart/` 下 `machine.ts` / `rows.ts` / `selectors.ts` / `submit.ts` + `RestartModal/`（`index.tsx` / `ClusterTable.tsx` / `*.style.ts`）。相对横向扩缩增量：弹窗级「超时时间」（默认 60，5~3600）；行内可编辑「最大不可用」（百分比 1%~100%）；只读列最大可超出、可用度；容器选择器值入 API（`targets[].container`）；提交带 `exitTimeoutSeconds`。含「温馨提示」暖色警告条。Skill: none
- Add：`WorkloadsHeader` 增加 `capability==='Restart'` 分支 + 弹窗渲染。Skill: none
- Decision：温馨提示暖色（需求给出 `#FFF3E0`）—— 复用 `semantic.state.warning.light`（已确认其值恰为 `#FFF3E0`，字节级一致，无需新增 token）；备选（组件内写 hex）拒绝，违反 design-tokens 红线。剩余风险：低（token 既有，仅引用）。Skill: none
- Proof：`rows.test.ts` 覆盖最大不可用百分比校验、选中↔最大不可用重置联动、超时时间校验、选中行 + 容器（入 API `targets[].container`）+ exitTimeoutSeconds → API 映射。Skill: none

[x] Exit Criteria:

- [x] 弹窗行为落地：联动加载、超时时间校验、最大不可用校验与选中联动、容器入 API、提交成功刷新+提示、失败保留数据
- [x] 空状态与只读列：Group/容器/Workload 空态占位、可用度为空显示"未启用"；弹窗宽 800px（高度随内容自适应，设计稿标注 606px 为参考）；标题/环境/副标题正确渲染；取消按钮直接关闭不二次确认
- [x] 标题栏「重启」点击打开弹窗并带入已选 group
- [x] 温馨提示暖色经 design token 引用（无 hex 字面量）
- [x] 关键联动有单测
- [x] `docs/logs/` updated

### Phase 4 - 验证与收口（Proof）

Status: done

- Proof：运行 `yarn lint-type` / `yarn lint` / `yarn test` / `yarn build`。Skill: none
- Fix：`horizontal-scale-dialog.md` 与 `app-restart-modal.md` 状态由「需求澄清中」更新为「已实现」；`docs/logs/2026/07-25.md` 追加实现记录。Skill: none

[x] Exit Criteria:

- [x] `yarn lint-type` / `yarn build` 通过；新增文件 `yarn lint` 无告警；`yarn test` 新增用例通过（horizontal 6 + restart 8，含既有 vertical 10 = 24 全绿）
- [x] 两需求文档状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（横向扩缩 + 重启弹窗按各自需求可测标准落地）
- [x] relevant docs are aligned（两需求状态更新 + plan/log 一致）
- [x] verification has run（lint-type / build 通过；新增文件 lint 无告警；operations 单测 24 全绿）
- [x] closure audit was independent（2026-07-25 General subagent 独立关闭审计 PASS，无阻塞项；N1 高度标注已在 Phase 3 exit 软化）

## Risks & Open Questions

- **两弹窗合一计划的理由**：横向扩缩与重启结构对称、共用 loader 与表格范式、且用户将其归为"弹窗类"同批处理；合入一个 plan 便于共享 Phase 1 提取。二者验收标准仍各自独立，任一未达标则本 plan 不关闭。
- 两弹窗均为**首次实现**（非改造），无既有行为基线，验收分别以对应需求文档为准。
- 需求剩余 Open Questions（权限差异化、取消二次确认）均为非阻塞，按需求当前设计实现。
- 温馨提示暖色 token 已确认存在（`semantic.state.warning.light` = `#FFF3E0`），直接引用即可，无需新增 token。
- 本 plan 已由独立 draft review 收敛为 `planned`（2026-07-25），可进入实现（AGENTS.md 规则 7）；关闭前需 independent closure audit。

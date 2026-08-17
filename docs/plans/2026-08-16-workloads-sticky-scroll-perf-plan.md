# 2026-08-16-workloads-sticky-scroll-perf Workloads 假滚动热路径性能优化（行为保持）

> Plan Status: planned
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-16（独立 draft review 已完成：passes draft review，2 major + 3 minor 修订已并入，见 Draft Review Record。实现未开始，受下方前置条件门控）
> Source: 用户性能分析（7 条方向）+ 对 2026-08-15 假滚动实现的逐条代码核实

## Current Baseline

- 基础计划 `2026-08-15-workloads-sticky-scroll-plan.md` 代码已落地（lint-type/lint/test 通过），但 `yarn start` 视觉 proof 与 closure audit 待人工，状态 in progress。
- 热路径现状（已逐条对照代码核实）：
  - `useStickyScroll.ts:56` `applyTransforms` 每个滚动 rAF 帧调 `resolveScrollParent`——沿父链逐节点 `getComputedStyle`。
  - `stickyScrollDom.ts` `applyGroupTransforms` 对每个分组每帧 `querySelector('[data-group-header]') + querySelector('thead')`（7 组 ≈ 14 次/帧），且对未变化的 transform/zIndex 也重复写 style。
  - `PodGroupTable.tsx:73-75` 每组 effect 各自 `requestAnimationFrame(measure)`；N 组数据同帧到达 → 同帧 N 次 measure，每次含 resetTransforms（写）→ `track.scrollHeight`（读）的强制回流。
  - 单一 `StickyScrollContext` 同时承载高频状态（activeGroupId / paginationPinnedId / pinned）与稳定 API（registerGroup / remeasure）；任一变化 → 所有 PodGroupTable 重渲染；`buildPodColumns`（`PodGroupTable.tsx:65`）未 useMemo。变化频率为跨组/过阈值时，非每帧。
  - `measure()` 读写已大致成批（写 top/复位 → 读 scrollHeight/rect → 写 spacer）；残余问题：末尾 `applyTransforms()` 在写 spacer 后重走 `getComputedStyle`（额外样式/布局重算），且可能同帧跑 N 次（见上）。
  - `will-change: transform` 常驻 Track + 每组 thead + GroupHeaderPin（7 组 ≈ 15 个常驻合成层）。
- 现有保护：`__tests__/stickyScroll.test.ts` 18 用例覆盖全部纯函数；keep-alive effect 契约（`docs/architecture/workspace-keep-alive.md`）。

## Goals

- 滚动热路径（每帧）收敛为「缓存节点读取 + 最少 style 写入」：消除每帧父链 getComputedStyle 与每帧 querySelector。
- remeasure 同帧去重（一帧至多一次 measure）；measure 路径去除重复样式解析。
- 收窄 context re-render 扇出：稳定 API 与高频状态拆分 context、高频消费隔离到最小组件；columns 记忆化。
- 全部为行为保持：视觉与交互与优化前一致。

## Non-Goals

- 不改假滚动模型、任何交互行为或视觉。
- 不做 CSS scroll-driven animations 改造、不做窗口内真实滚动替代（见 Decisions）。
- 不做表格虚拟化（每组经分页 ≤50 行，DOM 规模有界，非瓶颈）。
- 不顺延/替代 2026-08-15 基础计划的视觉 proof 与 closure audit。

## Task Route

- Type: implementation-only change（性能优化，行为保持，不改 requirement）
- Owner Docs: `docs/requirements/pod-list-content-area.md`（行为 AC 不变，仅作回归基准）；`docs/architecture/workspace-keep-alive.md`（effect+cleanup 契约继续约束）
- Skill: draft review 使用 `plan-audit-prompt.md`；实现各阶段 Skill: none

## 前置条件（Precondition）

- 2026-08-15 基础计划完成 `yarn start` 视觉 proof（其 Phase 2–5 行为验收）后，才开始本计划改码。理由：视觉 proof 未过前机制可能返工，性能改动会污染行为问题归因；proof 通过同时为「行为保持」提供对照基线。
- 基础计划的 independent closure audit 允许在本计划落地后执行（不阻塞改码），但审计者必须同时读本计划：本计划全程行为保持、其 Closure Gate 会复跑基础计划 Phase 2–5 验收点，验收点结论不受实现内部替换影响。理由：视觉 proof 已隔离「机制返工」风险，串行等待 closure audit 无增益地推迟工作。

## Execution Plan

### Phase 1 - 热路径节点缓存（高收益，改动小）

Status: planned

- Fix：scrollEl 解析结果缓存进 ref——effect/measure 建立时解析一次，`applyTransforms` 热路径直接取，measure 时顺带刷新。Skill: none
- Fix：每组 header/thead 节点在 measure 时随几何一起缓存（Map），`applyGroupTransforms` 直接取；使用前校验 `isConnected`，失效即回退 querySelector 并重建缓存——换节点但不触发 measure 的路径（如 GPU 列出现/消失而 pods.length 不变）由此兜底。Skill: none
- Fix：`applyGroupTransforms` 跳过与上次相同的 transform/zIndex 写入。Skill: none
- Proof：`yarn lint-type` / `yarn test`；代码走查/断点确认滚动帧内无父链 getComputedStyle、无 querySelector（Performance 面板仅能间接反映 Recalculate Style，不作为证据）；顺带记录优化前后同一滚动段的 Performance 摘要（scripting 耗时），作为 Decision B 重估的客观依据；`yarn start` 目视行为与现状一致。Skill: none

[ ] Exit Criteria:

- [ ] 滚动热路径无父链 getComputedStyle、无每帧 querySelector（代码走查 + 断点为准）
- [ ] 换节点路径（折叠/展开、刷新重挂载 key、GPU 列出现/消失等）核对：isConnected 守卫或 measure 刷新覆盖，目视吸顶无失效
- [ ] 行为无变化；`yarn lint-type` / `yarn test` 通过
- [ ] `docs/logs/` updated

### Phase 2 - remeasure 去重 + measure 读写卫生（中收益）

Status: planned

- Fix：共享 rAF id 去重 remeasure→measure，一帧至多一次（含 ResizeObserver 回调并入同一去重）。Skill: none
- Fix：measure 末尾复用 Phase 1 的 scrollEl 缓存，去除写 spacer 后的重复 `getComputedStyle`；保持现有「写复位 → 读几何 → 写占位/变换」批次结构（现结构已大致成批，不重设计为免复位量测）。Skill: none
- Proof：代码走查确认共享 rAF id 去重路径（含 ResizeObserver 回调并入）；「N 组数据同帧到达」目视内容高度只重算一次、无跳变；如 rAF 调度抽出为纯函数则补单测；`yarn start` 目视折叠/换页/批量栏显隐下无跳变。Skill: none

[ ] Exit Criteria:

- [ ] 同帧多次 remeasure 只触发一次 measure（代码走查 + 折叠/换页目视稳定）
- [ ] 行为无变化；`yarn lint-type` / `yarn test` 通过
- [ ] `docs/logs/` updated

### Phase 3 - context 扇出收窄 + columns 记忆化（中收益）

Status: planned

- Fix：`StickyScrollContext` 拆为「稳定 API（registerGroup/remeasure）」与「高频状态（pinned/windowHeight/activeGroupId/paginationPinnedId/paginationSlot）」两个 context。Skill: none
- Fix：PodGroupTable 对高频状态的消费（分页固定态判定 + portal）隔离到最小子组件，表格主体不随跨组滚动重渲染；`buildPodColumns` 加 useMemo。Skill: none
- Proof：React DevTools Profiler 抽查——跨组滚动时仅相关小组件更新；目视分页固定/回流两态不变；`yarn test`。Skill: none

[ ] Exit Criteria:

- [ ] 跨组滚动不再触发全部 PodGroupTable 重渲染（Profiler 抽查）
- [ ] 分页固定/回流行为不变；`yarn lint-type` / `yarn test` 通过
- [ ] `docs/logs/` updated

### Phase 4 - will-change 滚动期开启（低收益，可选门控）

Status: planned

- Fix：Track/thead/GroupHeaderPin 的 `will-change` 改为滚动活跃期开启、空闲后撤除（滚动停止判定 + 定时器，effect 内 + cleanup）。Skill: none
- Decision：若 DevTools Layers 显示常驻层成本可接受，或撤除引入重栅格化闪烁/抖动，则保留常驻 will-change 并在此记录理由。Skill: none
- Proof：`yarn start` 目视滚动启停无闪烁/抖动回归。Skill: none

[ ] Exit Criteria:

- [ ] 落地或经 Decision 记录豁免，二选一有据
- [ ] 行为无变化；`docs/logs/` updated

### Phase 5 - 验证与文档

Status: planned

- Proof：`yarn lint-type` / `yarn lint` / `yarn test` 全绿（仅既有无关失败需注明归因）。Skill: none
- Add：复跑基础计划 Phase 2–5 验收点的结果简记入 `docs/testing/`（或当日日志），为 closure audit 留可查 artifact，不依赖实现者自述。Skill: none
- Add：更新当日 `docs/logs/{year}/{month}-{day}.md`；与基础计划的时序交互（前置条件/closure audit 排序）在日志中注明；计划关闭时同步更新 project-context Active Work。Skill: none

[ ] Exit Criteria:

- [ ] 三命令如实记录
- [ ] `docs/logs/` updated
- [ ] 独立 closure audit 完成

## Decisions（更好/更方便实现方式的再确认）

- Decision A（整体替代方案）：保留假滚动模型，不切换「窗口内真实滚动（inner scroll）」。**选择理由**：inner scroll（PinnedWindow 变真实滚动容器、原生 sticky/antd Table sticky 直接可用）可整体删除本套 JS 热路径、恢复原生滚动语义，工程上确实更简单；但与 requirement :7 已确认的「单一外部滚动条 + overflow:hidden 定高窗口」模型直接冲突，属产品决策。**备选**：若视觉 proof 或用户反馈表明 1 帧延迟抖动/语义损失不可接受，评估切换（需更新 requirement 并另开计划）。**剩余风险**：本计划仅降常数开销，不消除 scroll 事件→transform 的固有 1 帧延迟。
- Decision B：CSS scroll-driven animations（`animation-timeline: scroll()`）不做。**理由**：可把 transform 移到合成器线程、彻底消除 1 帧延迟，但需 Chromium 115+（内部浏览器基线未确认）、pinStart/scrubRange 动态范围须映射为随 remeasure 变化的 animation-range、zIndex 交接语义需另想办法，改造面大。**重估触发**：Phase 1–3 落地后仍报告滚动抖动。
- Decision C：不做虚拟化。**理由**：每组经分页限制（10/20/50）行数有界，渲染非瓶颈；瓶颈在滚动/量测热路径。

## Draft Review Record

- Reviewer: 独立 subagent（fresh context），2026-08-16，按 `docs/skills/plan-audit-prompt.md` 执行，Current Baseline 逐条对照活代码核实。
- Verdict: **passes draft review**（无 blocking；2 major + 3 minor 均为计划文本级修订，已全部并入）。
- 已并入修订：① Phase 1 节点缓存增加 `isConnected` 守卫与「换节点路径核对」验收项（原「measure 刷新覆盖」为未验证假设）；② Precondition 显式记录基础计划 closure audit 时序决策（允许后置，但审计者须读本计划）；③ Phase 1 Proof 改以代码走查/断点为准（Performance 面板仅间接反映）并补优化前后量化对照；④ Phase 2/3 Proof 补「N 组同帧到达」目视与分页两态目视；⑤ Phase 5 增加复跑验收 artifact（docs/testing/）与 Active Work 状态维护。
- 残余风险：极端换节点场景存在一帧级失效窗口（守卫缓解、不可归零，除非保留每帧查询）；scroll 事件→transform 固有 1 帧延迟仍在（Decision A/B 已记录重估路径与触发条件）。

## Closure Gates

- [ ] 前置条件满足（基础计划 `yarn start` 视觉 proof 完成）
- [ ] 行为保持：滚动/吸顶/交接/分页/批量栏与优化前一致（目视 + 复跑基础计划 Phase 2–5 验收点）
- [ ] 各热路径优化点逐条可指认落地（节点缓存 / 帧去重 / 扇出收窄 / will-change 处置）
- [ ] 验证命令已运行且失败项归因清晰；owner docs 与 logs 一致
- [ ] closure audit 独立完成（非实现方）

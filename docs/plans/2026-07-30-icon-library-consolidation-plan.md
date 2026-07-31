# 2026-07-30 Icon Library Consolidation

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-30
> Source: User request — 在 `src/assets` 建立图标管理机制（去重 / 功能化命名 / README 目录 / barrel）

## Current Baseline

- `src/assets/` 平铺目录。改造前：52 PNG + 69 SVG = 121 文件；48 处 `@/assets/` 引用 / 13 文件。
- 52 PNG 中 15 个零引用（导出/回滚已删、block/unblock/scale 已改用 SVG）。
- 2026-07-30 新增一大批中文名 SVG（以 `#545454` 着色）。
- 姊妹计划 `2026-07-30-flatten-assets.md` 为 `partially completed`（视觉烟测待做）；本计划重命名同批资源，视觉烟测并入本计划。

## Goals

- 删除 15 个零引用 PNG。
- 将全部 69 个 SVG 重命名为功能化、去业务前缀、英文 kebab-case（icloud-logo 保留原名），解决畸形/变体命名。
- 提供 `src/assets/icons/index.ts` barrel（具名 URL 导出）与 `src/assets/README.md` 目录表（含语义描述）。
- 更新受影响的现有 SVG 引用（7 处 / 4 文件）到新名称，保持运行时视觉与行为不变。

## Non-Goals

- 不改变任何运行时视觉、交互或组件行为。
- 不重命名/合并 PNG，不做 antd 图标替换（归 `2026-07-30-workloads-icon-upgrade-plan.md`）。遗留 37 PNG 在 README 标注为待替换。
- 不修改 SVG/PNG 内容（仅重命名）。
- 不改动 `public/ai-capabilities.json` 等无关工作树变更；不重开 flatten-assets 范围。

## Task Route

- Type: 结构性重构（改动公共 import 契约，行为保持）
- Owner Docs: `docs/context/project-context.md`, `docs/design/design-tokens.md`, `docs/context/codebase-map.md`
- Skill: none

## Naming Contract

- 英文 kebab-case，去业务前缀，功能语义命名；barrel 导出名为对应 camelCase（`switch.svg` 保留字 → 导出 `switchIcon`）。
- 变体非重复：`add`/`add-circle`、`close`/`close-circle`、`expand`/`expand-panel`/`collapse-panel`、`chevron-*`（尖角）/`arrow-*`（箭头）均为不同图标，各自保留。
- 展开/收起采用动作语义。

## Execution Plan

### Phase 1 - Remove Unused PNG

Status: completed

- [x] Fix: 删除 15 个零引用 PNG。Skill: none
- [x] Proof: 删除后目录剩 106 文件（37 PNG + 69 SVG）；全仓库无引用。Skill: none

Exit Criteria:

- [x] 15 个文件已删除且仓库无任何引用。

### Phase 2 - Naming Mapping

Status: completed

- [x] Decision: 产出 68 条 SVG old→new 映射（icloud-logo 保留），变体各自命名，无碰撞。Skill: none
- [x] Proof: 重命名后 `Get-ChildItem *.svg` 列出 69 个全英文名文件，零残留中文/畸形名。Skill: none

Exit Criteria:

- [x] 映射完整、零碰撞、可核查。

### Phase 3 - Rename + Rewire References (atomic)

Status: completed

- [x] Fix: 重命名 68 个 SVG；更新 7 处引用（PodOperationIcons、BatchActionIcons、WorkloadsHeaderIcons、PodContentHeader）到新名称。Skill: none
- [x] Proof: grep 确认无旧 SVG 路径残留。Skill: none
- [x] Proof: `yarn lint-type` 通过；`yarn build` 通过（18.69s）。Skill: none

Exit Criteria:

- [x] 所有引用指向新名称，构建通过，行为无变化。

### Phase 4 - Barrel + Catalog

Status: completed

- [x] Add: `src/assets/icons/index.ts`（69 条具名 URL 导出）。Skill: none
- [x] Add: `src/assets/README.md`（69 行 SVG 目录表 + 37 遗留 PNG 说明）。Skill: none
- [x] Proof: barrel 全部导出解析到现存文件（build 通过间接验证 barrel 内路径）；README 条目与目录一致。Skill: none

Exit Criteria:

- [x] barrel 与 README 覆盖全部 SVG 且与磁盘一致。

### Phase 5 - Verify + Docs

Status: partially completed

- [x] Proof: `yarn lint-type`、`yarn build` 通过。Skill: none
- [x] Proof: 受影响文件 ESLint/dprint 通过；Workloads 测试 17 文件 83 用例通过。Skill: none
- [ ] Proof: 重命名后 Workloads 图标面 + TopNav logo 视觉烟测（并入 flatten-assets 待办）。Skill: none
- [x] Follow-up: 更新 `docs/logs/2026/07-30.md`。Skill: none

Exit Criteria:

- [x] `yarn lint-type` / `yarn build` 通过。
- [ ] ESLint/dprint/测试通过（无关既有失败单独记录）。
- [ ] 视觉烟测通过（视觉零变化）。
- [x] `docs/logs/` 更新。

## Draft Review Record

- Reviewer: `General_6504776` 独立子代理
- Verdict: passed-after-revisions
- Revisions applied: 修正基线计数、更正 flatten-assets 未关闭事实、拆分 Workloads 迁移到独立计划（rule 4）、收紧本计划范围为「仅 SVG 库」、rename 与引用更新合并为原子 Phase 并加构建证明、移除跨模块 Non-Goals 冲突。

## Closure Gates

- [x] In-scope behavior is complete（SVG 库 + barrel + README + 引用更新已落地）。
- [x] Relevant docs are aligned（README、log）。
- [x] Verification has run（lint-type + build）。
- [ ] Closure audit was independent（待做；视觉烟测未完成前保持 partially completed）。

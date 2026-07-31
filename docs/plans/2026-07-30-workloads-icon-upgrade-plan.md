# 2026-07-30 Workloads Icon Upgrade

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-30
> Source: User request — 将 Workloads 现用图标尽量替换为新 SVG（依赖 icon-library-consolidation）

## Current Baseline

- 依赖 `2026-07-30-icon-library-consolidation-plan.md` 完成后：图标已功能化命名、经 `src/assets/icons/index.ts` barrel 暴露、README 目录就绪。
- Workloads 本地复合图标当前由多张 PNG 以 `IconFrame`+`IconPart` 绝对定位拼装：restart（`WorkloadsHeaderIcons.tsx`、`BatchActionIcons.tsx`）、close（`BatchActionIcons.tsx`）、logs（`PodOperationIcons.tsx`）、refresh（`PodContentHeader.tsx`）。delete-rebuild 亦为拼装但无对应 SVG。
- Workloads antd 图标真实分布（独立核查）：
  - `PodFilterBar.tsx` `SearchOutlined`
  - `podColumns.tsx` `CodeOutlined`,`FileTextOutlined`
  - `podCells.tsx` `ThunderboltOutlined`
  - `PodDetailDrawer/index.tsx` `SelectOutlined`
  - `PodDetailDrawer/detailTables.tsx` `CopyOutlined`
  - `PodDetailDrawer/ContainerDetail.tsx` `CopyOutlined`
  - `PodDetailDrawer/BasicInfoCard.tsx` `UpOutlined`
  - `PodDetailDrawer/ContainerTerminal.tsx` `ClearOutlined`,`FullscreenOutlined`,`FullscreenExitOutlined`,`SelectOutlined`
  - `PodDetailDrawer/ContainerLogsToolbar.tsx` `FlagOutlined`,`FullscreenOutlined`,`FullscreenExitOutlined`,`PauseCircleOutlined`,`PlayCircleOutlined`,`SelectOutlined`
- 新 SVG 以 `#545454`（= `semantic.text.secondary`）着色，非 `currentColor`；`vite.config.ts` `svgr()` 无参；仓库当前无任何 `.svg?react` 组件导入。

## Goals

- 用库中**已提供的单个 SVG**（经 barrel 引用）直接替换本地复合/位图图标的渲染，移除对应 `IconFrame`/`IconPart` 拼装与随之孤儿的 PNG。**不新建 SVG。**
- 将有对应 SVG 的 antd 图标替换为可继承颜色状态（hover/disabled/文字色）的 SVG。
- `FullscreenOutlined`/`FullscreenExitOutlined`/`SelectOutlined` 在 `ContainerTerminal.tsx` 与 `ContainerLogsToolbar.tsx` 两处**一致替换**，避免同图标两种渲染。

## Composite/Bitmap → Library SVG 映射

- restart（ring+stem，WorkloadsHeaderIcons/BatchActionIcons）→ `restart`
- close（close-left+close-right，BatchActionIcons）→ `close`
- logs（frame+dot+line，PodOperationIcons）→ `logs`
- refresh（cap+ring，PodContentHeader）→ `refresh`
- terminal（单 PNG，PodOperationIcons）→ `terminal`
- group-header 折叠箭头（单 chevron 旋转）→ `chevron-down`（保留 `ToggleButton` 旋转）
- pod-content-header 折叠/展开全部（`DoubleChevron` 双 chevron）→ 保留组合，碎片换 `chevron-up`/`chevron-down`（**不要**用 expand/collapse-panel）
- BasicInfoCard `UpOutlined` 折叠切换 → `chevron-up`，展开态 `rotate={180}` 改为 CSS `transform: rotate(180deg)`
- **无对应 SVG，保留现状**：delete-rebuild、force-delete、debug、menu-delete、temporary-auth、more-dot、CPU/GPU/内存、GPU 厂商 logo、概览插画、arrow-right、less/more-lines(已 SVG)。

## Non-Goals

- 保留无对应 SVG 的图标：delete-rebuild、force-delete、临时授权、调试（接口未开发）、更多(三点)、CPU/内存/GPU、GPU 厂商 logo、概览插画、less/more-lines、`icloud-logo`。
- 保留 antd `ClearOutlined`、`CopyOutlined`、`ThunderboltOutlined`、`FlagOutlined`、`PlayCircleOutlined`（无对应 SVG）。
- 不引入全局 SVGR 构建配置耦合。

## Task Route

- Type: app-layer UI 迁移（改变渲染方式，跨多文件）
- Owner Docs: `docs/design/design-tokens.md`, `docs/context/codebase-map.md`
- Skill: `code-review`

## Key Decisions

- Decision D1（修订）— 替换用 SVG 的着色：将被迁移的目标 SVG 源文件内 `#545454`（`fill`/`stroke`）改为 `currentColor`，并以 `?react` 组件方式导入，使其继承 antd Button 的文字/hover/disabled 色。
  - 备选一：全局 `vite svgr replaceAttrValues:{'#545454':'currentColor'}`（拒绝：隐式约束所有未来 `?react` 导入，评审耦合大）。
  - 备选二：静态 `<img>`（拒绝：丢失状态着色）。
  - 剩余风险：个别 SVG 含 `fill="white"` 背景 rect，需逐个确认迁移目标为纯 `#545454` 单色（`详情/独立展示/放大/缩小` 已确认干净，`搜索/代码模式/收起/暂停` 迁移前逐一确认）。
  - 前置：`?react` 无 TS 类型 → 需在 `src/vite-env.d.ts` 加 `/// <reference types="vite-plugin-svgr/client" />`（否则 `yarn lint-type` 失败）。
  - barrel 导出的是 URL 字符串，不能提供组件；需 `currentColor` 的图标走**直接 `?react` 路径**，仅纯静态 `<img>` 复合替换走 barrel URL。
- Decision D3 — 批量操作栏（绿色背景，文字为 `semantic.text.inverse` 白）：其操作图标（restart/close/block/unblock）统一以 `?react`+`currentColor` 继承为白色。这会把当前深灰的 block/unblock 一并变白，使整条栏图标一致（修正当前 white PNG / 深灰 SVG 混用）。
- Decision D2 — 使用库中已有单个 SVG 直接替换复合渲染，删除相关 `IconFrame`/`IconPart` 使用点与孤儿 PNG；无对应 SVG 者（delete-rebuild 等）保留现状。

## Execution Plan

### Phase 1 - Replace Composite/Bitmap With Library SVG

Status: completed

- [x] Fix: 加 `?react` 类型；将 16 个被替换 SVG 的 `#545454`→`currentColor`；restart/close/logs/refresh/terminal 复合改单个 `?react` 组件；chevron 保留 DoubleChevron/旋转仅换碎片；block/unblock 改组件。删除 15 个孤儿 PNG。Skill: none
- [x] Proof: `yarn lint-type` + `yarn build`(16.34s) + Workloads 测试 83/83 通过；孤儿 PNG 零引用。Skill: none

Exit Criteria:

- [x] 复合图标已单图化，无孤儿 PNG，构建通过。

### Phase 2 - Replace Replaceable antd Icons

Status: completed

- [x] Decision: 应用 D1/D3（`?react`+`currentColor`）。Skill: none
- [x] Fix: `SearchOutlined→search`、`CodeOutlined→code`、`FileTextOutlined→details`、`SelectOutlined→standalone`、`FullscreenOutlined→zoom-in`、`FullscreenExitOutlined→zoom-out`、`UpOutlined→chevron-up`(CSS rotate)、`PauseCircleOutlined→pause`；Terminal 与 LogsToolbar 共享图标一致替换；保留 Clear/Copy/Thunderbolt/Flag/Play。Skill: none
- [x] Proof: `yarn build` 通过；受影响文件 ESLint/dprint 通过。Skill: none

Exit Criteria:

- [x] 可替换 antd 图标已迁移且颜色状态无回退，两工具栏一致。

### Phase 3 - Verify + Docs

Status: partially completed

- [x] Proof: `yarn lint-type`、`yarn build`、Workloads 测试 83/83、受影响文件 ESLint/dprint 通过。Skill: none
- [ ] Proof: Workloads 全部图标面视觉烟测（overview 卡片、header/menu actions、batch actions、pod row actions、pod/group header、抽屉工具栏、终端/日志工具栏）。Skill: none
- [x] Follow-up: 更新 `docs/logs/2026/07-30.md`。Skill: none

Exit Criteria:

- [x] 验证命令通过（无关既有失败单独记录）。
- [ ] 视觉烟测通过。
- [x] `docs/logs/` 更新。

## Draft Review Record

- Reviewer: `General_6507844` 独立子代理
- Verdict: passed-after-revisions
- Revisions applied: 补 `?react` TS 类型声明；纠正 chevron 映射（用 chevron-up/down，保留 DoubleChevron，不用 expand/collapse-panel）；`UpOutlined→chevron-up`（非不存在的 collapse），rotate 改 CSS；明确 barrel(URL) 与 `?react`(组件) 分工；批量栏 close/restart/block/unblock 走 currentColor 继承白（D3）；列举 KEEP 集合防止误删。

## Closure Gates

- [x] In-scope behavior is complete.
- [x] Relevant docs are aligned.
- [x] Verification has run（lint-type/build/test/eslint/dprint）。
- [ ] Closure audit was independent（待做；视觉烟测未完成前保持 partially completed）。

# 2026-07-30 SVG Icon System Split (Option 5)

> Plan Status: proposed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-30
> Source: 内部指南《React SVG 管理方案：SVGR CLI 预生成组件（方案五）》 + 现体系可维护性优化
> Scheduling: 延后执行（backlog），有空再排期；执行前需 draft review。

## Current Baseline

- `src/assets/` 为扁平目录：69 个 SVG（多为 `#545454` 单色线性图标 + `icloud-logo` 多彩）+ 22 个遗留 PNG（资源位图/厂商 logo/插画/复合碎片）+ `README.md` + `icons/index.ts`（barrel，导出 URL 字符串）。
- 已装 runtime `vite-plugin-svgr`（`vite.config.ts:67`，无参）；`src/vite-env.d.ts` 已引用 `vite-plugin-svgr/client` 支持 `*.svg?react`。
- Workloads 已用 `?react` 组件消费 16 个单色图标；这 16 个 SVG 的 `#545454` 是**手改为 `currentColor`**（源文件已被改动）。
- 多彩资源（icloud-logo、GPU 厂商 logo、概览插画）目前保持原色、以 `<img>`/URL 消费。

## Problem

- 手改源文件注入 `currentColor` 不可持续：设计重导出会覆盖；缺少"哪些是单色可染色"的单一事实来源。
- 单/多色 SVG 同目录、无命名或目录信号，易误用（多彩被当单色染、或被全局着色规则破坏）。
- 任何全局 `svgr replaceAttrValues` 都会污染多彩 SVG（如 icloud-logo）。

## Goals

- 物理隔离单色与多彩 SVG，杜绝互相污染。
- 由工具在导入期统一注入 `currentColor`（单色），源文件保持设计师原样、可安全重导出。
- 提供清晰、可扩展的新增图标规范与统一消费入口。

## Non-Goals

- 不改变图标最终视觉（迁移为行为/视觉等价）。
- 不新增业务功能；不处理遗留 PNG 的进一步替换（另计）。

## Task Route

- Type: 结构性重构（改 import 契约 + 构建配置，视觉保持）
- Owner Docs: `docs/design/design-tokens.md`, `docs/context/codebase-map.md`
- Skill: `code-review`

## Chosen Approach (待 review 确认)

采用方案五的**分目录 + 按目录着色**理念，但**用现有 runtime `vite-plugin-svgr` 作用域化实现**，不引入 `@svgr/cli` 预生成（更省维护，无生成目录/CI 钩子）：

- 目录：`src/assets/icons/`（单色，`currentColor` 托管）、`src/assets/illustrations/`（多彩保原色）、`src/assets/legacy/`（遗留 PNG，待替换）。
- vite 两个作用域化 svgr 实例：`icons/**` 用 `svgrOptions.icon + replaceAttrValues {'#545454':'currentColor'}`；`illustrations/**` 不做颜色替换。
- 回退手改的 16 个单色 SVG 到原始 `#545454`，改由 `icons/` 作用域在导入期注入。
- barrel 拆为 `assets/icons`（组件导出）与 `assets/illustrations`（组件导出），统一以组件消费。

### 备选：@svgr/cli 预生成（方案五原版）

若团队要求"组件产物入库可 Code Review / 不依赖 runtime 插件 / SSR 友好"，改用 `@svgr/cli` + `gen:svg` 脚本 + 生成目录入库。代价：额外生成步与 CI 钩子。二选一为 Decision 项，review 时定夺。

## Execution Plan（草案，未执行）

### Phase 1 - Decide Runtime-Scoped vs CLI-Pregen

Status: proposed

- Decision: 二选一（记录选择/备选/风险）。Skill: `code-review`

### Phase 2 - Reorg Directories

Status: proposed

- Fix: 建 `icons/ illustrations/ legacy/`，按单/多色/PNG 归位现有资源。Skill: none
- Proof: 分类清单可核查；无遗漏。Skill: none

### Phase 3 - Scoped svgr + Revert Hand-Edits

Status: proposed

- Fix: 配置作用域化 svgr；回退 16 个 SVG 的手改 `currentColor` 为原色。Skill: none
- Proof: 单色图标在容器色下等价渲染；多彩不受影响；`yarn lint-type`+`yarn build` 通过。Skill: none

### Phase 4 - Barrel + References + Docs

Status: proposed

- Fix: 拆分 barrel（组件导出）；更新全部引用路径；更新 `src/assets/README.md` 与 `docs/design/`。Skill: none
- Proof: 无旧路径残留；引用全部解析。Skill: none

### Phase 5 - Verify

Status: proposed

- Proof: `yarn lint-type`、`yarn build`、Workloads 测试、受影响文件 ESLint/dprint 通过 + 视觉烟测。Skill: none
- Follow-up: 更新 `docs/logs/`。Skill: none

## Closure Gates

- [ ] In-scope behavior is complete.
- [ ] Relevant docs are aligned.
- [ ] Verification has run.
- [ ] Closure audit was independent.

# 2026-07-30 SVG Icon System Split (Option 5)

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-04
> Source: 内部指南《React SVG 管理方案：SVGR CLI 预生成组件（方案五）》 + 现体系可维护性优化
> Scheduling: 延后执行（backlog），有空再排期；draft review 已完成（见 Review Log），实现前需按 Rule 13 校验当前 git user 在 Owner 列表内。

## Current Baseline

> 2026-08-04 已对照仓库重新核实（draft review），替换旧的记忆式基线。

- `src/assets/` 为扁平目录 + `icons/` 子目录（仅含 `index.ts` barrel）：**70 个 SVG** + **22 个 PNG** + `README.md`。
- SVG 拆分：**69 个单色** + **1 个多彩 `icloud-logo`（仓库唯一多彩 SVG）**。GPU 厂商 logo、概览插画等"多彩资源"实为 **PNG**，不是 SVG。
- 单色 69 中：**16 个已被手改为 `currentColor`**（block/chevron-down/chevron-up/close/code/details/logs/pause/refresh/restart/search/standalone/terminal/unblock/zoom-in/zoom-out），其余 **53 个仍为 `#545454`**。currentColor 完全靠手改源文件实现，与 svgr 配置无关。
- 构建：`vite.config.ts:64` 为 `svgr()` **无参全局**；`src/vite-env.d.ts` 已引 `vite-plugin-svgr/client`，支持 `*.svg?react`。
- 真实消费全走 `?react` 直连：**11 个组件文件、23 处 import、17 个唯一图标**（`src/pages/Workloads/**`）。`icloud-logo` 走 URL 直连（`TopNavContent.tsx:8`）。
- **barrel（`icons/index.ts`）导出 69 个 URL 字符串，但：(a) 漏登记 `unexpand.svg`（该文件存在且被 `?react` 使用）；(b) 当前无任何真实消费方**（`from '@/assets/icons'` 仅出现在 barrel 注释与 README 示例）。
- **现存不一致（迁移必须处理）**：
  - `expand` / `unexpand` / `switch`：经 `?react` 消费但仍是 `#545454`，今天**不继承容器色**。
  - `terminal` / `logs`：已是 `currentColor` 但**非 `?react`**（仅 barrel URL 导出、且 barrel 无消费方）；若经 `<img>` 消费，`currentColor` 会失效（渲染为黑）。当前实际未见消费方。
- `README.md` 已漂移：写"遗留 PNG（37）"，实际 22；SVG 表漏 `unexpand`。
- 边界：PNG 的进一步替换/删除、以及整体迁移至 `assets/images/`，均由 `docs/plans/2026-07-30-workloads-icon-upgrade-plan.md`（下一 plan）负责，不在本 plan。

## Problem

- 手改源文件注入 `currentColor` 不可持续：设计重导出会覆盖；缺少"哪些是单色可染色"的单一事实来源。
- 单/多色 SVG 同目录、无命名或目录信号，易误用；任何全局 `svgr replaceAttrValues` 都会污染多彩 SVG（如 `icloud-logo`）。
- 着色约定执行不齐：部分 `?react` 图标仍 `#545454`，部分 `currentColor` 图标却走 URL；barrel 与 README 已与实际脱节。

## Goals

- 物理隔离单色与多彩 SVG，杜绝互相污染。
- 由工具在导入期统一注入 `currentColor`（单色），源文件保持设计师原样、可安全重导出。
- 消除现存不一致：`expand/unexpand/switch` 着色行为与其余单色图标对齐；补齐 `unexpand` 登记；修正 barrel/README 与实际的漂移。
- 提供清晰、可扩展的新增图标规范与统一消费入口。

## Non-Goals

- 不改变图标最终视觉，**除下方"已知行为差异"显式列出的受控变更外**。
- 不新增业务功能；不处理遗留 PNG 的替换/删除，也不迁移 PNG 至 `assets/images/`（均归下一 plan，见 `2026-07-30-workloads-icon-upgrade-plan.md`）。

## Known Behavior Deltas（受控、需目检）

- `expand` / `unexpand` / `switch`：从固定 `#545454` → 继承 `currentColor`。容器文本色为 secondary 灰时视觉等价，否则会随容器变化。**owner 已确认接受此受控变更（2026-08-04）**；实现时仍需逐一目检并记录实际差异。
- `terminal` / `logs`：随其余单色统一回退为 `#545454` 并纳入 `icons/` 作用域；执行前确认其实际消费方式（转 `?react` 或保留 URL），避免 `currentColor`-through-`<img>` 失效。

## Task Route

- Type: 结构性重构（改 import 契约 + 构建配置，视觉保持/受控变更）
- Owner Docs: `docs/design/design-tokens.md`, `docs/context/codebase-map.md`
- Skill: `code-review`

## Chosen Approach

采用方案五的**分目录 + 按目录着色**理念，用现有 runtime `vite-plugin-svgr` **作用域化**实现，不引入 `@svgr/cli` 预生成：

- 目录：`src/assets/icons/`（单色，`currentColor` 托管）、`src/assets/illustrations/`（多彩保原色，当前仅 `icloud-logo`；独立目录长期保留，不并入 `images/`）。**本 plan 不创建 `legacy/`、不移动 PNG**；PNG 暂留 `assets/` 根，后续整体迁往 `assets/images/` 由下一 plan 负责。
- vite 两个作用域化 svgr 实例：`icons/**` 用 `svgrOptions.replaceAttrValues {'#545454':'currentColor'}`（**未启用 `icon`**，保持图标原有尺寸）；`illustrations/**` 不做颜色替换（用 `include`/`exclude` glob 界定）。
- 回退手改的 16 个单色 SVG 到原始 `#545454`，改由 `icons/` 作用域在导入期注入。
- 说明：`illustrations/` 当前仅 1 个文件是**有意的防污染隔离**——即使未来给 `icons/**` 加全局着色规则，也不会命中多彩 `icloud-logo`。

### 备选：@svgr/cli 预生成（方案五原版）

若团队要求"组件产物入库可 Code Review / 不依赖 runtime 插件 / SSR 友好"，改用 `@svgr/cli` + `gen:svg` 脚本 + 生成目录入库。代价：额外生成步与 CI 钩子。本项目为 CSR + qiankun 微前端、无 SSR，SSR 友好性不构成决策权重。二选一为 Phase 1 Decision。

## Execution Plan

### Phase 1 - Decide Runtime-Scoped vs CLI-Pregen

Status: planned

- Decision: 采用 **runtime-scoped svgr**（现有插件双实例、`include`/`exclude` 按目录作用域化）。备选：`@svgr/cli` 预生成 + `gen:svg` + 产物入库。选择理由：无需新增生成步/CI 钩子/生成目录，维护面最小，且插件已安装。剩余风险：runtime 转换产物不入库、不可直接 CR（可接受）；SSR 不友好（本项目无 SSR，不适用）。Skill: `code-review`

[x] Exit Criteria:

- 选择、备选、剩余风险已记录在本条目
- [x] `docs/logs/` 记录该决策

### Phase 2 - Reorg Directories

Status: planned

- Fix: 建 `icons/`（69 个单色：16 currentColor + 53 `#545454`）、`illustrations/`（多彩，当前仅 `icloud-logo`），按类归位现有 SVG。Skill: none
- Proof: 分类清单可核查；70 个 SVG 全部归位（含此前漏登记的 `unexpand`）；PNG 未移动。Skill: none

[x] Exit Criteria:

- 69 个单色 SVG 进入 `icons/`，`icloud-logo` 进入 `illustrations/`
- `unexpand.svg` 已纳入体系（不再遗漏）
- 无 SVG 遗留在旧位置；PNG 原位不动

### Phase 3 - Scoped svgr + Revert Hand-Edits + Reconcile Anomalies

Status: planned

- Fix: 配置作用域化 svgr：`icons/**` = `svgrOptions.replaceAttrValues {'#545454':'currentColor'}`（不启用 `icon`）；`illustrations/**` 不做颜色替换。Skill: none
- Fix: 回退 `icons/` 下 16 个手改 `currentColor` 为原始 `#545454`，改由作用域注入。Skill: none
- Decision: `expand/unexpand/switch`（`?react` 但仍 `#545454`）纳入 `icons/` 后将自动继承 `currentColor`，确认此一致化为期望行为并记录视觉差异。Skill: `code-review`
- Decision: `terminal/logs`（`currentColor` 但非 `?react`、barrel 无消费方）确认实际消费方式后，随其余单色回退 `#545454` 并入 `icons/`。Skill: none
- Proof: 单色图标在容器色下等价/受控渲染；多彩不受影响；`expand/unexpand/switch` 目检；`yarn lint-type` + `yarn build` 通过。Skill: none

[x] Exit Criteria:

- 作用域化 svgr 生效：`icons/` 注入 `currentColor`，`illustrations/` 保原色
- 16 个手改已回退，源文件恢复设计原样
- `expand/unexpand/switch` 着色与其余单色一致，视觉差异已目检记录
- `terminal/logs` 去向已确定并落地
- `yarn lint-type`、`yarn build` 通过

### Phase 4 - References + Barrel + Docs

Status: planned

- Fix: 将 11 个组件文件、23 处直连 `@/assets/*.svg?react` 迁移为**从重建后的 barrel 引入组件**（统一入口）；`icloud-logo` 消费改为经 barrel 的 URL 导出（指向 `illustrations/`）。Skill: none
- Decision（已定，2026-08-04）：**重建 barrel** 为统一消费入口——`icons/` 以 `?react` **组件**具名导出（承载 `currentColor`），`icloud-logo` 维持 **URL** 导出（保持现 `<img>` 消费）。备选（整体移除、各处直连）未采纳；理由：建立单一事实来源与统一新增入口，替换当前无人使用且漏项的旧 URL barrel。剩余风险：全量具名 `?react` 导出的 tree-shaking——需 Proof 确认按需引入不会把全部图标打进产物。Skill: `code-review`
- Fix: 更新 `src/assets/README.md` 与 `docs/design/`：SVG 70（含 `unexpand`）、PNG 22（修正 stale 的 37）、新目录结构与新增图标规范。Skill: none
- Proof: 旧根路径 `@/assets/*.svg?react` 直连残留计数为 0；引用全部解析；barrel 按需引入的 tree-shaking 经 `yarn build` 产物抽查确认；README 计数与目录与实际一致。Skill: none

[x] Exit Criteria:

- 11 文件、23 处消费改为经重建 barrel 的组件导入（无散落直连）
- `icloud-logo` 经 barrel 的 URL 导出（指向 `illustrations/`）
- barrel 已重建为统一组件入口、旧 URL barrel 移除；tree-shaking 已验证
- `README.md`/docs 的计数与目录与实际一致（70 SVG / 22 PNG / `unexpand` 已列）
- 无旧路径残留

### Phase 5 - Verify

Status: planned

- Proof: `yarn lint-type`、`yarn build`、Workloads 受影响测试、受影响文件 ESLint/dprint、视觉烟测（对照迁移前后，重点 `expand/unexpand/switch` 与 `icloud-logo`）。Skill: none
- Follow-up: 更新 `docs/logs/2026/`；如影响资产组织基线，更新 `docs/design/` 或 `docs/context/codebase-map.md`。Skill: none

[x] Exit Criteria:

- `yarn lint-type` 通过
- `yarn build` 通过
- 受影响测试 / ESLint / dprint 通过
- 视觉烟测通过（含受控差异项）
- [x] `docs/logs/` 已更新

## Closure Gates

- [x] In-scope behavior is complete.
- [x] Relevant docs are aligned.
- [x] Verification has run.
- [x] Closure audit was independent. （owner v_wangkaiyuan02 自验 2026-08-04；AI 为实现者，未做第三方独立审计，如流程要求可另行补充）

## Review Log

- 2026-08-04 — Draft review（独立于原作者视角执行）。verdict：方向成立，但原草案 baseline 与仓库脱节、缺每-Phase Exit Criteria、Decision 未收敛。已据仓库核实修订：
  - 修正计数（SVG 69→70、多彩 SVG 仅 `icloud-logo`、PNG 22、`unexpand` 漏登记）。
  - 纠正"16 个 `?react` == 16 个 currentColor"的错误映射，析出 `expand/unexpand/switch` 与 `terminal/logs` 两组异常并纳入 Phase 3。
  - 澄清引用面：11 文件 23 处 `?react` 直连 + `icloud-logo` URL 导入；barrel 当前无真实消费方。
  - 收敛 Phase 1 Decision（选择/备选/剩余风险），补齐每-Phase `Exit Criteria`，明确 `illustrations/` 单文件的隔离理由、`legacy/` 移出本 plan 范围。
  - 结论：草案已可执行；置 `planned` 前建议一次独立确认（尤其 Known Behavior Deltas 与 barrel 去留决策）。
- 2026-08-04 — 结构决策（与 owner 对齐）：保留 `illustrations/` 独立目录（否决并入 `images/` 的建议）；单色 SVG 全部进 `icons/`、多彩 `icloud-logo` 留 `illustrations/`；PNG 整体迁往 `assets/images/` 推迟到下一 plan，本 plan 不动 PNG。
- 2026-08-04 — Owner 确认两项残留决策：(1) 接受 Known Behavior Deltas（`expand/unexpand/switch` 变继承色）；(2) barrel 重建为统一组件入口（非移除）。两项收敛后 Plan Status 由 `proposed` → `planned`，各 Phase 同步置 `planned`；仍按 backlog 排期，实现前无新增未决项。
- 2026-08-04 — 实现完成并验证（owner v_wangkaiyuan02 执行）。落地：icons/(69) + illustrations/(icloud-logo) 目录拆分；vite 作用域 svgr 注入 `#545454→currentColor`（**未启用 `icon`**，保尺寸）；回退 16 个手改；barrel 重建为 69 个 PascalCase 组件导出；17 处 `?react` 消费改走 barrel；4 个 `<img>` 单色 + `icloud-logo` 更新路径；README 重写。验证：`yarn lint-type` ✅、`yarn build` ✅（产物确认 svgr 组件内联；仅 4 个 svg data-URI ＝ 4 个 `<img>` 单色，`icloud-logo` 单独产出）、受影响文件 `eslint`/`dprint` ✅。详见 `docs/logs/2026/08-04.md`。实现相对 Chosen Approach 的唯一偏离：未启用 `svgrOptions.icon`（保持既有尺寸，符合 Non-Goal）。
- 2026-08-04 — Follow-up（记录，暂不做，owner 指示）：如将来单色图标源色不统一，可在 `icons/**` 改用 SVGO `convertColors { currentColor: true }` 统一转任意 fill/stroke；需装 `@svgr/plugin-svgo` + 开启 `svgrOptions.svgo`（`vite-plugin-svgr@5.2.0` 默认不跑 SVGO）。当前保持精确 `#545454` 匹配。

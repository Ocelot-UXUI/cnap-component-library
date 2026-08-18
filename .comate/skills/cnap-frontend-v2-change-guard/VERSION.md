# 版本记录

## v1.4.0 — 2026-08-06

- `references/styling.md` 增补「semantic token 速查 & 易错点」：按 `src/constants/colors/semantic.ts` 真源列出 text/bg/border/state/component/icon/button/logConsole 各组键名，并点名实测踩过的坑——`semantic.status?.error`（应为 `state.*.default`）、`semantic.bg.subtle`（不存在）、`?? '#hex'` 兜底。目的：用状态色/深色日志色时照速查取键而非猜 token 结构。
- 依据 iteration-4 真实评测：新手 baseline 猜了 `semantic.status?.error ?? '#e64545'`、`bg.subtle`；装 skill 版用对了专用的 `semantic.logConsole.*`。

## v1.3.0 — 2026-08-06

- `references/component.md` 补成**完整组件知识清单**（`@/design` 42 透传 + Drawer/Select 增强 + message/notification/theme 工具；`@/components` 13 个业务组件及用途），复用判断从「每次全库 grep」改为「**先查清单、命中即用**，落用前做一次轻量确认，清单未覆盖或与代码不一致时以 `src/design/index.ts`/`src/components/` 为准」。清单标「最后核对日期」以对冲过时风险。
- 同步 SKILL.md 第 0 步与雷区#1 措辞：复用组件先查清单，不必每次 grep；hook/API/capability 仍先 grep 既有实现。

## v1.2.0 — 2026-08-06

- 打分卡新增「下 🔴 假设前的硬约束」：凡假设涉及接口字段/类型/控件/页面「已存在」，必须先 grep/读码核实，查不到则升级为 ⛔ 前提冲突，不得凭字段名臆测。修复 iteration-1 评测暴露的坑——A 用例（加筛选下拉）装 skill 版曾假设一个不存在的 `status` 字段，而 baseline 查证了其不存在。

## v1.1.0 — 2026-08-06

对照 AGE 真源（`ai-autonomy-policy.md` / `source-of-truth-and-precedence.md` / `project-context.md` / `docs/skills/README.md`）做的一次对齐修订：

- **补「保护区 / Block 闸」（关键）**：SKILL.md 的 AGE 关系节新增①保护区闸——auth/login/UUAP 会话=ask-first、AI executor core 与 capability 契约=plan-first；②前置让位闸（planning trigger）；打分卡的"🔴 缺失选默认继续"显式挂靠 autonomy=`implement` 且不碰保护区。`references/ai-semantics.md` 顶部加保护区警告，避免 skill 架空 autonomy policy。
- **接入 AGE 前置**：第 0 步先完成 AGENTS.md 的 Read This First + Task Routing，再进保护区/让位闸与分诊。
- **skill 路由衔接**：在 `docs/skills/README.md` 增设「Comate 层 Skills」小节登记本 skill，说明与 `docs/skills/*.md` prompt registry 是两套机制；SKILL.md 注明该指针。
- 小完善：收尾补 `yarn start`（视觉/暗色确认）；`api.md` 点明 API 契约真源=`src/api/`；`state.md` 提示 constate 可能无先例、无先例时按规范新建而非退回裸 useState。

## v1.0.0 — 2026-08-06

- 首个版本。参考 team-agents 的 `cnap-frontend-v2-change-guard`，按 CNAP2.0（frontend-v2）实际情况定制。
- 分场景路由结构：`SKILL.md`（AGE 协同 + 触发条件 + 动手前打分卡 + 场景分诊 + 通用约束）+ `references/` 下 13 个场景文件（component / page / state / api / types / constants / styling / interaction / routing / assets / utils / hooks / ai-semantics）。
- 与 tiki 版的主要差异（对齐 CNAP2.0）：
  - **服从 AGE 文档流**：新增「前置让位闸」——命中 planning trigger 先交回 AGE 写 plan/requirement；收尾遵守 Docs Maintenance（更新 `docs/logs`）。
  - **状态**：region-core → XState（外部可观测/持久）+ constate（视图内）。
  - **样式**：CSS 变量 → `@/constants` 的 semantic/palette/sidebar TS token + ConfigProvider `themePresets.cnap2` + 防绿色污染 + 组件级 alias token 锁。
  - **接口**：`createInterface` 来自 `@/api/services/primary`（axios-interface factory），DEV mock via enhance。
  - **格式**：Prettier → dprint；验证命令 `lint-type / test / lint / format:check / build`。
  - **新增 CNAP2.0 特有场景** `ai-semantics.md`：`aiProps()` 语义标注、capabilities 注册、executor、`ai-context.json`。
  - 组件层补充增强组件契约（Drawer/Select）、Layout 边界与私有 `.style.ts` 收敛、剪贴板 `@/utils/clipboard`。
- 保留 tiki 版的「前端 Prompt 质量打分卡」（完整版，🟢/🟡/🔴/⛔ 四档、一次一卡、纯微调出精简一行卡）。
- 受众覆盖不熟规范的贡献者，保留通用纠偏雷区（造轮子/直连 antd/硬编码/自造状态/手搓请求/过度防御/大文件）。

---
name: cnap-frontend-v2-change-guard
description: 只要改动触及 CNAP2.0（frontend-v2）仓库的 src/（或任何影响前端产物/渲染的东西，如 vite/svgr/构建配置），默认就用本 skill——不要因为改动小、是"微调"或"只是换个资源"就跳过。覆盖：新增或修改组件、页面、UI、hook、类型、前端接口；改样式/token，哪怕只调一个颜色、间距、圆角、定位数值；加或改动画/过渡；替换或新增资源（icon、svg、图片、插画、字体）；改路由、常量、localStorage；改 AI 语义标注（data-ai-action/entity）、capabilities、executor。典型口语指令如"换logo""改样式""调位置/对齐""加动画""换图标""改svg""加个筛选""接个接口""加个弹窗/抽屉"都应触发。它把 CNAP2.0 既有规范（AGENTS.md + docs/context + docs/design + 设计系统）转成分场景执行清单，重点约束：复用 @/design 而非直连 antd、token 防绿色污染、XState/constate 选型、走 createInterface 而非手搓 axios、Layout 边界与私有样式收敛，并强制收尾验证（lint-type/lint/format:check，必要时 build）与 docs/logs 记录。同时服从项目的 AGE 文档流：命中 planning trigger 先让位写 plan。
metadata:
  security_level: L0
---

# Frontend Change Guard (CNAP2.0)

CNAP2.0（frontend-v2）是一个**纯前端控制台**（React 19 + TS + Vite + Ant Design 6 + Emotion + XState）。它有一套成熟但**大量靠约定**的规范——设计 token、状态方案、接口封装、AI 语义标注都已定好。agent 如果不知道这些，会凭通用 React 直觉写出"能编译但不符合规范"的代码。

**本 skill 是一个路由，不是一份长清单。** 按下面的分诊表判断改动命中哪些场景，**只读命中场景对应的 `references/` 文件**——不要把所有场景正文都读进来。一次改动常命中多个，就读多个。

## 核心能力

- **分场景路由**：按下方「场景分诊」表把一次前端改动映射到对应 `references/` 文件，只读命中的场景，不全量加载。
- **规范护栏**：把 CNAP2.0 既有约定（`@/design` 收敛、token 防绿色污染、XState/constate 选型、`createInterface`、Layout 边界与私有样式收敛）转成动手前的执行约束。
- **AGE 流程闸**：先过保护区/Block 闸与 planning trigger 让位闸，再决定是否自主实现。
- **Prompt 质量打分卡**：动手前显性化「本次改动 AI 掌握了多少信息」，缺失走合理默认、前提冲突按可逆性决定继续或停下。
- **强制收尾**：按改动类型跑校验（`lint-type`/`lint`/`format:check`，必要时 `build`）并更新 `docs/logs`。

## 工作流程

1. 完成 AGE 前置：Read This First + Task Routing，过 ① 保护区闸 → ② 前置让位闸。
2. 动手前输出唯一一张前端 Prompt 质量打分卡。
3. 读要改的文件全文 + 兄弟文件 + 页面入口；复用组件先查 `references/component.md` 清单。
4. 用「场景分诊」表选中场景，读对应 `references/` 文件并执行（命中多个则并行读取）。
5. 收尾：跑校验并报告结果、确认暗色模式、更新当天 `docs/logs`。

## 与 AGE 文档流的关系（先读这条）

CNAP2.0 用 AGE 工作流治理流程（见 `AGENTS.md`）。**本 skill 从属于 AGE，不与它平起平坐**：

- **① 保护区 / Block 闸（最先判，最硬）**：依据 `docs/context/ai-autonomy-policy.md` + `docs/context/project-context.md` 的 AI Block Conditions，命中以下**一律不走快车道**：
  - auth/login、UUAP 登录/会话、权限路径（尤其无测试覆盖）→ **ask-first，停下等人确认**；
  - AI executor core（`src/executor/` 的 `agentLoop`/`AIExecutorProvider`）、capability 执行契约（`src/capabilities/types.ts` / `index.ts`）→ **plan-first**（先写 plan，且需 owner doc + tests）；
  - 验证命令缺失/损坏、或 live code 与 owner doc 冲突 → 停下。
  - **只有 autonomy=`implement`、不碰保护区、验证命令齐备、owner doc 已列出时，才可自主实现。**
- **② 前置让位闸（planning trigger）**：命中 AGE planning trigger（改 API/数据模型/集成/部署等公共契约；跨多个用户可见功能面或多个模块改共享行为；预计 >1 次会话；改动 >5 文件或 >约 200 行；有未解决产品/技术风险）→ **停下，交回 AGE 先写 `docs/requirements/` 或 `docs/plans/` 并走 draft review，不要直接改代码。** 本 skill 的"快速执行"只适用于**实现级、够小、owner doc 已明确**的前端改动。
- **③ 收尾归档**：改完除了跑校验，遵守 `AGENTS.md → Docs Maintenance`——更新当天 `docs/logs/{年}/{月}-{日}.md`；若影响应用层行为或技术结构，更新 `docs/design/` 或 `docs/architecture/` 对应 owner doc。若在一个 plan 内运行，按 Skill Usage Rule 在对应阶段登记 `Skill: cnap-frontend-v2-change-guard`。
- AGE 决定"该不该现在动手、要不要先 plan/停下"；本 skill 决定"一旦动手，前端代码怎么写才合规"。两者互补。
- 本 skill 是 Comate 层 `.comate/skills/`，与 AGE 的 `docs/skills/*.md`（审查 prompt registry）是两套机制；`docs/skills/README.md` 已注明指针，前端改动执行类走本 skill。

## 触发条件

**默认规则：只要改动触及 `src/`，或会影响前端产物/渲染，就触发。判断成本高时，默认触发而非跳过。**

| 场景 | 是否触发 |
|---|---|
| 改动落在 `src/` 下的 `.tsx`/`.ts`/样式（新增或修改组件、页面、UI、接口、类型、hook、状态等） | ✅ 触发 |
| 样式/token 微调（颜色、间距、圆角、阴影、字号、定位数值），哪怕只改一个值 | ✅ 触发 |
| 动画/过渡（Motion 组件、Emotion keyframes） | ✅ 触发 |
| 替换或新增前端资源（icon、svg、图片、插画、字体） | ✅ 触发 |
| 改 AI 语义标注（`data-ai-action`/`data-ai-entity`）、`src/capabilities/`、`src/executor/` | ✅ 触发 |
| 改 `vite`/`svgr`/构建、依赖配置，且影响前端产物或渲染 | ✅ 触发 |
| 仅改 `docs/**` 文档、且完全不影响 `src/` 产物/渲染 | ❌ 不触发 |

**不要因为改动小、是"微调"、"只是换个资源"或"只是改配置"就跳过——这些正是最容易漏掉规范的地方。**

## 输出前必做：前端 Prompt 质量打分卡

**每次命中本 skill（且已通过上面的 AGE 前置让位闸），整段回复里只输出一张打分卡，且尽量靠前。** 打分卡打的是**用户 prompt 本身给了多少信息**——尽量在动手前就出。若需先定位/读代码才能填准（例如核实控件/接口是否存在），可先做最小核实，但**只在动手前出这一张卡，不要每读一个文件就重出一张**，收尾总结里也不要再打印一次。目的是把"这次改动 AI 掌握了多少信息"显性化，顺带教用户下次怎么把前端需求描述清楚。

**🔴 缺失 vs ⛔ 前提冲突——什么时候继续、什么时候停**：

- 🔴 **信息缺失**（prompt 没说清但不矛盾，如"改好看点""加 hover"没给规格）→ **不要停**，选一个克制的合理默认，在卡里写明假设，直接动手。
- ⛔ **前提冲突**（读代码后发现 prompt 前提与实际不符）→ 分两种：
  - **有明显且可逆的默认解法** → 卡里标 ⛔ 说明冲突与默认处理，**继续动手**，邀请纠正。
  - **是真岔路 / 方向不定 / 可能不可逆** → 卡里标 ⛔，列可选方向，**停下等确认**。
- 判断依据：**有没有一个明显、克制、可逆的解释**。有→继续；没有→停下问。注意：真岔路里若涉及 AGE planning trigger，停下的动作是"交回 AGE 写 plan"，不是自己拍板。
- **🔴 缺失选默认自主推进，仅在 autonomy=`implement` 且不碰保护区（见上方 ① 保护区闸）时适用**；一旦命中保护区（auth/executor core/capability 契约），即使信息齐全也要 ask-first/plan-first，不能靠打分卡"合理默认"绕过。

维度按改动类型取用（不必全列）：改动位置 / 改动类型 / 参照对象（"参照哪个页面/组件"）/ 预期效果 / 视觉规格（含暗色模式）/ 接口契约（path·method·参数·响应字段是否已确认）。

**下 🔴 假设前的硬约束（先核实再假设）**：凡假设涉及某个接口字段/响应结构、类型、组件/控件、或目标页面/文件「已存在」，**必须先 grep/读码核实它真实存在**，再写进 🔴 假设。查证不存在或对不上 → 不要凭字段名想当然，升级为 ⛔ 前提冲突（数据契约不支持），按 `api.md`「别按字段名臆测、别为假设的 API 形状加兼容分支」处理：能改走既有契约就标注继续，是真岔路就停下/让位。（本条针对实测里"假设了一个不存在的 status 字段"的坑。）

**卡片模板**（🟡/🔴/⛔ 哪档没有就省略，不要硬凑）：

```
📋 前端 Prompt 质量打分 · 改动类型：<组件/样式/接口/AI语义/…>

🟢 已提供
✓ <维度>：<用户给到的内容>

🟡 建议补充（给了更好，不给我按合理默认来）
• <维度>

🔴 缺失（影响判断，我将按假设推进）
• <维度> → 假设：<我打算怎么处理>

⛔ 前提冲突（读代码后发现与 prompt 不符时才出现）
• <prompt 说的> → 代码实际：<真实情况>
  - 有默认解法 → 我按 <默认处理> 继续，如不符请纠正
  - 真岔路 → 可选 A / B，请确认后我再动手
```

**精简规则**：纯样式/资源微调只输出一行——`📋 打分：🟢 位置+类型明确 / 🔴 暗色模式未提（默认沿用现有 token，两侧都验证）`。中大型改动（新增组件/页面、接口联调、跨文件）才出完整卡。

## 唯一的真相来源

规范正文在仓库里，**不要凭记忆**。铁律：**源码与文档冲突时以源码为准**。权威顺序见 `docs/context/source-of-truth-and-precedence.md`。各场景文件会指引你读到具体的：

- `AGENTS.md`、`docs/context/conventions.md`（项目级约定）、`docs/context/codebase-map.md`（路由地图）
- `docs/design/design-tokens.md`（**样式强制规范**）、`docs/design/interaction-guidelines.md`、`docs/architecture/svg-icon-system.md`

## 第 0 步：动手前永远先做

0. **先完成 AGE 的 Read This First + Task Routing**：读 `docs/context/project-context.md`、`ai-autonomy-policy.md`、`codebase-map.md` + active requirement/owner doc，按 `docs/index.md` 给任务分类；再过 **① 保护区/Block 闸 → ② 前置让位闸**（命中保护区→ask-first/plan-first；命中 planning trigger→交回 AGE 写 plan，别往下走）。
1. 动手（改文件）前先输出**唯一一张打分卡**。
2. 读你要改的文件全文 + 同目录兄弟文件 + 该页面入口。**复用组件时先查 `references/component.md` 的组件清单判断（命中即用），不必每次全库 grep**；清单未覆盖或要确认 props/签名时再打开对应文件核实。hook/API/capability 仍先 grep 既有实现——**模仿既有 pattern，不要发明新的**。
3. 用下面分诊表选中场景，读对应 `references/` 文件并执行。命中多个就在同一轮并行读取。

## 场景分诊（命中哪个读哪个）

| 你的改动 | 读这个文件 |
|---|---|
| 渲染 UI 元素 / 新增组件 | `references/component.md` |
| 新增页面 / 调整页面级结构 | `references/page.md` |
| 读写数据 / 管理状态（XState vs constate） | `references/state.md` |
| 调后端接口 | `references/api.md` |
| 写 TS 类型 | `references/types.md` |
| 读写 localStorage / 应用级常量 | `references/constants.md` |
| 调整视觉（颜色/间距/圆角/阴影/字号）或写样式 | `references/styling.md` |
| 交互（表单/弹窗/抽屉/空态/加载/图标/文案/截断/时间） | `references/interaction.md` |
| 加 / 改路由 | `references/routing.md` |
| 图标 / 图片 / 插画 / 字体资源 | `references/assets.md` |
| 工具函数（格式化、纯逻辑、剪贴板） | `references/utils.md` |
| 定义或复用 hook | `references/hooks.md` |
| AI 语义标注 / capability / executor | `references/ai-semantics.md` |

没命中任何一行的纯逻辑小改，跳过 references，直接看下面的通用约束 + 收尾。**命中多个场景时在同一轮并行读取这些 reference，不要串行往返。**

## 通用约束（每次改动都适用，无需额外读文件）

### 收尾校验（必做）

克制"编译过=完成"的习惯——**类型过不代表 UI 对**。按改动类型跑校验并**在回复里报告结果**：

- 接口/类型/渲染改动 → `yarn lint-type`
- 代码质量 → `yarn lint`；格式 → `yarn format:check`（格式化由 **dprint** 独占，别在 ESLint 里加格式规则）
- 路由/构建配置/依赖/样式系统改动 → 再跑 `yarn build`
- 改动的模块已有测试 → 跑 `yarn test` 对应用例
- 命令跑不了就明说：具体命令、为什么没跑、你改为验证了什么。**视觉改动必须确认暗色模式**（token 自带 dark 覆盖，但仍要肉眼确认）——用 `yarn start` 本地跑起来看两侧效果。

### 收尾归档（AGE 要求）

改完更新当天 `docs/logs/{年}/{月}-{日}.md`（简短、追加）；影响应用层行为或技术结构时更新 `docs/design/` 或 `docs/architecture/` owner doc。失败的命令不得作为"通过基线"记录。

### 高频雷区（含新手/非前端贡献者）

1. **造轮子**：写组件前先查 `references/component.md` 的组件清单判断能否复用（`@/design` 增强+透传、`@/components` 业务组件），命中即用；清单没有对得上的再 grep 兜底、仍无则新建。
2. **直连 antd**：业务代码禁止 `import ... from 'antd'`，一律走 `@/design`（`.eslintrc.cjs` 的 `no-restricted-imports` 会拦）。
3. **硬编码样式**：禁止 hex 字面量与魔法数值，走 `@/constants/colors|radius|spacing|shadow|typography` 的 token；品牌绿只在 Switch/Radio/Checkbox/Slider/Progress/Sider 一级选中，输入/导航类走黑灰。
4. **自造状态**：外部可观测/持久状态走 XState actor，视图内共享走 constate——别乱堆 `useState`、别引 Redux/Zustand。
5. **手搓请求**：走 `@/api` 的 `createInterface`，别裸用 axios/fetch；剪贴板走 `@/utils/clipboard` 的 `copyText`（返回 `Promise<boolean>`，要 `await`）。
6. **过度防御 / scope 蔓延**：别给"不可能发生"的分支加兜底；只改被要求的，别顺手重构相邻代码或加注释。
7. **大文件 / 滥用 eslint-disable**：文件按约定 ~150 行就该拆；别用 `/* eslint-disable */` 头消 lint。

### 格式约定（dprint 会检查）

行宽 120；4 空格缩进；TS 单引号、JSX 双引号；始终分号；多行才留尾逗号。别手动纠格式，交给 `yarn format`。

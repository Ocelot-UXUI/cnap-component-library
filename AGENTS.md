# AGENTS.md

## Project Intent

CNAP 前端使用轻量级 Attractor-Guided Engineering (AGE) 工作流进行 AI 辅助应用开发。

这是一个应用层项目（前端控制台），不是框架核心项目。

仓库是唯一真源 (source of truth)。聊天只是临时工作区。

在编写非平凡代码之前，AI agent 必须先理解:

- `docs/context/project-context.md`
- `docs/context/ai-autonomy-policy.md`
- `docs/context/codebase-map.md`
- project context 中列出的 active requirement
- project context 中列出的 active owner doc
- 当 requirement 含义依赖源材料时，阅读 `docs/input/` 下相关原始输入

当信息冲突或不确定哪个文件拥有正确答案时，阅读 `docs/context/source-of-truth-and-precedence.md`。
当任务涉及工作流、计划、审查或关闭判断时，阅读 `docs/process/application-development-workflow.md`。

## Task Routing

编写代码前，AI agent 必须先分类任务:

1. 确定任务类型: requirement clarification / app-layer design change / architecture change / implementation-only change / bug investigation / verification or audit work
2. 使用 `docs/index.md` 查找该任务类型对应的 owner docs
3. 检查 `docs/skills/README.md` 是否有可复用的技能
4. 对于非平凡工作，在 plan 中记录所选路由和技能使用
5. 不要在 active requirement 和 owner docs 尚不支持的情况下，从 feature request 直接跳到代码

## Operating Rules

1. 偏好 file-in, file-out 协作模式。
2. 不要将聊天摘要当作持久化项目记忆。
3. 范围不清时，不要直接从需求跳到代码。
4. 如果输入有歧义，先在 `docs/discussions/` 或 `docs/requirements/` 中创建/更新文件。
5. 当满足 planning triggers 时，先创建计划再实现。
6. 创建、修改、执行或审计 `docs/plans/` 下的文件时，必须先阅读并遵循 `docs/plans/00-plan-authoring-and-execution-guide.md`。
7. 已创建的 plan 在实现前需要 draft review，在关闭前需要 independent closure audit。
8. `docs/design/` 和 `docs/architecture/` 应反映当前支持的基线，而非迁移历史。
9. 日志保持简短、带日期、追加模式。完成任何重要代码变更后，必须更新 `docs/logs/{year}/{month}-{day}.md`。
10. 在 `docs/bugs/` 中记录非显而易见的回归。
11. 如果原型和实现存在实质差异，在 `docs/retrospectives/` 中记录原因。
12. 当同类失败模式反复出现时，优先沉淀为 `docs/skills/` 或 `docs/audits/` 中的可复用审查方法。
13. 保持代码注释最少。偏好自解释的代码。
14. 当引用的文件找不到时，先检查 `docs/archive/`。
15. 将可复用技能视为方法选择器，而非需求、设计或架构文档的替代品。

## Read This First

- `docs/context/project-context.md`
- `docs/context/ai-autonomy-policy.md`
- `docs/context/codebase-map.md`
- `docs/context/conventions.md` — **machine 错误与异常数据必须可观测**
- `docs/design/design-tokens.md` — **UI 代码强制规范**，写任何前端样式前必读
- project context 中列出的 active requirement
- project context 中列出的 active owner doc

按需追加阅读:

- `docs/context/source-of-truth-and-precedence.md` - 真源归属或冲突判断
- `docs/context/conventions.md` - 项目级约定
- `docs/process/application-development-workflow.md` - 工作流、计划或关闭问题
- `docs/index.md` - 超出 active files 的路由问题

## Documentation Ownership

- `docs/context/` - 强制性的 AI 上下文、真源优先级、项目约定
- `docs/backlog/` - 优先排序的候选工作和 AI-ready 下一步行动
- `docs/input/` - 原始外部输入（PM 笔记、原型、卡片文档等）
- `docs/discussions/` - 需求澄清对话和未解决问题记录
- `docs/requirements/` - 实现级需求合成
- `docs/design/` - 稳定的应用层业务和功能设计
- `docs/architecture/` - 跨模块技术基线和模块边界
- `docs/lessons/` - 从 bug、审计和回顾中提取的持久经验
- `docs/plans/` - 非平凡工作的执行计划和关闭条件
- `docs/audits/` - 审计工作流记录和审计方法
- `docs/skills/` - 可复用提示词、审查 playbook 和审计 prompt 模板
- `docs/logs/` - 带日期的实现记忆
- `docs/testing/` - 手动和探索性测试记录
- `docs/bugs/` - 非显而易见的 bug 历史和回归笔记
- `docs/analysis/` - 调研、权衡分析和被拒绝方向
- `docs/retrospectives/` - 实现后差距分析和流程改进

## Default Workflow

1. 在 `docs/input/` 中收集原始材料。
2. 如有需要，在 `docs/discussions/` 中澄清歧义。
3. 在 `docs/requirements/` 中合成实现级需求。
4. 将设计输出拆分为 `docs/design/`（应用层）和 `docs/architecture/`（技术层）。
5. 路由任务并选择候选可复用技能。
6. 当满足 planning triggers 时编写或更新 plan，并在相关阶段/条目中记录技能使用。
7. 实现前审计 plan。
8. 实现最小的完整切片。
9. 运行验证。
10. 为已创建的 plan 运行关闭审计。
11. 记录日志和必要的 bug 笔记。

## Optional Workflow Layers

按任务复杂度启用以下层。已创建的 plan 必须进行 draft review 和 closure audit。

- `docs/audits/` - 文档审计和非平凡审计记录
- `docs/testing/` - 手动或探索性证明
- `docs/retrospectives/` - 需求/原型差距回顾
- `docs/skills/` - 重复失败后的可复用 prompt
- `docs/lessons/` - 重要恢复或重复失败后的持久经验

## Planning Rule

创建 plan 的条件:

- 修改 API、数据库/模型、auth、集成、部署或公共契约行为
- 跨多个用户可见功能面改变行为
- 跨多个模块并改变共享行为
- 预计需要超过一次 AI 会话
- 修改超过 5 个文件或可能超过约 200 行改动
- 需要分阶段执行或显式关闭门控
- 有未解决的产品或技术风险

仅对文案、小型样式修复、仅测试清理、有明确现有测试的单文件行为修复跳过正式 plan。

所有创建的 plan 在实现和关闭前必须遵循 `docs/plans/00-plan-authoring-and-execution-guide.md`。保护区域、未解决产品风险、真源冲突需要人工或独立审查，否则保持打开状态。

## Skill Usage Rule

使用可复用技能前，确认:

- 任务类型和路由已由 requirement 与 owner docs 明确
- 技能匹配的是工作方法，而不仅是相似业务标签
- `docs/skills/README.md` 中列出的必需输入可用
- 预期输出明确且能存入正确 docs 位置

非平凡 plan 中，每个依赖可复用技能的阶段或条目应记录 `Skill: <name>` 或 `Skill: none`。

## Prompting Guidance For Agents

- 不要从单一 feature list 生成完整产品。
- 不要为了 demo 完整性优化。
- 偏好小而完整的切片，而不是大量占位覆盖。
- 偏好现有项目模式，而不是发明抽象。
- 实现 UI 时必须将业务组件与布局组件分离：业务组件不包含布局信息，应放置在布局组件中，并自适应布局组件提供的宽高。
- 组件私有样式可以放在同目录 `ComponentA.style.ts` 中，但组件必须位于以组件名命名的目录下；调用方只能 import 组件公共入口，不得 import 组件内部 style 文件。
- 实现 Layout 组件时优先使用 `@emotion/styled` 定义布局容器（仅当承载真实业务样式时）；纯 flex 对齐 / 排列直接用 `@/design` 的 `Flex`，不要仅为布局新建 styled 组件（详见 `docs/context/conventions.md`）；仅在第三方 className 接入、状态 class 组合、已有 API 约束或很小的局部样式场景使用 `css`。
- 信息缺失时，将假设写入 requirement、discussion 或 plan，而不是静默发明。
- 不要把代码级实现细节写进 plan，除非该细节影响范围或关闭判断。
- 强制性规则不要藏在 `docs/references/`；默认必须应用的规则放在 `docs/context/` 或 `AGENTS.md`。

## Design Tokens (强制)

编写任何 UI 代码前，必须遵循 `docs/design/design-tokens.md`。核心红线：

- 颜色只能引用 `@/constants/colors` 导出的 `semantic.*` / `sidebar.*` / `palette.*`，**禁止 hex 字面量**。
- 圆角 / 间距 / 阴影 / 字体分别引用 `@/constants/radius` / `spacing` / `shadow` / `typography`。
- antd 组件通过 `<ConfigProvider>` 自动应用 `themePresets.cnap2`（默认主题），**不要在组件内二次覆盖 antd 主题 token**。
- 品牌绿 (`#41D08D`) 只允许出现在 Switch / Radio / Checkbox / Slider / Progress / Sider 一级选中；Input / Select / Menu / Tabs / Pagination 一律走黑或灰。
- 新增 antd 组件覆盖时，先看 `src/constants/themes/presets.ts` 中的 `cnap2` preset，参照现有污染防护模式扩展，不要单独引入新的 primary 派生绿色。

## Base Components (强制)

基础组件引用统一收敛到设计系统，详见 `docs/context/conventions.md → Base Component Imports`。核心红线：

- 禁止在 `src/design/` 以外的代码直接 `import ... from 'antd'`（含 `antd/*` 子路径与类型）；一律走 `@/design`。
- `src/design/` 只承载 antd 组件及其增强（透传组件放同名目录，仅 `export {X} from 'antd'`；增强组件以 antd 组件为基座，如 Drawer/Select）；带业务含义的基础组件放 `src/components/<Name>/`，经 `@/components/<Name>` 引用。
- 需要新 antd 组件时，先在 `src/design/<Name>/` 建目录并补 `src/design/index.ts` 出口，再在业务侧引用。
- 豁免：`src/design/**`、`src/constants/**`、应用根 `ConfigProvider`/主题装配（`src/index.tsx`、`src/routers/AppLayout/index.tsx`、`src/contexts/ThemeContext.tsx`）。
- 由 `.eslintrc.cjs` 的 `no-restricted-imports` 强制，`yarn lint` 拦截违规。

## Docs Maintenance

完成任何重要代码变更后:

1. 更新 `docs/logs/{year}/{month}-{day}.md`
2. 如果变更影响应用层行为或技术结构，更新 `docs/design/` 或 `docs/architecture/` 中的 owner docs

完整验证通过时，在日志中记录验证状态；失败命令不得作为通过基线记录。

## Verification Baseline

使用 `docs/context/project-context.md` 中列出的真实验证命令。

- `yarn lint-type` - TypeScript 类型检查
- `yarn test` - 单元测试
- `yarn lint` - 代码风格检查
- `yarn start` - 本地运行
- `yarn build` - 生产构建

如果验证命令为空或仍为占位符，先补齐命令，再报告验证成功。

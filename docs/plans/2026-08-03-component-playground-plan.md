# 2026-08-03-component-playground 组件视觉规范 Playground

> Plan Status: in progress
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
> Draft Review: 2026-08-03 独立审查（General subagent）— ACCEPT，13 条 Minimum Rules 全 PASS；Current Baseline / 集成点 / 退出标准均准确；已采纳两条非阻塞建议（软化 `*.style.ts` 措辞、注明 `Navigate` 已导入）。收敛为 `planned`，进入实现。
> Implementation: 2026-08-03 Phase 1-3 已落地，验证通过（lint-type 通过；lint 新增文件无告警，4 errors/4 warnings 均为基线预存；build 通过）。待 independent closure audit 后置 completed。
> Source: docs/requirements/cnap2-component-playground.md

## Current Baseline

- `src/routers/index.tsx` 使用 `createBrowserRouter`，所有路由为 `<AppLayout/>` 的 children；dev-only demo 路由（`example`、`border-glow-demo`）仅注册于 router，不进 `src/navigation/registry.ts`。
- 路由页面的懒加载模式：`const XPage = lazy(() => import('@/pages/X'))` + `withSuspense(XPage)` 包装。
- 页面约定：`src/pages/<PageName>/index.tsx` 默认导出；私有样式同目录 `*.style.ts` 为现有约定（`src/pages/Workloads/` 等模块页广泛使用，非每页必备）；使用 `PageLayoutHeader` from `@/design/Layouts/PageLayout`。
- antd 组件改造（`src/constants/themes/presets.ts` 的 `cnap2` preset + `src/styles/reset.css` + `src/styles/global-table.ts`）已在线上生效，本需求不改动这些文件。
- 设计 token 真源：`docs/design/design-tokens.md`；引用路径 `@/constants/colors`、`@/constants/spacing`、`@/constants/radius`、`@/constants/typography`、`@/constants/shadow`。
- Vite 提供 `import.meta.env.PROD` 判断生产环境。

## Goals

- 新增独立 `playground` 路由页面，左右布局：左侧 18 项组件名称列表，右侧渲染当前选中组件的状态矩阵；同一时刻仅渲染选中组件。
- 生产环境剔除：`/playground` 在 `import.meta.env.PROD` 为真时重定向至 `/home`，生产用户不可达。
- 不修改任何 antd 组件改造代码（presets.ts / reset.css / global-table.ts 等），仅新增路由 + 页面文件。

## Non-Goals

- 不改动 antd 组件改造代码（token / 全局样式覆盖）。
- 不实现 SearchBox、Collapse Header 具体组件（占位）。
- 不进侧边栏导航 `src/navigation/registry.ts`。
- 不写单元测试（视觉核验页面，无业务逻辑）。
- 不做主题切换联动 / 截图回归自动化。

## Task Route

- Type: implementation-only change（需求文档 `cnap2-component-playground.md` 已实现就绪；无 API/auth/契约变更；仅新增前端路由 + 页面）
- Owner Docs: `docs/requirements/cnap2-component-playground.md`、`docs/design/design-tokens.md`
- Skill: none

## Design Notes（影响范围的关键决策）

- **生产剔除方式**：在 router 层用 `import.meta.env.PROD` 判断，生产环境将 `playground` 路由 element 替换为 `<Navigate to="/home" replace />`，使该路由在 prod 构建中不可达（不引入额外构建配置）。备选：构建时 tree-shake 剔除页面模块（拒绝——Vite 已能 tree-shake 未引用 lazy 模块，但路由 element 仍需守卫，router 层守卫更直接）。剩余风险（低）：生产 bundle 仍含页面源码（未执行），但不影响用户可达性。
- **左右布局实现**：使用 `@emotion/styled` 定义布局容器（左列表固定宽 + 右内容区 flex），遵循 AGENTS.md "Layout 组件优先用 styled" 约定。
- **仅渲染选中组件**：用 `useState` 维护当前选中 key，右侧按 key 条件渲染对应 section 组件；未选中组件不挂载，满足需求"同一时刻仅渲染选中"。
- **文件结构**（每文件 ≤150 行，业务与布局分离）：`src/pages/ComponentPlayground/`（`index.tsx` 页面外壳 + `ComponentPlayground.style.ts` 布局样式 + `sections/` 分组组件 + `sections/index.tsx` 注册表）。

## Execution Plan

### Phase 1 - 页面外壳 + 布局样式 + 路由注册 + 生产剔除（Add）

Status: done

- Add：`src/pages/ComponentPlayground/ComponentPlayground.style.ts`——使用 `@emotion/styled` 定义左右布局容器（左列固定宽 + 选中项高亮 + 右列 flex），样式引用 `semantic` / `spacing` / `radius` / `typography`，无 hex。Skill: none
- Add：`src/pages/ComponentPlayground/index.tsx`——页面外壳：`PageLayoutHeader` 标题"组件视觉规范 Playground" + 说明；`useState` 维护选中 key（默认首项 `'button'`）；左侧渲染列表项（18 项，占位项标注 `*`），右侧按选中 key 渲染对应 section；同一时刻仅渲染选中 section。Skill: none
- Add：`src/pages/ComponentPlayground/sections/index.tsx`——section 注册表：导出 `{ key, label, placeholder?, Component }` 数组（18 项），占位项（`searchbox`、`collapse-header`）的 Component 渲染"待实现"标注。Skill: none
- Add：`src/routers/index.tsx`——新增 `ComponentPlaygroundPage` lazy import + `playground` 路由；生产守卫：`element: import.meta.env.PROD ? <Navigate to="/home" replace /> : withSuspense(ComponentPlaygroundPage)`（`Navigate` 已在 router 顶部导入，无需新增 import）。Skill: none
- Proof：`yarn lint-type` 通过；`yarn start` 访问 `/playground` 见左右布局壳子，左侧 18 项列表，右侧默认 Button 占位（sections 未落地前右侧可暂显空）。Skill: none

[ ] Exit Criteria:

- [ ] 页面外壳 + 布局样式落地，左右布局可见，样式走 design tokens 无 hex
- [ ] 路由注册，`/playground` 本地可达
- [ ] 生产守卫：`import.meta.env.PROD` 为真时重定向至 `/home`
- [ ] `yarn lint-type` 通过
- [ ] `docs/logs/` updated

### Phase 2 - 组件 Section 实现（Add）

Status: done

- Add：`src/pages/ComponentPlayground/sections/Buttons.tsx`——Button / Checkbox / Switch / Radio 四个 section，每 section 渲染该组件关键交互状态（default / hover / focus / disabled / selected 等），直接从 `antd` 导入，不二次覆盖 token。Skill: none
- Add：`src/pages/ComponentPlayground/sections/Inputs.tsx`——Text Input / Number Input / Select 三个 section，覆盖 focus / disabled / prefix-suffix / error 等状态。Skill: none
- Add：`src/pages/ComponentPlayground/sections/Overlays.tsx`——Drawer / Modal / Message / Table 四个 section：触发按钮打开 Drawer/Modal，按钮触发 message.success/error/warning/info，Table 含表头+多行数据+多选列+分页。Skill: none
- Add：`src/pages/ComponentPlayground/sections/Display.tsx`——Tag / Pagination / Empty / Tooltip / Breadcrumb 五个 section，覆盖状态色/当前页高亮/空状态/hover 深色 tooltip/多级面包屑。Skill: none
- Add：`src/pages/ComponentPlayground/sections/index.tsx`——注册表接入上述 section 组件（占位项保持"待实现"）。Skill: none
- Proof：`yarn lint-type` / `yarn lint` 通过；`yarn start` 访问 `/playground`，逐项点击左侧列表，右侧切换渲染对应组件状态矩阵，同一时刻仅渲染选中项。Skill: none

[ ] Exit Criteria:

- [ ] 16 个实际组件 section + 2 个占位项全部落地，左侧列表 18 项均可切换
- [ ] 每个 section 覆盖该组件关键交互状态（default / hover / focus / disabled / selected 等）
- [ ] 同一时刻右侧仅渲染当前选中 section，未选中组件不挂载
- [ ] Table section 含多选列；Message section 触发右上角提示；Modal/Drawer 可打开
- [ ] SearchBox 与 Collapse Header 占位项显示"待实现"
- [ ] `yarn lint-type` / `yarn lint` 通过
- [ ] `docs/logs/` updated

### Phase 3 - 验证与收口（Proof / Fix）

Status: done

- Proof：`yarn lint-type` / `yarn lint` / `yarn build`。Skill: none
- Fix：`docs/requirements/cnap2-component-playground.md` 状态 → 已实现；`docs/logs/2026/08-03.md` 追加实现记录。Skill: none

[ ] Exit Criteria:

- [ ] 三项验证通过：lint-type / lint / build
- [ ] 需求状态与日志一致
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] in-scope behavior is complete（左右布局 playground + 18 项 + 生产剔除按需求验收标准落地）
- [ ] relevant docs are aligned（需求状态 → 已实现，plan/log 一致）
- [ ] verification has run（lint-type / lint / build 通过）
- [ ] closure audit was independent

## Risks & Open Questions

- **单文件行数**：16 个 section 若集中单文件易超 150 行，故按 Buttons/Inputs/Overlays/Display 四文件分组，每组 ≤150 行。剩余风险（低）：若某 section 状态过多超长，再拆分。
- **生产剔除完整性**：router 层 `import.meta.env.PROD` 守卫使路由不可达，但页面源码仍可能在 prod bundle（未被引用的 lazy chunk）。剩余风险（低）：不影响用户可达性，符合需求"生产用户无法访问"。
- 本 plan 需在实现前经独立 draft review，关闭前需 independent closure audit。

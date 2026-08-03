# Feature: CNAP 2.0 组件视觉规范 Playground

> 状态：已实现（2026-08-03，plan `docs/plans/2026-08-03-component-playground-plan.md`；lint-type / lint / build 通过；待 independent closure audit）
> 来源：用户叙述（构建独立 playground 路由，批量查看被改造 token / 全局样式的 antd 组件是否符合视觉规范）
> 关联真源：
> - `docs/design/design-tokens.md` — UI 代码强制规范
> - `src/constants/themes/presets.ts` — `cnap2` 主题 preset（token 层改造）
> - `src/styles/reset.css` — 全局 CSS 覆盖（Message / Tabs / Modal / Drawer 动画与定位）
> - `src/styles/global-table.ts` — 全局 Table 样式（原 BaseTable 提升）

## Goal

构建一个独立的 playground 路由页面，集中展示本项目对 antd 基础组件所做的两层改造（ConfigProvider token 改造 + 全局样式覆盖）的真实渲染效果。该页面用于在测试环境或本地批量核验这些被改造的组件是否符合 CNAP 2.0 视觉规范，避免逐页面人工翻查。

## Background

本项目已通过两层手段对 antd 基础组件做了改造：Token 层（`src/constants/themes/presets.ts` 的 `cnap2` preset）与全局样式覆盖层（`src/styles/reset.css` + `src/styles/global-table.ts`）。这些改造已在线上生效。

**本需求不涉及对上述改造代码的任何改动**，也无需关心两层改造的细节与多层整合。本需求的目标只有一个：在一个新的 playground 路由页面中，将所述 antd 组件全部渲染一遍，使开发者/设计者可以在一个页面快速、全面地浏览这些组件的最终视觉效果并发现问题。

## In Scope

### 1. 独立 Playground 路由

- 新增一个独立路由 `playground`，挂载在 `src/routers/index.tsx` 顶层 `<AppLayout/>` children 下。
- 路由仅注册于 router，不注册于 `src/navigation/registry.ts`（不进入侧边栏），与现有 `border-glow-demo` / `example` 路由保持一致。
- 页面入口位于 `src/pages/ComponentPlayground/index.tsx`，默认导出，使用 `lazy(() => import(...))` 懒加载。

### 2. 页面布局（左右 Master-Detail）

页面采用左右布局，**不要**将所有组件在一个页面中全部渲染：

```
┌─ PageLayoutHeader：标题"组件视觉规范 Playground" + 说明 ──────────────────────┐
├──────────────────────┬──────────────────────────────────────────────────────┤
│  左侧：组件名称列表   │  右侧：选中组件的内容区域                              │
│  ┌────────────────┐ │  ┌──────────────────────────────────────────────────┐  │
│  │ Button      ●  │ │  │  区块标题：Button（中文 + 英文）                    │  │
│  │ Checkbox       │ │  │  状态矩阵：primary / default / dashed / text       │  │
│  │ Text Input     │ │  │            + disabled + loading + 图标            │  │
│  │ Switch         │ │  │                                                    │  │
│  │ Radio          │ │  │  （仅当前选中组件渲染于此，其余组件不渲染）          │  │
│  │ Select         │ │  │                                                    │  │
│  │ Number Input   │ │  │                                                    │  │
│  │ Tag            │ │  │                                                    │  │
│  │ Pagination     │ │  │                                                    │  │
│  │ Drawer         │ │  │                                                    │  │
│  │ Modal          │ │  │                                                    │  │
│  │ Message        │ │  │                                                    │  │
│  │ Table          │ │  │                                                    │  │
│  │ Empty          │ │  │                                                    │  │
│  │ Tooltip        │ │  │                                                    │  │
│  │ SearchBox *    │ │  │                                                    │  │
│  │ Breadcrumb     │ │  │                                                    │  │
│  │ Collapse Hdr * │ │  │                                                    │  │
│  └────────────────┘ │  └──────────────────────────────────────────────────┘  │
└──────────────────────┴──────────────────────────────────────────────────────┘
  * = 占位项
```

- 左侧列表固定展示全部 18 个组件名称，带选中态高亮。
- 默认选中第一项（Button），右侧渲染其内容。
- 点击列表项切换右侧内容，**同一时刻仅渲染当前选中组件**，未选中组件不挂载。
- 占位项（SearchBox、Collapse Header）在列表中可见，选中后右侧仅显示"待实现"标注。

### 3. 组件列表项顺序（与组件清单一致）

1. Button
2. Checkbox
3. Text Input
4. Switch
5. Radio
6. Select
7. Number Input
8. Tag
9. Pagination
10. Drawer
11. Modal
12. Message
13. Table
14. Empty
15. Tooltip
16. SearchBox（占位）
17. Breadcrumb
18. Collapse Header（占位）

### 4. 右侧内容区展示规范

每个组件的内容区遵循统一结构：

- 区块标题：组件名称（中文 + 英文）。
- 状态矩阵：将该组件的所有关键交互状态（default / hover / focus / active / disabled / selected / error）以静态或可触发的形式并排展示，便于一次性比对。
- 组件直接使用 antd 原生组件（从 `antd` 导入），不包裹本项目业务组件，展示改造后的纯效果。
- 需要交互才能呈现的状态（hover / focus / open），保持组件可交互，由查看者自行触发。
- 静态展示的状态（disabled / selected / error），通过 props 直接钉死。
- Message / Modal / Drawer / Tooltip 等需触发的组件，在内容区提供触发按钮。

### 5. 样式约束

- playground 页面自身布局样式必须使用 design tokens（`semantic` / `spacing` / `radius` / `typography` / `shadow`），禁止 hex 字面量。
- 页面内的 antd 组件不得在 playground 内二次覆盖 antd 主题 token（通过 `<ConfigProvider>` 自动应用 `themePresets.cnap2`）。
- 左侧列表与右侧内容区之间需有清晰分隔，区块间距使用 `spacing` 尺度保证视觉呼吸感。
- 左侧列表项选中态高亮使用 design tokens（如 `semantic.state.component.selectHover` / `selectActive`）。

## Out Of Scope

- **不改动任何 antd 组件相关代码**：不修改 `src/constants/themes/presets.ts`、`src/styles/reset.css`、`src/styles/global-table.ts` 或任何 antd 组件的 token / 全局样式覆盖。本需求仅新增路由 + 页面。
- SearchBox 和 Collapse Header 的具体组件实现（本期仅占位）。
- playground 页面不进入侧边栏导航，不做权限路由保护。
- 不为 playground 编写单元测试（视觉核验页面，无业务逻辑）。
- 不实现主题切换联动（即不在此页面做 dark mode 或其他 themeKey 的切换演示）。
- 不对组件做截图回归自动化（本期为人工目视核验）。

## Main User Flows

```
开发者/设计者在测试环境或本地访问 /playground 路由
  → 页面加载，左右布局：左侧组件名称列表，右侧默认渲染第一项（Button）
  → 在左侧列表点击组件名称
  → 右侧切换渲染该组件的状态矩阵，同一时刻仅渲染当前选中组件
  → 目视核验该组件各状态是否符合 CNAP 2.0 视觉规范
  → 对需要交互的状态（hover/focus/open）手动触发观察
  → 发现偏差时记录并回到 presets.ts 或全局样式文件修正
```

## Business Rules

1. playground 路由为开发/测试专用，不进入正式导航侧边栏，不影响生产用户。
2. **生产环境剔除**：该路由在生产构建中不可达，需通过环境判断（如 `import.meta.env.PROD`）或构建时剔除，确保生产用户无法访问 `/playground`。
3. **不改动 antd 组件改造代码**：本需求不修改 `presets.ts` / `reset.css` / `global-table.ts` 或任何 antd token / 全局样式覆盖，仅新增路由 + 页面文件。
4. 页面内所有 antd 组件直接从 `antd` 导入，不经过本项目业务组件封装，展示的是改造后的纯效果。
5. 每个组件区块覆盖该组件的关键交互状态（default / hover / focus / disabled / selected 等），便于一次性目视核验。
6. SearchBox 与 Collapse Header 为占位区块，仅渲染标题与"待实现"标注，不渲染具体 antd 组件。
7. Message 区块通过按钮触发 `message.success/error/warning/info`，核验右上角定位 + 右滑动画。
8. Modal 与 Drawer 区块通过按钮触发打开，核验动画与阴影。
9. 所有页面布局样式引用 design tokens，不得使用 hex 字面量。

## Roles / Permissions

- 不涉及业务权限角色。playground 路由对所有能访问测试环境/本地的开发者开放，不做权限门控。

## Edge Cases

- 组件在不同屏幕宽度下的折行行为：playground 采用响应式网格，区块在窄屏下自动单列。
- Message / Modal / Drawer / Tooltip 等需挂载到 body 的组件，依赖 antd 默认 `getContainer`，确保全局 `ConfigProvider` 生效。
- Empty 组件无组件级 token 覆盖，仅受 seed/alias token 影响，展示时需说明其反映的是全局基线色。

## Open Questions

1. SearchBox 是否指 antd 的 `Input.Search`，还是本项目未来自研的搜索组件？本期按占位处理，待明确后补实现。
2. Collapse Header 是否指 antd `Collapse` 的自定义 header？本期按占位处理，待明确后补实现。

## Acceptance Criteria

- [ ] 新增 `src/pages/ComponentPlayground/index.tsx` 页面，默认导出
- [ ] `src/routers/index.tsx` 注册 `playground` 路由，lazy 加载，挂于 `<AppLayout/>` children 下
- [ ] 生产环境剔除：生产构建中 `/playground` 不可达（通过 `import.meta.env.PROD` 判断或构建时剔除）
- [ ] 路由不进入 `src/navigation/registry.ts` 侧边栏
- [ ] 页面采用左右布局：左侧组件名称列表，右侧当前选中组件的内容区
- [ ] 左侧列表包含全部 18 个组件名称，顺序与组件清单一致
- [ ] 同一时刻右侧仅渲染当前选中组件，未选中组件不挂载
- [ ] 默认选中第一项（Button），右侧渲染其内容
- [ ] 选中列表项高亮，使用 design tokens
- [ ] 右侧内容区覆盖该组件的关键交互状态（default / hover / focus / disabled / selected 等）
- [ ] SearchBox 与 Collapse Header 选中后右侧显示"待实现"标注
- [ ] 页面布局样式使用 design tokens，无 hex 字面量
- [ ] 不修改 antd 组件改造相关代码（presets.ts / reset.css / global-table.ts 等保持不变）
- [ ] 通过 `yarn lint-type` 和 `yarn lint` 检查

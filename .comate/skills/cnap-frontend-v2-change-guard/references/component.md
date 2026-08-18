# 组件 / UI 元素

**真源**：`docs/context/conventions.md`（Base Component Imports / 增强组件契约 / Component Boundaries）。

## 复用组件清单（先查这里判断复用，命中即用）

> 最后核对：2026-08-06。**优先照这份清单判断"有没有可复用的、选哪个"，命中就直接用，不必每次全库 grep。** 但清单会过时——**真正落用某组件前做一次轻量确认**（它在 `src/design/index.ts` 出口 / `src/components/<Name>/` 目录里、props 对不对）；清单未覆盖，或与代码不一致时，**以 `src/design/index.ts` 和 `src/components/` 实际为准，冲突信代码**。

**判断顺序**：`@/design` → `@/components` → 页面本地组件 → 新建（清单都没有再考虑新建）。

### `@/design`（基础组件，业务代码禁直连 antd）

- **增强组件**：`Drawer`（标题左/关闭右/`extra` 插槽，见下方契约）、`Select`（antd 的 drop-in，多选用 `mode="multiple"`/`tags`）。
- **透传 antd（42 个，直接从 `@/design` 引）**：Alert / Avatar / Badge / Breadcrumb / Button / Card / Checkbox / Col / Collapse / ConfigProvider / DatePicker / Descriptions / Divider / Dropdown / Empty / Flex / Form / Input / InputNumber / Layout / List / Menu / Modal / Pagination / Popover / Progress / Radio / Result / Row / Segmented / Slider / Space / Spin / Statistic / Switch / Table / Tabs / Tag / Timeline / Tooltip / Typography。
- **工具**（也从 `@/design` 出）：`message` / `notification` / `theme`；类型如 `SelectProps`/`TableProps` 等也从 `@/design` 引，不从 `antd`。

### `@/components`（业务复用组件，用途以实际为准）

- `Layouts` —— 页面布局壳：`PageLayout` / `PageLayoutHeader` / `PageLayoutActions`（标题、返回、额外操作区）。
- `LogSearchInput` —— 带匹配数 + 上/下条导航 + 可见切换的搜索输入。
- `Error` —— `ErrorBoundary` + `PageFallback` 错误兜底。
- `Motion` / `MotionEmpty` —— 动效包装 / 动画空态。
- `ai/Tabs`、`ai/Form` —— 带 `data-ai-*` 语义标注的 Tabs / Form（见 `ai-semantics.md`）。
- `NavigationContextSelectors` —— 导航上下文选择器。
- `SidebarMenu` —— 侧边导航菜单；`ThemeSwitcher` —— 主题切换；`UserAvatar` —— 用户头像。
- `ClusterNameLabel` —— 集群名标签；`AIDebugPanel` —— AI 调试面板。
- `BorderGlow` / `LightPillar` —— 视觉特效（边框辉光 / 光柱）。

清单里没有对得上的，再考虑页面本地组件或新建；新建前仍需确认确实无现成的。

## 硬约束

- **禁止业务代码 `import ... from 'antd'`（含 `antd/*` 与类型），一律走 `@/design`。** 由 `.eslintrc.cjs` 的 `no-restricted-imports` 强制，`yarn lint` 拦截。需要 antd 里还没收进 `@/design` 的组件时，先在 `src/design/<Name>/` 建透传目录并补 `src/design/index.ts` 出口，再引用。
- **增强组件契约**（详见 conventions.md「增强组件契约」）：
  - `Drawer`：标题左 / 关闭右 / `extra` 插槽；已 `Omit` 掉 `closable`+`closeIcon`，别自造关闭按钮；`showClose` 默认 true，关闭走 `onClose`。
  - `Select`：drop-in 替代，单选与 antd 一致；多选统一用 `mode="multiple"`/`tags`（自动前置 Checkbox），**不要再造 MultiSelect**。
- **组件边界**：承担定位/尺寸/排布的组件用 `Layout` 后缀（不要用 `Shell`）；业务状态/持久化/交互规则放容器/hook/纯函数，不放 Layout 组件。
- **私有样式**：组件私有样式放同目录 `<Name>.style.ts` / `.styles.ts`，**调用方只 import 组件公共入口，禁止 import 内部 style 文件**。
- Props 用显式 `interface`，不用 `any`。
- 样式细节见 `styling.md`；图标见 `assets.md`；交互（表单/弹窗/空态）见 `interaction.md`。

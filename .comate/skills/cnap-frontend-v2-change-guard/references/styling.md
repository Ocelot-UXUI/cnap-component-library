# 样式 / 视觉规格 / token

**真源（强制）**：`docs/design/design-tokens.md`。写任何样式前必读。**违反会被拒 CR。**

## 引用优先级

```
antd ConfigProvider theme  >  semantic.* / sidebar.*  >  palette.*  >  hex 字面量（禁止）
```

- **首选**：让 antd 组件通过根部 `ConfigProvider` 的 `themePresets.cnap2` 自动应用主题，**不要在组件内二次覆盖 antd 主题 token**。
- 颜色只引用 `@/constants/colors` 的 `semantic.*`（bg/border/text/icon/button/state）、`sidebar.*`；`palette.*` 仅在语义 token 覆盖不到时用，并在 PR 说明理由。
- 圆角/间距/阴影/字体：`@/constants/radius`、`spacing`、`shadow`、`typography`。
- **禁止 hex 字面量和魔法数值。**

## 防绿色污染（关键设计决策，别改）

品牌绿 `#41D08D` 只允许出现在 **Switch / Radio / Checkbox / Slider / Progress / Sider 一级选中**；**Input / Select / Menu / Tabs / Pagination 一律走黑或灰**。antd 的 `colorPrimary` 会级联派生，`themes/presets.ts` 的 `cnap2` preset 已在 alias 层钉死（`controlItemBgActive`/`controlItemBgHover`/`controlOutline`，及 `Input.activeBorderColor` / `Select.colorPrimary` / `Tabs.inkBarColor` / `Menu.itemSelectedBg` 等）。**新增 antd 组件覆盖时先看该组件从 `colorPrimary` 派生了什么，若视觉规范要中性色就在 `cnap2.components.<Name>` 显式覆盖，不要引入新的派生绿。**

## 写法

- Emotion `styled` / `css`；私有样式放 `<Name>.style.ts`（见 `component.md`）。
- **暗色模式是一等需求**：token 自带 dark 覆盖，改完仍要肉眼确认两侧。
- 收尾跑 `yarn format:check`（dprint）+ 必要时 `yarn build`。

## semantic token 速查 & 易错点（下笔前核对，别猜）

真源 `src/constants/colors/semantic.ts`（分组见 design-tokens.md §5）。常用分组：

- 文字 `semantic.text.{primary|secondary|tertiary|placeholder|disabled|inverse|link}`
- 背景 `semantic.bg.{page|default}` —— **只有这两个**，没有 `subtle`/`elevated`
- 边框 `semantic.border.{divider|card|cardHover}`
- 状态色 `semantic.state.{brand|info|success|warning|error}.{default|hover|active|disabled|focus|light}` —— **是 `state` 不是 `status`**；每组是 6 阶对象，**要带 `.default` 等档位**，不能只写 `state.error`
- 组件交互态 `semantic.state.component.{borderDefault|borderHover|borderFocus|borderError|selectBorder|selectHover|selectActive|disabledBg}`
- 图标 `semantic.icon.*`；按钮 `semantic.button.{primary|secondary}.{bg|bgHover|bgFocus|text|border}`
- **日志 / 终端类深色 UI**：用专用组 `semantic.logConsole.{bg|text|timestamp|marker|highlightBg|highlightText|level.{info|warn|error|debug}}`，别自己配深色色值

**易错（实测踩过）**：别写 `semantic.status?.error`（无 `status` 组）、`semantic.bg.subtle`（不存在），更不要 `?? '#xxxxxx'` 用 hex 兜底。**下笔前先打开 `semantic.ts` 或 design-tokens.md §5 核对键名**；没有对应语义就先在 `semantic.ts` 加，再引用。

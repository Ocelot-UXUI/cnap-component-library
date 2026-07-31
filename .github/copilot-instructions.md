# GitHub Copilot Instructions — CNAP Frontend

> 本文件是 GitHub Copilot 在此项目中的默认指令，Copilot Chat 会自动加载。

## 项目性质

CNAP 2.0 前端控制台，React 19 + Vite 6 + TypeScript + antd 6 + Emotion。采用 AGE（Attractor-Guided Engineering）工作流，仓库是唯一真源。

## 首要指令

编写代码前请先阅读以下文件：

1. `AGENTS.md` — 项目工作流与总规范
2. `docs/design/design-tokens.md` — **UI 代码强制规范**（写任何前端样式前必读）
3. `docs/context/codebase-map.md` — 代码组织约定
4. `.comate/rules/basic.mdr` / `typescript.mdr` / `components.mdr` — 编码细则

## Design Tokens 强制规则（红线）

- 颜色一律引用 `@/constants/colors` 导出的 `semantic.*` / `sidebar.*` / `palette.*`；**禁止 hex 字面量**。
- 圆角 / 间距 / 阴影 / 字体分别引用 `@/constants/radius` / `spacing` / `shadow` / `typography`。
- antd 组件通过 `<ConfigProvider theme={themePresets.cnap2}>` 应用主题，**不要在业务组件内覆盖 antd 主题 token**。
- 品牌绿 `#41D08D` 只允许出现在 Switch / Radio / Checkbox / Slider / Progress / Sider 一级选中；Input / Select / Menu / Tabs / Pagination 一律走黑或灰。
- 旧 `colors['gray-8']` 语法（`src/constants/colors/base.ts`）已 `@deprecated`，新代码禁止使用。

## 组件与布局约定

- 业务组件与布局组件分离：业务组件不含布局信息，通过外部布局组件提供宽高。
- 组件私有样式放在同目录 `ComponentA.style.ts`；调用方只 import 组件公共入口。
- Layout 组件优先 `@emotion/styled`；仅在第三方 className 接入、状态 class 组合等场景用 `@emotion/css`。
- 单文件行数不超过 140 行，超过应拆分。

## TypeScript 约定

- 对象形状用 `interface`，联合 / 工具类型用 `type`。
- 避免 `any`；不确定类型用 `unknown` + 类型守卫。
- API 定义放 `src/api/<module>/`，请求 / 响应类型必须显式声明。
- 组件文件 PascalCase，工具函数放 `src/utils/`，通过 `@/utils` 引用。

## 验证

任何代码变更后必须能通过：

```bash
yarn lint-type   # TypeScript 类型检查
yarn lint        # ESLint
yarn test        # 单元测试（若涉及）
```

## 变更记录

完成重要变更后，追加日志到 `docs/logs/{year}/{month}-{day}.md`（简短、带日期、追加模式）。

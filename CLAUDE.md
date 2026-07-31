# CLAUDE.md

Claude Code 在此项目工作时，请首先读取根目录 `AGENTS.md`，其为项目工作流与规范的总入口。

## 编写代码前必读

- `AGENTS.md` — AGE 工作流、任务路由、编码规范
- `docs/design/design-tokens.md` — **UI 代码强制规范**（写任何前端样式前必读）
- `docs/context/codebase-map.md` — 代码组织约定
- `.comate/rules/` — 项目细粒度规则（`basic.mdr` / `typescript.mdr` / `components.mdr` / `design-tokens.mdr`）

## Design Tokens 红线

- 颜色只能引用 `@/constants/colors` 导出的 `semantic.*` / `sidebar.*` / `palette.*`，禁止 hex 字面量。
- antd 组件通过 `themePresets.cnap2` 应用主题（已设为默认），不在业务组件内覆盖 antd token。
- 品牌绿 `#41D08D` 只允许出现在 Switch / Radio / Checkbox / Slider / Progress / Sider 一级选中；Input / Select / Menu / Tabs / Pagination 一律走黑或灰。
- 详情见 `docs/design/design-tokens.md`。

## 验证命令

`yarn lint-type` / `yarn lint` / `yarn test` / `yarn build`。失败命令不得作为通过基线记录。

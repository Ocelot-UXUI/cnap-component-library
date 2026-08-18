# 常量 / localStorage

**真源**：`src/constants/localStorage.ts`、`src/constants/themes/presets.ts`、`docs/context/conventions.md`。

- **localStorage key 统一定义在 `src/constants/localStorage.ts`**（仅存 key 常量，如 `SIDEBAR_COLLAPSED`、`THEME_KEY`），业务代码别裸写字符串 key。
- localStorage 只承载"键"；**有生命周期的状态（读取/写入/持久化）应由 XState 管理**（见 `state.md`），不要在组件里散着直接读写。
- 主题 / token 常量走 `src/constants/`（`colors`、`radius`、`spacing`、`shadow`、`typography`、`themes/presets.ts`）——见 `styling.md`。
- 新增应用级常量遵循"共享才提升到 `src/constants/`"的原则，不预先提升。

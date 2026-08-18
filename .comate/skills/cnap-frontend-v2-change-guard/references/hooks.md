# Hooks

**真源**：`docs/context/conventions.md`、既有 hook 代码。

- 先 `grep` 是否已有同类 hook，能复用就复用。
- 遵守 React Hooks 规则：顶层调用、不条件调用；`useEffect`/`useMemo`/`useCallback` **依赖数组必须完整**（ESLint `react-hooks` 强制，不要 silence）。
- 数据获取 + loading 的就地收敛：视图内共享用 constate hook；需要外部/AI 可观测则走 XState（见 `state.md`），不要在普通 hook 里堆本应进 machine 的持久状态。
- hook 只做逻辑，不承担布局（布局见 `component.md` 的 Layout 边界）。

# 路由

**真源**：`docs/context/codebase-map.md`、`src/routers/index.tsx`。

- 路由集中定义在 `src/routers/index.tsx`（懒加载）。应用壳与 workspace 导航在 `src/routers/AppLayout/`（`topNavigation/`、`workspace/navigation/`）。
- 加路由时：在 `src/routers/index.tsx` 加定义，并按需在 `AppLayout/workspace/navigation/` 补导航项。
- `src/routers/index.tsx` 是集中、易改错的脆弱文件——**新增优先，避免大规模重组**。
- 页面标识/参数若要供 AI 导航使用，注意与 `ai-context.json` 的一致（见 `ai-semantics.md`）。
- 收尾 `yarn lint-type`；改动大时 `yarn build`。

# 页面 / 页面级结构

**真源**：`docs/context/codebase-map.md`（Common Change Routes）。

## 起手式

- 以 `src/pages/` 下**现有同类页面为模板**，先读 2-3 个兄弟页面，模仿其结构与数据流，不要发明新 pattern。
- 路由集中在 `src/routers/index.tsx`（懒加载）；应用壳在 `src/routers/AppLayout/`（顶导航 + workspace 模块）。加路由见 `routing.md`。

## 结构约束

- **业务与布局分离**：布局用 `src/components/Layouts/`（`PageLayout` / `PageLayoutHeader` / `PageLayoutActions`），业务组件作为其 children 传入，自适应布局给的宽高；业务组件不写布局信息。
- 数据获取/状态：按 `state.md` 选 XState / constate；接口按 `api.md` 走 `createInterface`。
- 页面私有样式走 Emotion + 私有 `.style.ts`（见 `component.md` / `styling.md`）。

## 注意

- `src/routers/index.tsx` 是集中定义、易改错的脆弱文件——**新增路由优先，避免大规模重组**。

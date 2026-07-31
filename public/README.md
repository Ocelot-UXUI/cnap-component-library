# public 静态资源说明

本目录下的静态资源会被 Vite 原样拷贝到构建产物根目录，可通过 `/<文件名>` 直接访问。

## AI 集成描述文件（自动生成）

以下两个文件由 `scripts/generate-ai-context.ts` 扫描路由配置与页面文件后自动生成，**请勿手动编辑**。修改内容应改生成器或页面/路由源，再运行：

```bash
yarn gen:ai-context   # 单独生成
yarn build            # 构建前会自动先执行 gen:ai-context
```

### `ai-context.json` — 应用页面 / 路由地图

描述应用有哪些页面：`path`（路由）、`page`（页面组件名）、`title`（标题）、`params`（路由参数）。

运行时由 AI 执行器（`src/executor/AIExecutorProvider.tsx`）通过 `fetch('/ai-context.json')` 加载，用于让 AI 助手理解"有哪些页面、如何跳转"。

### `ai-capabilities.json` — AI 可调用能力清单

描述 AI 可执行的动作及其参数（如 `listApplications` / `deployApplication` / `addCluster` / `navigateTo` / `goBack` 等），相当于暴露给 AI 代理的一组"工具函数"。

## 设计说明：为何提交到仓库、且不含时间戳

- **保留在仓库（不 gitignore）**：`yarn start`（dev）不会运行 `gen:ai-context`，运行时又需 `fetch('/ai-context.json')`。若忽略并从仓库移除，新克隆在 dev 下会因文件缺失而 404、AI 执行器失效。因此选择随仓库提交，保证开箱即用。
- **产物稳定、不含 `generatedAt`**：生成器不再写入生成时间戳（方案 A）。此前每次 `yarn build` 仅时间戳变化就会让这两个文件出现 diff，污染 git；去掉后产物只在**路由/能力真正变化**时才变更，diff 变得有意义。

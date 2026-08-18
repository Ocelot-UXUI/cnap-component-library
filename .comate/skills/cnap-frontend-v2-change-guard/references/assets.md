# 资源：图标 / 图片 / 插画 / 字体

**真源**：`docs/architecture/svg-icon-system.md`、`vite.config.ts`（svgr 作用域）。

## 目录与机制

- `src/assets/icons/` — **单色 SVG，源色统一 `#545454`**（= `semantic.text.secondary`）。`vite-plugin-svgr` 作用域在导入期把 `#545454` 替换为 `currentColor`。
- `src/assets/illustrations/` — 多彩插画，**保留原色**，不受色 token 约束。
- `src/assets/images/` — 位图（历史）。

## 用法

- 组件式消费（`import {Search} from '@/assets/icons'`，走 `.svg?react`）：颜色随容器 `color` 变化，**改色请设容器 `color`**。
- URL 式消费（`import x from '@/assets/icons/x.svg'` → `<img src={x}>`）：固定 `#545454`。
- 新增单色图标：放 `src/assets/icons/`，源色用 `#545454`，在 `src/assets/icons/index.ts` barrel 按分组补导出。
- **禁止在 SVG 源里写死颜色或改成品牌绿**，也不要手动写 `currentColor`——注入只由 svgr 作用域负责。
- 改 svgr / 别名 / 打包配置属于构建改动，收尾要 `yarn build`。

# 图标资源目录（src/assets）

本目录集中管理项目图标与位图资源，避免重复下载。

## 目录结构

- `icons/` — **单色图标 SVG**。源文件统一以 `#545454` 着色；由 `vite-plugin-svgr` 作用域（见 `vite.config.ts`）在导入期把 `#545454` 注入为 `currentColor`，因此以**组件**方式消费时颜色随容器 `color` 变化。
- `illustrations/` — **多彩插画 SVG**（保留设计原色，不做颜色替换）。当前仅 `icloud-logo.svg`。
- `images/` — **遗留位图 PNG**（资源用量、概览插画、复合碎片、菜单图标等），以 URL 消费。由 `docs/plans/2026-08-04-png-assets-images-relocation-plan.md` 从根目录迁入。

## 使用方式

单色图标优先以**组件**方式从 barrel 统一入口消费（自动继承 `currentColor`）：

```ts
import {Restart, Search} from '@/assets/icons';

<Search />;
```

少数以 `<img>` 渲染的场景可直接取 URL（此时保持 `#545454`，不继承颜色）：

```ts
import scaleIcon from '@/assets/icons/scale-horizontal.svg';

<img src={scaleIcon} alt="" aria-hidden="true" />;
```

多彩插画以 URL 方式消费：

```ts
import icloudLogo from '@/assets/illustrations/icloud-logo.svg';
```

## 新增图标

- **单色图标**：把 `#545454` 单色 SVG 放入 `icons/`（功能化英文 kebab-case 命名），在 `icons/index.ts` 对应分组追加一条组件导出（PascalCase）。**完整图标清单以 `icons/index.ts` 的分组具名导出为准**（避免 README 与代码二次漂移）。
- **多彩插画**：放入 `illustrations/`，保持原色，按需以 URL 消费。

## 资源计数（2026-08-04）

- SVG：**70** = `icons/` 69 个单色 + `illustrations/` 1 个多彩（`icloud-logo`）。
- PNG：**20**（`images/` 遗留位图；原 22，已删 2 个无引用孤儿）。

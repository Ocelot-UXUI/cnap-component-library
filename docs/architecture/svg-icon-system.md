# SVG 图标系统

## Purpose

CNAP 前端 SVG 图标的稳定技术基线：目录归属、着色机制、消费契约与新增规范。目的是让任何 agent 处理图标相关工作时有单一事实来源，避免漂移。

真源：本文（机制/契约）+ `src/assets/icons/index.ts`（图标清单）+ `vite.config.ts`（svgr 配置）。

## 目录归属

- `src/assets/icons/` — **单色图标 SVG**。源文件统一以 `#545454`（= `semantic.text.secondary`）着色。
- `src/assets/illustrations/` — **多彩插画 SVG**，保留设计原色（当前仅 `icloud-logo`）。**独立目录，勿并入 `icons/`**。
- `src/assets/images/` — 遗留位图 PNG（以 URL 消费），由 `docs/plans/2026-08-04-png-assets-images-relocation-plan.md` 从根目录迁入。

## 着色机制（作用域 svgr）

`vite.config.ts` 注册两个作用域化 `vite-plugin-svgr` 实例：

- `icons/**`：`svgrOptions.replaceAttrValues { '#545454': 'currentColor' }` —— 在 `?react` 导入的**编译期**把 `#545454` 注入为 `currentColor`，源文件保持 `#545454` 原样（设计可安全重导出）。**未启用 `svgrOptions.icon`**（保持图标原有尺寸）。
- `illustrations/**`：不做颜色替换（多彩保原色）。

要点：

- `currentColor` 仅在 SVG 以**组件（`?react`）内联进 DOM** 时生效；以 `<img src>`（URL）消费时不继承颜色，渲染源色 `#545454`。
- 源文件**禁止手写 `currentColor`**（历史上曾手改，已回退）；染色交给作用域注入 —— "哪些可染色"的单一事实来源 = `icons/` 目录。

## 消费契约

- **可染色图标（推荐）**：`import { Search } from '@/assets/icons'; <Search />` —— 继承容器 `color`。
- **固定灰 `<img>` 图标**：`import x from '@/assets/icons/x.svg'; <img src={x} />` —— 保持 `#545454`，不继承。
- **多彩插画**：`import logo from '@/assets/illustrations/icloud-logo.svg'`（URL）。
- **barrel `icons/index.ts` 是图标清单单一事实来源**：仅做 `?react` 组件具名导出（PascalCase），勿再加 URL 字符串导出。

## 新增图标

- 单色：SVG 用 `#545454` 着色 → 放入 `icons/`（功能化 kebab-case）→ 在 `icons/index.ts` 对应分组追加一条 `export { default as Xxx } from './xxx.svg?react';`。
- 多彩：放入 `illustrations/`，按需 URL 消费。

## Do-Not（防漂移）

- 不要把多彩 SVG 放进 `icons/`（作用域着色规则/未来规则会静默压平其颜色）。
- 不要在 SVG 源文件写死 `currentColor`，或把单色图标改成品牌绿。
- 可染色图标不要绕过 barrel、散落 `@/assets/xxx.svg?react` 直连。
- 不要给 `icons/**` 的 svgr 加 `icon: true`（会把尺寸改成 `1em`，破坏既有布局）。

## Follow-up（未实施）

- 若将来单色图标源色不统一（非 `#545454`），可在 `icons/**` 改用 SVGO `convertColors { currentColor: true }` 统一转任意 fill/stroke；需装 `@svgr/plugin-svgo` 并开启 `svgrOptions.svgo`（`vite-plugin-svgr@5.2.0` 默认不跑 SVGO）。当前保持精确 `#545454` 匹配（更安全、零新依赖）。

## Related

- `src/assets/README.md` — 目录内使用说明
- `docs/design/design-tokens.md` §11 — 图标着色与色 token 关系
- 落地记录：`docs/logs/2026/08-04.md`；plan：`docs/plans/2026-07-30-svg-icon-system-split-plan.md`

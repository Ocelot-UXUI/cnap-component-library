# 2026-08-05-standard-drawer 标准抽屉组件（标题左 / 关闭右 + 额外插槽）

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-05
> Source: request（统一抽屉：标题左上、关闭右上、关闭左侧额外按钮组插槽，并作为标准组件全量替换）

## Current Baseline

- 项目无统一抽屉封装，各处直接用 antd `Drawer`。
- antd 6 默认 header 为 `[关闭] 标题 …… [extra]`，关闭按钮在左上角。
- `src/design/` 目录尚不存在（`basic.mdr` 约定的设计系统组件位置）。
- 直接使用 `<Drawer>` 的位置共 3 处：
  - `src/pages/Workloads/PodContentArea/PodDetailDrawer/index.tsx`（title + extra=TitleActions）
  - `src/pages/Workloads/PodContentArea/YamlDrawer/index.tsx`（title + footer={null}）
  - `src/pages/ComponentPlayground/sections/Overlays.tsx`（DrawerSection 示例）
- 主题在 `src/constants/themes/presets.ts:272` 已有 `Drawer.boxShadow` 覆盖。

## Goals

- 在 `src/design/Drawer/` 提供标准 `Drawer`：标题居左、关闭按钮居右、关闭按钮左侧提供额外操作插槽（`extra`）。
- 将应用内全部 antd `Drawer` 直接用法替换为该标准组件。
- 在 playground 中以示例展示（含额外按钮组）。

## Non-Goals

- 不改 antd 主题 token（沿用现有 `cnap2` preset 与 Drawer 阴影）。
- 不改抽屉的业务内容 / 数据逻辑。
- 不新增 `PageLayout` 等其他 `src/design` 组件。

## Task Route

- Type: app-layer design change（新增共享设计组件 + 跨模块替换）
- Owner Docs: docs/design/design-tokens.md、AGENTS.md（组件目录/布局分离约定）
- Skill: none

## Execution Plan

### Phase 1 - 标准 Drawer 组件

Status: completed

- Add: `src/design/Drawer/index.tsx` — 封装 antd Drawer，固定 `closable={false}`，将 `extra` 插槽 + 自定义关闭按钮（`CloseOutlined`，`Button type="text"`）组合进 antd `extra`（header 右侧），title 走原生（居左）。新增 `showClose` 控制关闭按钮显隐。
- Add: `src/design/Drawer/Drawer.style.ts` — `@emotion/styled` 定义关闭区 flex 布局，间距用 `spacing` token。
- Decision: 关闭原生左上角关闭按钮改用 `extra` 组合，而非 CSS 挪动原生按钮。备选：CSS `order` 反转原生按钮（脆弱、依赖 antd 内部结构，拒绝）。剩余风险：低。

[x] Exit Criteria:

- 标准 Drawer 渲染出「标题左 / 额外插槽 + 关闭按钮右」布局。
- 颜色/间距仅用 design token，无 hex 字面量。

### Phase 2 - 全量替换 + Playground 示例

Status: completed

- Fix: 3 处 `<Drawer>` 用法改为 `import {Drawer} from '@/design/Drawer'`（PodDetailDrawer、YamlDrawer、Overlays），保持各自 `title` / `extra` / `footer` 等透传行为不变。
- Add: Playground `DrawerSection` 增加 `extra` 按钮组示例，展示插槽位置。
- Proof: `yarn lint-type`、`yarn build` 通过；`yarn lint` 本次改动文件 0 error/0 warning。

[x] Exit Criteria:

- 全仓无直接 `from 'antd'` 的 `Drawer` JSX 用法残留（仅封装内部 `Drawer as AntdDrawer`）。
- 验证命令通过。
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent

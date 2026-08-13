# 2026-08-12 Design Empty 插图扩展计划

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-12
> Source: 当前用户需求（取代 `docs/logs/2026/08-12.md` 中“第一轮视觉验收不做 Empty 插画与尺寸”的旧范围）

## Current Baseline

- `src/design/Empty/index.tsx` 当前已扩展 antd `Empty`。
- `src/design/index.ts` 已从统一出口导出 `Empty`，业务侧已有使用。
- `src/assets/images/` 已提供 `empty-table.png`、`empty.png`、`no-auth.png`、`no-data.png`、`no-target.png`。
- antd 原生 `Empty` 已有 `image` prop，因此新增插图选择参数需使用不同名称。
- 现有业务使用 `Empty.PRESENTED_IMAGE_SIMPLE`，增强组件必须保留 antd 的两个静态插图成员。

## Goals

- 将 `@/design` 的 `Empty` 扩展为保持 antd 行为的 drop-in 组件。
- 增加插图类型选择和 S/M/L 插图尺寸选择；命中受支持插图类型时使用项目插图。
- 未指定或未命中受支持插图类型时继续使用 antd 原生 Empty，包括原生 `image` 参数行为。
- 保持其他 antd 参数全部透传。

## Public Contract

- `EmptyImageType = 'empty-table' | 'empty' | 'no-auth' | 'no-data' | 'no-target'`，值与同名 PNG 一一映射。
- `EmptySize = 's' | 'm' | 'l'`，S = 125 × 110、M = 175 × 154、L = 248 × 218，默认 M；尺寸应用于自定义插图。
- `EmptyProps extends AntdEmptyProps`，新增 `imageType?: EmptyImageType` 与 `size?: EmptySize`，并从 `@/design` 导出三种公共类型。
- 支持的 `imageType` 优先于原生 `image`；未传或运行时传入未知类型时，`image`、样式和其他参数完整回退给 antd，且不应用 `size`。
- `size` 默认值为 `m`，但仅在 `imageType` 命中时生效；`imageType` / `size` 不传给 antd 或根 DOM。
- `Empty.PRESENTED_IMAGE_DEFAULT` 与 `Empty.PRESENTED_IMAGE_SIMPLE` 保持可用。

## Non-Goals

- 不修改业务页面现有 Empty 调用方。
- 不修改 antd 全局主题或新增颜色 token。
- 不新增图片资源或改变图片内容。
- 不扩展 Empty 的描述、布局或其他行为。

## Task Route

- Type: implementation-only change / app-layer design system change
- Owner Docs: `AGENTS.md`, `docs/context/conventions.md`, `docs/design/design-tokens.md`
- Skill: none（现有技能均非该单一组件实现方法）

## Execution Plan

### Phase 1 - Implement and prove

Status: completed

- Decision: 按 Public Contract 固定公开类型、资源映射、默认 M、原生 `image` 优先级与回退规则。替代方案为原生 `image` 优先或禁止同传；未采用是因为显式选择项目插图应确定生效，且禁止同传会削弱 drop-in 兼容。剩余风险是 JavaScript 或类型断言仍可传未知字符串，必须由运行时守卫和定向测试证明回退。Skill: none
- Add: 在 `src/design/Empty` 实现增强组件，使用 `size` 作为插图尺寸 prop，保留统一出口、antd Props 与静态插图成员。Skill: none
- Add: 新增 `src/design/Empty/Empty.test.tsx`，参数化覆盖五种资源映射与三档尺寸，并验证默认 M、自定义类型覆盖原生 `image`、无类型时的 antd 默认图片、原生字符串图片及 alt、ReactNode / `PRESENTED_IMAGE_SIMPLE`、未知运行时值回退且不泄漏控制 Props、description / children / className / styles 等代表性 Props 透传。Skill: none
- Fix: 在 `docs/context/conventions.md` 的“增强组件契约”记录公开类型、映射、优先级、回退和静态成员；在 `docs/design/design-tokens.md` 的“组件尺寸档”记录三档数值、默认 M 与生效范围。Skill: none
- Proof: 运行 `yarn lint-type`、`yarn test src/design/Empty/Empty.test.tsx`、`yarn test`、`yarn lint`、`yarn format:check`，真实记录各命令结果。全量测试若仍因已知 collect 问题失败，必须记录为未通过；仅当定向证明通过且独立关闭审计确认失败与本改动无关时才允许关闭，不能声称全量验证通过。Skill: none
- Fix: 更新 `docs/logs/2026/08-12.md`。Skill: none

[ ] Exit Criteria:

- [x] Supported illustration types render the mapped local asset at S/M/L dimensions，默认 M。
- [x] Unsupported/omitted illustration type delegates to antd behavior，不应用自定义尺寸。
- [x] Existing antd Empty props remain type-safe and are forwarded，两个静态插图成员可用。
- [x] `docs/context/conventions.md`、`docs/design/design-tokens.md` 与实现一致。
- [x] `docs/logs/2026/08-12.md` updated.

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent

## Draft Review Record

- Reviewer: General_7503981
- Verdict: passes draft review
- Revision: 已补齐公共类型与静态成员兼容、资源和尺寸映射、原生行为回退矩阵、owner doc 位置及可执行验证命令，可开始实施。

## Closure

- Reviewer: General_7511228
- Verdict: passes closure audit
- Evidence: `yarn lint-type`、Empty 定向 18 项测试、全量 38 个测试文件 / 244 项测试、相关 ESLint、dprint 和 `git diff --check` 均通过；全量 lint 的既有 i18n 错误已如实记录在日志中。

## Amendment（2026-08-13，closure 后实现调整）

- 实现调整（Follow-up 状态保持 closed，本条仅记录现状）：`src/design/Empty/index.tsx` 尺寸样式由内联样式改为 emotion css 类（`!important` 固定插图尺寸）；命中 `imageType` 时仅 `classNames.root` 生效、root 应用纵向居中 flex 布局、图-文间距 S 4px / M·L 12px；未命中分支 `classNames` 不透传。Skill: none
- Fix: `docs/context/conventions.md` 的 Empty 契约补充上述 `classNames` 限制与布局行为；`docs/design/design-tokens.md` 尺寸档数值不变，无需修改。Skill: none
- 验证状态（以本条为准，Closure Evidence 中「Empty 定向 18 项测试通过」的记录已失效）：`yarn lint-type` 通过；`yarn test src/design/Empty/Empty.test.tsx` 10/18 失败，原因是测试断言基于旧的尺寸内联样式实现（emotion css 类文本不进入静态 markup）。按用户决定**删除 Empty 单测**（组件不需要单测），`src/design/Empty/Empty.test.tsx` 已移除，不再同步测试。Skill: none

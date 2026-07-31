# 2026-06-26 Component Style File Rule Plan

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-06-26
> Source: user request: 放开组件样式文件规则，允许组件目录内 `ComponentA.style.ts` 并增加脚本校验

## Goal

- [x] 将组件私有样式文件规则写入项目级文档和 Agent 必须遵守的规则。
- [x] 允许 `ComponentA/ComponentA.style.ts` 存放当前组件私有样式。
- [x] 要求一旦组件使用独立 style 文件，组件文件和 style 文件必须位于以组件名命名的目录下。
- [x] 要求调用方只能 import 组件公共入口，不 import 组件内部 style 文件。
- [x] 新增独立脚本校验可自动检查上述规则。

## Scope

- Update: `AGENTS.md`
- Update: `docs/architecture/module-boundaries.md`
- Add: `scripts/verify-component-styles.ts`
- Update: `package.json`
- Update: `docs/logs/2026/06-26.md`

## Rules To Implement

- 组件私有样式文件命名为 `ComponentA.style.ts`。
- `ComponentA.style.ts` 必须位于 `ComponentA/` 目录下。
- 同目录下应存在 `index.tsx` 或 `ComponentA.tsx` 作为组件入口/实现。
- `ComponentA.style.ts` 只允许被同目录下文件 import。
- Layout 组件优先使用 `@emotion/styled` 定义布局容器；只有第三方 className 接入、状态 class 组合、已有 API 约束或很小的局部样式才使用 `css`。

## Verification

- Passed: `yarn verify:component-styles`
- Passed: `yarn lint-type`

## Closure

- [x] project-level docs updated
- [x] script added and command registered
- [x] verification passed or unrelated failures recorded

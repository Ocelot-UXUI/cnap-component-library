# 2026-07-31-vite-8-toolchain-upgrade Vite 构建工具链升级到 Vite 8

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-31
> Source: request（用户要求升级 vite 系列工具）

## Current Baseline

- `vite@^6.0.7`、`@vitejs/plugin-react@^4.3.4`、`vite-plugin-svgr@^4.3.0`、`vite-plugin-qiankun@^1.0.15`。
- `vite.config.ts` 用 `react({ jsxImportSource: '@emotion/react', babel: { plugins: ['@emotion/babel-plugin'] } })`。
- `src/index.tsx:14` 从 `vite-plugin-qiankun/dist/helper` 导入 `renderWithQiankun`/`qiankunWindow`；生命周期在 `src/index.tsx:42-59`。
- SVG 全量使用 `@/assets/*.svg?react`（现代写法）；`src/vite-env.d.ts` 引用 `vite-plugin-svgr/client`。
- `package.json` 有 `@rollup/wasm-node` + `resolutions['@rollup/rollup-linux-x64-gnu']` 的 Rollup 原生二进制绕过 hack。
- `vitest.config.ts` 存在，但 `vitest` 未装、无 `test` 脚本。
- `volta.node = 22.12.0`（满足 Vite 8 的 Node 20.19+/22.12+ 要求）。
- 仓库 `yarn.lock` 处于删除状态，升级期间会重建。

## Goals

- 将 Vite 内核升级到 Vite 8（Rolldown + Oxc）。
- `@vitejs/plugin-react` 升到 v6、`vite-plugin-svgr` 升到 v5。
- 用 `@tiny-codes/vite-plugin-qiankun` 替换 `vite-plugin-qiankun`，保持独立/qiankun 双模式行为等价。
- 安装 `vitest` 并补 `test` 脚本，纳入验证基线。
- 移除失效的 `@rollup/wasm-node` + rollup `resolutions` hack。
- 四条验证命令（lint-type / lint / test / build）通过。

## Non-Goals

- 不改动业务逻辑、路由、UI 视觉与 design tokens。
- 不在主应用侧接入新插件的 `qiankun:*` 全局事件（属主应用范围）。
- 不引入 React Compiler。

## Task Route

- Type: architecture change（构建工具链 / 部署产物契约）
- Owner Docs: `docs/architecture/system-baseline.md`
- Skill: none

## Execution Plan

### Phase 0 - 基线

Status: in progress

- Proof: 重建 lockfile 后运行 `yarn lint-type` / `yarn build` 记录升级前状态。

[ ] Exit Criteria:

- 升级前 `yarn build` 可通过或问题已记录

### Phase 1 - 核心升级（Vite 8 / plugin-react 6 / svgr 5）

Status: planned

- Add: `package.json` 升级 `vite@^8`、`@vitejs/plugin-react@^6`、`vite-plugin-svgr@^5`。
- Fix: 移除 `@rollup/wasm-node` devDep 与 `resolutions['@rollup/rollup-linux-x64-gnu']`。
- Fix: `vite.config.ts` react 插件去掉 `babel` 字段，保留 `jsxImportSource: '@emotion/react'`（Oxc 处理 css prop）；移除 `@emotion/babel-plugin` devDep。
- Decision: 去 Babel 方案。选择直接移除 `@emotion/babel-plugin` 而非引入 `@rolldown/plugin-babel`；替代方案是保留 babel 以维持 label/sourcemap；剩余风险：emotion 类名可读性/sourcemap 略降，功能不受影响，必要时后续可 opt-in `@rolldown/plugin-babel`。

[ ] Exit Criteria:

- `yarn build` 与 `yarn start` 正常，css/styled 样式正常渲染
- SVG 组件导入正常

### Phase 2 - qiankun 插件替换

Status: planned

- Add: 安装 `@tiny-codes/vite-plugin-qiankun`，卸载 `vite-plugin-qiankun`。
- Fix: `vite.config.ts` 改为 `qiankun('cnap')`（`useDevMode` 选项已废弃，dev 默认开启）。
- Fix: `src/index.tsx` 导入改为 `@tiny-codes/vite-plugin-qiankun`；`renderWithQiankun` → `exportQiankunLifeCycles`，且移入 `if (qiankunWindow.__POWERED_BY_QIANKUN__)` 分支，独立运行走 `else`（保留 `APP_BASENAME` 跳转）。

[ ] Exit Criteria:

- 独立运行渲染正常、basename 跳转逻辑保留
- qiankun 环境下生命周期注册正常（主应用接入手测）

### Phase 3 - vitest

Status: planned

- Add: 安装 `vitest@^4`，`package.json` 增加 `"test": "vitest run"`。

[ ] Exit Criteria:

- `yarn test` 通过（当前 `passWithNoTests: true`）

### Phase 4 - 验证与文档

Status: planned

- Proof: 运行 `yarn lint-type` / `yarn lint` / `yarn test` / `yarn build`。
- Fix: 更新 `docs/logs/2026/07-31.md`；如影响技术基线更新 `docs/architecture/system-baseline.md`。

[ ] Exit Criteria:

- 四条验证命令全绿
- [ ] `docs/logs/` updated

## Verification Results (2026-07-31)

已解析版本：vite@8.2.0、@vitejs/plugin-react@6.0.5、vite-plugin-svgr@5.2.0、vitest@4.1.10、@tiny-codes/vite-plugin-qiankun@2.4.0、新增 jsdom@30。

- `yarn lint-type` — ✅ 通过（升级前因缺 vitest 类型而红，装 vitest 后转绿）。
- `yarn build` — ✅ 通过，Vite 8 + Rolldown，产物正常，构建 18.35s → 1.37s。
- `yarn test` — ⚠️ vitest 已能运行（原本无法运行）：168 passed / 5 failed / 16 skipped，另有 3 个 suite 网络错误 + ResizeObserver 未定义。**均为升级前既有问题**，与工具链升级无关：
  - `accountId: 1` vs `"1"` 类型断言（clusterContext / navigationTool）
  - `/applications` vs `/workloads` 路由顺序（derive）
  - `AxiosError: Network Error`（3 suite 未 mock axios，直连网络）
  - `ResizeObserver is not defined` / `getComputedStyle` 伪元素（jsdom 缺 setup полиfill）
- `yarn lint` — ⚠️ 4 error + 3 warning，全部位于本次未改动的文件（LoadingProgress.tsx / date.ts / i18n/index.ts / MountVolumeList.tsx / ResourceLimit.tsx / verticalScale/rows.ts）。**既有问题**，非本次升级引入。
- `yarn start` — 未做非交互验证（dev server 需人工确认，尤其 qiankun 双模式）。

未关闭原因：`yarn test` 与 `yarn lint` 存在既有失败；qiankun 独立/接入双模式尚需人工手测。这些既有失败是否纳入本次修复范围待 owner 决策。

## Closure Gates

- [ ] in-scope behavior is complete
- [ ] relevant docs are aligned
- [ ] verification has run
- [ ] closure audit was independent

# 2026-08-04 PNG Assets Relocation To images/

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-04
> Source: 从 `2026-07-30-svg-icon-system-split-plan` 拆出的遗留项——该 SVG plan 只做 `icons/`//`illustrations/` 拆分并显式延后 PNG 迁移；此前误挂在 `workloads-icon-upgrade-plan`（其范围是"用 SVG 替换图标 + 删孤儿"，不含目录迁移）。

## Current Baseline

> 2026-08-04 对照仓库核实（执行前需按 Rule 1 用 grep 复核确数）。

- `src/assets/` 根目录现存 **22 个 PNG**（SVG 已迁入 `icons/`，`icloud-logo` 在 `illustrations/`）。分类：
  - 资源用量 `pod-resource-usage-*`（cpu/gpu/memory/huawei/kunlunxin/nvidia）
  - 概览 `workloads-overview-*`（cpu/gpu/memory/arrow-right/config-artwork/deployment-artwork）
  - 菜单 `workloads-header-menu-*`（debug/delete/temporary-auth）
  - 三点 `{group-header,workloads-header-actions,pod-row-actions}-more-dot`
  - 批量 `batch-action-bar-{delete-rebuild,force-delete}`
  - `pod-row-actions-delete-rebuild-{head,handle}`
- 消费方式：全部为 URL 直连 `import x from '@/assets/<name>.png'`，约 **24 处 import、~11 个 Workloads 组件文件**。
- 疑似孤儿（零引用，待核验）：`pod-row-actions-delete-rebuild-{head,handle}`（疑为 `workloads-icon-upgrade` 替换后遗留）。
- `src/assets/images/` 目录尚不存在。
- 相关：`docs/architecture/svg-icon-system.md`（图标系统基线，已将本项列为待迁）；`docs/plans/2026-07-30-workloads-icon-upgrade-plan.md`（负责"用 SVG 替换图标 + 删孤儿"，**不含**目录迁移）。

## Goals

- 把根目录遗留 PNG 统一收纳到 `src/assets/images/`，与 `icons/`（单色 SVG）、`illustrations/`（多彩 SVG）形成一致的资产分层。
- 更新全部 PNG 引用路径；确认根目录零 PNG 残留、引用全部解析。
- 顺带删除确认无引用的孤儿 PNG（不迁移死资源）。

## Non-Goals

- 不把 PNG 替换为 SVG、不改渲染方式或视觉（纯 URL 路径迁移）。
- 不在 `images/` 内建子目录分组（保持扁平；如需分组另议）。
- 不改动 `icons/` / `illustrations/`。

## Task Route

- Type: 实现级结构迁移（改 import 路径，视觉不变，跨多文件）
- Owner Docs: `docs/architecture/svg-icon-system.md`, `docs/context/codebase-map.md`
- Skill: `code-review`

## Execution Plan

### Phase 1 - Relocate PNG + Update References

Status: completed

- Decision: 孤儿 PNG（零引用）删除而非迁移；有引用者 `git mv` 进 `images/`。记录删除清单与理由。Skill: `code-review`
- Fix: `git mv` 有引用 PNG → `src/assets/images/`；更新全部 `@/assets/*.png` → `@/assets/images/*.png`。Skill: none
- Fix: 更新 `src/assets/README.md`（PNG 位置：根目录待迁 → `images/`）与 `docs/architecture/svg-icon-system.md`（PNG 归属指向本 plan/已落地）。Skill: none
- Proof: 根目录 `*.png` 计数为 0；`@/assets/*.png`（非 `images/`）残留为 0；引用全部解析；`yarn lint-type` + `yarn build` 通过。Skill: none

[x] Exit Criteria:

- 所有被引用 PNG 位于 `src/assets/images/`；孤儿已删并记录
- 全部 PNG import 指向 `@/assets/images/`，无旧根路径残留
- `yarn lint-type`、`yarn build` 通过
- `README.md` / `svg-icon-system.md` 的 PNG 位置与实际一致
- [x] `docs/logs/` 已更新

## Closure Gates

- [x] In-scope behavior is complete.
- [x] Relevant docs are aligned.
- [x] Verification has run.
- [x] Closure audit was independent. （owner v_wangkaiyuan02 自验 2026-08-04；owner 指示"直接实现"，未单独做 draft review / 第三方 closure audit）

## Execution Notes

- 2026-08-04（owner v_wangkaiyuan02，直接实现）：`git mv` 20 个被引用 PNG → `src/assets/images/`；删除 2 个零引用孤儿 `pod-row-actions-delete-rebuild-{head,handle}`；更新 11 文件、24 处 `@/assets/*.png` → `@/assets/images/`。验证：根目录 PNG=0、旧根路径 import=0、`@/assets/images/`=24；`yarn lint-type` ✅、`yarn build` ✅、受影响文件 `eslint`/`dprint` ✅。同步更新 `src/assets/README.md`、`docs/architecture/svg-icon-system.md`。详见 `docs/logs/2026/08-04.md`。

# 03 Applications Sidebar First Item Path Mismatch (pre-existing)

## Problem

- `src/navigation/__tests__/derive.test.ts > navigation derive helpers > generates internal menu paths without basename` 断言 `getSidebarGroups('applications')[0].items[0].url` 为 `/applications`，实际为 `/workloads`。
- 该断言当前失败，`yarn test` 因此报 1 项 failed（其余全绿）。

## Diagnostic Method

- 在 cluster-selector 实现前，用 `git stash` 暂存本次改动后单跑该测试文件，仍失败 → 确认为**既有失败**，与 cluster-selector（clusterId 维度 / appEnvID 解析）改动无关。
- 检查 `src/navigation/registry.ts`：`applications` workspace 的第一个 `visibleInSidebar: true` 节点是 `applications.workloads`（route `workloads` → `/workloads`）；`applications.list`（route `applications` → `/applications`）**未设 `visibleInSidebar`**，因此不进侧边栏，导致侧边栏首项变为 workloads。

## Root Cause

- 早前 workload 相关改动（commit `e5d1e2f` 附近）将 `applications.workloads` 设为 `visibleInSidebar: true` 且 `applications` workspace 默认落地页改为 workloads，但未同步更新该测试的期望值（或未给 `applications.list` 设 `visibleInSidebar`）。
- 结果：测试期望的"侧边栏首项 = 应用列表 `/applications`"与实际"首项 = 工作负载 `/workloads`"不一致。

## Status

- 未修复。属 workloads 侧边栏可见性/默认落地的既有回归，需由该 owner 判定正确意图（更新测试期望为 `/workloads`，或给 `applications.list` 补 `visibleInSidebar`）。
- 本条仅记录，避免在 cluster-selector plan 中越界猜测 workloads 的既定行为。

## Impact On cluster-selector Plan

- 不影响 clusterId 维度与 appEnvID 解析的正确性。cluster-selector 新增/相关单测全部通过；`yarn test` 全量 105/106，唯一失败即本条。

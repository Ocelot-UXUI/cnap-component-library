# 2026-07-31 ResourceQuota 类型统一与资源用量计算路径对齐

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-31
> Source: `docs/architecture/resource-usage-display-principle.md`（强制基线）+ owner 对 Open Questions 的回答

> Implementation 完成（Phase 1-4 全部 Exit Criteria 达成，四项验证命令达基线）。按 plan-authoring-guide item 7，关闭前需 independent closure audit；audit 完成前 Status 保持 `partially completed`。

## Current Baseline

- `ResourceQuota`（`src/interface/entities/workload.ts:24`）已同时含带单位字段（`cpu`/`memory`/`ephemeralStorage`）与无单位换算字段（`cpuMilli`/`memoryBytes`/`ephemeralStorageBytes`）。
- 读侧（响应）已统一为 `ResourceQuota`：`Container`/`Pod`/`PodUsage`/`ContainerUsage`/`RuntimeWorkloadContainer` 的 `resourceLimits`/`resourceRequests`/`resourceUsages`。
- 写侧未统一：`VerticalScaleTargetParams.resourceLimits/Requests`（`runtimeOperation.ts:185`）与 `VerticalScaleTarget.resourceLimits/Requests`（`runtimeOperation.ts:129`）仍是 `Record<string, string>`；`fromResourceSpec()`（`resource.ts:107`）返回 `Record<string, string>`；`capability.ts:108` 把 `Record` 塞进 `params`；`verticalScale/submit.ts:17` 用 `as Record<string, string>` 断言。
- 比例计算违反原则：`resourceUsage.ts` 的 `usagePercent(usage, limit, parse)` 靠 `parseQuantity` 解析带单位字符串算比值；`ResourceUsageView.tsx`、`ResourceUsageTooltip.tsx`、`podUsageCells.tsx` 全部传带单位字段进 `usagePercent`。
- 单位枚举刚统一（CPU c/nc、内存 Mi/Gi/Ti、存储 Mi/Gi/Ti，见 07-31 日志）；`CPU_FACTORS`/`BYTE_FACTORS` 仅服务于显示侧合法性兜底，不进入比例计算。

## Goals

- 确保所有**接口响应侧**的 `resourceLimits`/`resourceRequests`/`resourceUsages` 字段为 `ResourceQuota` 类型（核实现状：已统一，本 plan 落地为核实记录 + 适配器对齐）。
- 把 `toResourceSpec` 的入参类型与实现跟上 `ResourceQuota`（解析时只取 `cpu`/`memory`/`ephemeralStorage`，忽略 `cpuMilli`/`*Bytes` 派生字段与 `gpus`，`others` 透传）。
- 把比例计算路径从"解析带单位字符串"切换到"直接读 `cpuMilli`/`memoryBytes`/`ephemeralStorageBytes`"，与 `resource-usage-display-principle.md` 对齐。
- 显示侧直接渲染带单位字段，移除/降级 `formatCpu`/`formatMemory` 的解析依赖。
- 受影响测试同步对齐。

## Non-Goals

- **不改写侧（请求负载）类型**：`VerticalScaleTarget.resourceLimits/Requests`、`VerticalScaleTargetParams.resourceLimits/Requests`（`runtimeOperation.ts:129-130, 185-186`）保持 `Record<string, string>`；`fromResourceSpec()` 返回类型保持 `Record<string, string>`；`capability.ts`/`submit.ts`/`api/runtimeOperation.ts:148-149` 的写侧链路保持现状。理由：写侧只发送显示字段（`cpu`/`memory`/`ephemeralStorage`）的扁平 map，后端按此契约消费；改为 `ResourceQuota` 会塞入 `cpuMilli`/`*Bytes`/`gpus`/`others` 等后端不期望的字段。
- **不改纵向扩缩弹窗的输入校验**：`isLimitGteRequest`/`toBaseValue`（`resource.ts:69-88`）仍依赖 `Quantity.value + UNIT_FACTORS` 解析带单位字符串算 Limit≥Req。这是输入侧校验，不属本原则的"显示/比例"二分。
- 不重构 `docs/architecture/workload-domain-model.md` 的领域层（L1/L2）整体落地——仅对齐其中与本原则冲突的描述。
- 不改 GPU 资源（`gpus?: GpuResource[]`）与其他扩展资源（`others`）的处理逻辑。
- 不引入查询缓存、不改 hooks 的请求编排。
- `src/pages/Applications/RuntimeConfig`（vCPU/NORMALIZED）独立体系，不纳入。

## Task Route

- Type: architecture change + implementation-only change（跨多模块的类型契约 + 显示/计算路径重构）
- Owner Docs: `docs/architecture/resource-usage-display-principle.md`（强制基线）、`docs/architecture/workload-domain-model.md`（提案，需对齐）、`docs/requirements/vertical-scale-dialog.md`（写侧语义）
- Skills: none（无匹配可复用技能）

## Execution Plan

### Phase 1 - 响应侧类型核实与 toResourceSpec 适配器对齐

Status: completed

**方法论**：响应侧字段类型已统一为 `ResourceQuota`（核实确认），无需改字段声明。`toResourceSpec` 当前入参签名为 `Record<string, string>`，与已统一的 `ResourceQuota` 响应侧不符，需对齐签名与实现。改完跑 `yarn lint-type` 暴露剩余冲突点，按报告修复——不试图事前穷举。

- [x] Step 1（核实响应侧类型已统一）：确认以下响应侧字段均为 `ResourceQuota`，无需改动——
    - `src/interface/entities/pod.ts:100-104`：`Container.resourceLimits`/`resourceRequests`/`resourceUsages`
    - `src/interface/entities/pod.ts:175-179`：`Pod.resourceLimits`/`resourceRequests`/`resourceUsages`
    - `src/interface/entities/pod.ts:214, 219`：`PodUsage.resourceUsages`、`ContainerUsage.resourceUsages`
    - `src/interface/entities/workload.ts:107-108`：`RuntimeWorkloadContainer.resourceLimits`/`resourceRequests`
    - 写侧（`runtimeOperation.ts:129-130, 185-186` 的 `VerticalScaleTarget`/`VerticalScaleTargetParams`）**不在本次范围**，保持 `Record<string, string>`。
- [x] Step 2（改 `toResourceSpec` 签名）：`src/domain/workload/resource.ts:91` 入参 `record?: Record<string, string>` 改为 `record?: ResourceQuota`。`fromResourceSpec()` 返回类型与实现**保持不变**（仍 `Record<string, string>`，对接写侧）。
- [x] Step 3（重写 `toResourceSpec` 实现，不能保留 `Object.entries` 遍历）：
    - 显式取 `record.cpu`/`memory`/`ephemeralStorage` 调 `parseQuantity` 进对应 `ResourceSpec` 字段
    - **忽略** `cpuMilli`/`memoryBytes`/`ephemeralStorageBytes`（派生字段，不进入显示侧 `ResourceSpec`）
    - **忽略** `gpus`（`ResourceSpec` 当前不承载 GPU，GPU 走独立路径，见 `ResourceUsageView` 直接读 `container.resourceLimits?.gpus`）
    - `record.others` 直接透传到 `spec.others`，不再合并到 `others.others`
- [x] Step 4（编译器驱动发现）：`yarn lint-type` 报出 1 处冲突（`resource.test.ts:56` 旧 Record 形状输入），由 Step 5 修复；`adapters.ts` 调用点自动适配，无冲突。
- [x] Step 5（测试同步）：`resource.test.ts` 的 `toResourceSpec` 测试输入改为 `ResourceQuota` 形状；新增"派生字段不进入 ResourceSpec"与"gpus 不进入 ResourceSpec"用例；round-trip 改为 `ResourceQuota → ResourceSpec → Record`。
- [x] Proof: `yarn lint-type` 通过；`yarn test src/domain/workload --run` 通过（22 passed）。

[x] Exit Criteria:

- [x] 响应侧 5 处 `resourceLimits/Requests/Usages` 类型核实为 `ResourceQuota`（已在 `pod.ts`/`workload.ts` 落地）
- [x] 写侧 `VerticalScaleTarget`/`VerticalScaleTargetParams` 保持 `Record<string, string>` 不变
- [x] `toResourceSpec` 签名与实现按 `ResourceQuota` 重写，派生字段与 GPU 不混入 ResourceSpec
- [x] `yarn lint-type` 全绿，无由本次变更引发的残留错误
- [x] `docs/logs/` updated

#### Decisions（执行中追加）

- **lint-type 报告**：Step 4 运行后仅 1 处冲突（`resource.test.ts`），无未预期项。无需追加非预期 Decision。

### Phase 2 - 比例计算切换到无单位字段

Status: completed

- [x] Fix `src/pages/Workloads/PodContentArea/PodDetailDrawer/resourceUsage.ts`：`usagePercent(usage?: string, limit?: string)` 重写——直接 `Number()` 解析无单位字段，任一缺失/非数值/分母≤0 返回 `undefined`；移除 `parse` 形参与 `parseQuantity` 依赖；移除 `CPU_FACTORS`/`BYTE_FACTORS` 与 `parseCpu`/`parseBytes`。
- [x] Decision: `formatCpu`/`formatMemory` 保留为"空值占位"包装 `value ?? '-'`，不再做合法性解析。替代方案（直接在调用点用 `?? '-'`）未选，因 `Metric`/`podUsageCells` 多处复用。剩余风险：后端下发非法字符串时新版直接显示原串（可接受）。
- [x] Fix `src/pages/Workloads/PodContentArea/PodDetailDrawer/ResourceUsageView.tsx`：`Metric` 新增 `usageNumeric`/`limitNumeric`；CPU 传 `cpuMilli`、内存传 `memoryBytes`。
- [x] Fix `src/pages/Workloads/PodContentArea/PodDetailDrawer/ResourceUsageTooltip.tsx`：Props 去掉 `parse`，新增 `usageNumeric`/`limitNumeric`。
- [x] Fix `src/pages/Workloads/PodContentArea/podUsageCells.tsx`：`renderUsageCell(pod, displayKey, numericKey, ...)`；`renderCpu` 传 `'cpuMilli'`，`renderMemory` 传 `'memoryBytes'`。
- [x] Fix `resourceUsage.test.ts`：重写为无单位字符串断言（`usagePercent('500','1000')===50`、`'abc'`/`undefined`/`'0'` 边界）。
- [x] Decision: `usageMerge.test.ts` **未改动**。原计划要改的测试数据（`{ cpu: '500m' }` → 加 `cpuMilli`）实际是合法 `ResourceQuota` 形状（`cpu` 为 `string`），无类型冲突；且 `usageMerge` 测的是合并逻辑而非比例计算，不需要 `cpuMilli`。强行加 `cpuMilli` 反而误导（暗示比例计算在 merge 阶段发生）。剩余风险：无。
- [x] Proof: `yarn lint-type` 通过；`yarn test src/pages/Workloads --run` 通过（83 passed / 17 files）。

[x] Exit Criteria:

- [x] 比例计算不再解析带单位字符串
- [x] `usagePercent` 签名简化为 `(usage?: string, limit?: string) => number | undefined`
- [x] `CPU_FACTORS`/`BYTE_FACTORS`/`parseCpu`/`parseBytes`/`parseQuantity` 全部删除
- [x] `ResourceUsageView`/`ResourceUsageTooltip`/`podUsageCells` 传参对齐
- [x] `docs/logs/` updated

### Phase 3 - 文档对齐

Status: completed

- [x] Fix `docs/architecture/workload-domain-model.md`：现状问题 #1 更新——`ResourceQuota` 现含带单位字符串 + 派生无单位字段；读侧 `RuntimeWorkloadContainer` 已统一；写侧 `Record` 保留。
- [x] Fix `docs/architecture/resource-usage-display-principle.md`：Open Questions 节落定答案。
- [x] Add `docs/logs/2026/07-31.md`：追加 Phase 1-3 变更与验证记录。

[x] Exit Criteria:

- [x] 两份 architecture 文档与本 plan 立场一致
- [x] `docs/logs/` updated

### Phase 4 - 验证

Status: completed

- [x] Proof: `yarn lint-type` 通过
- [x] Proof: `yarn lint` 4 errors + 3 warnings，全部在未改动文件（`LoadingProgress.tsx`/`MountVolumeList.tsx`/`ResourceLimit.tsx`/`verticalScale/rows.ts`/`date.ts`/`i18n/index.ts`），与 07-31 Vite 升级基线一致
- [x] Proof: `yarn test` 170 passed / 5 failed / 16 skipped + 3 ResizeObserver unhandled errors；passed 比基线（168）多 2，源自 Phase 1 新增的派生字段/GPU 测试；failed/skipped/errors 与基线一致
- [x] Proof: `yarn build` 通过（4.34s）

[x] Exit Criteria:

- [x] 四项验证命令均达基线
- [x] `docs/logs/` 记录验证状态

## Closure Gates

- [x] in-scope behavior is complete：`toResourceSpec` 适配器对齐 + 比例计算切到无单位字段 + 显示侧直接渲染
- [x] relevant docs are aligned：`resource-usage-display-principle.md` / `workload-domain-model.md` / `docs/logs/`
- [x] verification has run：`yarn lint-type` / `yarn lint` / `yarn test` / `yarn build` 达基线
- [ ] closure audit was independent：由非 owner 角色按 `docs/process/application-development-workflow.md` 执行关闭审计（**pending**——实现由 owner 完成，audit 待独立执行）

## Open Questions

无（owner 已回答：凡 `ResourceQuota` 都可取 `cpuMilli`/`*Bytes`，缺失或非法放弃计算；凡 `resourceLimits`/`resourceRequests`/`resourceUsages` 都是 `ResourceQuota`）。

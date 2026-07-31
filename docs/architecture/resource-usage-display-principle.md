# Workload 资源用量显示与计算原则

## Status

**强制基线**。本原则适用于 `src/pages/Workloads/` 下所有涉及资源（CPU / 内存 / 存储）用量的业务逻辑。新增代码必须遵守；存量代码在触碰时对齐。

## Purpose

消除"靠解析带单位字符串来计算比例"的脆弱做法。后端 `ResourceQuota` 已为同一资源同时下发**带单位字段**与**无单位换算字段**，前端按用途取用即可，避免重复解析与单位口径漂移。

## Principle

| 用途       | 取用字段                                                     | 说明                                                                              |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| **显示**   | `cpu` / `memory` / `ephemeralStorage`                        | 带单位字符串，单位枚举：CPU → c/nc；内存 → Mi/Gi/Ti；存储 → Mi/Gi/Ti（见 `RESOURCE_UNITS`） |
| **计算比例** | `cpuMilli` / `memoryBytes` / `ephemeralStorageBytes`         | 后端已换算到统一基准的无单位数值字符串，直接 `Number()` 参与计算                          |

> 反模式：用 `parseQuantity('64c')` / `parseBytes('16Gi')` 的结果做 usage/limit 比值。解析只服务于显示路径（且显示也不强制解析——能原样展示就原样展示）。

## 字段语义（来自 `src/interface/entities/workload.ts`）

```ts
interface ResourceQuota {
    cpu?: string;                       // 带单位，如 "1c" / "500m" → 显示
    cpuMilli?: string;                  // millicore 数值字符串，1000 = 1 core → 计算
    memory?: string;                    // 带单位，如 "16Gi" → 显示
    memoryBytes?: string;               // bytes 数值字符串 → 计算
    ephemeralStorage?: string;          // 带单位，如 "200Gi" → 显示
    ephemeralStorageBytes?: string;     // bytes 数值字符串 → 计算
    gpus?: GpuResource[];               // GPU 明细，单独处理
    others?: Record<string, string>;    // 扩展资源（FPGA 等）
}
```

注意：

- `cpuMilli` 的内部基准是 **millicore**（1 core = 1000 millicores），与显示用的 `c`/`nc` 不同——它是后端为跨单位比较预派生的固定基准，前端不感知其语义，只当作"可比较的数字"使用。
- `memory` / `ephemeralStorage` 共用同一套单位枚举（Mi/Gi/Ti）与同一套 bytes 基准。

## 应用规则

### 1. 用量百分比（usage/request、usage/limit）

```ts
// ✅ 正确：用无单位字段
function usagePercent(usageMilli?: string, limitMilli?: string): number | undefined {
    const u = usageMilli !== undefined ? Number(usageMilli) : NaN;
    const l = limitMilli !== undefined ? Number(limitMilli) : NaN;
    if (!Number.isFinite(u) || !Number.isFinite(l) || l <= 0) return undefined;
    return Math.round((u / l) * 100);
}
// 调用：usagePercent(container.resourceUsages?.cpuMilli, container.resourceLimits?.cpuMilli)
```

```ts
// ❌ 反模式：解析带单位字符串做比值
usagePercent(parseCpu(usage?.cpu), parseCpu(limit?.cpu))
```

### 2. 显示数值

直接渲染带单位字段；只在需要"空值占位"或"明显非法值过滤"时做轻量校验：

```ts
// ✅ 直接显示
<span>{container.resourceUsages?.cpu ?? '-'}</span>
```

```ts
// ❌ 解析后再拼回原串
formatCpu(value) // 仅为兼容旧调用点保留，新代码不再依赖
```

### 3. 高负载判定（如 ≥80%）

基于规则 1 产出的百分比，与单位无关。

## 受影响位置（当前实现待对齐）

下列文件目前通过解析带单位字符串做比例，违反本原则，需在后续 plan 中对齐：

- `src/pages/Workloads/PodContentArea/PodDetailDrawer/resourceUsage.ts`
  - `usagePercent(usage, limit, parse)` 的 `parse` 入参应去除；改为直接接收无单位字段
  - `CPU_FACTORS` / `BYTE_FACTORS` 仅服务于显示侧的合法性兜底，不进入比例计算
- `src/pages/Workloads/PodContentArea/PodDetailDrawer/ResourceUsageView.tsx`
  - `Metric` 组件传给 `usagePercent` 的是带单位字段，需改传 `cpuMilli` / `memoryBytes` / `ephemeralStorageBytes`
- `src/pages/Workloads/PodContentArea/PodDetailDrawer/ResourceUsageTooltip.tsx`
  - 同上
- `src/pages/Workloads/PodContentArea/podUsageCells.tsx`
  - 列表单元格的百分比计算改用无单位字段

显示侧（`formatCpu` / `formatMemory`）可保留为兼容包装，逐步替换为直接渲染带单位字段。

## 与领域模型的关系

`docs/architecture/workload-domain-model.md` 提出的 `ResourceSpec` + `Quantity`（raw + value + unit）值对象，对应本原则的**显示侧**。比例侧不在领域值对象中体现——它是后端预派生的数值字段，前端按字段名直取即可。

## Open Questions

已落定（2026-07-31，owner 回答）：

1. **接口下发覆盖度**：凡类型为 `ResourceQuota` 的字段都可直接取 `cpuMilli`/`memoryBytes`/`ephemeralStorageBytes`。若某条数据缺失或值不合法，前端放弃比例计算（`usagePercent` 返回 `undefined`，UI 显示 `-`），**不回退到解析带单位字符串**。
2. **`RuntimeWorkloadContainer.resourceLimits`/`resourceRequests`**（曾为 `Record<string,string>`）：现已统一为 `ResourceQuota`。

**写侧例外**（不属本原则范围）：`VerticalScaleTarget`/`VerticalScaleTargetParams`（`runtimeOperation.ts`）是请求负载类型，保持 `Record<string, string>`——写侧只发送 `cpu`/`memory`/`ephemeralStorage` 的扁平 map，`fromResourceSpec()` 同步保持该返回类型。

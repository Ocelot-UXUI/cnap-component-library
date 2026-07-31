# Workload 领域数据模型

## Status

**目标设计（提案，待分阶段实现）**。本文定义 Workload 业务的目标领域模型与分层，用于指导后续重构；尚未成为当前代码基线。随配套 plan 逐阶段落地后，本文转为稳定基线。当前实现基线以 `src/interface/entities/` 与 `src/api/` 的 TypeScript 定义为准。

## Purpose

统一 Workload 业务下"呈现数据（读）"与"操作触发（写）"的建模方式，消除同一概念多形状、领域语义散落在组件的问题，降低操作弹窗与列表的维护成本。

## Sources & Related Docs

- 真源接口：`docs/input/source-api-runtime-workloads.md`
- 缺失字段：`docs/analysis/workload-missing-api-fields.md`
- 需求：`docs/requirements/workloads-page.md` 及其子需求（pod-list / pod-detail / batch-action-bar / 各操作弹窗 / cluster-selector）
- 现有类型：`src/interface/entities/{workload,pod,runtimeOperation,runtimeSummary,podEvent,applicationEnvironment}.ts`
- 现有 API：`src/api/{runtimeResource,runtimeOperation}.ts`
- 现有状态机范式：`src/contexts/navigationContextMachine.ts`（XState v5）

## 现状问题（复杂度根源）

1. **资源规格三套并存**：`ResourceQuota`（数值 millicore/bytes，`workload.ts:17`）、`ResourceRequirements`（字符串 "32c"/"128Gi"，`runtimeSummary.ts`）、`Record<string,string>`（`RuntimeWorkloadContainer` `workload.ts:95`、`VerticalScaleTargetParams` `runtimeOperation.ts:185`）。换算/拆拼逻辑散落各组件。
2. **Operation 重复**：`RuntimeOperation`（`runtimeOperation.ts:43`）与 `PodOperation`（`pod.ts:11`）几乎等价，`capability` 一处枚举一处退化为 `string`。
3. **Workload 两套实体**：`Workload`（`/groups`，`workload.ts:33`）与 `RuntimeWorkload`（`/workloads`，含 `updateStrategy/containers/availabilityTarget`，`workload.ts:104`）共享身份却无共同基类。
4. **状态是裸 string**：`Pod.status` / `Container.status` / `Order.status`；中文名/颜色/是否正常/分类的映射只在需求文档表格里，组件各自实现。
5. **操作数据链与联动散落弹窗**：多接口顺序调用 + join（Pod→group→workload）+ 字段联动（容器切换、集群选中↔字段、Limit↔Req、值/单位拆拼）+ 提交组装，全部堆在弹窗组件内。

## 领域概念与聚合边界

同一份运行时存在两条投影，靠 `(clusterId, workloadName)` 关联：

- **上下文坐标 Context**：Account → Application → Environment(=appEnvID) → Cluster；`clusterId` 缺省=全部集群。复用现有 `NavigationContextState`。
- **聚合根 1 · WorkloadGroup**（分组视角）→ 内含 `Workload[]`（每个 = 某集群上的 K8s 实例，带副本数/更新策略/版本/容器规格）。
- **聚合根 2 · Pod**（实例视角）→ 内含 `Container[]`；经 `(clusterId, workloadName)` 回指某 Workload。
- **能力 Operation**：挂在 Workload 或 Pod 上（`targetKind`），触发后产出 **Order（异步订单）**。
- **投影 Summary**：对"当前 Context + group"的只读统计（`podStatistics` + `resourceRequirements`）。

## 分层模型（坐标系 → 聚合 → 值对象 → 读/写 → 会话）

### L0 坐标层 RuntimeScope

所有列表/汇总查询的统一入参；缺省语义清晰。

### L1 值对象层 Value Objects（消除"同概念多形状"）

- `ResourceRef`：Workload / Pod / OperationTarget 的共同身份。
- `ResourceSpec` + `Quantity`：收敛三套资源表示，解析/格式化/拆值单位只实现一次。
- `PodStatusDescriptor` 注册表：raw status → 展示名 / tone / isNormal，派生正常/异常/已屏蔽。
- `Version`：group 顶层版本 + 各集群 `currentVersion`。

### L2 聚合层 Resource（读模型骨架）

组件渲染所依赖的稳定主干：只定义**身份、层级关系、内嵌值对象**，不掺入接口细节，也不为某个具体界面定制（界面差异由 selector 从骨架派生）。含 `WorkloadGroup` / `Workload`（合并两套实体）/ `Pod` / `Container`。

**为什么是"两聚合根 + 软关联"，而非单一深树**：接口是分开且分页拉取的——`/groups` 返回 `WorkloadGroup[]`（内含 `Workload[]`），`/pods` 分页返回 `Pod[]`（内含 `Container[]`）。因此骨架由**两个聚合根（WorkloadGroup 树 + Pod 树）**构成，Pod 经 `ownerWorkloadRef`（`(clusterId, workloadName)`）**软关联**回 Workload，而非把 `Pod[]` 物理嵌进 Workload。理由：Pod 是独立分页查询，强嵌套会迫使一次性拉全量 Pod（与分页矛盾）并引入冗余/循环；骨架只固定关系，何时查询与 join 交给 loader / selector。

关键设计决策：

- **两套 Workload 合并为一**：`/groups` 的 `Workload` 与 `/workloads` 的 `RuntimeWorkload` 描述同一 workload 的不同字段子集（后者独有 `updateStrategy/containers/availabilityTarget`）。合并为单一 `Workload`、来源独有字段设为可选，adapter 按来源填充。消费方只判断"字段在不在"，无需知道数据来自哪个接口；避免两套类型 + 全局 `instanceof` 分叉。
- **身份统一 `ResourceRef`**：作为读→写的接缝，选中行取 `ResourceRef` 即可映射为 `OperationTarget`。
- **内嵌值对象**：`status → PodStatusDescriptor`、`resource* → ResourceSpec`，语义/单位在进入 L2 时收敛，组件不再各自实现映射与换算。
- **与 DTO 分离**：经 adapter 转换而非复用 entities，把接口波动与缺失字段挡在 adapter 一层。

边界：L2 不做分页/缓存/请求编排（loader/hooks 负责），不承载勾选/联动等瞬态状态（L5 Session 负责）。

### L3 能力层 Capability Registry（把操作变成数据）

以 `OperationCapability` 为 key 的注册表，声明 `targetKind / supportsBatch / dialog`（后续可扩 `buildTargets / buildParams`）。

**当前基线（已落地）**：`src/domain/workload/capability.ts` 登记全部已实现能力（Workload 维度 Vertical/Horizontal/Restart，Pod 维度 PodRestart/PodDelete/PodDeleteForce，及占位 PodBlock/PodUnblock/ApplicationUninstall）；派生选择器 `listModalCapabilities()`（标题栏弹窗路由）/ `listBatchCapabilities()`（批量栏成员，按 `targetKind==='Pod'` 派生）已被 `WorkloadsHeader/OperationModals` 与 `BatchActionBar/batchActions` 消费，替代了原先的散落硬编码清单。`dialog` 存字符串 key，UI 层据此映射 React 组件（registry 不持有组件）。批量能力集合前端写死（理由见 `capability.ts` 注释）。

**尚未收敛（后续）**：提交路径统一到 `OperationCommand`（目前仅 VerticalScale 走 `buildVerticalScaleCommand`，其余弹窗各自 `submit.ts` 直接映射）；合并 `PodOperation` 进 `RuntimeOperation`；行内单 Pod 操作接入注册表。

### L4 读 / 写模型分离（CQRS-lite）

- **读（Query）**：Summary、Group 列表、Pod 分页列表、Pod 详情、日志/事件、集群列表 → 面向呈现，可派生缓存。
- **写（Command）**：`OperationCommand = { capability, targets, params }` → `Order`。
- 读模型演进不影响写契约。

### L5 操作会话层 Session（弹窗瞬态）

用 XState 承载"顺序拉取 + join + 联动"，产物即 `OperationCommand`。数据链抽为纯异步 loader；联动为显式事件 + `assign` actions；派生数据用 selector。

## 关系图

```
RuntimeScope(appEnvID, clusterId?, groupId?)          ← 查询坐标
   ├── RuntimeSummary ─ podStatistics / resourceRequirements     （读·投影）
   ├── WorkloadGroup[] ─┬─ Workload[](ResourceRef, ResourceSpec, updateStrategy, version)
   │                    └─ 组统计 / 版本列表 / 操作菜单
   └── Pod[](分页 + summary)
         └─ Pod(ResourceRef, ownerWorkloadRef, PodStatus, ResourceSpec)
              └─ Container[](ResourceSpec, ports/mounts/env, status)

Operation(capability, targetKind)
   └─ CapabilityRegistry ⇒ buildTargets/buildParams ⇒ OperationCommand ⇒ Order(异步)

值对象贯穿全层：ResourceRef / ResourceSpec+Quantity / PodStatusDescriptor / Version
```

## 类型草图（目标 Domain 层，示意非最终）

```ts
// 身份
export interface ResourceRef {
    clusterId: string;
    resourceType: string; // apps/v1/deployments | v1/pods ...
    name: string;
    // 注：CNAP 2.0 不向用户暴露 K8s namespace，资源身份不含 namespace 维度
}

// 资源规格值对象：内部规范化数值，对外可格式化
export interface Quantity {
    raw: string; // 接口原值，如 "64c" / "16Gi" / "960"
    value: number; // 规范化数值
    unit: string; // 展示单位
}
export interface ResourceSpec {
    cpu?: Quantity;
    memory?: Quantity;
    ephemeralStorage?: Quantity;
    gpus?: Array<{ vendor: string; model: string; profile: string; count: number; }>;
    others: Record<string, string>; // 其他扩展资源，例如 FPGA
}

// 状态描述符
export type StatusTone = 'SUCCESS' | 'INFO' | 'WARN' | 'ERROR';
export interface PodStatusDescriptor {
    raw: string;
    displayName: string;
    tone: StatusTone;
    isNormal: boolean;
}

// 能力注册表（当前基线：capability / targetKind / supportsBatch / dialog）
export interface CapabilityDef {
    capability: OperationCapability;
    targetKind: OperationTargetKind;
    supportsBatch: boolean; // 批量是否已实现；不参与批量栏成员判定（成员按 targetKind==='Pod' 派生）
    dialog?: DialogKey; // 弹窗 key；UI 层映射到组件，registry 不持有 React 组件
    // 后续可扩：buildTargets / buildParams（提交路径统一到 OperationCommand 时）
}

// 写模型
export interface OperationCommand {
    capability: OperationCapability;
    targets: Array<ResourceRef & { container?: string; params?: Record<string, unknown>; }>;
    params?: Record<string, unknown>;
}
```

## DTO ↔ Domain 映射（Adapter 层职责）

- `Pod`(DTO) → `Pod`(Domain)：`{clusterId,resourceType?,name}` → `ResourceRef`（不含 namespace）；`status` → `PodStatusDescriptor`；`resource*`(ResourceQuota) → `ResourceSpec`。
- `RuntimeWorkload` / `Workload`(两套 DTO) → 统一 `Workload`(Domain)。
- `RuntimeWorkloadContainer.resource*`(Record) 与 `containers[].resource*`(ResourceQuota) → `ResourceSpec`（两个 `toResourceSpec` 重载）。
- `RuntimeSummary.resourceRequirements`(字符串) → `ResourceSpec`。
- 弹窗表单值 → `OperationCommand`（经 `buildTargets/buildParams`）。

## 目录结构建议

```
src/interface/entities/        # DTO 层（保留，贴近接口）
src/domain/workload/           # 新增：Domain 层（纯 TS，无 React）
  ├── model.ts                 # ResourceRef / Workload / Pod / Container
  ├── resource.ts              # ResourceSpec / Quantity + parse/format
  ├── status.ts                # PodStatusDescriptor 注册表 + 分类派生
  ├── capability.ts            # CapabilityRegistry
  └── adapters.ts              # DTO ↔ Domain 转换
src/pages/Workloads/operations/<capability>/
  ├── loader.ts                # 多接口顺序调用 + join → 归一化
  ├── machine.ts               # XState：状态 + 事件 + 联动
  ├── build.ts                 # buildTargets/buildParams
  ├── selectors.ts             # context → view model
  └── XxxModal.tsx             # 仅渲染 + send(event)
src/pages/Workloads/operations/shared/
  └── resolveClusterParamsFromPods.ts   # Pod→group→workload 共享链
```

> 依赖方向：`src/domain/` 为纯逻辑层，可被 pages/hooks/capabilities 依赖，不依赖 React。落地时需在 `docs/architecture/module-boundaries.md` 的 Module Map 与依赖规则中补充 `domain/` 层（见 Open Questions）。

## 落地取舍

- **DTO 层保留**：接口在演进、字段有缺口，Domain 经 Adapter 从 DTO 转换，隔离波动。
- **优先级**：① ResourceSpec/Quantity ② PodStatus 注册表 ③ Operation 合并 + Capability Registry ④ ResourceRef + Workload 合一 ⑤ Session 状态机（试点：纵向扩缩弹窗，顺序依赖 + 联动最重）。
- **避免过度工程**：仅"顺序多接口 或 ≥2 组字段联动"的弹窗上状态机；简单弹窗用 hook。
- **乐观字段**：`pod.ts` 已定义但接口未返回的 `ports/volumeMounts/env` 子字段，Domain 层按可选处理，不假设存在。

## Open Questions

1. `src/domain/` 作为新分层需并入 `module-boundaries.md` 的依赖规则（放行 pages/hooks/capabilities → domain；domain 不依赖 React/组件）。
2. 数据获取是否引入查询缓存（当前仅 axios，无 react-query/swr）；读模型缓存策略待定，暂由各 hook 自管。
3. Capability → Dialog 组件的映射放在 UI 层（pages）还是 registry：建议 registry 只存纯数据/纯函数，组件映射留在 pages 层，避免 domain 依赖 React。

# RuntimeOperation capability 与 name 职责分离

## Status

**稳定设计原则**。本文定义 `RuntimeOperation` 中 `capability` 与 `name` 两个字段的职责边界与使用规则。所有运行时操作的触发路径必须遵循此约定。

## Purpose

消除「操作名硬编码在前端 API 封装层」的耦合，使同一 capability 能适配不同后端实现（不同应用类型可能对同一能力有不同的 operation name）。

## 核心原则

`RuntimeOperation` 接口（`src/interface/entities/runtimeOperation.ts:43`）返回的两个关键字段有**截然不同的职责**：

| 字段 | 类型 | 持有者 | 职责 | 使用场景 |
|------|------|--------|------|----------|
| `name` | `string` | 后端定义 | **后端实现标识**：告诉后端用哪一种处理逻辑来执行该操作。值会拼入 trigger API 的 URL 路径 `:operation` 段。 | 触发操作时的请求参数 |
| `capability` | `OperationCapability` | 后端定义、前端枚举约束 | **前端能力标识**：告诉前端这是哪一个操作（重启/扩缩/删除等），用于路由到正确的弹窗组件。 | 弹窗路由、按钮渲染、批量栏成员判定 |

### 关键约束

1. **capability → name 是 N:1 或 1:N 均可**：同一 capability 在不同应用类型下可能对应不同的 name；同一 name 理论上也可被多个 capability 复用（当前无此场景）。
2. **前端不得硬编码 name**：name 必须从 `/runtime/operations` 接口响应中获取，由调用方透传到 API 触发层。
3. **capability 是前端路由的唯一依据**：弹窗选择、按钮展示、批量栏组成全部依据 capability，不依赖 name。

## 当前数据流（改造前）

```
GET /runtime/operations  →  RuntimeOperation[]  ← 含 name + capability
                                   │
                    Header 按钮 / Pod 行操作点击
                                   │
                      仅提取 .capability 存入 state
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
      OperationModals        BatchActionBar       行内操作菜单
      (按 capability          (按 capability       (按 capability
       路由到弹窗)             路由到弹窗)           路由)
              │                    │                    │
              ▼                    ▼                    ▼
         RestartModal       BatchRestartPod     DeleteModalBase
         HorizontalScale                   (均未接收 operation 对象)
         VerticalScale
              │                    │
              └────────┬───────────┘
                       ▼
            API 封装层（硬编码 name）：
            restartWorkload()    → operation: 'workload-restart'
            horizontalScale()    → operation: 'workload-horizontal-scale'
            verticalScale()      → operation: 'workload-vertical-scale'
            restartPod()         → operation: 'pod.restart'
            deletePod()          → operation: 'pod-delete' / 'pod.delete-force'
```

**问题**：`name` 在 UI 层丢失，API 层只能硬编码。当新应用类型使用不同的 operation name 时，前端必须改代码。

## 目标数据流（改造后）

```
GET /runtime/operations  →  RuntimeOperation[]  ← 含 name + capability
                                   │
                    Header 按钮 / Pod 行操作点击
                                   │
              同时保留 .name 和 .capability
               （或将整个 operation 对象向下传递）
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
      OperationModals        BatchActionBar       行内操作菜单
      (接收 operationName     (接收 operationName   (接收 operationName
       + capability)          + capability)          + capability)
              │                    │                    │
              ▼                    ▼                    ▼
         各弹窗组件  ←── 接收 operationName 作为 prop
              │
              ▼
            API 封装层（动态 name）：
            restartWorkload(input, operation)    → operation: 参数传入
            horizontalScale(input, operation)
            verticalScale(input, operation)
            restartPod(input, operation)
            deletePod(input, operation)
```

## 影响范围

### 需要改造的文件

| 层级 | 文件 | 改动 |
|------|------|------|
| **API 层** | `src/api/runtimeOperation.ts` | 5 个包装函数新增 `operation` 参数，移除硬编码 |
| **Workload 弹窗路由** | `src/pages/Workloads/WorkloadsHeader/index.tsx` | `setActiveOp` 同时携带 operationName |
| **Workload 弹窗容器** | `src/pages/Workloads/WorkloadsHeader/OperationModals.tsx` | Props 新增 `operationName`，透传给子弹窗 |
| **Restart 弹窗** | `src/pages/Workloads/operations/restart/machine.ts` | submit actor 传入 operationName |
| **HorizontalScale 弹窗** | `src/pages/Workloads/operations/horizontalScale/machine.ts` | 同上 |
| **VerticalScale 弹窗** | `src/pages/Workloads/operations/verticalScale/machine.ts` | 同上 |
| **Pod 批量重启** | `src/pages/Workloads/operations/batchRestart/BatchRestartPodModal/index.tsx` | Props 新增 operationName，传入 restartPod |
| **Pod 删除/强删** | `src/pages/Workloads/operations/batchDelete/DeleteModalBase.tsx` | Props 新增 operationName，传入 deletePod |
| **Pod 弹窗调用方** | `src/pages/Workloads/index.tsx`（或实际渲染 Pod 弹窗的父组件） | 传递 operationName |

### 不需要改动的文件

- `src/interface/entities/runtimeOperation.ts` — 类型定义不变
- `src/domain/workload/capability.ts` — 注册表仍以 capability 为 key，不涉及 name
- 弹窗 UI 组件（`*Modal/index.tsx`, `ClusterTable.tsx`）— 不直接调 API，仅通过 machine/state 间接关联

## 向后兼容

- 本次改造为**破坏性变更**：API 包装函数的 `operation` 参数为必填，所有调用方必须同步改造，不存在"部分迁移、部分兜底"的中间状态。
- 改造必须全链路一次性完成（Phase 1~3 为原子操作），不可分批上线。

## Related Docs

- 真源类型：`src/interface/entities/runtimeOperation.ts`
- 领域模型：`docs/architecture/workload-domain-model.md`（L3 Capability Registry / L4 CQRS 写模型）
- 操作弹窗实现计划：`docs/plans/2026-07-25-workload-operation-dialogs-plan.md`

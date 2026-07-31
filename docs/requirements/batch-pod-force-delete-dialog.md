# Feature: 批量强制删除 Pod 弹窗

> 状态：已实现（2026-07-25，plan `docs/plans/2026-07-25-workload-batch-operations-plan.md`）
> 父需求：`docs/requirements/workloads-page.md`
> 来源：用户指令 + Figma 设计稿
> 关联：`docs/requirements/batch-pod-delete-rebuild-dialog.md`（批量删除重建 Pod 弹窗）

## Goal

提供批量强制删除 Pod 的确认弹窗：用户在 Pod 列表页选中 Pod 后，弹窗展示待操作 Pod 清单预览和集群参数（只读），用户确认后执行强制删除操作。本弹窗与「批量删除重建 Pod 弹窗」在布局、Pod 列表、集群参数、交互流程上完全一致，仅文案与提交接口不同。

> **实现倾向**：实现时复制删除重建弹窗代码作为起点，再在其上修改文案与接口，而非在同一个组件中通过参数区分二者。本需求文档不约束具体组件实现方式，仅描述用户可见行为与接口契约。

## 与删除重建弹窗的差异

除下表所列差异外，其余（弹窗尺寸、布局结构、Pod 列表、集群参数配置、交互流程、Edge Cases、Acceptance Criteria）均与 `batch-pod-delete-rebuild-dialog.md` 一致，不再重复。

| 差异项       | 删除重建                                                                       | 强制删除                                                                              |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| 触发入口     | BatchActionBar「删除重建」按钮                                                 | BatchActionBar「强制删除」按钮（危险操作，红色文字，左侧分隔线）                      |
| 标题         | "批量删除重建Pod"                                                              | "批量强制删除Pod"                                                                     |
| 功能说明文案 | "删除重建操作将触发集群释放当前 Pod 并重新申请、重新启动的过程"                | "强制删除操作将强制释放当前 Pod 并重新申请、重新启动的过程"（文案待产品确认）         |
| 操作提示区   | 描述删除重建的关键影响（销毁+重建、Evicted 彻底删除）                          | 描述强制删除的关键影响（强制销毁+重建，语义同删除重建但强调"强制"）（文案待产品确认） |
| 提交接口     | `runtimeOperationApi.deletePod({ ..., force: false })`，operation `pod.delete` | `runtimeOperationApi.deletePod({ ..., force: true })`，operation `pod.delete-force`   |
| 成功提示     | "批量删除重建命令已下发，查看执行详情"                                         | "批量强制删除命令已下发，查看执行详情"                                                |

## In Scope

- 弹窗布局：标题栏、操作提示区、待强制删除 Pod 列表（只读预览）、集群参数配置（只读）、底部操作栏
- 弹窗尺寸：宽度 800px，高度自适应
- 操作提示区：使用 antd Alert 组件（warning 类型）展示强制删除关键影响
- Pod 列表：只读表格，列含 Pod 名称、所属工作负载、集群、状态
- 集群参数区：由所选 Pod 聚合集群，从对应 Workload 的 `updateStrategy` 和 `availabilityTarget` 读取参数，只读展示
- 提交接口 `runtimeOperationApi.deletePod({ force: true })` 请求体组装
- 提交成功后关闭弹窗，展示成功提示含"查看执行详情"链接
- 从 Pod 列表页 BatchActionBar 的"强制删除"按钮触发

## Out Of Scope

- 单个 Pod 的强制删除（Pod 行内操作）
- 操作进度追踪/状态轮询
- 操作的撤销/回滚
- 操作历史/审计日志
- 取消正在进行的操作
- 删除重建弹窗的具体实现（见 `batch-pod-delete-rebuild-dialog.md`）

## Main User Flows

### 流程 1：标准强制删除流程

1. 用户在 Pod 列表页勾选多个 Pod，底部 BatchActionBar 浮现
2. 用户点击"强制删除"按钮
3. 弹窗打开，Pod 列表展示所选 Pod，集群参数区加载中
4. 集群参数加载完成后用户查看 Pod 列表和参数（均为只读）
5. 用户点击"确定"，按钮进入 loading 态
6. 成功后：弹窗关闭 → 展示成功提示"批量强制删除命令已下发，查看执行详情"（含链接）
7. 失败时：弹窗保持打开，展示 Alert 错误提示，数据保留

### 流程 2：取消操作

1. 点击取消或关闭按钮 → 弹窗关闭，不执行任何操作

## Business Rules

- **Pod 列表**：展示用户进入弹窗前选中的所有 Pod（只读，不可增删）
- **集群参数**：由所选 Pod 的 `clusterId` 去重聚合集群；每个集群从对应的 Workload 对象获取 `maxUnavailable` / `maxSurge` / `availabilityTarget`，只读展示
- **集群参数数据链**：Pod（含 `clusterId`、`workloadName`）→ 通过 `workloadName` 匹配 WorkloadGroup 获取 `groupId` → 调用 `GET /runtime/workloads?groupId=xxx` 获取 `RuntimeWorkload[]` → 按 `clusterId` 匹配各集群的 `updateStrategy` / `availabilityTarget`
- **强制删除行为**：与删除重建一致的"先删除 Pod，再重建 Pod"流程，但以强制（force）方式执行
- **Evicted 状态 Pod**：处于已驱逐状态的 Pod 会被彻底删除（不再创建新 Pod）；其他状态的 Pod 会创建新的 Pod
- **提交成功提示**：接口成功返回后提示"批量强制删除命令已下发，查看执行详情"，其中"查看执行详情"为链接，链接地址暂未确定
- **appEnvID 来源**：由调用方通过 props 传入

## Roles / Permissions

角色/权限对弹窗 UI 无差异化影响。操作权限由后端 API 校验，前端根据后端返回的权限错误码展示提示。本需求不涉及前端权限控制逻辑。【待确认】

## Edge Cases

| 状态                         | 表现                                                       |
| ---------------------------- | ---------------------------------------------------------- |
| 仅选中 1 个 Pod              | Pod 列表仅一行                                             |
| 跨集群选中 Pod               | 集群参数区按集群分组展示多行，每行对应集群的 Workload 参数 |
| 所选 Pod 中包含 Evicted 状态 | Pod 列表中该行状态 Tag 显示"已驱逐"                        |
| 集群参数 API 加载中          | 集群参数区展示 Spin loading                                |
| 集群参数 API 失败            | 对应集群行展示"加载失败"占位文本                           |
| 提交接口报错                 | 弹窗保持打开，顶部展示 Alert 错误提示，数据保留            |
| 权限不足                     | 提交后展示 Alert "无操作权限"提示                          |
| 并发提交                     | loading 期间确定按钮 disabled                              |
| 弹窗内容超出高度             | 内容区域滚动，底部操作栏固定                               |

## Acceptance Criteria

- [ ] Pod 列表页 BatchActionBar 的"强制删除"按钮可点击并打开弹窗
- [ ] 弹窗标题"批量强制删除Pod"，展示环境上下文信息
- [ ] 标题下方展示功能说明文案（描述强制删除行为）
- [ ] 操作提示区使用 Alert 组件（warning 类型）展示关键影响
- [ ] 待强制删除 Pod 列表正确展示所选 Pod（名称、工作负载、集群、状态），数量与标题计数一致
- [ ] Pod 列表和集群参数均为只读，不可编辑
- [ ] 集群参数正确从 Pod → WorkloadGroup → RuntimeWorkload 数据链获取，按集群分组展示
- [ ] 可用度为空时显示"未启用"
- [ ] Evicted 状态 Pod 以 Tag 正确标识
- [ ] 提交成功后弹窗关闭，展示提示"批量强制删除命令已下发，查看执行详情"，含链接
- [ ] 提交失败时弹窗保持打开，展示 Alert 错误提示
- [ ] 集群参数加载失败时对应行展示"加载失败"
- [ ] 权限不足时展示"无操作权限"提示
- [ ] 提交 loading 期间确定按钮 disabled
- [ ] 取消按钮点击后弹窗关闭不执行操作

## Open Questions

- **[非阻塞]** "查看执行详情"链接的目标地址暂未确定：不构成阻塞，实现时先以纯文字占位（不挂载真实跳转），待地址确定后再接入
- **[非阻塞]** 功能说明文案与操作提示区文案的最终措辞待产品确认
- **[非阻塞]** 集群参数区多集群时，每行是否需要在集群列前展示 checkbox 供用户选择是否对特定集群执行操作？（当前设计：所有集群均执行）

## Implementation Notes

### Modal Props

弹窗组件由 Pod 列表页调用，入参仅包含选中的 Pod 基本信息：

```ts
interface BatchPodForceDeleteModalProps {
    appEnvID: number;
    pods: { clusterId: string; name: string; }[];
}
```

### 触发接口

提交时调用封装的 API 方法，参照源码 `src/api/runtimeOperation.ts`：

```ts
import runtimeOperationApi from '@/api/runtimeOperation';

runtimeOperationApi.deletePod({
    appEnvID: number,
    targets: [
        { clusterId: 'cluster-a', resourceType: 'v1/pods', name: 'pod-a' },
    ],
    force: true, // 强制删除
});
```

`force: true` 时 operation 为 `pod.delete-force`，对应 API 路径 `POST /rest/v1/application-environments/:appEnvID/runtime/operations/pod.delete-force/trigger`。`targets[].resourceType` 默认为 `'v1/pods'`。

**请求体字段映射**：

| 字段                     | 来源                    |
| ------------------------ | ----------------------- |
| `targets[].clusterId`    | 所选 Pod → `clusterId`  |
| `targets[].resourceType` | 默认 `'v1/pods'`        |
| `targets[].name`         | 所选 Pod → `name`       |
| `force`                  | 固定 `true`（强制删除） |

### API 依赖

| 接口                                                                                           | 用途                                                       |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `GET /rest/v1/application-environments/:appEnvID/runtime/pods`                                 | Pod 列表数据（name / workloadName / clusterName / status） |
| `GET /rest/v1/application-environments/:appEnvID/runtime/groups`                               | 通过 workloadName 匹配获取 groupId                         |
| `GET /rest/v1/application-environments/:appEnvID/runtime/workloads?groupId=xxx`                | 集群参数（maxUnavailable / maxSurge / availabilityTarget） |
| `POST /rest/v1/application-environments/:appEnvID/runtime/operations/pod.delete-force/trigger` | 触发强制删除                                               |

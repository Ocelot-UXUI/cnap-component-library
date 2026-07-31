# Feature: 纵向扩缩弹窗

> 状态：已评审定稿（2026-07-25）
> 来源：Figma 设计稿「Frame 1912057556」+ API 文档 `docs/input/source-api-runtime-workloads.md`
> 父需求：`docs/requirements/workloads-page.md`（从标题栏操作按钮"纵向扩缩"打开）

## Goal

提供批量纵向扩缩 Workload 容器资源配置（CPU/内存/存储的 requests 和 limits）的弹窗交互：用户选择工作负载（Group）和目标容器，按集群维度为每个 Workload 单独配置资源规格。

> `targetKind` 为 `Workload`，通过 `targets[].container` 指定目标容器。

## In Scope

- 弹窗布局：标题栏、Group、容器选择器、资源配置表格（CPU/内存/存储 Req/Lim + 单位选择器）、底部操作栏
- 弹窗尺寸：宽度 1024px，高度自适应
- Group 选择 → 容器选择器 + Workload 表格联动加载
- 容器选择器：从 Workload 列表聚合 `containers[].name` 去重，默认选中第一个
- 选中容器后按容器过滤 Workload，仅展示包含该容器的 Workload 的集群行
- 每个 Workload 行：CPU、内存、存储（ephemeralStorage）三项资源的 Req+Lim 数值输入 + 单位选择
- 资源单位枚举：CPU → c（core）、nc（nanocore）；内存 → Mi、Gi、Ti；存储 → Mi、Gi、Ti
- 值与单位分割/拼接：接口返回的资源值为"数字+单位"拼接字符串，页面需分割为数值与单位分别展示；提交时再将数值与单位拼接回字符串
- 集群选中态驱动资源项可用性：未选中集群时该行所有资源项（Req 与 Limit）及 Limit 复选框均为禁用态；选中集群时资源项启用且 Limit 复选框自动勾选；取消集群选中时 Limit 值同步为 Req 值并取消 Limit 勾选，资源项回到禁用态
- 校验：数值为正数、同一资源项 Limit ≥ Req（CPU/内存/存储均适用）、至少选中一个集群
- 提交接口 `runtimeOperationApi.verticalScale()` 的请求体组装（resourceLimits/resourceRequests 置于 targets[].params 下，由 verticalScale() 内部封装）
- 从 workloads-page 标题栏"纵向扩缩"按钮触发
- 若用户在 workloads-page 已选中某个工作负载（Group），则该 Group 作为 Modal 入参带入，设为 Group 选择器的默认值

## Out Of Scope

- 批量修改多个容器的资源配置（一次只操作一个容器）
- 资源配置模板/预设
- 扩缩进度追踪
- 扩缩操作的撤销/回滚
- 操作确认二次弹窗

## Main User Flows

### 流程 1：标准纵向扩缩流程

1. 用户在 workloads-page 点击"纵向扩缩"按钮
2. 弹窗打开（1024px 宽），Group 下拉框加载中
3. 用户选择 Group
4. 系统加载 Workload 列表 → 聚合容器名填容器选择器（默认第一个）→ 以选中容器过滤 Workload（只保留包含该容器的）→ 渲染表格，各行 CPU/内存/存储默认值为选中容器当前值
5. 用户切换容器 → 表格中 CPU/内存/存储值重新初始化为新容器当前值（覆盖用户已有修改）
6. 用户勾选 Workload 行（集群），该行 CPU/内存/存储的 Req 与 Limit 输入框由禁用态变为可编辑，Limit 复选框自动勾选；用户修改各项 Req 和 Lim 值
7. 用户可选：手动取消 Limit 复选框使该资源项 Lim 同步 Req 值并禁用；或取消集群勾选，此时该行所有资源项回到禁用态，Limit 值同步 Req 并取消 Limit 勾选
8. 所有填写合法后点击"确定"，按钮进入 loading 态
9. 成功后关闭弹窗，展示成功提示"纵向扩缩命令已下发，查看执行详情"（含链接）
10. 失败时弹窗保持打开，显示错误信息，已填数据保留

### 流程 2：带入已选工作负载

1. 用户在 workloads-page 已选中某个工作负载（Group），然后点击"纵向扩缩"
2. 弹窗打开，Group 选择器默认值设为该已选中的工作负载，并自动加载对应 Workload 数据
3. 后续同流程 1 的第 4-10 步

### 流程 3：切换 Group 或容器

1. 切换 Group → 重新聚合容器列表 → 默认选中第一个 → 以选中容器过滤 Workload → 表格刷新，CPU/内存/存储初始化为新容器值，清空勾选状态
2. 切换容器 → 以新容器名过滤 Workload → 表格重新渲染，CPU/内存/存储初始化为新选中容器的当前值，清空勾选状态

### 流程 4：取消操作

1. 点击取消 → 关闭弹窗，不执行操作，不做二次确认

## Business Rules

- **容器切换过滤表格**：切换容器后，以当前选中容器名为条件过滤 Workload 列表（只保留 `containers[]` 中包含该容器名的 Workload），按过滤后的 Workload 重新渲染集群表格，清空已有勾选状态
- **容器切换重置数据**：切换容器后，表格中 CPU/内存/存储所有值重新初始化为新选中容器在各过滤后 Workload 中的当前值（覆盖用户已有修改）
- **资源项与单位枚举**：表格展示 CPU、内存、存储（ephemeralStorage）三项资源，每项均含 Req 与 Limit。单位枚举：CPU → c（core）、nc（nanocore）；内存 → Mi、Gi、Ti；存储 → Mi、Gi、Ti
- **值与单位分割/拼接**：接口返回的资源值（`containers[].resourceRequests.*` / `resourceLimits.*`）为"数字+单位"拼接字符串（如 `64c`、`16Gi`、`100Gi`），页面需将其分割为数值与单位分别填入输入框和单位选择器；提交时将每项的数值与单位重新拼接为字符串（如 `64` + `c` → `64c`）作为 `resourceLimits`/`resourceRequests` 字段值
- **集群选中与资源项联动**：默认（集群未选中）该行所有资源项的 Req/Limit 输入框、单位选择器及 Limit 复选框均为禁用态；选中集群后该行资源项启用可编辑，且 Limit 复选框自动勾选（Limit 初始值取 Req 当前值）；取消集群选中后，该行 Limit 值同步为 Req 值、Limit 复选框取消勾选，所有资源项回到禁用态
- **Limit 与 Req 关系**：同一资源项（CPU/内存/存储）的 Limit 值不得小于其 Req 值，否则对应 Limit 输入框标红
- **Limit 复选框手动操作**：在集群已选中的前提下，用户可手动取消 Limit 复选框，取消后该资源项 Limit 输入框值同步为 Req 值，输入框和单位选择器置灰禁用；重新勾选后恢复可编辑
- **数值校验**：CPU/内存/存储数值必须为正数
- **确定按钮可用条件**：至少选中一个集群且所有选中行的 CPU/内存/存储值均合法
- **appEnvID 来源**：由调用方通过 props 传入

## Roles / Permissions

角色/权限对弹窗 UI 无差异化影响。操作权限由后端 API 校验，前端根据后端返回的权限错误码展示提示。本需求不涉及前端权限控制逻辑。【待确认】

## Edge Cases

| 状态                            | 表现                                               |
| ------------------------------- | -------------------------------------------------- |
| Group 列表为空                  | 工作负载 Select 展示空状态提示                     |
| 选中 Group 后容器聚合为空       | 容器 Select 展示空状态提示，集群表格展示空状态     |
| 选中 Group 后 Workload 列表为空 | 集群表格区域展示空状态提示                         |
| CPU/内存/存储输入负数或 0       | 校验失败，输入框标红                               |
| 同资源项 Limit < Req            | 对应资源项 Limit 输入框标红                        |
| 接口请求中                      | 确定按钮展示 loading 态，禁用点击                  |
| Group/Workload 查询接口报错     | 对应区域展示内联错误提示                           |
| 提交接口报错                    | 弹窗保持打开，弹窗内展示内联错误信息，已填数据保留 |
| 权限不足                        | 提交接口返回权限错误时，弹窗内展示"无操作权限"提示 |
| 集群未选中                      | 该行所有资源项（Req/Limit）及 Limit 复选框禁用     |
| 并发提交                        | loading 期间确定按钮 disabled                      |

## Acceptance Criteria

- [ ] 点击 workloads-page"纵向扩缩"按钮后弹窗正常打开（1024px 宽）
- [ ] 若用户在 workloads-page 已选中工作负载，Group 下拉框默认值正确设为该工作负载并自动加载数据
- [ ] 标题栏显示"纵向扩缩"标题、环境信息、功能说明
- [ ] Group 下拉框数据正确加载自 `runtimeResourceApi.getWorkloadGroups()`
- [ ] 选择 Group 后容器选择器正确聚合去重，默认选中第一个
- [ ] 选择 Group 后表格正确渲染，每行列：复选框、集群、CPU Req/Lim、内存 Req/Lim、存储 Req/Lim、最大不可用、最大可超出、可用度
- [ ] CPU/内存/存储输入框初始值为选中容器在各 Workload 中的当前值（由返回字符串分割为数值与单位）
- [ ] CPU 单位选择器选项：c、nc；内存单位选择器选项：Mi、Gi、Ti；存储单位选择器选项：Mi、Gi、Ti
- [ ] 集群未选中时该行所有资源项（Req/Limit）及 Limit 复选框均为禁用态
- [ ] 选中集群后该行资源项启用可编辑，且 Limit 复选框自动勾选
- [ ] 取消集群选中后：Limit 值同步为 Req 值，Limit 复选框取消勾选，该行资源项回到禁用态
- [ ] 在集群已选中时手动取消 Limit 复选框后：值同步为 Req 值，输入框和单位选择器均置灰；重新勾选后恢复可编辑
- [ ] 输入负数或 0 时校验失败，输入框标红
- [ ] 同资源项 Limit < Req 时对应 Limit 输入框标红
- [ ] 未勾选任何行时确定按钮 disabled，底部提示"请选择一个集群后，再发起确定"
- [ ] 至少勾选一行且所有值合法后确定按钮可点击
- [ ] 切换容器后以新容器名过滤 Workload，表格重新渲染并初始化 CPU/内存/存储值，清空勾选状态
- [ ] 提交时各资源项的数值与单位正确拼接为字符串（如 64 + c → 64c）
- [ ] 切换 Group 后容器选择器和表格正确刷新
- [ ] 提交成功后弹窗关闭，展示提示"纵向扩缩命令已下发，查看执行详情"，含链接
- [ ] 提交失败时弹窗保持打开，显示错误信息，已填数据保留
- [ ] 提交 loading 期间确定按钮 disabled

## Open Questions

- **[非阻塞]** "查看执行详情"链接的目标地址暂未确定：不构成阻塞，实现时先以纯文字占位（不挂载真实跳转），待地址确定后再接入
- **[非阻塞]** 提交失败时是否支持行级错误提示（精确到哪个 Workload 的资源值不合法）？
- **[非阻塞]** 接口返回的资源值单位若不在当前枚举内（如 CPU 返回 millicore `m`），前端如何处理（转换到枚举单位 or 原样展示）？

## Implementation Notes

### 弹窗结构

#### 头部区域

- **标题**："纵向扩缩"
- **环境信息**：格式 "环境 : 环境名称"，位于标题右侧、以分隔线隔开
- **关闭按钮**：右上角 X 图标
- **功能介绍文字**：字号 12px，灰色，"纵向扩缩是在保持当前集群Pod数量的前提下，调整Pod的资源规格，Pod规格可按集群调整。"

#### 工作负载与容器选择（必选）

- **工作负载选择器**：数据来源 `runtimeResourceApi.getWorkloadGroups()`，外部带入时预填
- **容器选择器**：从 Workload 列表聚合 `containers[].name` 去重，默认第一个
- **联动**：选 Group → 加载 Workload → 聚合容器 → 默认第一个 → 以选中容器过滤 Workload → 填充表格
- **切换容器**：以新容器名过滤 Workload，表格重新渲染，CPU/内存/存储值初始化为新容器在过滤后 Workload 中的当前值，清空勾选状态

#### 资源配置表格

| 列         | 说明                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| 复选框     | 选中/取消选中该 Workload（集群）                                               |
| 集群       | 集群名称（`clusterName`），前带供应商图标                                      |
| CPU        | Req 行（数值输入 + 单位选择 c/nc）+ Lim 行（复选框 + 数值输入 + 单位选择）     |
| 内存       | Req 行（数值输入 + 单位选择 Mi/Gi/Ti）+ Lim 行（复选框 + 数值输入 + 单位选择） |
| 存储       | Req 行（数值输入 + 单位选择 Mi/Gi/Ti）+ Lim 行（复选框 + 数值输入 + 单位选择）       |
| 最大不可用 | 只读，`updateStrategy.maxUnavailable`                                          |
| 最大可超出 | 只读，`updateStrategy.maxSurge`                                                |
| 可用度     | 只读，`availabilityTarget`，为空显示"未启用"                                   |

- 内容行高 88px，表头行高 48px

**资源列（CPU / 内存 / 存储）单元格展示**（依据 Figma Frame 1912057556）：

每个资源列的单元格为**上下两行**，垂直居中排列，两行间距 8px：上行为 **Req**、下行为 **Lim**。每行从左到右由四部分组成：

| 位置 | 元素       | 说明                                                                                                                                                                                    |
| ---- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 状态图标   | Req 行为选中态图标（Req 恒启用）；Lim 行为**复选框**（勾选/取消，语义见下方「Limit 行」，此处仅描述展示）                                                                               |
| 2    | 标签       | `Req` / `Lim` 文本，14px                                                                                                                                                                |
| 3    | 数值输入框 | 宽 60px、高 32px，圆角 8px（`radius.lg`），默认中性灰边框（`semantic.state.component.borderDefault`）                                                                                   |
| 4    | 单位选择器 | 宽 60px、高 32px，圆角 8px 的 Select，形态为"单位文本（左）+ 下拉箭头（右）"；单位候选**以各资源单位枚举为准**（CPU: c/nc；内存: Mi/Gi/Ti；存储: Mi/Gi/Ti），视觉稿中的单位取值为占位、不作准 |

- **禁用态**（Lim 未勾选或集群未选中）：该行数值与单位文本置灰（`semantic.text.disabled`），数值输入框与单位选择器不可编辑。
- **校验错误态**（如同资源项 Lim < Req 或输入非法值）：对应行的数值输入框与单位选择器边框变红（`semantic.state.error`）。

**Limit 行**：Limit 复选框的可用性与勾选态由集群选中状态驱动——集群未选中时整行禁用且复选框不可用；选中集群时复选框自动勾选，Limit 输入框默认取 Req 当前值；取消集群选中时 Limit 值同步 Req、复选框取消勾选、整行禁用。集群已选中时用户可手动取消/勾选 Limit 复选框，手动取消后 Limit 值同步 Req 并置灰，重新勾选后恢复可编辑。

#### 底部操作栏

- **左侧**：提示文字。未选中时"请选择一个集群后，再发起确定"
- **右侧**：取消 + 确定按钮，样式遵循组件库默认规范

### 数据来源基线

| 表格列     | 类型 | 数据接口                                   | 字段                                             |
| ---------- | ---- | ------------------------------------------ | ------------------------------------------------ |
| 复选框     | 选择 | --（前端状态）                             | --                                               |
| 集群       | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `clusterName`                                    |
| CPU Req    | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceRequests.cpu`              |
| CPU Lim    | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceLimits.cpu`                |
| 内存 Req   | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceRequests.memory`           |
| 内存 Lim   | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceLimits.memory`             |
| 存储 Req   | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceRequests.ephemeralStorage` |
| 存储 Lim   | 输入 | `runtimeResourceApi.getRuntimeWorkloads()` | `containers[].resourceLimits.ephemeralStorage`   |
| 最大不可用 | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `updateStrategy.maxUnavailable`                  |
| 最大可超出 | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `updateStrategy.maxSurge`                        |
| 可用度     | 展示 | `runtimeResourceApi.getRuntimeWorkloads()` | `availabilityTarget`                             |

> 表格仅展示 `containers[]` 中包含当前选中容器名的 Workload。初始化值：根据弹窗级容器选择器当前容器名，在 Workload 的 `containers[]` 中找到对应容器的 `resourceLimits` 和 `resourceRequests` 预填。切换容器时重新初始化。
>
> **值与单位分割**：上述资源字段返回值为"数字+单位"拼接字符串（如 `64c`、`16Gi`、`100Gi`）。页面展示时需按各资源项的单位枚举（CPU: c/nc；内存: Mi/Gi/Ti；存储: Mi/Gi/Ti）将字符串解析为数值与单位，分别填入数值输入框和单位选择器。

### 触发接口

```ts
import runtimeOperationApi from '@/api/runtimeOperation';

runtimeOperationApi.verticalScale({
    appEnvID: number,
    targets: [
        {
            clusterId: 'cluster-a',
            resourceType: 'apps/v1/deployments',
            name: 'api',
            container: 'api',
            // 提交前将各资源项的数值与单位拼接为字符串
            resourceLimits: { cpu: '64c', memory: '16Gi', ephemeralStorage: '100Gi' },
            resourceRequests: { cpu: '64c', memory: '16Gi', ephemeralStorage: '100Gi' },
        },
    ],
});
```

> 注：`verticalScale()` 内部将 `resourceLimits`/`resourceRequests` 置于 `targets[].params` 下发送（见 `src/api/runtimeOperation.ts:138`），调用方按上述顶层字段传入即可。前端仅依赖该封装好的 RESTful 接口，不关心底层 operation name。

**请求体字段映射**：

| 字段                         | 来源                                         |
| ---------------------------- | -------------------------------------------- |
| `targets[].clusterId`        | 勾选 Workload 行 → `clusterId`               |
| `targets[].resourceType`     | 勾选 Workload 行 → `resourceType`            |
| `targets[].name`             | 勾选 Workload 行 → `name`                    |
| `targets[].container`        | 容器选择器当前值                             |
| `targets[].resourceLimits`   | 该行 CPU/内存/存储 Lim 的数值+单位拼接字符串 |
| `targets[].resourceRequests` | 该行 CPU/内存/存储 Req 的数值+单位拼接字符串 |

### API 依赖

| 接口                                                                       | 用途               |
| -------------------------------------------------------------------------- | ------------------ |
| `runtimeResourceApi.getWorkloadGroups()`（`src/api/runtimeResource.ts`）   | 查询 Group 列表    |
| `runtimeResourceApi.getRuntimeWorkloads()`（`src/api/runtimeResource.ts`） | 查询 Workload 列表 |
| `runtimeOperationApi.verticalScale()`（`src/api/runtimeOperation.ts`）     | 触发纵向扩缩       |

### 与重启弹窗的差异

| 项目       | 纵向扩缩                       | 重启                              |
| ---------- | ------------------------------ | --------------------------------- |
| 可编辑字段 | CPU/内存/存储 Req/Lim          | 最大不可用                        |
| 容器选择   | 弹窗级选择器（与重启一致）     | 弹窗级选择器（过滤表格 + 入 API） |
| 超时时间   | 无                             | 有（exitTimeoutSeconds）          |
| 只读字段   | 最大不可用、最大可超出、可用度 | 最大可超出、可用度                |
| 弹窗宽度   | 1024px                         | 800px                             |

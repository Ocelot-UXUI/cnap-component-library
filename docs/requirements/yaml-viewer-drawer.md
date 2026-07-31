# Feature: 工作负载 / Pod YAML 查看抽屉

> 状态：已实现（2026-07-29，plan `docs/plans/2026-07-29-yaml-viewer-drawer-plan.md`）
> 来源：Figma 视觉设计（Rectangle 1908）、`pod-list-content-area.md`（子需求）、Raw Resource API、CNAP 1.0 用户指南
> 父需求：—（独立 feature，后续插入对应父需求）

## Goal

在工作负载页面（Workloads）中，支持用户查看工作负载组（WorkloadGroup）和单个 Pod 的 Kubernetes 原始 YAML 配置。点击按钮后，从页面右侧滑出 Drawer（抽屉）组件，以只读代码视图（CodeMirror 6，支持语法高亮与代码折叠）展示 YAML 内容。本期仅支持 YAML，JSON 查看能力留待后续扩展。

## Background

现有的 `pod-list-content-area.md` 需求已在 GroupHeader 下拉菜单中预留了"工作负载 YAML"菜单项，但其**右侧抽屉的实现被明确标记为超范围**。同时，`src/api/rawResource.ts` 已定义了获取 K8s 资源原始 YAML/JSON 的 API（`getCoreResource` 和 `getGroupVersionResource`），但尚未被消费。此外，CNAP 1.0 用户指南中将"查看 yaml"列为 Pod 级别的标准操作。

本需求将补齐这两个入口（工作负载级和 Pod 级）的 YAML 查看功能，共享同一个 Drawer 组件。

## In Scope

### 0. 共享 YAML Drawer 组件（YamlDrawer）

设计一个可复用的 Drawer 组件，用于展示任意 K8s 资源的原始 YAML：

**Drawer 结构（参考 PodDetailDrawer 模式和 Figma "Rectangle 1908" 设计稿）：**

```
┌─ Drawer (右侧滑出) ───────────────────────────────┐
│ [关闭按钮] 标题                                     │
│ ├─────────────────────────────────────────────────┤│
│  应用: xxx  集群: xxx  命名空间: xxx               │
│ ├─────────────────────────────────────────────────┤│
│ │                                                   │
│ │  YAML 代码展示区域（CodeMirror 6，只读）           ││
│ │  - 语法高亮                                        ││
│ │  - 行号显示                                        ││
│ │  - 折叠槽（可折叠/展开 YAML 缩进块）               ││
│ │  - 选中复制                                        ││
│ │                                                   ││
│ ├─────────────────────────────────────────────────┤│
│                                    [关闭]            │
└──────────────────────────────────────────────────────┘
```

| 区域        | 说明                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| Drawer 容器 | antd `Drawer`，右侧滑出，宽度 980px（与 PodDetailDrawer 一致）                               |
| 标题栏      | 根据入口显示不同标题：工作负载 YAML / Pod YAML                                               |
| 搜索框      | YAML 展示区上方一行 antd `Input`，`placeholder="搜索 yaml 内容"`，键入即在展示区高亮全部匹配 |
| YAML 展示区 | CodeMirror 6 只读视图，支持语法高亮、行号、代码折叠、搜索高亮                                |
| 底部        | 关闭按钮（antd Button）                                                                      |

**Drawer 交互：**

- 打开方式：从右侧滑入
- 关闭方式：点击右上角关闭图标（antd Drawer 内置）、点击遮罩层、按 ESC 键
- 加载失败：显示错误提示 + 重试入口（参照 PodDetailDrawer 的错误处理模式）
- 加载中：内容区显示 Spin

> **底部关闭按钮为本需求新增**：作为 Drawer 参考的 PodDetailDrawer 本身没有底部关闭按钮（仅用 antd 内置右上角关闭）。本需求的底部关闭按钮是新增设计，与设计稿对齐。

**组件签名（Props）：**

```typescript
type YamlDrawerEntry = 'workload' | 'pod';

interface YamlDrawerProps {
    open: boolean;
    onClose: () => void;
    /** Drawer 标题将根据 entry 自动设置为"工作负载 YAML"或"Pod YAML" */
    entry: YamlDrawerEntry;
    /** API 调用参数 */
    appEnvID: string;
    clusterId: string;
    namespace: string;
    resourceType: string;
    resourceName: string;
    /** 显示用信息 */
    clusterName?: string;
    appName?: string;
    kind?: string;
}
```

Drawer 复用：工作负载 YAML 和 Pod YAML 共享同一个 `<YamlDrawer>` 组件，通过 `entry` prop 区分标题

> **entry 映射**：Workload 入口传入 `entry: 'workload'`，Drawer 标题显示"工作负载 YAML"。

### 1. 工作负载级入口（Workload YAML）

**触发位置**：GroupHeader（分组标题）右侧 `⋮` 下拉菜单 → "工作负载 YAML"

**当前状态**：

- `GroupHeader.tsx` 中已存在 `key: 'workload-yaml'` 的菜单项
- 已实现 `disabled: !clusterSelected` 的启用条件
- **缺少** `onClick` 回调处理

**所需改动**：

| 改动项                     | 说明                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| `GroupHeader.tsx`          | 为 `<Dropdown>` 添加 `menu.onClick` 回调，处理 `'workload-yaml'` 键    |
| `GroupHeaderProps`         | 新增 `onYamlView?: () => void` 回调属性                                |
| `PodGroupTable.tsx`        | 接收 `onYamlView` 属性，透传给 `GroupHeader`                           |
| `PodContentArea/index.tsx` | 管理 `yamlViewState`（存当前 WorkloadGroup 信息），渲染 `<YamlDrawer>` |

**点击行为**：

1. 用户 hover GroupHeader 右侧 `⋮` 菜单
2. 下拉菜单展开
3. 用户点击"工作负载 YAML"（未选集群时置灰不可点）
4. 系统获取该 WorkloadGroup 下第一个 Workload 的信息（`clusterId`、`namespace`、`resourceType`、`name`）
5. 打开右侧 Drawer，调用 API 获取 YAML 内容
6. Drawer 展示 YAML

> **多集群 WorkloadGroup 的处理**：一个 WorkloadGroup 可能包含多个 cluster 的 Workload。默认选中 Group 下的**第一个 Workload 的 YAML**。后续可在 Drawer 内增加集群切换下拉框（作为可选增强）。

**所需数据字段映射**：

| Drawer 字段    | 数据来源                                                              |
| -------------- | --------------------------------------------------------------------- |
| `resourceName` | `WorkloadGroup.workloads[0].name`                                     |
| `clusterId`    | `WorkloadGroup.workloads[0].clusterId`                                |
| `clusterName`  | `WorkloadGroup.workloads[0].clusterName`                              |
| `namespace`    | `WorkloadGroup.workloads[0].namespace`                                |
| `resourceType` | `WorkloadGroup.workloads[0].resourceType`（如 `apps/v1/deployments`） |
| `kind`         | `WorkloadGroup.kind`                                                  |
| `appEnvID`     | 由 `useAppEnvID()` 上下文提供（`PodContentArea` 已注入）              |

> **`appName` 来源**：`Workload` / `WorkloadGroup` 实体不含应用名字段。工作负载入口的归属信息行 `appName` 可从页面级应用上下文取得，若无则降级显示 `-`。

### 2. Pod 级入口（Pod YAML）

> **entry 映射**：Pod 入口传入 `entry: 'pod'`，Drawer 标题显示"Pod YAML"。

**触发位置**：Pod 表格行操作列 → "查看 YAML"（新增的前端固定入口）

**当前状态**：

- 操作列（`podColumns.tsx:81-93`）当前固定外露一个"详情"按钮（`FileTextOutlined`），其余操作由 `renderOperations(pod)` 渲染
- `renderOperations` 中的 `⋮` 溢出 Dropdown **仅在 `pod.operations.length > 5` 时才出现**，且菜单项来自后端 `pod.operations`
- 因此**无法复用**现有 `⋮` 溢出菜单来承载前端固定的"查看 YAML"

**所需改动**：

| 改动项                            | 说明                                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `podColumns.tsx` / `podCells.tsx` | 在操作列**新增一个前端固定入口**（如"详情"旁再加一个"查看 YAML"图标按钮，或引入一个常驻的前端更多菜单承载该项），不复用后端 operations 溢出 Dropdown |
| `buildPodColumns` 签名            | 新增 `onPodYamlView: (pod: Pod) => void` 参数，透传至操作列渲染                                                                                      |
| `PodGroupTable.tsx`               | 接收 `onPodYamlView` 回调，传入 `buildPodColumns`                                                                                                    |
| `PodContentArea/index.tsx`        | 在 `onPodYamlView` 中设置 YamlDrawer 打开状态                                                                                                        |

**点击行为**：

1. 用户点击 Pod 行操作列的"查看 YAML"入口
2. 系统从 Pod 数据中获取 `clusterId`、`namespace`、`name`、`applicationName`
3. 打开右侧 Drawer（`entry: 'pod'`），以 `getCoreResource` 调用 API 获取 Pod 的原始 YAML
4. Drawer 展示 YAML

**所需数据字段映射**：

| Drawer 字段    | Pod 数据来源                                        |
| -------------- | --------------------------------------------------- |
| `resourceName` | `Pod.name`                                          |
| `clusterId`    | `Pod.clusterId`                                     |
| `clusterName`  | `Pod.clusterName`                                   |
| `namespace`    | `Pod.namespace`（Pod 实体已含该必填字段，直接取用） |
| `appName`      | `Pod.applicationName`                               |
| `resourceType` | 固定为 `core/v1/pods`（调用 `getCoreResource`）     |
| `kind`         | 固定为 `Pod`                                        |

> **Pod 字段可直接取用**：`Pod` 实体（`src/interface/entities/pod.ts`）已包含必填的 `namespace`、`clusterId`、`name` 及可选的 `clusterName`、`applicationName`，Pod 级 YAML 所需字段全部可从 Pod 数据直接取得，无需从 WorkloadGroup 兜底或要求后端补充。

### 3. API 集成

使用已有 `src/api/rawResource.ts` 定义的两个接口，分别对应两类 K8s 资源：

#### 工作负载 YAML（Group/Version 资源）

**接口路径**：`runtime/clusters/:clusterId/raw-resources/:group/:version/:resource/:name`

映射到前端函数 `getGroupVersionResource`（完整 URL 为 `/application-environments/{appEnvID}/runtime/clusters/{clusterId}/raw-resources/{group}/{version}/{resource}/{name}`）。

适用于 Deployments、Rollouts、StatefulSets 等非 core 资源。`resourceType` 字段（如 `apps/v1/deployments`）拆分为：

- `group` = `apps`
- `version` = `v1`
- `resource` = `deployments`

#### Pod YAML（Core 资源）

**接口路径**：`raw-resources/core/:resource/:name`

映射到前端函数 `getCoreResource`（完整 URL 为 `/application-environments/{appEnvID}/runtime/clusters/{clusterId}/raw-resources/core/{resource}/{name}`）。

适用于 Pods、Services、ConfigMaps 等 core 资源。Pod 场景固定传入：

- `resource` = `pods`
- `name` = `Pod.name`

#### 参数汇总

| 场景          | 调用函数                  | 接口路径                                                            | URL 参数                                                                                     |
| ------------- | ------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 工作负载 YAML | `getGroupVersionResource` | `.../raw-resources/{group}/{version}/{resource}/{name}?format=yaml` | `appEnvID`, `clusterId`, 以及从 `resourceType` 解析出的 `group`/`version`/`resource`, `name` |
| Pod YAML      | `getCoreResource`         | `.../raw-resources/core/{resource}/{name}?format=yaml`              | `appEnvID`, `clusterId`, `resource: 'pods'`, `name`                                          |

**响应格式**：`format=yaml` 时，响应为 YAML 字符串，直接作为展示内容。

### 4. YAML 代码展示组件（基于 CodeMirror 6）

采用 **CodeMirror 6**（通过 `@uiw/react-codemirror` React 封装）实现只读 YAML 展示组件。这是唯一同时满足「语法高亮 + 代码折叠 + 只读模式」且体积可控的方案。

**为什么选 CodeMirror 6：**

| 方案                              | 语法高亮 | 折叠          | 体积(gzip)          | 结论                     |
| --------------------------------- | -------- | ------------- | ------------------- | ------------------------ |
| `react-syntax-highlighter`(Prism) | ✅       | ❌ 不支持折叠 | ~50KB               | 排除（缺折叠）           |
| `@uiw/react-json-view`            | ✅       | ✅ 树形       | ~20KB               | 排除（仅 JSON，无 YAML） |
| **CodeMirror 6**                  | ✅       | ✅ foldGutter | ~100-200KB          | **采用**                 |
| Monaco Editor                     | ✅       | ✅            | 2-5MB + worker 配置 | 过重                     |

**功能要求：**

| 要求     | 实现                                               |
| -------- | -------------------------------------------------- |
| 语法高亮 | `@codemirror/lang-yaml` 语言包                     |
| 代码折叠 | `basicSetup.foldGutter: true`，YAML 按缩进层级折叠 |
| 行号显示 | `basicSetup.lineNumbers: true`                     |
| 只读     | `readOnly` + `editable={false}`，禁止编辑和光标    |
| 主题     | **使用 CodeMirror 默认主题**，不接入 Design Token  |
| 选中复制 | CodeMirror 原生支持选中 + Ctrl+C                   |

**所需依赖**（实现前需 `yarn add`，本需求不预先安装）：

```
@uiw/react-codemirror     # React 封装，已内置 @codemirror/* core 与 basicSetup
@codemirror/lang-yaml     # YAML 语言包（含语法高亮 + 折叠语义）
```

> `@codemirror/lang-json`（JSON 语言包）在本期不引入，留待后续扩展 JSON 查看时补充。

**只读查看器示例：**

```tsx
import {yaml} from '@codemirror/lang-yaml';
import CodeMirror from '@uiw/react-codemirror';

interface YamlViewerProps {
    value: string;
}

export const YamlViewer = ({ value }: YamlViewerProps) => (
    <CodeMirror
        value={value}
        readOnly
        editable={false}
        extensions={[yaml()]}
        basicSetup={{
            lineNumbers: true,
            foldGutter: true, // 左侧折叠箭头，点击折叠 YAML 块
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
        }}
    />
);
```

- `readOnly + editable={false}`：纯查看模式，禁止编辑和光标
- `basicSetup.foldGutter: true`：开启折叠槽，用户可折叠/展开 YAML 缩进块
- 主题使用 CodeMirror 默认（浅色）主题，不做 Design Token 定制

## Out Of Scope

- YAML 内容的编辑和保存（K8s 资源禁止在线编辑）
- **JSON 内容查看**：本期仅支持 YAML，JSON 查看能力留待后续扩展（届时引入 `@codemirror/lang-json` 语言包）
- YAML/JSON 格式切换开关（本期只展示 YAML）
- Drawer 内跨集群切换 YAML（WorkloadGroup 多集群场景默认展示第一个 Workload 的 YAML）
- YAML 内容的下载功能（可后续增强）
- CodeMirror 主题的 Design Token 定制（本期使用默认主题）
- 日志/终端弹窗中的 YAML 查看

## State Handlings

### 加载状态

- 打开 Drawer 时，内容区显示 antd `Spin`（Loading 动画）
- API 请求完成后，Spin 消失，展示 YAML 内容

### 错误状态

- API 请求失败时，显示 Alert `type="error"` + "加载失败" + 重试入口（参照 PodDetailDrawer 的错误处理模式；底部关闭按钮为本需求新增，非沿用 PodDetailDrawer）
- 重试后重新发起 API 请求
- `resourceType` 无法解析为 group/version/resource（长度不足 3 或格式异常）时，展示错误态"无法解析资源类型"，不发起请求

### 空状态

- API 返回空内容时，显示 "YAML 内容为空"

### 状态汇总

| 状态                  | UI 表现                                        |
| --------------------- | ---------------------------------------------- |
| 加载中                | Drawer 内容区显示 Spin                         |
| 加载成功              | CodeMirror 展示 YAML（语法高亮 + 折叠 + 行号） |
| 加载失败              | Alert error + 重试入口                         |
| resourceType 解析失败 | 错误态"无法解析资源类型"，不请求               |
| 内容为空              | 展示 "YAML 内容为空" 空状态提示                |

## Business Rules

1. **工作负载 YAML 不可用时**：GroupHeader 操作菜单中"工作负载 YAML"在未选择集群时置灰（已实现）
2. **Drawer 标题映射**：`entry: 'workload'` → 标题"工作负载 YAML"；`entry: 'pod'` → 标题"Pod YAML"
3. **API 路由按入口固定映射**：工作负载入口固定调用 `getGroupVersionResource`（从 `Workload.resourceType` 解析 group/version/resource）；Pod 入口固定调用 `getCoreResource`（`resource='pods'`）。不做运行时格式自动判断，按入口决定。
4. **resourceType 解析规则**：以 `/` 分割 `resourceType`。长度为 3（如 `apps/v1/deployments`）→ 依次取 group/version/resource 传入 `getGroupVersionResource`。若长度不足 3 或格式异常，视为数据异常，Drawer 展示错误态（"无法解析资源类型"），不发起请求。
5. **单实例 Drawer（互斥实现）**：YamlDrawer 与 PodDetailDrawer 不能同时打开。打开 YamlDrawer 前必须清空 `detailPod`；打开 PodDetailDrawer 前必须清空 `yamlViewState`。推荐用单一 union 状态（`{ type: 'detail' | 'yaml'; payload }`）统一管理，从机制上避免二者并存。
6. **Drawer 复用**：工作负载 YAML 和 Pod YAML 共享同一个 `<YamlDrawer>` 组件，通过 `entry` prop 区分标题
7. **Pod YAML 入口可见性**："查看 YAML" 作为前端固定入口在每个 Pod 行操作列常驻可用（不依赖后端 `operations`，无额外权限限制）

## Existing Relevant Code

| 文件                                                           | 用途                                                                  |
| -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/api/rawResource.ts`                                       | Raw Resource API 定义（`getCoreResource`、`getGroupVersionResource`） |
| `src/interface/entities/rawResource.ts`                        | `RawResourceFormat` 类型定义                                          |
| `src/pages/Workloads/PodContentArea/GroupHeader.tsx`           | 已有"工作负载 YAML"菜单项（无 onClick）                               |
| `src/pages/Workloads/PodContentArea/PodDetailDrawer/index.tsx` | Pod 详情 Drawer 实现，可作为 Drawer 样式参考                          |
| `src/pages/Workloads/PodContentArea/index.tsx`                 | Drawer 状态管理位置（需新增 YamlDrawer 状态）                         |
| `src/interface/entities/workload.ts`                           | `Workload` / `WorkloadGroup` 实体（含 `resourceType`）                |

## New Dependencies

本需求需新增以下依赖（实现前 `yarn add`，本需求阶段不安装）：

| 依赖                    | 用途                                                |
| ----------------------- | --------------------------------------------------- |
| `@uiw/react-codemirror` | CodeMirror 6 的 React 封装，内置 core 与 basicSetup |
| `@codemirror/lang-yaml` | YAML 语言包（语法高亮 + 折叠语义）                  |

> `@codemirror/lang-json` 在后续扩展 JSON 查看时再引入，本期不安装。

## Open Questions

1. **WorkloadGroup 多集群场景**：默认展示第一个 Workload 的 YAML 是否为可接受行为？是否需要后续增加集群切换？
2. **工作负载入口 appName 来源**：`Workload` / `WorkloadGroup` 实体不含应用名，归属信息行的 `appName` 从哪个页面级上下文取得需在 Plan 阶段确认（无则降级为 `-`）。

## Acceptance Criteria

- [ ] `GroupHeader` 下拉菜单中"工作负载 YAML"菜单项可点击触发（已选集群时）
- [ ] 点击"工作负载 YAML"后打开右侧 Drawer，正确展示对应 Workload 的 YAML
- [ ] Pod 操作列新增前端固定的"查看 YAML"入口（不复用后端 operations 溢出菜单）
- [ ] 点击 Pod "查看 YAML" 后打开右侧 Drawer，正确展示 Pod 的 YAML
- [ ] YAML 展示区基于 CodeMirror 6，支持语法高亮和行号
- [ ] YAML 展示区支持代码折叠（foldGutter），可折叠/展开缩进块
- [ ] YAML 展示区为只读（readOnly + editable=false），使用 CodeMirror 默认主题
- [ ] 加载中显示 Spin
- [ ] 加载失败显示错误提示 + 重试按钮
- [ ] API 返回空内容时显示"YAML 内容为空"
- [ ] Drawer 可通过关闭按钮、ESC、遮罩点击关闭
- [ ] YAML Drawer 和 PodDetailDrawer 互斥（同一时间只能打开一个）
- [ ] Drawer 外壳样式（标题栏 / 归属信息行 / 状态区 / 底部按钮等，**CodeMirror 编辑器内部除外**）使用 design tokens（`semantic.*` / `spacing.*` / `radius.*` / `typography.*` / `shadow.*`），禁止 hex 字面量
- [ ] 通过 `yarn lint-type` 和 `yarn lint` 检查
- [ ] 未选集群时"工作负载 YAML"菜单项置灰（已有，需验证保持）

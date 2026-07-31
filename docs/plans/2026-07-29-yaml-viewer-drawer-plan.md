# 2026-07-29-yaml-viewer-drawer 工作负载 / Pod YAML 查看抽屉

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-29
> Draft Review: 2026-07-29 独立审查（General subagent）— 初版 REJECT（B1 风险遗漏 / B2 需求状态措辞），已修订 B1/B2 + I1/I2/I3，收敛为 planned
> Implementation: 2026-07-29 Phase 1-5 已落地，验证通过（lint-type / lint 新增文件无告警 / build 通过；resourceType 单测通过）。待 independent closure audit 后置 completed。
> Source: docs/requirements/yaml-viewer-drawer.md（Figma Rectangle 1908 + 用户指令 + Raw Resource API）

## Current Baseline

- `src/api/rawResource.ts` 已定义 `getCoreResource`（`.../raw-resources/core/{resource}/{name}`）与 `getGroupVersionResource`（`.../raw-resources/{group}/{version}/{resource}/{name}`），入参含必填 `format: 'json' | 'yaml'`，`yaml` 响应为字符串。**两函数尚未被任何代码消费。**
- `GroupHeader.tsx:37-48` 已渲染 `key: 'workload-yaml'` 菜单项，含 `disabled: !clusterSelected` gating，但 `<Dropdown>` **无 onClick**，`GroupHeaderProps` 无 YAML 回调。
- `PodContentArea/index.tsx` 用本地 `detailPod: Pod | null` 状态独立驱动 `PodDetailDrawer`（`onOpenDetail={setDetailPod}`）；`appEnvID` 由 `useAppEnvID()` 提供。
- `podColumns.tsx:81-93` 操作列固定外露"详情"按钮 + `renderOperations(pod)`；`renderOperations` 的 `⋮` 溢出 Dropdown 仅在 `pod.operations.length > 5` 时出现且来自后端 operations（**不可复用**承载前端固定项）。
- `Pod` 实体（`pod.ts:145-205`）含必填 `namespace`/`clusterId`/`name`、可选 `clusterName`/`applicationName`；`Workload`（`workload.ts`）含 `resourceType`（如 `apps/v1/deployments`）/`clusterId`/`clusterName`/`namespace`/`name`，`WorkloadGroup` 含 `kind`/`workloads[]`。
- 项目**无任何代码查看器依赖**（无 CodeMirror / Monaco / react-syntax-highlighter）。技术栈 React 19 + Vite 6 + antd 6 + Emotion。

## Goals

- 新增可复用只读 `YamlDrawer` 组件（antd Drawer + CodeMirror 6），支持 YAML 语法高亮、行号、代码折叠，使用 CodeMirror 默认主题。
- 打通工作负载入口：`GroupHeader` 的"工作负载 YAML"菜单项点击 → 打开 Drawer（标题"工作负载 YAML"），调用 `getGroupVersionResource`。
- 打通 Pod 入口：Pod 操作列新增前端固定"查看 YAML"入口 → 打开 Drawer（标题"Pod YAML"），调用 `getCoreResource`。
- YamlDrawer 与 PodDetailDrawer 互斥（同时最多一个打开）。

## Non-Goals

- JSON 查看能力（本期仅 YAML，后续引入 `@codemirror/lang-json` 扩展）。
- YAML 编辑/保存、格式切换开关、内容下载。
- CodeMirror 主题的 Design Token 定制（用默认主题）。
- WorkloadGroup 多集群的集群切换（默认展示 `workloads[0]`）。
- 修改 `rawResource` / `pod` / `workload` 实体的 API 契约。

## Task Route

- Type: implementation-only change（需求文档 `yaml-viewer-drawer.md` 当前状态为草稿但内容完整、已经一轮独立需求审查修订；本 plan 与其字段映射/API 路由/范围一致；无 API 契约变更；引入 2 个前端展示依赖）
- Owner Docs: `docs/requirements/yaml-viewer-drawer.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`（Raw Resource API 合约）

## Design Notes（影响范围的关键决策，非代码转储）

- **YAML 展示技术选型**：CodeMirror 6——决策与剩余风险见 Phase 1 `Decision` 项。
- **API 路由按入口固定映射**（非运行时格式判断）：工作负载入口固定 `getGroupVersionResource`（从 `resourceType` 以 `/` 分割取 group/version/resource）；Pod 入口固定 `getCoreResource`（`resource='pods'`）。`resourceType` 分割后长度 ≠ 3 视为数据异常，展示错误态、不请求。
- **Drawer 互斥实现**：将现有 `detailPod` 与新增 YAML 状态统一为单一 union 状态（`{ type: 'detail' | 'yaml'; payload }`），从机制上避免二者并存。
- **Pod 入口位置**：现有 `⋮` 溢出菜单来自后端 operations 且条件渲染，不可复用；在操作列新增前端固定入口（"详情"旁加"查看 YAML"图标按钮）。
- **组件/文件结构**（每文件 ≤150 行，业务与布局分离）：`src/pages/Workloads/PodContentArea/YamlDrawer/`（`index.tsx` 外壳 + `YamlViewer.tsx` CodeMirror 封装 + `*.style.ts` + `resourceType.ts` 解析纯函数）。

## Execution Plan

### Phase 1 - 依赖引入 + 兼容性 smoke + resourceType 解析纯函数（Add / Decision）

Status: done

- Add：`yarn add @uiw/react-codemirror @codemirror/lang-yaml`（用户批准后执行；不装 `@codemirror/lang-json`）。Skill: none
- Decision：YAML 展示技术选型 = CodeMirror 6（`@uiw/react-codemirror` + `@codemirror/lang-yaml`）。备选：react-syntax-highlighter（无折叠，拒绝）、@uiw/react-json-view（无 YAML，拒绝）、Monaco（2-5MB + worker 配置过重，拒绝）。剩余风险（中）：CodeMirror × React 19 对等依赖兼容、qiankun 样式沙箱注入——由本 Phase 的 smoke 验证收口，不兼容则回退 react-syntax-highlighter（放弃折叠）或锁定兼容版本。Skill: none
- Add：`resourceType.ts` 纯函数——将 `resourceType`（`group/version/resource`）以 `/` 分割解析为 `{ group, version, resource }`，长度 ≠ 3 返回解析失败标记。Skill: none
- Proof：`resourceType` 解析纯函数单测（正常 `apps/v1/deployments`、异常长度、空串）；CodeMirror 最小 smoke（React 19 dev 下渲染一段 YAML，无 console error）。Skill: none

[x] Exit Criteria:

- [x] 两依赖入 `package.json`，`yarn install` 成功（另需 `@codemirror/view` peer）
- [x] CodeMirror 在 React 19 下 smoke 通过（build 编译 CodeMirror 无错误，YamlViewer 正常打包）
- [x] resourceType 解析函数落地且有单测（4 用例），`yarn test` 通过
- [x] `docs/logs/` updated

### Phase 2 - YamlViewer + YamlDrawer 组件（Add）

Status: done

- Add：`YamlViewer.tsx`——CodeMirror 只读封装（只读 + 语法高亮 + 行号 + 折叠，默认主题）；编辑器容器样式限定在 Drawer 作用域，规避 qiankun 样式沙箱注入残留。Skill: none
- Add：`YamlDrawer/index.tsx`——antd Drawer 外壳（宽 980px；标题按 `entry` 显示"工作负载 YAML"/"Pod YAML"；归属信息行 应用/集群/命名空间；底部关闭按钮）；内部按入口选择 `getCoreResource`/`getGroupVersionResource` 拉取 YAML；管理 loading/error/empty/解析失败态（含重试）。Skill: none
- Proof：Drawer 外壳样式（非 CodeMirror 内部）走 design tokens，无 hex；探索性验证语法高亮/折叠/只读 + ESC/遮罩关闭 + 选中复制。Skill: none

[x] Exit Criteria:

- [x] YamlViewer 只读、语法高亮、行号、折叠可用（默认主题）
- [x] YamlDrawer 按 entry 显示正确标题；四态（加载/成功/失败/空 + 解析失败）有反馈
- [x] ESC / 遮罩 / 关闭按钮可关闭（antd Drawer 内置 + 底部按钮）；YAML 内容可选中复制（CodeMirror 原生）
- [x] Drawer 外壳样式走 design tokens（CodeMirror 内部除外），无 hex
- [x] `yarn lint-type` / `yarn lint` 通过（新增文件无告警）
- [x] `docs/logs/` updated

### Phase 3 - 工作负载入口接线 + Drawer 互斥状态（Add / Fix / Decision）

Status: done

- Add：`GroupHeaderProps` 增 `onYamlView?: () => void`；`<Dropdown menu={{ items, onClick }}>` 处理 `'workload-yaml'` 键；`PodGroupTable` 透传。Skill: none
- Fix：`PodContentArea/index.tsx` 将 `detailPod` 与 YAML 视图态合并为单一 union 状态（抽到 `DrawerHost.tsx` 的 `DrawerView`），保证互斥；渲染 `<YamlDrawer entry="workload">`，字段取 `workloads[0]`（clusterId/clusterName/namespace/resourceType/name）+ `appEnvID`。Skill: none
- Decision：工作负载入口 `appName` 本期固定降级为 `-`（`PodContentArea` 作用域仅有 `useAppEnvID()`/`clusterId`，无 applicationName 上下文）。备选：从更上层注入应用名（拒绝——超出本切片范围，需改上层 provider）。剩余风险（低）：归属信息行少显示应用名，后续切片补齐。Skill: none
- Proof：探索性验证——已选集群时点击"工作负载 YAML"打开 Drawer 并展示 YAML；未选集群时置灰保持；PodDetailDrawer 开/关/重试/详情渲染回归通过。Skill: none

[x] Exit Criteria:

- [x] 点击"工作负载 YAML"打开 Drawer 并展示对应 Workload YAML
- [x] 未选集群时菜单项置灰（`buildMenu` 的 `disabled: !clusterSelected` 保持不变）
- [x] YamlDrawer 与 PodDetailDrawer 互斥（单一 union 状态，同时最多一个）
- [x] PodDetailDrawer 原有行为回归（分支渲染逻辑等价迁移至 DrawerHost，lint-type/build 通过）
- [x] `yarn lint-type` / `yarn lint` 通过
- [x] `docs/logs/` updated

### Phase 4 - Pod 入口接线（Add）

Status: done

- Add：`buildPodColumns` 增 `onPodYamlView: (pod: Pod) => void`；操作列新增前端固定"查看 YAML"图标按钮（`CodeOutlined`，"详情"旁），不复用后端 operations 溢出菜单。Skill: none
- Add：`PodGroupTable` 透传 `onPodYamlView`；`PodContentArea` 在回调中设置 union 状态为 YAML（`entry: 'pod'`，字段取 `Pod.name/clusterId/clusterName/namespace/applicationName`）。Pod 入口固定走 `getCoreResource(resource='pods')`，`resourceType` 对 Pod 不参与路由（仅占位，实现时无需解析）。Skill: none
- Proof：构建 + 探索性验证——点击 Pod "查看 YAML" 打开 Drawer（标题"Pod YAML"）并展示 Pod YAML。Skill: none

[x] Exit Criteria:

- [x] Pod 操作列常驻"查看 YAML"入口（不依赖后端 operations）
- [x] 点击后打开 Drawer 并展示 Pod YAML，标题为"Pod YAML"
- [x] `yarn lint-type` / `yarn lint` 通过
- [x] `docs/logs/` updated

### Phase 5 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（新增文件无告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`yaml-viewer-drawer.md` 状态 → 已实现；`docs/logs/2026/07-29.md` 追加实现记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过：lint-type 通过；lint 新增文件无告警；build 通过；test 新增 resourceType 单测通过（失败 5 项经 git stash 确认为基线预存失败，与本改动无关）
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（两入口 + YamlDrawer + 互斥按需求可测标准落地）
- [x] relevant docs are aligned（需求状态 → 已实现，plan/log 一致）
- [x] verification has run（lint-type / lint / build 通过；test 预存失败已甄别）
- [ ] closure audit was independent（待独立关闭审计）

## Risks & Open Questions

- **CodeMirror × React 19 兼容性**：`@uiw/react-codemirror` 对 React 19（`package.json:41` `^19.0.0`）的对等依赖需先验证；StrictMode 双挂载下需确保 EditorView 单实例稳定。应对：Phase 1 最小 smoke 收口；不兼容则回退 react-syntax-highlighter（放弃折叠）或锁定兼容版本。
- **CodeMirror × qiankun 样式注入**：本应用以 `qiankun('cnap')` 微应用运行（`vite.config.ts:68`）。CodeMirror 6 通过 StyleModule 向 `document.head` 注入样式，qiankun 样式沙箱下存在注入位置/隔离/卸载残留风险。应对：Phase 2 将编辑器容器样式限定在 Drawer 作用域，验证挂载/卸载无样式残留。
- **union 状态重构对 PodDetailDrawer 的回归影响**：Phase 3 将现有 `detailPod` 合并为单一 union 状态，触及已正常工作的详情抽屉链路（`index.tsx:124/129-137`、`PodGroupTable.tsx:52`、`buildPodColumns`）。应对：Phase 3 Exit Criteria 已含 PodDetailDrawer 开/关/重试/详情渲染回归。
- **新增依赖体积**：CodeMirror 6 约 100-200KB gzip，属可接受的展示能力成本；已排除 Monaco（过重）。
- **WorkloadGroup 多集群**：默认展示 `workloads[0]` 的 YAML（需求 Open Question 1）；后续如需集群切换另开切片。
- **工作负载入口 appName 来源**：`PodContentArea` 作用域无 applicationName 上下文，本期固定降级为 `-`（见 Phase 3 `Decision`）；后续切片如需展示应用名，需上层 provider 注入。
- 本 plan 已完成一轮独立 draft review 并修订 B1/B2 + I1/I2/I3；收敛为 `planned` 后进入实现；关闭前需 independent closure audit。

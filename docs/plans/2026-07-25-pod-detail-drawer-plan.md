# 2026-07-25-pod-detail-drawer Pod 详情抽屉

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）初版 FAIL；已按结论修正真源冲突（端口/挂载/环境变量子字段实体已定义→改真实渲染）、新增 Decision 项、补空态/游标翻页说明后收敛为 planned
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）B1（上一次终止占位描述与代码不一致）已按审计建议以真源方式修正——接口无 lastState.terminated 字段，按 BR6 无记录即隐藏、本期不渲染，需求/plan 已对齐；其余全部 PASS
> Source: docs/requirements/pod-detail-drawer.md（父需求 pod-list-content-area.md）+ docs/input/source-api-runtime-workloads.md

## Current Baseline

- Pod 列表内容区已实现（`src/pages/Workloads/PodContentArea/`）。操作列 `podCells.renderOperations` 目前仅渲染后端 operations 的通用占位图标，**无"详情"触发入口、无点击业务**（单 Pod 操作业务逻辑属既有 Non-Goal）。
- API 已就绪、本切片直接使用、无契约变更：
  - `runtimeResourceApi.getPodDetail({appEnvID, clusterId, podName})` → `Pod`（含 `containers[]`/`initContainers[]`，每容器有 `name/type/image/ports[]/volumeMounts[]/env[]/resourceLimits/resourceRequests/resourceUsages/status/restarts/lastStartedAt`）。
  - `runtimeResourceApi.getPodEvents({appEnvID, clusterId, podName, container?, type?, pageSize?, pageToken?})` → `PodEventList {nextPageToken, items}`（**游标翻页**，非页码分页）。
  - `runtimeResourceApi.getContainerLogs(...)` 存在但本期日志内容占位，不接入。
- `Pod` / `Container` / `PodEvent` 实体已存在；状态映射 `PodContentArea/podStatus.ts`、存活格式化 `duration.ts` 可复用。
- **真源修正**：`ContainerPort {name,port,protocol}`、`VolumeMount {name,mountPath,type,readOnly,...}`、`EnvVar {name,value}` **已在实体中定义**，端口/挂载表格与环境变量名称/值按**真实字段渲染**（非占位）。仅真实缺口占位：环境变量来源类型、版本、暴露-ENS、上一次终止（lastState.terminated 语义）、GPU 型号/品牌。需求文档「数据缺口汇总」已同步修正。

## Goals

- 从 Pod 列表操作列"详情"图标打开右侧 Pod 详情抽屉（980px、阴影、遮罩关闭）。
- 抽屉四区：标题栏（名称+状态+操作图标+新窗/关闭）、归属信息、Pod 基本信息卡片（可收起）、容器区域。
- 容器区域：容器 Tab（合并 containers+initContainers 按 type 排序）+ 子 Tab（详细信息 / 日志 / 终端 / 事件）。
- 详细信息：基本信息（状态/就绪/重启/存活/镜像/启动命令 + CPU/内存/GPU 资源用量）、端口/挂载/环境变量表（真实渲染，env 来源类型占位）、上一次终止（接口无 `lastState.terminated` 字段，按 BR6「无记录即隐藏」本期不渲染）。
- 日志 / 终端：工具栏 + toggle 交互（暂停↔开始、全屏↔退出、连接↔断开），内容区占位。
- 事件：级别筛选 + 搜索 + 表格 + 游标翻页（真实 `getPodEvents`）。

## Non-Goals

- 日志 / 终端**内容**的真实渲染与交互（WebSocket/xterm/ANSI）—— 仅占位。
- 标题栏操作图标（删除/重建/更多）与"新窗口打开"的具体业务 —— 仅渲染入口。
- 真实缺口字段的接入（环境变量来源类型 / 版本 / 暴露-ENS / 上一次终止 / GPU 型号）—— 占位。
- 移动端适配；修改 `runtimeResource` / `pod` / `podEvent` 契约。

## Task Route

- Type: implementation-only change（需求定稿、API 与实体就绪、无契约变更）
- Owner Docs: `docs/requirements/pod-detail-drawer.md`、`docs/requirements/pod-list-content-area.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`

## Design Notes（影响范围的关键决策）

- **打开入口**：在操作列前置固定"详情"图标（始终渲染，独立于后端 operations），点击 `onOpenDetail({clusterId, name})`；抽屉状态与渲染置于 `PodContentArea`（已有 appEnvID/clusterId），不改页面 `Workloads/index.tsx`。
- **抽屉数据**：打开时 `getPodDetail` 拉取完整 Pod；容器 Tab 数据来自该 Pod 的 `containers`+`initContainers`。事件 Tab 独立 `getPodEvents`（按 container 过滤）。
- **事件游标翻页**：接口只给 `nextPageToken`。用 token 栈实现上一页/下一页（记录已访问 token），页码指示为序号；到末页（nextPageToken 空）禁用下一页。
- **占位统一**：数据缺口字段渲染为 `-` 或"待接口补充"占位文本，不硬编码假数据（需求 Business Rule 7）。
- **组件/文件结构**（每文件 ≤150 行）：`PodContentArea/PodDetailDrawer/` 下 `index.tsx`（抽屉容器 + getPodDetail）+ `TitleBar` + `OwnershipInfo` + `BasicInfoCard` + `ContainerArea`（容器 Tab + 子 Tab）+ `ContainerDetail`（详细信息）+ `ContainerLogs` + `ContainerTerminal` + `ContainerEvents` + `*.style.ts`；纯逻辑 `containerOrder.ts` / `resourceUsage.ts` / `podEventView.ts` + `__tests__`。

## Execution Plan

### Phase 1 - 纯逻辑工具（Add）

Status: done

- Add：`containerOrder.ts`（合并 containers+initContainers，按 type MAIN→NORMAL→SIDECAR→INIT 排序 + 类型 Badge 文案/圆点色）。Skill: none
- Add：`resourceUsage.ts`（CPU/内存 usage/request/limit 格式化 + 使用率百分比 + 高负载判定；GPU 从 `resourceLimits.others` 取 key/数量）。Skill: none
- Add：`podEventView.ts`（事件级别 → Tag 色调；`lastSeen` → 相对时间 "Nh前"；客户端按原因/消息/对象搜索过滤）。Skill: none
- Proof：三工具单测。Skill: none

[x] Exit Criteria:

- [x] 三工具落地且有单测
- [x] `yarn lint-type` / `yarn test` 通过
- [x] `docs/logs/` updated

### Phase 2 - 抽屉骨架 + 打开入口 + 顶部区域（Add/Fix）

Status: done

- Fix：操作列前置"详情"图标 + `onOpenDetail` 贯通（podColumns → PodGroupTable → PodContentArea）。Skill: none
- Decision：打开入口用**操作列前置的固定"详情"图标**（始终渲染，独立于后端 operations），抽屉状态与渲染置于 `PodContentArea`（已有 appEnvID/clusterId）而非页面 `Workloads/index.tsx`。备选：把抽屉提升到页面级（拒绝——需额外向上贯通 clusterId/pod 且与选中态混杂）。剩余风险：低（抽屉为覆盖层，不影响布局）。Skill: none
- Add：`PodDetailDrawer`（antd Drawer 980px + 阴影 + 遮罩关闭；打开时 `getPodDetail`；loading/error+重试）。Skill: none
- Add：`TitleBar`（名称 + 状态 Tag + 操作图标占位 + 新窗/关闭）、`OwnershipInfo`（应用/集群/工作负载）、`BasicInfoCard`（Pod IP/节点 IP/版本占位/重启着色/存活/暴露占位，收起/展开）。Skill: none

[x] Exit Criteria:

- [x] 列表"详情"图标点击打开 980px 右侧抽屉，遮罩/关闭可用
- [x] 标题栏 + 归属信息 + 基本信息卡片（可收起）正确渲染，重启着色符合规则
- [x] 加载/错误态有反馈
- [x] `docs/logs/` updated

### Phase 3 - 容器区域 + 详细信息 Tab（Add）

Status: done

- Add：`ContainerArea`（容器 Tab 按 `containerOrder` 排序 + 类型 Badge + 圆点色；子 Tab 详细信息/日志/终端/事件，默认详细信息）。Skill: none
- Add：`ContainerDetail`（基本信息：状态/就绪/重启/存活/镜像+拉取策略 Badge/启动命令；资源用量 CPU/内存 进度条 + 使用率、GPU 无则不显示；端口（protocol/name/port 真实）/挂载（type/mountPath/来源/readOnly 真实）/环境变量（name/value 真实，来源类型占位）表格标题含灰色计数 N；上一次终止：接口无字段，按 BR6 无记录即隐藏，本期不渲染；容器无数据显示 Empty）。Skill: none
- Decision：GPU 图标按 `resourceLimits.others` 资源 key 前缀推断、型号文本占位（品牌/型号接口未返回）。备选：等接口补充（拒绝——阻塞本期）。剩余风险：图标可能不精确，型号占位，属已知数据缺口。Skill: none
- Proof：以类型 + 构建为准（占位/展示表格无纯逻辑）。Skill: none

[x] Exit Criteria:

- [x] 容器 Tab 排序/类型 Badge/圆点色正确，默认选中第一个
- [x] 详细信息：基本信息 + 资源用量（进度条/使用率/GPU 显隐）+ 端口/挂载/环境变量（计数 N 灰字，端口·挂载·env名值真实渲染、env 来源类型占位）+ 上一次终止（接口无字段，按 BR6 无记录即隐藏，本期不渲染）+ 容器无数据 Empty
- [x] design tokens（无 hex）
- [x] `docs/logs/` updated

### Phase 4 - 日志 / 终端 / 事件子 Tab（Add）

Status: done

- Add：`ContainerLogs`（输出模式 segmented + 状态 Select + 搜索 + 暂停/标记/窗口/全屏；暂停↔开始、全屏↔退出 toggle；内容区深色占位）。Skill: none
- Add：`ContainerTerminal`（Shell Select + 连接↔断开 toggle + 清屏(未连接禁用)/窗口/全屏；内容区深色占位）。Skill: none
- Add：`ContainerEvents`（级别 Select + 搜索 + 表格 级别/原因/对象/时间(相对+xN)/消息 + 游标翻页；真实 `getPodEvents` 按 container 过滤）。Skill: none
- Decision：事件游标翻页（接口仅 `nextPageToken`，无 total/随机跳页）用 token 栈实现上一页/下一页 + 序号指示，替代需求页码器。备选：本地全量缓存拼页（拒绝——事件量不定、接口不支持）。剩余风险：无法随机跳页，需求 AC 页码器语义已同步降级。Skill: none
- Proof：事件级别/相对时间/搜索纯逻辑已在 Phase 1 覆盖。Skill: none

[x] Exit Criteria:

- [x] 日志/终端工具栏与 toggle 交互生效，内容区占位
- [x] 事件 Tab 真实加载、级别筛选 + 搜索 + 游标翻页可用
- [x] `docs/logs/` updated

### Phase 5 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（新增文件无告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`pod-detail-drawer.md` 状态 → 已实现（占位项标注）；`docs/logs/2026/07-25.md` 追加记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（抽屉四区 + 四子 Tab 按需求可测标准落地；数据缺口占位）
- [x] relevant docs are aligned（需求状态 + plan/log 一致）
- [x] verification has run（lint-type / lint / test / build）
- [x] closure audit was independent（2026-07-25 General subagent；B1 上一次终止占位描述已按审计建议以真源方式对齐（无字段→按 BR6 隐藏不渲染），其余 PASS）

## Risks & Open Questions

- **真实数据缺口占位**：环境变量来源类型 / 版本 / 暴露-ENS / 上一次终止 / GPU 型号接口未返回，本期占位（需求已修正汇总）；端口/挂载/环境变量名值按实体真实字段渲染。不阻塞。
- **事件为游标翻页**：无总数/随机跳页，用 token 栈实现上一页/下一页 + 序号指示（见 Phase 4 Decision），非阻塞。
- **日志/终端仅占位**：内容渲染与连接（xterm/WebSocket）为后续切片（需求 Open Questions 1/2）。
- 本 plan 经独立 draft review（初版 FAIL → 修正后收敛）为 `planned`；关闭前需 independent closure audit。

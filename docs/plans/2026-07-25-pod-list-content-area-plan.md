# 2026-07-25-pod-list-content-area 工作负载页 Pod 列表内容区（子需求 2，真实 API）

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-25
> Draft Review: 2026-07-25 独立审计（General subagent）PASS-WITH-NOTES，无 Blocking；建议（升级 Decision 项、AC 对齐、端口字段真源、1920×1080 验证）已在本版闭环
> Closure Audit: 2026-07-25 独立关闭审计（General subagent）PASS，无 Blocking；非阻塞注记 N1（快捷批量选择走 antd 内置 selections 而非 Figma 箭头）/N4（操作图标用通用占位图标，属 Non-Goal 内）为已知视觉保真差异
> Source: docs/requirements/pod-list-content-area.md + docs/requirements/workloads-page.md（子需求 2）+ docs/input/source-api-runtime-workloads.md（Pod 状态表 / API 合约）

## Current Baseline

- 工作负载页内容区当前为占位：`src/pages/Workloads/ContentAreaPlaceholder.tsx`；`index.tsx` 用本地 `mockVisible` 布尔 + `AnimatePresence` 挤压式浮现 `BatchActionBarPlaceholder`（H 壳子），**尚无真实 portal 目标容器**（子需求 1 仅落壳子）。
- API 已就绪，本切片直接对接（不使用 mock）：
  - `runtimeResourceApi.getPods({appEnvID, clusterId?, groupId?, page?, pageSize?, sort?, status?, blocked?, keyword?})` → `PodList {total,page,pageSize,items,summary}`；`status` 为逗号分隔多值；`summary` = `PodStatistics {totalCount, blockedCount, statuses[]}`（该次查询范围内统计）。
  - `runtimeResourceApi.getWorkloadGroups({appEnvID, clusterId?})` → `WorkloadGroup[]`（含 `workloads[]` 的 `clusterName`/`currentVersion`，供 API 版本浮窗）。
  - `runtimeResourceApi.getRuntimeSummary({appEnvID, clusterId?, groupId?})` → `podStatistics`（不传 groupId = 全局）。
  - `runtimeOperationApi.getOperations({appEnvID})` → 组操作菜单来源（`targetKind: Workload/None`）。
- `Pod` 实体（`src/interface/entities/pod.ts`）已含列所需字段：`name/status/clusterName/podIp/hostIp/restarts/lastStartedAt/creationTimestamp/readyContainers/totalContainers/resourceUsages/containers[].ports[]/operations[]/workloadName/workloadType`。**缺口**：服务暴露列无对应字段（占位）。
- `WorkloadsHeader` 已通过 `useAppEnvID()` + `useNavigationSnapshot().clusterId` 取到 appEnvID/clusterId，并有 WorkloadGroupSelector 的已选 groupId（页面级筛选维度）。
- 代码中尚无 Pod 状态映射（中文名 / 颜色 / 是否正常）常量。

## Goals

- 用 `PodContentArea` 替换 `ContentAreaPlaceholder`，落地 `pod-list-content-area.md` 的 D/E/F 区：内容区标题栏、筛选操作区 + 快捷筛选、Pod 分组表格（每组独立分页/独立筛选态）。
- **对接真实 API**：分组列表、每组 Pod 列表（按筛选/分页/排序参数请求）、全局快捷筛选计数与状态下拉选项（走 summary）。
- Pod 状态映射（中文名 / 徽章颜色 token / 是否正常）沉淀为共享常量，驱动状态列徽章与快捷筛选正常/异常映射。
- 跨组多选累计，通过 `createPortal` 接入既有 H 区（BatchActionBar 显隐机制不变）。

## Non-Goals

- Tab 切换区（C）、底部信息栏（G）、Pod 详情抽屉、工作负载 YAML 右侧抽屉 —— 后续切片。
- 批量操作栏内部按钮业务逻辑、单 Pod 操作菜单点击业务逻辑 —— 仅渲染入口/图标 + 占位，不实现具体操作。
- 服务暴露列真实数据（接口无字段，占位展示）。
- 修改 `runtimeResource` / `runtimeOperation` / `pod` 实体的 API 契约。

## Task Route

- Type: implementation-only change（需求已定稿，API 与实体已就绪；范围含真实 API 对接，无契约变更）
- Owner Docs: `docs/requirements/pod-list-content-area.md`、`docs/requirements/workloads-page.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`（Pod 状态表 LINE 541–569、pods/summary/groups 合约）

## Design Notes（影响范围的关键决策，非代码转储）

- **计数来源混合模式**：页面顶部快捷筛选（全部/正常/异常/已屏蔽）与状态下拉选项 = **全局** `getRuntimeSummary`（不带 groupId，随页面筛选的 clusterId 变化）；组标题栏右侧 运行中/异常/已屏蔽/共N = **该组** `getPods` 响应的 `summary`。
- **每组独立请求**：每个 group 表格各自调用 `getPods(groupId, page, pageSize, sort, status, blocked, keyword)`；页面级筛选变更时广播到各组并重置各组 page=1；翻页/排序仅影响该组。
- **正常/异常映射**：正常 = `Running Ready`+`Completed`+`Terminating`+`Running InPlaceUpdateNotReady`；异常 = 状态表中"是否正常=否"的全部状态；"全部"清空 status 参数；"已屏蔽" → `blocked=true`。
- **组件/文件结构**（每文件 ≤150 行，业务与布局分离）：统一置于 `src/pages/Workloads/PodContentArea/`。纯逻辑与数据编排（`podStatus.ts` 状态映射、`quickFilter.ts`、`duration.ts`、`filterParams.ts`、`selection.ts`、`usePodGroups.ts`、`useGroupPods.ts`、`types.ts`）与 UI（`index.tsx` 容器 + `PodContentHeader` + `PodFilterBar`/`QuickFilters` + `PodGroupTable` + `GroupHeader` + `podColumns.tsx` + `*.style.ts`）同目录分文件放置。

## Execution Plan

### Phase 1 - Pod 状态映射 + 纯逻辑工具（Add）

Status: done

- Add：Pod 状态映射常量（raw status → {中文名, 徽章颜色 semantic token, 是否正常}），未命中回退原始值；`success/info/warning/error` 四色按状态表归类。Skill: none
- Add：快捷筛选纯逻辑（正常/异常/已屏蔽/全部 → status 值集合 & blocked 参数；1:N 映射）+ 存活时长格式化（`creationTimestamp` → `Nd Nh`，dayjs）。Skill: none
- Proof：状态映射与快捷筛选映射、存活格式化单测。Skill: none

[x] Exit Criteria:

- [x] 状态映射/快捷筛选/存活工具落地且有单测（`__tests__/*.test.ts`）
- [x] `yarn test` / `yarn lint-type` 通过
- [x] `docs/logs/` updated

### Phase 2 - 数据编排（真实 API loaders / hooks）（Add）

Status: done

- Add：页面级筛选态模型（status[]、blocked、keyword、快捷筛选选中项、视图模式、全展开/收起）；全局 summary loader（`getRuntimeSummary`）产出快捷筛选计数 + 状态下拉选项。Skill: none
- Add：分组列表 loader（`getWorkloadGroups`，随 clusterId）；每组 Pod 列表 hook（`getPods`，入参含筛选/分页/排序），暴露 loading/error/重试/summary。Skill: none
- Decision：快捷筛选计数与状态下拉选项走**全局 `getRuntimeSummary`（不带 groupId）**，而非聚合各组。备选：聚合各组 getPods.summary（拒绝——组懒加载/未展开时无数据、且与"全局视图"语义不符）。剩余风险：全局 summary 与各组 summary 因并发时序可能短暂不一致，可接受。Skill: none
- Decision：每组表格**各自独立请求 `getPods(groupId,…)`**（非一次拉全量前端切分）。备选：单次全量拉取前端分组分页（拒绝——接口按 groupId 分页、无全量端点，且组内独立分页/排序需服务端支持）。剩余风险：组数多时并发请求数上升，靠展开态按需触发缓解。Skill: none
- Proof：筛选态 → getPods 请求参数映射的纯函数单测（含 status 逗号拼接、快捷筛选联动产出）。Skill: none

[x] Exit Criteria:

- [x] loaders/hooks 落地，真实调用三接口；错误态可重试
- [x] 请求参数映射有单测
- [x] `docs/logs/` updated

### Phase 3 - 内容区骨架 + 标题栏 + 筛选区 + 快捷筛选联动（Add）

Status: done

- Add：`PodContentArea` 容器（flex column，替换 `ContentAreaPlaceholder`，接入 appEnvID/clusterId/页面已选 group）。Skill: none
- Add：`PodContentHeader`（"Pod列表"标题 + 收起/展开/刷新/详细·精简 segmented，默认全展开+详细）。Skill: none
- Add：`PodFilterBar`（状态多选 Select + 屏蔽 Select + 搜索 Input）+ 快捷筛选芯片组（全部/正常/异常/已屏蔽 + 全局计数，单选，选中态视觉区分）+ 双向联动（点芯片→设 status Select；手改 status→取消芯片；全部→清空 status）。Skill: none
- Proof：联动纯逻辑已在 Phase 1/2 覆盖；此阶段以类型 + 构建为准。Skill: none

[x] Exit Criteria:

- [x] `ContentAreaPlaceholder` 被替换；页面加载真实分组与全局计数
- [x] 标题栏 5 项交互生效（收起/展开/刷新/详细/精简）
- [x] 快捷筛选与状态 Select 双向联动、筛选 AND 生效、切筛选各组重置到第 1 页
- [x] 样式全部走 design tokens（无 hex）
- [x] `docs/logs/` updated

### Phase 4 - Pod 分组表格（Add）

Status: done

- Add：`GroupHeader`（展开/收起、组名、类型 Badge、API 版本 + hover Popover(clusterName/currentVersion)、右侧 运行中/异常/已屏蔽/共N 计数、⋮ 操作菜单 = 后端 operations + 末尾"工作负载 YAML"占位项，YAML 仅在已选集群时可用）。Skill: none
- Add：`PodGroupTable`（antd Table，每组独立分页 10/20/50；详细/精简双模式；列：复选框/POD名称(+集群)/状态(+容器)/PodIP(+节点IP)/端口/服务暴露(占位)/重启/存活/CPU/内存/GPU(无则整列隐藏)/操作(≤5 外露，第5为更多)；状态徽章配色；重启/存活/状态 3 列排序；POD 名称列头快捷批量选择 Dropdown：全选本页/反选本页/取消全部；Pod名/IP 复制）。快捷批量选择的「全选所有/反选所有」按需求详情表标注**暂时去掉**（不实现，与需求 AC 行 454 的差异以此为准）。Skill: none
- Proof：GPU 列显隐、详细模式扩展行为空列垂直居中等以构建 + 探索性验证为准；纯派生（列可见性、排序参数）尽量抽函数加单测。Skill: none

[x] Exit Criteria:

- [x] 分组表格按组渲染、每组独立分页/筛选/排序，翻页互不影响
- [x] 详细/精简模式、GPU 列显隐、状态徽章、复制、快捷批量选择、组操作菜单（含 YAML 占位 gating）落地
- [x] 空/加载/错误/无权限态有反馈
- [x] `docs/logs/` updated

### Phase 5 - 跨组多选 + BatchActionBar 显隐接入（Add）

Status: done

- Add：跨组选中态累计（group A + group B 累加，`selection.ts` 纯逻辑）；`PodContentArea` 通过 `onSelectedCountChange` 上报累计数量。Skill: none
- Decision：H 区显隐采用**状态提升 + props**（页面持有 `selectedCount`，>0 时经既有 `AnimatePresence` 浮现 `BatchActionBar` 并展示"已选择 N 个实例"），而非子需求 1 设想的 createPortal 子元素探测。理由：等价行为、更少样板、避免跨层 portal 复杂度；备选（createPortal + MutationObserver 探测）拒绝——过度设计。剩余风险：低。Skill: none
- Fix：`index.tsx` 移除临时 `mockVisible` toggle 与 `ContentAreaPlaceholder`，改由选中数量驱动 H；`BatchActionBar` 壳子展示"已选择 N 个实例"（按钮业务逻辑仍属后续切片）。Skill: none
- Proof：跨组累计计数纯逻辑单测。Skill: none

[x] Exit Criteria:

- [x] 勾选任意组 Pod → H 浮现并显示跨组累计数量；全部取消 → H 消失
- [x] 保留既有 AnimatePresence 显隐动画机制
- [x] `docs/logs/` updated

### Phase 6 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（新增文件无告警）/ `yarn test` / `yarn build`。Skill: none
- Proof：探索性验证 1920×1080 分辨率下内容区正常展示（需求 AC）。Skill: none
- Fix：`pod-list-content-area.md` 状态 → 已实现；`docs/logs/2026/07-25.md` 追加实现记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过（新增文件 lint 无告警）
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（D/E/F 区按需求可测标准落地，真实 API 驱动）
- [x] relevant docs are aligned（需求状态 + plan/log 一致）
- [x] verification has run（lint-type / lint / test / build）
- [x] closure audit was independent（2026-07-25 General subagent PASS，无阻塞项；N1/N4 视觉保真差异为已知非阻塞）

## Risks & Open Questions

- **单 plan 覆盖较大结果面**：经用户确认按单 plan 分阶段实现、末尾统一关闭 + 一次提交（用户 2026-07-25 指示）。范围虽大但为同一结果面（子需求 2 内容区），各 Phase 以 Exit Criteria 分段验证，任一未达标不关闭。
- **范围变更（mock → 真实 API）**：用户 2026-07-25 指示纳入真实 API，已更新 `pod-list-content-area.md` 与父需求 Out-of-Scope；本切片不改 API 契约。
- **数据缺口**：服务暴露列无接口字段 → 占位；`containers[].ports[]` 以实体现有 `name/port` 渲染（若线上为空按占位）。均记录于需求，不阻塞。
- **每组独立请求的性能**：组数较多时并发 getPods；本切片按需触发（展开态加载），不引入查询缓存库。
- 本 plan 需经独立 draft review 收敛为 `planned` 后进入实现；关闭前需 independent closure audit。

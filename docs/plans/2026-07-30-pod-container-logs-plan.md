# 2026-07-30-pod-container-logs Pod 容器日志模块（流式接入）

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-30
> Draft Review: 2026-07-30 独立审计（General subagent）初版 FAIL；已按结论修正——补空态/断流重连入口 Goals+Phase3、新增流路径 401/session 与参数序列化补偿项（Phase1）、历史+增量 Decision 标注回填需求、搜索命中高亮、基线措辞（标记/窗口无 handler）后收敛为 planned
> Closure Audit: 2026-07-30 独立关闭审计（General subagent）初版 FAIL；已按结论修正——「在窗口打开」改为 Out Of Scope 占位（需求+plan 对齐）、resume 后 markerAfterId 复位、需求 Flow2/规则 resume 文案对齐单流重载、`ContainerArea` 拆出 `ContainerSubTabs` 降至 <150 行、`runtimeLogStream` 补 TextDecoder flush 并 <140 行；复验 lint-type/lint/test(17)/build 通过
> Closure Hold: 2026-07-30 按用户要求标记为未完成——代码与静态验证已通过，但保留待真实后端日志流联调验证后再正式关闭
> Source: docs/requirements/pod-container-logs.md（父需求 pod-detail-drawer.md）+ Figma Frame 1444（463:46340）

## Remaining Before Closure

- [ ] **传输层改造为 SSE**：现有 HTTP 流式（fetch `ReadableStream`）接口存在问题，`streamContainerLogs` 需按 SSE 重做；传输层方案确定前保持未完成（见需求 2026-07-30 调整）
- [ ] **暂停行为重做**：由现「暂停中止流 + 开启重载」改为「**暂停不断流 + 缓存（默认 3min 上限）+ 开启 append 续接**」；`useContainerLogStream` 的 pause/resume 逻辑需相应改写
- [ ] 固定 `tailLines`（当前 500）与暂停缓存上限（3min）按实测/产品确认收敛并回填需求
- [ ] 残留（低优先）：标记分隔线所在行被级别/关键字过滤隐藏时不显示，考虑锚定到稳定 sentinel

## Current Baseline

- `ContainerLogs.tsx`（`src/pages/Workloads/PodContentArea/PodDetailDrawer/`）为占位 UI：来源 Segmented（标准输出/文件输出）、状态 Select（空）、搜索框、暂停/标记/窗口/全屏按钮，其中仅暂停、全屏有本地 `useState` toggle，标记、在窗口查看按钮无 handler；内容区为 `ConsolePlaceholder` 文本占位，**不接接口**。
- 接口 `runtimeResourceApi.getContainerLogs()`（`src/api/runtimeResource.ts:167`）已定义，参数含 `source/tailLines/headLines/previous/filePath/follow`，响应类型 `string`。
- **`getContainerLogs` 经 `axios-interface`（`createInterface`）封装，无法消费 `follow=true` 的不结束 HTTP 流**（onResolve 取 `response.data`，一次性返回）。
- 已有流式消费范式：`src/api/ai/chat.ts` 用原生 `fetch()` + `res.body.getReader()` + `AbortController` 逐块解析（SSE），可作为模式参考。
- 请求基线：baseURL `/api/cnap/rest/v1`；鉴权头（`x-region`/`baggage`/`x-account-id`）+ `withCredentials` 由 `getCommonOptionsForAppspace()`（`src/api/services/primary/commonOptions.ts`）提供。
- 无 WebSocket 使用；无 axios `responseType:'stream'` 用法。
- 用户已确认：「屏蔽与接流」本期不做；`source=file` 由新增 `filePath` 输入框输入并确定后传参；其余非阻塞项暂无答案。

## Goals

- 容器「日志」子 Tab 接入真实日志：首屏拉历史 + `follow` 流式增量追加渲染，深色控制台样式、按日志级别着色（对照 Figma Frame 1444）。
- 来源开关：标准输出（不传 `source`）↔ 容器内文件（`source=file`）；来源=文件时展示 `filePath` 输入框，输入并确定后按该路径加载。
- 暂停/开启按钮控制 `follow`：开启=建立流式跟随并自动滚动；暂停=中止流、停止追加、停止自动滚动。
- 小旗子标记：在当前最新一条日志下方插入分隔线（纯前端视觉），新日志渲染在其下。
- 搜索（命中高亮）、日志级别筛选、全屏、在窗口打开。
- 空态与异常态：空日志占位、搜索无命中空态、流断开中断提示 + 重连入口。
- 切换容器 / 切换来源 / 关闭 Drawer / 组件卸载时正确中止流（无连接泄漏）。

## Non-Goals

- 「屏蔽与接流」下拉功能（本期移出）。
- 日志下载/导出、跨会话持久化、按时间范围查询（sinceTime/untilTime）、多容器聚合。
- 终端子 Tab（`ContainerTerminal` 单独负责）。
- `previous`（上次实例日志）接入 —— 待非阻塞项确认后另行切片。
- 修改 `getContainerLogs` 现有 `createInterface` 契约（新增独立流式消费路径，不改原封装）。

## Task Route

- Type: app-layer change + 新增流式消费能力（前端基础设施小扩展）
- Owner Docs: `docs/requirements/pod-container-logs.md`、`docs/design/design-tokens.md`
- 关联真源：Figma Frame 1444；参考范式 `src/api/ai/chat.ts`

## Design Notes（影响范围的关键决策）

- **流式方案**：`follow` 流用**原生 `fetch()` + `ReadableStream` reader + `AbortController`**，独立于 `axios-interface` 主工厂；复用 `getCommonOptionsForAppspace()` 注入鉴权头 + `credentials:'include'`，URL 用同一 baseURL 前缀拼接。理由：`axios-interface` 的 onResolve 一次性取 data，无法消费不结束的流；`chat.ts` 已验证该范式。注意：`chat.ts` 消费的是 SSE `data:` 帧且 signal 由调用方传入，本模块为**纯文本按行**流、`AbortController` 内部创建，需自行实现。
- **绕过工厂的横切能力补偿**：原生 fetch 不经过工厂的 `onReject → tryConfirmSessionLost`（session 失效处理）、`paramsSerializer`（`source/tailLines/filePath` 序列化）与 DEV `mock/enhance` 层，需在流路径手动补齐 401/session 失效处理与查询参数序列化对齐。
- **历史 + 增量衔接**：进入/切换时先按 `tailLines` 建立 `follow=true` 流（首包即历史尾部、后续为增量），单一流处理，避免"先拉历史再另起流"的去重问题。若接口语义不支持，则回退"先取历史快照 + 再起 follow 流并按行去重"（Phase 1 Decision 中定）。
- **前端过滤**：搜索/级别筛选按前端过滤实现（接口无 keyword/level 参数），不改请求；此为需求非阻塞假设，标注可回退为接口参数。
- **行缓冲上限**：前端保留最近 N 行滚动缓冲，超出丢弃最旧行防内存膨胀（N 默认值在 Phase 2 Decision 定）。
- **组件/文件结构**（每文件 ≤150 行）：`ContainerLogs.tsx`（业务/工具栏容器）+ 新增 `LogConsole`（内容区渲染，业务/布局分离）+ 纯逻辑 `logLine.ts`（级别解析/着色映射/搜索过滤/缓冲裁剪）+ `containerLogsStream.ts`（fetch 流消费）+ `*.style.ts` + `__tests__`。
- **Design tokens**：控制台深色背景/级别色若无现成 `semantic.*` token，则在 `@/constants/colors` 扩展语义 token，**禁止组件内 hex 字面量**。

## Execution Plan

### Phase 1 - 流式日志消费能力（Add）

Status: done

- Add：`containerLogsStream.ts` —— 基于 `fetch()` + `ReadableStream` 消费容器日志流，注入鉴权头（复用 `getCommonOptionsForAppspace`）+ `credentials`，支持 `source/tailLines/filePath/follow` 参数，逐行回调 `onLine`，`AbortController` 中止，错误/结束回调。落地为 `src/api/runtimeLogStream.ts`（`streamContainerLogs` + 纯逻辑 `createLineAssembler`/`buildContainerLogUrl`）。Skill: none
- Add：流路径补齐工厂横切能力 —— 401/session 失效处理（非 ok 响应调用 `tryConfirmSessionLost`）、查询参数经 `qs`（arrayFormat comma/skipNulls/allowDots）与 `paramsSerializer` 对齐、baseURL 前缀 `/api/cnap/rest/v1` 对齐。Skill: none
- Decision：历史与增量衔接采用**单条 follow 流**（一次请求携带 `tailLines` + `follow=true`，首包为历史尾部、后续为增量），逐行装配。备选：历史快照 + 另起 follow 流并按行去重（拒绝——需去重、且多一次请求）。剩余风险：若后端 `follow=true` 首包不含历史尾部，需回退备选方案；已在需求 Business Rules 对齐为单流策略。Skill: none
- Proof：`runtimeLogStream.test.ts` 覆盖行装配（跨 chunk 半行拼接、flush）与 URL 拼装（stdout/file/仅路径参数）共 6 用例。Skill: none

[x] Exit Criteria:

- [x] 流式消费函数可拉取并逐行回调日志，`AbortController` 可中止且无泄漏（abort 时静默返回不报错）
- [x] 401/session 失效与查询参数序列化在流路径正确处理
- [x] chunk 跨行边界处理有单测
- [x] 历史+增量衔接 Decision 已记录，需求条目已按结论对齐
- [x] `yarn lint-type` / `yarn test` 通过
- [x] `docs/logs/` updated

### Phase 2 - 日志内容区渲染（Add）

Status: done

- Add：`LogConsole` 内容区组件（深色控制台、逐行渲染、级别着色、自动滚动到底、分隔线标记锚点），自适应父容器宽高。落地 `LogConsole.tsx` + `LogConsole.style.ts`。Skill: none
- Add：`logLine.ts`（级别解析 + 前端搜索/级别过滤 + 行缓冲裁剪 + 关键字高亮切片）。Skill: none
- Add：深色控制台语义色扩展 `semantic.logConsole.*`（bg/text/timestamp/marker/highlight/level），禁止组件内 hex。Skill: none
- Decision：行缓冲上限 `MAX_LOG_LINES = 2000`，首屏 `tailLines = 500`。备选：无上限（拒绝——内存膨胀风险）。剩余风险：极大日志量下 2000 行上限可能偏小，可后续调参。Skill: none
- Proof：`logLine.test.ts` 覆盖级别识别/别名、过滤、缓冲裁剪、高亮切片共 11 用例。Skill: none

[x] Exit Criteria:

- [x] 内容区按级别着色渲染，深色样式与 Figma 一致，自动滚动/分隔线锚点可用
- [x] 缓冲超限丢弃最旧行
- [x] design tokens 合规（无 hex，新增 `semantic.logConsole`）
- [x] `docs/logs/` updated

### Phase 3 - 工具栏接线与交互（Add/Fix）

Status: done

- Fix：`ContainerLogs` 接入真实数据 —— 来源开关 + 文件路径输入框（source=file 展示，输入并确定后加载）+ 暂停/开启（follow 起停流）+ 旗子标记（分隔线）+ 搜索（命中高亮）+ 级别筛选 + 全屏/窗口。工具栏抽出 `ContainerLogsToolbar.tsx`，流生命周期抽出 `useContainerLogStream.ts`。Skill: none
- Fix：`ContainerArea` 向 `ContainerLogs` 传入 `appEnvID/clusterId/podName/containerName`；切换容器/来源/文件路径/卸载时经 hook effect cleanup 中止流并清空重载。Skill: none
- Decision：暂停保留已渲染内容；开启（resume）时清空并以新 follow 流重载（后端 follow 首包重发 tail，重载可避免重复）。备选：暂停点续接增量（拒绝——需后端游标支持，当前不具备）。剩余风险：resume 会重拉 tail 而非严格续接，已在需求记录。Skill: none
- Decision：搜索/级别筛选按前端过滤实现（接口无 keyword/level 参数）。备选：接口参数（拒绝——接口不支持）。剩余风险：大缓冲下前端过滤开销可控（≤2000 行）。Skill: none

[x] Exit Criteria:

- [x] 来源切换正确传 `source`；file 模式 filePath 输入并确定后加载，未输入不发起 file 请求
- [x] 暂停停止追加/滚动并中止流，开启恢复跟随
- [x] 标记插入分隔线，新日志渲染其下
- [x] 搜索命中高亮、级别筛选、全屏可用（「在窗口打开」为占位入口，已在需求列 Out Of Scope）
- [x] 空日志 / 搜索无命中 / 流断开（中断提示 + 重连入口）空态与异常态生效
- [x] 切换/关闭/卸载无流泄漏（AbortController cleanup）
- [x] `docs/logs/` updated

### Phase 4 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type`（通过）/ `yarn lint` 目标文件无告警 / `yarn test`（新增 17 用例通过，其余失败为既有基线：navigation accountId 类型、401、ResizeObserver、菜单路径）/ `yarn build`（通过）。Skill: none
- Fix：`pod-container-logs.md` 状态更新；`docs/logs/2026/07-30.md` 追加记录。Skill: none

[x] Exit Criteria:

- [x] 四项验证通过（test 仅剩既有基线失败，无本次新增失败）
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（来源/filePath、follow 暂停·开启、标记分隔线、搜索高亮、级别筛选、全屏、空态/断流重连均落地；「在窗口打开」为占位入口已列 Out Of Scope）
- [x] relevant docs are aligned（需求状态=已实现、plan Phase 全 done、log 已记录）
- [x] verification has run（lint-type / 目标文件 lint / test 新增 17 通过 / build）
- [x] closure audit was independent（2026-07-30 General subagent；初版 FAIL → 按 P2/P3 修正后复验通过）

## Risks & Open Questions

- **流式接入为新范式**：项目仅 `chat.ts` 有 fetch 流先例；容器日志流的鉴权/断线/心跳行为需实测验证（Phase 1 重点）。
- **历史+增量衔接语义未实测**：`follow=true` 首包是否含历史尾部未确认，Phase 1 Decision 依实测定，可能需去重回退方案。
- **非阻塞项未定**（前端 vs 接口过滤、tailLines 默认值、缓冲上限、级别解析规则、previous、标记是否多条、暂停跨容器继承）：以 plan 内默认值推进并标注，收敛后回填需求。
- **深色控制台 token**：若 `@/constants/colors` 无对应语义色需扩展，禁止 hex。
- **原生 fetch 绕过工厂横切能力**：session 失效处理、参数序列化、DEV mock 不再自动生效，需在流路径手动补齐（Phase 1）。否则日志流上的 401/session 过期不会触发统一失效处理。
- 本 plan 已通过独立 draft review（初版 FAIL → 已按 P1–P5 修正），收敛为 `planned`；关闭前需 independent closure audit。

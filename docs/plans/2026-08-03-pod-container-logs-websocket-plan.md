# 2026-08-03-pod-container-logs-websocket 容器日志 WebSocket 集成与暂停续接重做

> Plan Status: proposed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
> Source: docs/requirements/pod-container-logs.md（传输层已定 WebSocket）+ docs/input/source-api-runtime-workloads.md（2026-08-03 更新）

## Current Baseline

- 传输层已改造为 WebSocket：`src/api/runtimeLogStream.ts` 的 `streamContainerLogs` 已从 fetch `ReadableStream` 改为 `WebSocket`（`/ws/v1/.../logs`，服务端 text 消息，逐行装配 `createLineAssembler`），认证头转 query。单测 `runtimeLogStream.test.ts` 覆盖 URL 构造与装配，`yarn test` 该文件 6 passed。
- 日志 UI 已存在（首版 plan `2026-07-30-pod-container-logs-plan.md`）：`ContainerLogs.tsx` / `ContainerLogsToolbar.tsx` / `LogConsole.tsx` / `useContainerLogStream.ts` / `logLine.ts`，渲染真实日志、级别着色、搜索/级别筛选、标记线、全屏。
- **暂停行为与需求不符**：`useContainerLogStream.ts` 当前暂停（`following=false`）即 `active=false`，`useEffect` 提前 return 并 `controller.abort()` 中止流；开启时重新建流并 `setLines([])` 重载。需求要求「暂停不断流 + 后台缓存 + 开启续接 append」。
- 无断线重连自动化；`error` 态提供手动「重连」按钮（`reconnect` bump reloadToken）。

## Goals

- 日志跟随/暂停行为对齐需求：暂停时**不关闭 WebSocket**，停止向视图追加并将增量写入内存缓存（默认 3min 时间窗上限）；开启后按序 append 缓存增量并继续跟随（无重复、无重载）。
- 保持切换容器/来源/关闭 Drawer 时中止连接并清空缓存（无泄漏）。
- 断线时保留已渲染内容并提供重连入口。

## Non-Goals

- 修改 WebSocket 传输层本身（已完成，不改 `streamContainerLogs` 契约）。
- 日志下载/导出、跨会话持久化、时间范围查询、多容器聚合（需求 Out Of Scope）。
- 状态筛选/搜索改为接口参数（保持前端过滤）。
- `previous`（上次实例日志）本期不接入。

## Task Route

- Type: app-layer behavior change（改用户可见的暂停/续接行为，不改 API 契约）
- Owner Docs: `docs/requirements/pod-container-logs.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`

## Design Notes（影响范围的关键决策）

- **暂停缓存归属**：缓存逻辑放在 `useContainerLogStream`（数据层），`ContainerLogs`/`LogConsole` 仅消费 `lines`。暂停时 WebSocket 保持打开，`onLine` 回调改为写入缓存队列而非直接 `setLines`；开启时 flush 缓存到 `lines`。
- **缓存上限**：按时间窗 3min（默认，可配置常量）；超限丢弃最旧缓存增量。是否叠加行数上限见 Open Questions。
- **连接生命周期**：following 保持 true 建流；`active` 不再随 following 变化——只要在日志页面且 fileReady 就保持连接，following 仅决定渲染 vs 缓存。切换容器/来源/卸载仍 abort + 清空。

## Execution Plan

### Phase 1 - 暂停/续接数据层重做（Fix）

Status: proposed

- Fix：`useContainerLogStream.ts` 暂停语义——连接生命周期与 following 解耦；暂停写缓存、开启 flush+append，缓存带 3min 时间窗上限。Skill: none
- Decision：缓存上限策略（时间窗 3min vs 叠加行数上限）。记录选择/备选/剩余风险。Skill: none
- Proof：为缓存/flush 纯逻辑抽函数并补单测（时间窗裁剪、append 顺序、无重复）。Skill: none

[ ] Exit Criteria:

- [ ] 暂停不关闭连接、不追加渲染、增量进缓存；开启 append 缓存并继续跟随（无重复、无重载）
- [ ] 缓存超 3min 丢弃最旧、开启从保留部分续接
- [ ] 缓存/flush 纯逻辑单测通过
- [ ] `docs/logs/` updated

### Phase 2 - 切换/卸载/断线行为校验（Fix/Proof）

Status: proposed

- Fix：切换容器/来源、关闭 Drawer、离开日志页面中止连接并清空缓存（校验无泄漏）。Skill: none
- Fix：断线（onError/onclose 非正常）保留已渲染内容 + 展示重连入口；重连清空重载。Skill: none
- Proof：手动/探索性验证记录（`docs/testing/`）。Skill: none

[ ] Exit Criteria:

- [ ] 切换容器/来源/关闭 Drawer 无连接泄漏、缓存清空
- [ ] 断线保留内容 + 重连入口可用
- [ ] `docs/logs/` updated

### Phase 3 - 验证与收口（Proof）

Status: proposed

- Proof：`yarn lint-type` / `yarn lint`（改动文件无新增告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`pod-container-logs.md` 状态 → 已实现（移除「暂停/续接重做」待办）；`docs/logs/2026/08-03.md` 追加。Skill: none

[ ] Exit Criteria:

- [ ] 四项验证达基线
- [ ] 需求状态与日志一致
- [ ] `docs/logs/` updated

## Closure Gates

- [ ] in-scope behavior is complete
- [ ] relevant docs are aligned
- [ ] verification has run
- [ ] closure audit was independent

## Risks & Open Questions

- **[非阻塞] 缓存上限**：3min 时间窗是否叠加行数上限、超限提示文案（需求 Open Questions）。
- **[非阻塞] 固定 tailLines**（首版 500）、前端滚动缓冲行数（首版 2000）待确认。
- **[非阻塞] 日志级别解析规则**：行格式与级别关键字集合。
- 本 plan 实现前需 independent draft review；关闭前需 independent closure audit。

# 2026-08-03-pod-container-logs-websocket 容器日志 WebSocket 集成与暂停续接重做

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
> Draft Review: 2026-08-03 独立 draft review（General subagent）FAIL → 已修正：默认 follow=true 纳入 Phase 1 scope+exit；端点 shorthand 改 `/api/cnap/ws/v1`；补 followingRef/到达时间裁剪/flush→trim 说明。收敛为 planned。
> Closure Audit: pending（实现 + 静态验证已过，运行时手动证明与 independent closure audit 未做）
> Source: docs/requirements/pod-container-logs.md（传输层已定 WebSocket）+ docs/input/source-api-runtime-workloads.md（2026-08-03 更新）

## Current Baseline

- 传输层已改造为 WebSocket：`src/api/runtimeLogStream.ts` 的 `streamContainerLogs` 已从 fetch `ReadableStream` 改为 `WebSocket`（`/api/cnap/ws/v1/.../logs`，服务端 text 消息，逐行装配 `createLineAssembler`），认证头转 query。单测 `runtimeLogStream.test.ts` 覆盖 URL 构造与装配，`yarn test` 该文件 6 passed。
- 日志 UI 已存在（首版 plan `2026-07-30-pod-container-logs-plan.md`）：`ContainerLogs.tsx` / `ContainerLogsToolbar.tsx` / `LogConsole.tsx` / `useContainerLogStream.ts` / `logLine.ts`，渲染真实日志、级别着色、搜索/级别筛选、标记线、全屏。
- **暂停行为与需求不符**：`useContainerLogStream.ts` 当前暂停（`following=false`）即 `active=false`，`useEffect` 提前 return 并 `controller.abort()` 中止流；开启时重新建流并 `setLines([])` 重载。需求要求「暂停不断流 + 后台缓存 + 开启续接 append」。
- **默认态与需求不符**：`ContainerLogs.tsx:38` 默认 `following=false`（进入即暂停），而需求 AC（`pod-container-logs.md`「默认 follow=true」）要求进入日志 Tab 默认跟随。当前默认下进入 Tab 不建流、不展示历史；且在新设计下（暂停即缓存）默认暂停会把首包历史打进缓存并可能被 3min 窗口丢弃，必须一并改默认为 follow=true。
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

Status: done

- Fix：`ContainerLogs.tsx` 默认 `following=true`（对齐需求「默认跟随」AC），进入 Tab 即建流展示历史 + 跟随。Skill: none
- Fix：`useContainerLogStream.ts` 暂停语义——连接生命周期与 following 解耦（`active` 不再依赖 following，仅依赖 fileReady + reloadToken；保留 reconnect）；暂停写缓存、开启 flush+append，缓存带 3min 时间窗上限。用 `followingRef` 读实时暂停态（`onLine` 闭包避免读到 stale following）。Skill: none
- Decision：缓存上限策略——时间窗按**客户端到达时间**（`onLine` 仅给 raw 文本、无时间戳，故用 `Date.now()` 打点）裁剪；flush 后经 `trimLogLines`（`MAX_LOG_LINES=2000`）封顶。备选：叠加行数上限（可后续加）。剩余风险：低。Skill: none
- Proof：`logLine.ts` 抽 `pruneCache`（+ `CachedLogLine`/`PAUSE_CACHE_WINDOW_MS`），`logLine.test.ts` 新增 3 用例（按到达时间裁剪、窗口内全保留、全过期返回空）。Skill: none

[x] Exit Criteria:

- [x] 进入日志 Tab 默认跟随（follow=true）：建流、渲染历史尾部 + 后续增量
- [x] 暂停不关闭连接、不追加渲染、增量进缓存；开启 append 缓存并继续跟随（无重复、无重载）
- [x] 缓存超 3min 丢弃最旧、开启从保留部分续接；flush 后经 trimLogLines 封顶
- [x] 缓存/flush 纯逻辑单测通过（`yarn test logLine` 14 passed）
- [x] `docs/logs/` updated

### Phase 2 - 切换/卸载/断线行为校验（Fix/Proof）

Status: partially completed

- Fix：切换容器/来源、关闭 Drawer、离开日志页面中止连接并清空缓存（effect 依赖变化触发 cleanup `controller.abort()` + 重置）。Skill: none
- Fix：断线（onError/onclose 非正常）保留已渲染内容 + 展示重连入口（`ContainerLogs` error Alert + 「重连」按钮）；重连清空重载。Skill: none
- Proof：手动/探索性验证记录（`docs/testing/`）—— **未做**（无实时后端/浏览器手测）。Skill: none

[ ] Exit Criteria:

- [x] 切换容器/来源/关闭 Drawer 无连接泄漏、缓存清空（代码级：effect cleanup abort + 依赖重置；静态验证通过）
- [x] 断线保留内容 + 重连入口可用（代码级）
- [ ] 运行时手动/探索性证明（`docs/testing/`）—— pending
- [x] `docs/logs/` updated

### Phase 3 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（改动文件无新增告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`pod-container-logs.md` 状态 → 已实现（移除「暂停/续接重做」待办）；`docs/logs/2026/08-03.md` 追加。Skill: none

[x] Exit Criteria:

- [x] 四项验证达基线（lint-type ✅ / test ✅ 20 passed / lint 改动文件无告警 / build ✅）
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（默认跟随 + 暂停不断流缓存 + 开启续接 + 切换/断线处理，代码落地并静态验证）
- [x] relevant docs are aligned（需求 pod-container-logs.md 状态更新 + 日志一致）
- [x] verification has run（lint-type / test / lint / build）
- [ ] closure audit was independent（pending；另需运行时手动证明）

## Risks & Open Questions

- **[非阻塞] 缓存上限**：3min 时间窗是否叠加行数上限、超限提示文案（需求 Open Questions）。
- **[非阻塞] 固定 tailLines**（首版 500）、前端滚动缓冲行数（首版 2000）待确认。
- **[非阻塞] 日志级别解析规则**：行格式与级别关键字集合。
- 本 plan 实现前需 independent draft review；关闭前需 independent closure audit。

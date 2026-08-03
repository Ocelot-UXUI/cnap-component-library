# 2026-08-03-pod-container-terminal 容器 Web 终端 WebSocket 集成

> Plan Status: partially completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
> Draft Review: 2026-08-03 独立 draft review（General subagent）FAIL → 已修正三处：(1) API 增补 backward-compatible `onOpen?` handler 驱动 connected/初始 resize（放宽 Non-Goal）；(2) 深色底改用 `semantic.logConsole.bg` token（去 hex 字面量）；(3) `ContainerTerminal/` 目录拆分 index+hook+style 以守 150 行/组件目录约定。收敛为 planned。
> Closure Audit: pending（实现 + 静态验证已过，运行时手动证明与 independent closure audit 未做）
> Source: docs/requirements/pod-container-terminal.md（Figma 终端 Tab 截图 + WebSocket 接口）+ docs/input/source-api-runtime-workloads.md（2026-08-03 更新）

## Current Baseline

- 接口层已就绪：`src/api/runtimeTerminal.ts` 提供 `connectContainerTerminal(params, handlers)`，基于 `v5.channel.k8s.io` 协议（`/ws/v1/.../terminal`），二进制帧 channel（0 stdin / 1 stdout / 2 stderr / 3 error / 4 resize），返回 `{sendInput, resize, close}` 控制器，认证头转 query，`binaryType='arraybuffer'`。
- UI 为占位：`ContainerTerminal.tsx` 仅本地 `connected`/`fullscreen` state + 工具栏（Shell Select、连接/断开、清屏/在窗口打开/全屏），**内容区为占位文本，无 WebSocket、无终端渲染**。当前不接收 props（未拿到 appEnvID/clusterId/podName/containerName）。
- `ContainerSubTabs.tsx` 以 `<ContainerTerminal />` 挂载（无 props 透传），已向 `ContainerLogs`/`ContainerEvents` 传 appEnvID/clusterId/podName/containerName。
- 无终端渲染库：`package.json` 无 xterm 相关依赖（本次调研曾试装 `@xterm/xterm`+`@xterm/addon-fit` 后回退）。

## Goals

- 终端子 Tab 从占位升级为真实交互式终端：连接后经 `connectContainerTerminal` 建立会话，渲染 stdout/stderr，键盘输入经 stdin 发送。
- 连接/断开切换、清屏（未连接禁用 + hover 提示）、全屏、在窗口打开、尺寸自适应 resize，符合 `pod-container-terminal.md` 验收。
- 切换容器/关闭 Drawer/离开页面时关闭会话，无连接泄漏。

## Non-Goals

- 不重写终端 WebSocket 协议层（`v5.channel.k8s.io` 帧编解码、channel 语义保持）。**例外（允许的加法式改动）**：为 `ContainerTerminalHandlers` 增补可选 `onOpen?`（`connectContainerTerminal` 内 set `socket.onopen`），并把 per-frame `TextDecoder` 改为流式（`{stream:true}`）以支持跨帧多字节 UTF-8——二者均向后兼容，不改变既有 `onData/onError/onDone` 与控制器契约。
- 多终端并行会话、会话持久化/回放、终端内文件传输、主题自定义（需求 Out Of Scope）。
- 「在窗口打开」的独立页面路由目标（与 pod-detail-drawer Open Question #3 一致，本期仅入口）。
- 心跳保活本期不做（后端 relay 空闲约 10min 断开，见 Open Questions）。

## Task Route

- Type: app-layer feature（新用户可见交互面，接入既有 WebSocket 接口）
- Owner Docs: `docs/requirements/pod-container-terminal.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`、参考 `docs/input/WEBSSH_TERMINAL_GUIDE.md`

## Design Notes（影响范围的关键决策）

- **渲染库**：引入 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`）承载终端渲染与输入；`@xterm/addon-fit` 计算行列驱动 `resize`；CSS 走 `@xterm/xterm/css/xterm.css`。实现模式参考 `docs/input/WEBSSH_TERMINAL_GUIDE.md`（该指南基于 xterm v4，`import`/包名按 v6 适配：`xterm`→`@xterm/xterm`、`xterm-addon-fit`→`@xterm/addon-fit`）；不用 attach addon（走自定义 `v5.channel.k8s.io` 帧）。`v5.channel.k8s.io` 帧与 xterm 的 `onData`（输入）/`write`（输出）对接。见 Phase 1 Decision。
- **Shell 选项**：`/bin/bash` / `/bin/sh`，默认 `/bin/bash`；选中值原样作为 `connectContainerTerminal` 的 `command`。
- **断开后内容**：断开保留终端最后画面（不清空），重连时按需重置。
- **props 透传**：`ContainerSubTabs` 向 `ContainerTerminal` 透传 `appEnvID/clusterId/podName/containerName`（对齐 `ContainerLogs`），供 `connectContainerTerminal` 使用。
- **深色底与配色**：终端内容区背景/前景复用日志控制台 token `semantic.logConsole.bg` / `semantic.logConsole.text`（与 `LogConsole.style.ts` 一致），同时作为 xterm `theme.background`/`foreground`；**禁止 `rgba(12,12,12,1)` 等 hex/字面量**。断开按钮红态走 `semantic.state.error.default`（成员，非 group）。
- **文件结构（守 150 行/组件目录约定）**：新建 `ContainerTerminal/` 目录——`index.tsx`（视图：工具栏 + 容器挂载点）+ `useContainerTerminal.ts`（xterm 实例 + WS 生命周期 hook）+ `ContainerTerminal.style.ts`（同目录样式）；调用方只 import 公共入口 `ContainerTerminal`。删除原单文件 `ContainerTerminal.tsx`。
- **业务/布局分离**：终端渲染为业务组件，自适应父布局宽高；布局用 `@emotion/styled`，样式置于 `ContainerTerminal.style.ts`，颜色/圆角/间距走 design tokens，无 hex。
- **会话生命周期**：`connected` 由 WebSocket 事件驱动——`onOpen` 置 true 并触发首次 `fit()`+`resize()`，`onclose`/`onError` 置 false 恢复「连接」态并提示；连接中（CONNECTING）展示 loading；卸载/切换容器 `close()`。

## Execution Plan

### Phase 1 - 依赖、API 加法式补齐与终端渲染骨架（Add/Decision/Fix）

Status: done

- Decision：终端渲染库定为 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`，锁定版本）。选择：v6 为当前维护版本，兼容 React 19 / Vite 8；实现模式参考 `WEBSSH_TERMINAL_GUIDE.md`（v4）按 v6 适配 import/包名。备选（v4——拒绝，已停维护 / 自绘——拒绝）。剩余风险：低（核心 `Terminal`/`FitAddon` API 稳定；v6 移除 canvas renderer、CSS 走 `@xterm/xterm/css/xterm.css`）。Skill: none
- Fix：`src/api/runtimeTerminal.ts` 加法式补齐——`ContainerTerminalHandlers` 增补可选 `onOpen?`，`connectContainerTerminal` 内 set `socket.onopen`；per-frame `TextDecoder` 改 stdout/stderr 分通道共享实例 `{stream:true}` 以支持跨帧多字节 UTF-8。二者向后兼容，不改既有契约。Skill: none
- Add：新建 `ContainerTerminal/` 目录（`index.tsx` + `useContainerTerminal.ts` + `ContainerTerminal.style.ts`），删除原 `ContainerTerminal.tsx`；`ContainerSubTabs` 透传 `appEnvID/clusterId/podName/containerName`。Skill: none
- Add：xterm 实例挂载/销毁 + `addon-fit` + ResizeObserver 自适应容器宽高；深色底/前景用 `semantic.logConsole.bg`/`.text`（同步 xterm theme），等宽字体。Skill: none

[x] Exit Criteria:

- [x] `@xterm/xterm@6.0.0` + `@xterm/addon-fit@0.11.0` 入 `package.json`（锁定版本）
- [x] `runtimeTerminal.ts` 新增 `onOpen?` 且既有测试/调用不破坏；TextDecoder 流式
- [x] `ContainerTerminal/` 目录三文件成形，每文件 ≤150 行，`ContainerSubTabs` 透传 props
- [x] 终端容器挂载 xterm、自适应父布局宽高、卸载正确销毁；无 hex 字面量
- [x] `docs/logs/` updated

### Phase 2 - 连接/断开 + I/O + resize（Add）

Status: partially completed

- Add：连接按钮建立 `connectContainerTerminal`（`command` 取自 Shell Select，选项 `/bin/bash` / `/bin/sh`，默认 `/bin/bash`，原值传参）；`onOpen` 置 connected=true 并触发首次 `fit()`+`resize()`（避免在 CONNECTING 态发 resize 被丢弃）；stdout/stderr → `term.write`，`term.onData` → `sendInput`；连接态切换「连接」↔「断开」（红态 `semantic.state.error.default`），连接中显示 loading。Skill: none
- Add：容器/窗口尺寸变化（ResizeObserver + `addon-fit`）计算行列并调用 `resize(rows, cols)`。Skill: none
- Add：断开按钮/卸载/切换容器调用 `close()`；**断开后保留终端最后画面（不清空）**；连接失败/断线（`onError`/`onclose`）恢复「连接」态 + 提示。Skill: none

[ ] Exit Criteria:

- [x] 连接/断开/IO/resize 全链路代码落地（onOpen 驱动 connected + 首次 resize、onData↔write/sendInput、ResizeObserver）；静态验证通过
- [ ] 连接后可见 stdout/stderr、键盘输入回显、resize 生效——**运行时手动证明 pending**（需实时后端）
- [x] 连接失败/断线恢复「连接」态 + Alert 提示；切换容器/卸载 `close()` 无泄漏（代码级）
- [x] `docs/logs/` updated

### Phase 3 - 操作按钮与状态规则（Add/Fix）

Status: done

- Add：清屏——连接后 `term.clear()` 并 `message.success('已清空')`；未连接置灰禁用，`<span>` 包裹使 Tooltip 在 disabled 下仍显示"当前未连接命令解释器，无法清空"。Skill: none
- Add：三个右侧按钮 hover tooltip；全屏切换（全屏 ↔ 退出全屏，切换后 `syncSize` 重适配）；在窗口打开入口（本期仅入口）。Skill: none

[x] Exit Criteria:

- [x] 清屏禁用/hover 提示/清屏成功提示符合截图
- [x] tooltip、全屏切换可用
- [x] design tokens（无 hex）
- [x] `docs/logs/` updated

### Phase 4 - 验证与收口（Proof）

Status: done

- Proof：`yarn lint-type` / `yarn lint`（改动文件无新增告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`pod-container-terminal.md` 状态 → 已实现；`docs/logs/2026/08-03.md` 追加。Skill: none

[x] Exit Criteria:

- [x] 四项验证达基线（lint-type ✅ / test ✅ 20 passed / lint 改动文件无告警 / build ✅ xterm v6 打包）
- [x] 需求状态与日志一致
- [x] `docs/logs/` updated

## Closure Gates

- [x] in-scope behavior is complete（连接/断开/IO/resize/清屏/全屏/在窗口入口 代码落地并静态验证）
- [x] relevant docs are aligned（需求 pod-container-terminal.md + 日志一致）
- [x] verification has run（lint-type / test / lint / build）
- [ ] closure audit was independent（pending；另需运行时手动证明 Phase 2 的实时 IO/resize）

## Risks & Open Questions

> 已定（2026-08-03，owner）：终端渲染库定为 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`），实现模式参考 `WEBSSH_TERMINAL_GUIDE.md`（v4，按 v6 适配 import/包名）；Shell 选项 `/bin/bash` / `/bin/sh`（原值作 `command`，默认 `/bin/bash`）；断开后保留最后画面。

- **[非阻塞] 心跳保活**：本期不做；后端 relay 空闲约 10min 断开（`WEBSSH_TERMINAL_GUIDE.md`），空闲超时会掉线。后续可加 `sendInput` keepalive 帧，不改 API。
- **[非阻塞] 清屏"失败"场景定义**：清屏为纯前端 `term.clear()`，失败场景与提示文案待明确（首版可仅提示成功）。
- **[非阻塞] 在窗口打开路由目标**（pod-detail-drawer Open Question #3）。
- **[非阻塞] 跨帧 UTF-8**：已在 Phase 1 用共享 `TextDecoder({stream:true})` 处理，消除 cnap1.0 遗留的多字节乱码风险。
- 本 plan 已通过 independent draft review（2026-08-03，见头部）→ planned；关闭前需 independent closure audit。

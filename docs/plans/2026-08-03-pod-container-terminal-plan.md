# 2026-08-03-pod-container-terminal 容器 Web 终端 WebSocket 集成

> Plan Status: proposed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-03
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

- 修改终端 WebSocket 接口层（`runtimeTerminal.ts` 已就绪，不改契约）。
- 多终端并行会话、会话持久化/回放、终端内文件传输、主题自定义（需求 Out Of Scope）。
- 「在窗口打开」的独立页面路由目标（与 pod-detail-drawer Open Question #3 一致，本期仅入口）。

## Task Route

- Type: app-layer feature（新用户可见交互面，接入既有 WebSocket 接口）
- Owner Docs: `docs/requirements/pod-container-terminal.md`、`docs/design/design-tokens.md`
- 关联真源：`docs/input/source-api-runtime-workloads.md`、参考 `docs/input/WEBSSH_TERMINAL_GUIDE.md`

## Design Notes（影响范围的关键决策）

- **渲染库**：引入 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`）承载终端渲染与输入；`@xterm/addon-fit` 计算行列驱动 `resize`；CSS 走 `@xterm/xterm/css/xterm.css`。实现模式参考 `docs/input/WEBSSH_TERMINAL_GUIDE.md`（该指南基于 xterm v4，`import`/包名按 v6 适配：`xterm`→`@xterm/xterm`、`xterm-addon-fit`→`@xterm/addon-fit`）；不用 attach addon（走自定义 `v5.channel.k8s.io` 帧）。`v5.channel.k8s.io` 帧与 xterm 的 `onData`（输入）/`write`（输出）对接。见 Phase 1 Decision。
- **Shell 选项**：`/bin/bash` / `/bin/sh`，默认 `/bin/bash`；选中值原样作为 `connectContainerTerminal` 的 `command`。
- **断开后内容**：断开保留终端最后画面（不清空），重连时按需重置。
- **props 透传**：`ContainerSubTabs` 向 `ContainerTerminal` 透传 `appEnvID/clusterId/podName/containerName`（对齐 `ContainerLogs`），供 `connectContainerTerminal` 使用。
- **业务/布局分离**：终端渲染为业务组件，自适应父布局宽高；工具栏与内容区布局用 `@emotion/styled`，样式置于同目录 `*.style.ts`，颜色/圆角/间距走 design tokens（断开按钮红态走 `semantic.state.error`），无 hex。
- **会话生命周期**：`connected` 由真实 WebSocket 状态驱动；卸载/切换容器 `close()`；连接失败/断线恢复「连接」态并给提示。

## Execution Plan

### Phase 1 - 依赖与终端渲染骨架（Add/Decision）

Status: proposed

- Decision：终端渲染库定为 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`）。选择：v6 为当前维护版本，与 React 19 / Vite 8 工具链兼容；实现模式仍参考 `WEBSSH_TERMINAL_GUIDE.md`（v4），按 v6 适配 import/包名。备选（指南原版 `xterm@^4.13.0`——拒绝，v4 已停止维护且与新工具链兼容性存疑 / 自绘——拒绝，成本高）。剩余风险：低（v6 API 与 v4 基本一致，主要差异在包名与 CSS 引入路径）。Skill: none
- Add：`ContainerTerminal` 接收 `appEnvID/clusterId/podName/containerName` props；`ContainerSubTabs` 透传。Skill: none
- Add：xterm 实例挂载/销毁 + `addon-fit` 自适应容器宽高（深色内容区 `rgba(12,12,12,1)`，等宽字体）。Skill: none

[ ] Exit Criteria:

- [ ] 依赖入 `package.json`（锁定版本）
- [ ] 终端容器挂载 xterm、自适应父布局宽高、卸载正确销毁
- [ ] `docs/logs/` updated

### Phase 2 - 连接/断开 + I/O + resize（Add）

Status: proposed

- Add：连接按钮建立 `connectContainerTerminal`（`command` 取自 Shell Select，选项 `/bin/bash` / `/bin/sh`，默认 `/bin/bash`，原值传参）；stdout/stderr → `term.write`，`term.onData` → `sendInput`；连接态切换按钮「连接」↔「断开」（红态 `semantic.state.error`）。Skill: none
- Add：容器/窗口尺寸变化经 `addon-fit` 计算行列并调用 `resize(rows, cols)`。Skill: none
- Add：断开按钮/卸载/切换容器调用 `close()`；**断开后保留终端最后画面（不清空）**；连接失败/断线恢复「连接」态 + 提示。Skill: none

[ ] Exit Criteria:

- [ ] 连接后可见 stdout/stderr、键盘输入回显；断开关闭会话
- [ ] resize 同步 `{Height, Width}`
- [ ] 连接失败/断线有提示与恢复，切换容器/关闭 Drawer 无泄漏
- [ ] `docs/logs/` updated

### Phase 3 - 操作按钮与状态规则（Add/Fix）

Status: proposed

- Add：清屏——连接后 `term.clear()` 并提示成功/失败；未连接置灰禁用，hover 提示"当前未连接命令解释器，无法清空"。Skill: none
- Add：三个右侧按钮 hover tooltip；全屏切换（全屏 ↔ 退出全屏）；在窗口打开入口（本期仅入口）。Skill: none

[ ] Exit Criteria:

- [ ] 清屏禁用/提示/清屏成功失败提示符合截图
- [ ] tooltip、全屏切换可用
- [ ] design tokens（无 hex）
- [ ] `docs/logs/` updated

### Phase 4 - 验证与收口（Proof）

Status: proposed

- Proof：`yarn lint-type` / `yarn lint`（改动文件无新增告警）/ `yarn test` / `yarn build`。Skill: none
- Fix：`pod-container-terminal.md` 状态 → 已实现；`docs/logs/2026/08-03.md` 追加。Skill: none

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

> 已定（2026-08-03，owner）：终端渲染库定为 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`），实现模式参考 `WEBSSH_TERMINAL_GUIDE.md`（v4，按 v6 适配 import/包名）；Shell 选项 `/bin/bash` / `/bin/sh`（原值作 `command`，默认 `/bin/bash`）；断开后保留最后画面。

- **[非阻塞] 心跳保活**：是否需定期心跳帧维持连接（参考 WEBSSH_TERMINAL_GUIDE.md）。
- **[非阻塞] 清屏"失败"场景定义**：清屏为纯前端操作，失败场景与提示文案待明确。
- **[非阻塞] 在窗口打开路由目标**（pod-detail-drawer Open Question #3）。
- 本 plan 实现前需 independent draft review；关闭前需 independent closure audit。

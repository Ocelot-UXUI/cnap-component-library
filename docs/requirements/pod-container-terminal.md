# Feature: Pod 容器 Web 终端模块

> 状态：进行中（2026-08-03）——传输层已定为 **WebSocket**（`v5.channel.k8s.io` 协议，远端 ku 文档 2026-08-03 更新）；接口层 `src/api/runtimeTerminal.ts` 已就绪，UI 交互（连接/断开、清屏、内容渲染）为实现级待办
> 来源：Figma「终端 Tab」截图（连接态切换 + 操作按钮 hover/禁用规则）+ WebSocket 接口 `/ws/v1/.../terminal`（`docs/input/source-api-runtime-workloads.md`）
> 父需求：Pod Detail Drawer（`docs/requirements/pod-detail-drawer.md` 4d 节），本模块为容器子 Tab「终端」
> 实现：连接消费 `src/api/runtimeTerminal.ts`（WebSocket `v5.channel.k8s.io`）；UI `ContainerTerminal.tsx`
> 参考：`docs/input/WEBSSH_TERMINAL_GUIDE.md`（cnap1.0 webssh 复刻指南，xterm.js + 帧协议基线，可复用）

## Goal

在 Pod Detail Drawer 的容器「终端」子 Tab 中，提供容器内 Shell 的交互式终端。用户选择 Shell 类型后点击连接，建立 WebSocket 终端会话，实时收发终端输入输出；支持断开、清屏、全屏与在窗口打开。

## In Scope

- 终端内容区：深色控制台样式（`rgba(12,12,12,1)`），渲染容器 Shell 的标准输出/标准错误，接受键盘输入
- **Shell 类型选择**（工具栏 Select）：`current` / `bash` / `sh` 等，默认当前容器默认 Shell，作为连接的 `command` 参数
- **连接 / 断开**（切换按钮）：未连接=「连接」，连接后=「断开」；建立 / 关闭 WebSocket 会话
- **清屏**：仅连接后可用，清除终端当前显示内容；未连接时置灰禁用
- **全屏查看**（切换按钮）：终端区域扩展至全屏 ↔ 退出全屏
- **在窗口打开**：在新窗口/独立视图打开终端
- 终端尺寸自适应：窗口/容器尺寸变化时向服务端发送 resize
- 连接状态与错误提示：连接中 / 已连接 / 断开 / 连接失败的可视反馈

## Out Of Scope

- 终端会话持久化与历史回放（跨会话）
- 多终端并行会话（本期单会话）
- 终端内文件上传/下载、命令录制
- 日志（日志子 Tab 由 `ContainerLogs` 单独负责，见 `pod-container-logs.md`）
- 终端主题/字体自定义设置

## Toolbar 结构（对照 Figma 终端 Tab 截图 + pod-detail-drawer 4d）

工具栏 32px 高、`mb-[12px]`，位于终端内容区上方，左右两组。

### 左侧控件组

| 控件              | 规格                                                                                                          | 接口映射             |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | -------------------- |
| Shell 标签        | 14px `semantic.text.tertiary` 静态文字 "Shell"                                                                | 无                   |
| Shell 类型 Select | 160px，选项 `/bin/bash` / `/bin/sh`，默认 `/bin/bash`；选中值直接作为连接的 `command` 参数 | `command`（选中的 shell 路径原值） |
| 连接 / 断开按钮   | 62×32px，`radius.xl3`（24px）。未连接=灰边白底「连接」（14px medium）；连接后=红边红字「断开」（`semantic.state.error`），切换按钮 | 建立 / 关闭 WebSocket |

### 右侧操作按钮组

3 个按钮，每个 32×32px，`radius.xl`（16px），白底灰边框，间距 8px；**hover 显示 tooltip**（tooltip 文字为按钮名）：

| 按钮       | 图标       | 交互                                                                                            |
| ---------- | ---------- | ----------------------------------------------------------------------------------------------- |
| 清屏       | Clear      | 仅连接后生效；未连接时置灰禁用（opacity 40%），hover 提示"当前未连接命令解释器，无法清空"；点击清除终端显示内容并提示清空成功/失败 |
| 在窗口打开 | Window     | 点击在新窗口打开终端视图                                                                         |
| 全屏查看   | Fullscreen | 切换按钮：点击终端区域扩展至全屏，图标变为退出全屏；再次点击恢复                                  |

## Main User Flows

### 流程 1：建立终端连接

1. 用户在 Pod Detail Drawer 选中容器并切到「终端」子 Tab
2. 选择 Shell 类型（`/bin/bash` / `/bin/sh`，默认 `/bin/bash`）
3. 点击「连接」→ 以选定 shell 作为 `command` 建立 WebSocket（`v5.channel.k8s.io`）；连接中展示 loading
4. 连接成功 → 按钮变为「断开」，终端内容区可交互，键盘输入经 stdin 通道发送、服务端输出经 stdout/stderr 通道渲染

### 流程 2：断开连接

1. 用户点击「断开」→ 关闭 WebSocket 会话
2. 按钮恢复为「连接」，终端内容区停止交互；**保留最后画面**（不清空，见 Business Rules）

### 流程 3：清屏

1. 连接状态下点击「清屏」→ 清除终端当前显示内容，提示清空成功/失败
2. 未连接状态下「清屏」置灰禁用，hover 提示"当前未连接命令解释器，无法清空"

### 流程 4：全屏 / 在窗口打开

1. 点击「全屏」→ 终端区域扩展至全屏，图标变退出全屏；再次点击恢复
2. 点击「在窗口打开」→ 在新窗口/独立视图打开终端

### 流程 5：终端尺寸调整

1. 终端容器尺寸变化（全屏切换 / 窗口 resize）→ 计算行列数，通过 resize 通道向服务端发送 `{Height, Width}`

## Business Rules

- **默认 Shell**：进入终端 Tab 默认选中 `/bin/bash`；选项 `/bin/bash` / `/bin/sh`，选中值原样作为 `command` 参数
- **断开后内容**：断开连接后保留终端最后画面（不清空），便于用户回看；重新连接时再按需重置
- **连接态与按钮**：未连接=「连接」（灰边白底）；已连接=「断开」（红边红字，`semantic.state.error`）
- **清屏可用性**：仅连接后可用；未连接置灰禁用并提供 hover 提示
- **协议**：`v5.channel.k8s.io`，二进制帧，首字节为 channel ID——`0x00` stdin（client→server）、`0x01` stdout、`0x02` stderr、`0x03` error（server→client）、`0x04` resize（client→server，payload 为 `{Height, Width}` JSON）；`socket.binaryType = 'arraybuffer'`
- **切换重置**：切换容器、关闭 Drawer、离开终端页面均需关闭 WebSocket 会话，避免连接泄漏
- **鉴权**：沿用现有 `AppLayout` 会话上下文；WebSocket 无法设置自定义 header，认证信息（`x-region` / `x-account-id` / `baggage`）转为 query 参数（见 `runtimeTerminal.ts`）
- **内容区样式**：深色背景 `rgba(12,12,12,1)`，等宽字体

## Edge Cases

- 未连接即点击清屏：按钮禁用，hover 提示"当前未连接命令解释器，无法清空"
- 连接失败（鉴权失败 / 容器不存在 / shell 不可用）：展示连接失败提示，按钮恢复为「连接」
- 连接中途断开（网络中断 / 服务端关闭 / Pod 重启）：展示断开提示，按钮恢复为「连接」，提供重连入口
- 已终止 / 未就绪容器：连接可能立即失败，需给出明确原因
- 切换容器 / 关闭 Drawer 时存在活动会话：主动关闭，避免泄漏与串话
- 全屏态下断开：退出全屏或保留全屏由实现决定，需保证状态一致

## Acceptance Criteria

- [ ] 终端 Tab 工具栏：Shell 标签 + Shell 类型 Select（默认 current）+ 连接/断开按钮 + 右侧 清屏/在窗口打开/全屏
- [ ] 点击「连接」建立 WebSocket 会话，按钮变「断开」；点击「断开」关闭会话，按钮变回「连接」
- [ ] 连接后终端内容区可渲染 stdout/stderr 并接受键盘输入（stdin）
- [ ] 未连接时「清屏」置灰禁用，hover 提示"当前未连接命令解释器，无法清空"
- [ ] 连接后点击「清屏」清除显示内容并提示清空成功/失败
- [ ] 三个右侧操作按钮 hover 显示 tooltip
- [ ] 全屏按钮切换全屏 ↔ 退出全屏
- [ ] 在窗口打开可在新窗口打开终端视图
- [ ] 终端尺寸变化时通过 resize 通道同步 `{Height, Width}`
- [ ] 连接失败 / 断开有明确提示与重连入口
- [ ] 切换容器 / 关闭 Drawer 时关闭会话，无连接泄漏
- [ ] 使用 design tokens（semantic / spacing / radius / typography），无 hex 字面量
- [ ] 通过 `yarn lint-type` 和 `yarn lint` 检查

## API 依赖

| 接口                          | 位置                        | 用途                          |
| ----------------------------- | --------------------------- | ----------------------------- |
| `connectContainerTerminal()`  | `src/api/runtimeTerminal.ts` | 建立 WebSocket 终端会话       |

WebSocket 端点：`/ws/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/containers/:containerName/terminal?command=/bin/sh`

参数：

- `appEnvID` / `clusterId` / `podName` / `containerName`：定位容器（path，来自 Drawer 上下文）
- `command`：shell 路径（query，可选），来自 Shell 类型 Select

控制器（`connectContainerTerminal` 返回值）：

- `sendInput(data)`：用户输入经 stdin 通道（`0x00`）发送
- `resize(rows, cols)`：经 resize 通道（`0x04`）发送 `{Height, Width}`
- `close()`：主动关闭会话

> 渲染层：`v5.channel.k8s.io` 与 xterm 兼容，以 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`）渲染；实现模式参考 `WEBSSH_TERMINAL_GUIDE.md`（该指南基于 v4，按 v6 适配 import/包名）。

## Open Questions

> 已解决：传输层与协议已定为 WebSocket `v5.channel.k8s.io`（2026-08-03）；连接态切换、清屏禁用/提示规则由 Figma 截图明确；Shell 选项定为 `/bin/bash` / `/bin/sh`（原值作 `command`）；断开后保留最后画面；终端渲染库定为 **xterm v6**（`@xterm/xterm` + `@xterm/addon-fit`），实现模式参考 `WEBSSH_TERMINAL_GUIDE.md`（该指南基于 xterm v4，import 路径与包名按 v6 适配）。

以下为待定项：

- **[非阻塞] "在窗口打开"的路由跳转目标**（与 `pod-detail-drawer.md` Open Question #3 一致）。
- **[非阻塞] 心跳保活**：是否需要定期心跳帧维持连接（参考 WEBSSH_TERMINAL_GUIDE.md 的心跳机制）。
- **[非阻塞] 清屏成功/失败判定**：清屏为纯前端操作，"失败"场景与提示文案待明确。

# 04 Terminal WebSocket Handshake Rejected When Sending Subprotocol

## Problem

- 容器 Web 终端建连时，`new WebSocket(url, ['v5.channel.k8s.io'])` 携带 WebSocket 子协议（`Sec-WebSocket-Protocol` 请求头），导致握手被后端拒绝（连接以 1006 异常关闭，终端无法连上）。
- 直觉上会以为需要传 `v5.channel.k8s.io`：源文档 `docs/input/source-api-runtime-workloads.md` 明确写"Web 终端使用 `v5.channel.k8s.io` 协议"，且该名称正是标准 Kubernetes exec 的子协议名。

## Reproduction

- 环境：CNAP2.0 终端 WS 端点 `/ws/v1/.../terminal`。
- 触发：`connectContainerTerminal` 内 `new WebSocket(url, ['v5.channel.k8s.io'])` 发起握手。
- 现象：握手失败，`onclose` code=1006；`onOpen` 不触发，终端停在"连接中"后回落"连接"。

## Diagnostic Method

- 对照 `docs/input/WEBSSH_TERMINAL_GUIDE.md`（cnap1.0 webssh 复刻指南）的 EKS/ECI 通道实现：`WEBSSH_TERMINAL_GUIDE.md:248` 是 `new WebSocket(url)`——**不带任何子协议**，channel 帧（`\x00` stdin / `\x04` resize，见 L268/275）全部在应用层手拼。
- 即：后端是自定义 relay，只按 channel 前缀字节读写二进制，**不做标准 k8s 的子协议协商**；名字叫 `v5.channel.k8s.io` 仅指"帧格式"，不代表要走 `Sec-WebSocket-Protocol` 协商。
- 联调实测：带子协议 → 握手被拒；去掉 → 正常。

## Root Cause

- 把"帧格式名"误当成"WebSocket 子协议"传给了 `new WebSocket` 第二参数。
- 标准 k8s exec 需要子协议协商；但本后端是自定义 relay，服务端未实现该子协议，收到未支持的 `Sec-WebSocket-Protocol` 时拒绝握手。

## Fix

- `src/api/runtimeTerminal.ts`：`new WebSocket(url, ['v5.channel.k8s.io'])` → `new WebSocket(url)`（去掉子协议），保留 `binaryType='arraybuffer'` 与 channel 帧收发不变。
- 加注释说明：后端不做子协议协商，传子协议会握手被拒。

## Tests

- `yarn lint-type` passed。
- `yarn build` passed。
- 运行时：去掉子协议后握手成功（联调实测）。

## Affected Artifacts

- `src/api/runtimeTerminal.ts` - 去掉 WebSocket 子协议参数。
- `docs/requirements/pod-container-terminal.md` - 协议 Business Rule 补充"握手不携带子协议"。

## Notes For Future Refactors

- 帧格式名（`v5.channel.k8s.io`）≠ WebSocket 子协议。只有当后端确为标准 k8s exec、且在响应头回显该子协议时，才应把它作为 `new WebSocket` 第二参数。
- 判断依据：若 `socket.protocol` 协商结果为空 / 握手 1006，多半是后端不做子协议协商，应去掉第二参数。

## Prevention

- 联调新 WebSocket 端点时，先确认后端是否协商子协议（看响应 `Sec-WebSocket-Protocol` / `socket.protocol`），再决定是否传第二参数。

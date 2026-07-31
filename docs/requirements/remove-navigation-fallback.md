# Remove Navigation Fallback

## Purpose

移除原导航系统中的 fallback key / fallback node 自动回退能力，避免导航失败时进入非目标页面并误导用户。

## Background

当前导航实现仍包含 fallback 体系：

- navigation node 可配置 `fallbackKey`。
- workspace 可配置 `fallbackNodeKey`。
- 派生逻辑可通过 `getFallbackNode()` 解析回退节点。
- 上下文缺失时，导航执行可能跳转到 fallback route。

该行为与新的 Agent 导航上下文设计冲突。导航目标因参数或业务上下文不满足而失败时，系统不应自动导航到其他页面，也不应向 Agent 暴露 fallback 目标。否则用户会疑惑为什么没有进入自己请求的目标路由。

## Requirement

导航系统应移除 fallback key 相关能力。导航失败必须保持为显式失败事实，而不是被转换为其他路由跳转。

### Functional Requirements

- 从导航节点模型中移除 `fallbackKey`。
- 从工作区模型中移除 `fallbackNodeKey`。
- 从 navigation registry 删除所有 fallback 配置。
- 删除或替换 `getFallbackNode()` 等 fallback 派生能力。
- 上下文不满足时，导航派生逻辑不得返回另一个导航节点代替原目标。
- Agent `navigate` 能力缺少 route 参数、业务上下文或状态机校验失败时，必须返回结构化失败事实，不执行任何跳转。
- 用户通过 UI 触发不可达导航目标时，系统不得自动跳转到非目标路由。
- Tool result 和 Agent prompt 派生数据中不得包含 fallback 目标。

### Non Goals

- 不在本需求中实现 XState 上下文状态机。
- 不在本需求中实现完整 Agent capability registry。
- 不设计新的错误展示 UI；本需求只要求不再自动回退到非目标路由。
- 不移除路由默认页概念。默认页只能用于显式进入工作区时的初始目标，不能用于失败后的隐式回退。

## Acceptance Criteria

- 代码中不再存在 `fallbackKey` 和 `fallbackNodeKey` 类型字段、registry 配置或导出 API。
- `navigate` 缺少上下文时不会调用 `router.navigate()`。
- `navigate` 缺少 route 参数时不会调用 `router.navigate()`。
- 上下文缺失或非法时，tool result 只包含缺失/非法事实，不包含 fallback 目标。
- 用户或 Agent 请求目标路由失败后，当前路由保持不变。
- 单元测试覆盖：缺上下文不跳转、缺 route 参数不跳转、registry 派生不返回 fallback 节点。

## Owner Docs

- `docs/design/navigation-system.md`
- `docs/architecture/navigation-system.md`
- `docs/architecture/agent-context-capabilities.md`

## Status

- Status: ready
- AI autonomy: plan-first
- Blocker: none

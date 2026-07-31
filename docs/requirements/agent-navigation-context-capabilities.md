# Agent Navigation Context Capabilities

## Purpose

定义 Agent 与导航系统、导航上下文和业务能力之间的实现级需求。目标是让 Agent 基于结构化业务事实理解导航失败原因、继续与用户交互，并为后续业务能力接入建立可扩展边界。

## Background

当前导航系统已经提供 navigation registry、route key、上下文需求和 Agent 可读导航目标。但现有实现仍存在几个问题：

- 账号、应用、环境的层级关系分散在 UI、存储读取和导航工具中，缺少统一状态真源。
- Agent `navigate` 能力失败时主要返回字符串错误，不足以稳定表达缺失参数、缺失上下文和执行阶段。
- 原导航 fallback 体系会在导航不可达时进入非目标路由，容易误导用户。
- Agent 可调用能力尚未形成通用 registry，后续业务维度接入容易重复造逻辑。

## Scope

本需求覆盖以下能力方向：

- 移除导航 fallback 自动回退。
- 将 Agent tool result 收敛为结构化业务事实。
- 用 XState 管理账号、应用、环境上下文层级关系。
- 通过受控能力注册机制向 Agent 暴露上下文读取和选择能力。
- 约束 Agent prompt 只消费硬事实，不依赖前端生成的用户话术。

## Priority Order

1. 移除导航 fallback 自动回退。
2. 改造 `navigate` tool result，使缺参数、缺上下文、上下文非法等场景返回结构化事实。
3. 引入 XState 管理账号、应用、环境上下文。
4. 建立 Agent capability registry，暴露上下文读取和选择能力。
5. 将 Agent prompt 派生逻辑调整为消费 tool result 和能力描述中的硬事实。

## Functional Requirements

### 1. Remove Navigation Fallback

导航失败不能被转换为其他路由跳转。

- 必须移除 `fallbackKey`、`fallbackNodeKey` 和 `getFallbackNode()` 等 fallback 相关模型与派生能力。
- `navigate` 缺少 route 参数或业务上下文时不得调用 `router.navigate()`。
- UI 导航触发不可达目标时不得自动跳转到非目标路由。
- Tool result 和 Agent prompt 派生数据不得包含 fallback 目标。
- 默认页概念可以保留，但只能用于显式进入工作区时的初始目标，不能用于失败后的隐式回退。

详细需求见 `docs/requirements/remove-navigation-fallback.md`。

### 2. Structured Tool Result

所有 Agent 可调用能力应逐步收敛到统一结果外壳。

- 能力层只返回可验证业务事实，不返回面向用户的话术、固定追问文案或下一步动作建议。
- `ok=false` 不等同系统异常；缺参数、缺上下文和校验失败都应作为 Agent 可继续推理的正常工具结果。
- `navigate` 至少需要区分：目标无法解析、route 参数缺失、上下文缺失、上下文非法、真实执行失败。
- `agentLoop` 应将结构化 tool result 回传给 LLM，避免把可恢复结果压缩成普通字符串异常。

### 3. XState Context Management

账号、应用、环境上下文应由 XState 状态机管理。

- 账号是应用的上级。
- 应用是环境相关运行态的上级。
- 下层上下文不能脱离上层上下文独立存在。
- 切换账号后，必须校验或重置应用和环境。
- 切换应用后，必须校验或重置环境。
- 选择环境时，必须基于当前账号和应用的可用范围。
- 持久化恢复后的上下文必须重新校验，不能直接视为合法状态。

状态机应提供可序列化快照，供 UI 选择器、导航能力和 Agent 上下文派生逻辑读取。

### 4. Agent Capability Registry

Agent 不应直接访问 XState 内部事件。对 Agent 暴露的上下文读取和选择能力必须通过能力注册层。

首批能力包括：

- `navigate`
- `selectAccount`
- `selectApplication`
- `selectEnvironment`
- `listAvailableAccounts`
- `listAvailableApplications`
- `listAvailableEnvironments`

能力描述至少包含：

- 稳定能力标识。
- 面向 Agent 的简短说明。
- 输入 schema。
- required context。
- 读取或改变的业务资源。
- 基于状态机快照的可用性判断。
- 返回结构化 tool result 的执行函数。

### 5. Agent Prompt Boundary

Prompt 只描述通用规则，不写具体业务话术。

- 工具返回 `ok=false` 时，Agent 应基于 `code`、`phase`、`data` 和 `error` 中的事实决定下一步。
- Agent 不应编造缺失参数或上下文。
- 如果缺少必要上下文，Agent 可以继续与用户交互或调用可用能力获取候选项。
- 如果返回 route template、schema 或 missing fields，应优先使用这些硬信息。

## Non Goals

- 不在前端代码中生成面向用户的 Agent 追问文案。
- 不让 Agent 直接调用 XState 内部事件。
- 不把 DOM 定位能力纳入本需求。
- 不要求一次实现全部能力；应按优先级拆分计划和验证。

## Acceptance Criteria

- fallback 自动回退能力被移除，导航失败不会进入非目标路由。
- `navigate` 能以结构化事实表达缺参数、缺上下文和上下文非法。
- 账号、应用、环境的层级关系由统一状态机管理，并通过测试覆盖关键转移。
- Agent 可获得当前上下文、候选项和上下文选择能力的结构化描述。
- Agent tool result 和 prompt 派生中不包含前端硬编码的用户话术或下一步动作建议。
- 相关单元测试覆盖导航失败不跳转、tool result 结构、上下文状态转移和能力可用性判断。

## Owner Docs

- `docs/design/navigation-system.md`
- `docs/architecture/navigation-system.md`
- `docs/architecture/agent-context-capabilities.md`
- `docs/requirements/remove-navigation-fallback.md`

## Status

- Status: ready
- AI autonomy: plan-first
- Blocker: none

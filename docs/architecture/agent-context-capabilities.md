# Agent Context Capabilities Architecture

## Purpose

定义 Agent 与导航上下文、业务能力之间的稳定技术边界。本文补充 `docs/architecture/navigation-system.md`，用于约束 Agent 如何获得业务事实、调用能力、接收执行结果并继续交互。

## Core Principle

前端能力层只返回可验证的业务事实，不替 Agent 生成对话策略。

能力层不得返回：

- 面向用户的话术。
- 固定追问文案。
- 下一步动作建议。
- 依赖具体业务场景的 Agent 行为脚本。

能力层应返回：

- 调用的能力和输入参数。
- 执行阶段和执行结果。
- 当前业务上下文。
- 目标能力需要的上下文和参数。
- 缺失或非法的字段。
- 路由模板、schema 校验结果、底层错误 code 等硬信息。

Agent 根据这些事实自主理解、自主追问、自主决定是否继续调用工具。`agentLoop` 必须将结构化工具结果序列化回传给 LLM，不能把缺参数、缺上下文等可恢复结果压缩成普通字符串异常。

## Tool Result Contract

所有 Agent 可调用能力应逐步收敛到统一结果外壳：

```ts
interface AgentToolResult {
    ok: boolean;
    tool: string;
    code?: string;
    phase?: 'resolve_target' | 'validate_input' | 'validate_context' | 'execute';
    input: Record<string, unknown>;
    data?: Record<string, unknown>;
    error?: {
        code: string;
        details?: Record<string, unknown>;
    };
}
```

字段语义：

- `ok`：能力是否完成真实执行。
- `tool`：能力名称，如 `navigate`。
- `code`：稳定机器可读结果码。
- `phase`：结果发生在哪个执行阶段。
- `input`：Agent 本次传入的原始参数。
- `data`：能力特有事实，必须保持结构化。
- `error`：底层错误或校验错误的结构化表示。

`ok=false` 不等同于系统异常。缺少参数、上下文不完整和 schema 校验失败都属于 Agent 可继续推理的正常工具结果。

## Navigation Tool Result Facts

`navigate` 能力的 `data` 应优先包含以下事实：

- `target`：解析到的导航节点或路由信息。
- `routeTemplate`：目标路由模板。
- `requiredParams`：目标路由需要的参数。
- `resolvedParams`：由输入和当前上下文解析出的参数。
- `missingParams`：仍缺失的路由参数。
- `requiredContext`：目标二级路由要求的上下文字段。
- `currentContext`：状态机当前快照中的上下文。
- `missingContext`：目标要求但当前缺失的上下文字段。
- `invalidContext`：存在但未通过状态机校验的上下文字段。

缺少上下文时，`navigate` 不应自动跳转或返回 fallback 目标。导航异常后的自动回退会让用户误以为目标路由已完成导航，实际却进入了其他页面；能力层应只返回缺失或非法事实，由 Agent 基于这些事实继续与用户交互。

## XState Context Source

账号、应用、环境上下文由 XState 状态机管理，Agent 能力只能消费状态机提供的快照或 selector，不直接读取散落状态。

状态机需要提供：

- 当前上下文：`accountId`, `applicationId`, `environmentId`。
- 候选项集合及加载状态。
- 上下文合法性和失效原因。
- 上下文选择操作的受控入口。
- 可序列化快照，用于 tool result 和 Agent prompt 派生。

Agent 不直接访问状态机内部事件。对 Agent 暴露的操作必须经过能力注册层。

## Capability Registry

业务能力通过统一 registry 暴露给 Agent，而不是在 prompt 或 tool schema 中手写分散逻辑。

能力描述至少包含：

- `id`：稳定能力标识。
- `description`：面向 Agent 的简短能力说明。
- `inputSchema`：结构化输入 schema。
- `requiredContext`：能力执行所需上下文字段。
- `reads`：能力读取的业务资源。
- `writes`：能力可能改变的业务上下文或资源。
- `enabledWhen`：基于状态机快照判断当前是否可用。
- `execute`：返回 `AgentToolResult` 的执行函数。

首批上下文能力包括：

- `navigate`
- `selectAccount`
- `selectApplication`
- `selectEnvironment`
- `listAvailableAccounts`
- `listAvailableApplications`
- `listAvailableEnvironments`

该机制应面向未来业务维度扩展，例如集群、命名空间、地域、流水线和版本。账号、应用、环境是第一组接入的 domain context，不应让底层抽象只能表达固定三级链路。

## Agent Prompt Boundary

Prompt 只描述通用规则，不写具体业务话术：

- 工具返回 `ok=false` 时，基于 `code`、`phase`、`data` 和 `error` 中的事实决定下一步。
- 不要编造缺失参数或上下文。
- 如果缺少必要上下文，可以继续与用户交互或调用可用能力获取候选项。
- 如果返回 route template、schema 或 missing fields，应优先使用这些硬信息。

## Non Goals

- 不在前端代码中生成面向用户的 Agent 追问文案。
- 不让 Agent 直接调用 XState 内部事件。
- 不把 DOM 定位能力纳入本架构。

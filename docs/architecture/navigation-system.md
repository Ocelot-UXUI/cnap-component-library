# Navigation System Architecture

## Purpose

定义 CNAP 2.0 导航系统 MVP 的跨模块技术结构。应用层行为由 `docs/design/navigation-system.md` 拥有，具体切片需求由 `docs/requirements/cnap2-sidebar-navigation-mvp.md` 拥有。

## Source Of Truth

导航系统采用混合模型：

- `src/routes/` 拥有 route key、path、params、`toPath()`、`toUrl()` 和基础路由描述。
- navigation registry 拥有工作区、二级导航、父子关系、二级路由上下文需求、默认页和 Agent 描述。

navigation registry 必须引用 route key 或 route object，不维护硬编码 URL。React Router 内部跳转、菜单 URL 和选中态使用 `toPath()`；外部链接、跨 shell 打开等需要完整应用路径的场景使用 `toUrl()`。

## Module Ownership

建议模块边界：

- `src/routes/`：统一路由定义、内部 path 生成和外部 URL 生成。
- `src/navigation/`：导航 registry、类型、派生工具和上下文规则。
- `src/contexts/`：当前账号、应用、环境上下文状态。
- `src/routers/AppLayout/`：应用外壳入口，只编排顶部导航、工作区导航和内容布局。
- `src/routers/AppLayout/topNavigation/`：云端 Header portal、本地 Header fallback 和顶部导航内容。
- `src/routers/AppLayout/workspace/layout/`：工作区整体定位与内容区布局。
- `src/routers/AppLayout/workspace/navigation/`：工作区导航派生、一级导航、二级导航和导航布局容器。
- `src/components/`：通用导航展示组件，不直接写业务路由判断。
- Agent 导航能力：从 `src/routes/` 和 `src/navigation/` 派生结构化导航目标；不再考虑已废弃的 `src/capabilities/`。

## Navigation Registry

每个导航节点至少应表达：

- `key`：稳定导航节点标识。
- `routeKey` 或 `route`：关联统一路由定义。
- `label`：用户可见名称。
- `workspaceKey`：所属工作区。
- `parentKey`：可选父节点。
- `groupKey`：可选二级导航分组。
- `defaultChildKey`：可选默认子节点。
- `contextRequirements`：仅二级路由节点可声明的账号、应用、环境上下文需求。
- `agentDescription`：面向 Agent 的简短语义说明。
- `visibility` / `disabled` / `badge`：可选展示规则。

路由层级规则：工作区是一级路由，工作区下对应的二级导航是二级路由。只有二级路由节点可以声明 `contextRequirements`。三级、四级等更深层子路由必须继承所属二级路由的上下文配置，并且不允许覆盖。若深层页面需要不同上下文，应调整二级路由设计，而不是在深层子路由单独声明。

新增子路由时，应优先挂到既有二级路由下，并复用该二级路由上下文配置，而不是修改 AppLayout 中的菜单结构。

## Context Model

导航上下文至少包含：

- `accountId`
- `applicationId`
- `environmentId`

三者为硬性层级关系：账号 > 应用 > 环境。

状态更新规则：

- 更新账号时，必须校验或重置应用和环境。
- 更新应用时，必须校验或重置环境。
- 更新环境时，必须在当前账号和应用范围内校验。

该层级关系应由 XState 状态机作为技术真源管理。状态机至少负责：

- 保存当前账号、应用、环境上下文。
- 暴露账号、应用、环境候选项和加载状态。
- 校验下层上下文是否仍属于上层上下文。
- 在上层上下文变化时重置或标记失效的下层上下文。
- 提供可序列化快照，供导航能力、选择器和 Agent 上下文派生逻辑读取。

每个工作区最近使用的账号、应用、环境上下文应保存到 localStorage。MVP 不保存完整页面状态。持久化恢复后必须经过状态机重新校验，不能把 localStorage 中的值直接视为合法上下文。

## Derived Capabilities

导航 registry 应派生以下能力，避免重复映射：

- 根据当前 route 计算 active workspace。
- 根据当前 route 计算 active navigation node。
- 根据 workspace 生成一级和二级导航渲染数据。
- 根据导航节点生成 router 内部 path，避免与 React Router basename 重复拼接。
- 根据当前路由所属二级路由的上下文需求判断当前页面意图是否可达；不可达时保留目标并返回不可达事实，不替换为其他路由。
- 生成 Agent 可读取的导航目标列表。

## Layout Separation

布局组件与业务导航配置必须分离：

- 布局组件负责尺寸、定位、滚动区域、折叠状态和容器结构。
- 布局职责可以嵌套存在：外层导航 Layout 定位全局区域后，一级导航内部如果继续负责业务入口区、更多入口和辅助入口的排列，也仍然是 Layout。
- 承担布局职责的导航组件必须以 `Layout` 结尾；业务状态、持久化、容量计算和入口替换规则应放在 Container、hook 或纯函数中。
- 业务导航组件负责渲染传入的导航数据和触发导航事件。
- 业务组件不得包含全局布局定位信息，应自适应布局组件提供的宽高。

## Agent Navigation

Agent 化导航只依赖结构化导航数据：route key、参数、所属二级路由上下文需求和 Agent 描述。

导航能力执行结果必须作为结构化事实返回给 Agent，而不是抛出仅供人阅读的字符串错误。能力层只描述输入、执行阶段、目标、当前上下文、目标需求、缺失项和底层错误信息，不生成面向用户的话术，也不硬编码 Agent 的下一步交互策略。

推荐的通用能力执行结果外壳：

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

导航能力应至少区分以下失败事实：

- `NAVIGATION_TARGET_NOT_FOUND`：route key 或 navigation key 无法解析。
- `NAVIGATION_ROUTE_PARAM_MISSING`：目标路由模板仍存在未填充参数。
- `NAVIGATION_CONTEXT_MISSING`：目标二级路由要求的账号、应用、环境上下文不完整。
- `NAVIGATION_CONTEXT_INVALID`：当前上下文存在但不满足状态机校验。

缺少上下文时，导航能力不应静默执行 fallback，也不应向 Agent 返回 fallback 目标。导航异常后的自动回退会让用户误以为目标路由已完成导航，实际却进入了其他页面，这是错误的产品设计。

> **基线变更（2026-07-13）**：UI 导航与 Agent 导航采用不同策略：
>
> - **UI 导航**（`useAppLayoutNavigation`）：用户在导航栏中主动选择业务模块时，任何时候都允许跳转，跳转后的业务组件判断是否需要用户选择应用/环境等内容。不因缺上下文而阻断。
> - **Agent 导航**（`navigationTool`）：Agent 执行用户指令时，缺上下文应返回 `NAVIGATION_CONTEXT_MISSING` 结构化错误，由 Agent 再次询问用户补全参数。不执行跳转。

本 MVP 不把 `data-ai-*` DOM 语义属性作为导航系统的一部分。DOM 定位和 DOM 操作兜底机制后续单独设计。

## Verification Expectations

实现导航系统 MVP 时至少验证：

- `yarn lint-type`
- 与导航 registry 派生函数相关的单元测试，如已有测试位置适合则补充。
- 手动验证工作区切换、二级导航选中态、顶部上下文层级切换和不可达导航不跳转行为。

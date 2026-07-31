# Feature: 路由信息暴露给 LLM

> REQ-AI-14 | 状态：已完成
> 前置依赖：REQ-AI-06（已完成）

## Goal

将 `src/routes/` 中统一管理的路由元数据暴露给 LLM，使 LLM 能理解应用的路由结构，并通过 navigate 工具执行页面导航。同时弃用 `src/capabilities/` 下的 mock 能力层，建立新的工具定义机制。

## In Scope

- 扩展 `Route` 接口，增加 `path` 字段
- 新增 `RouteMeta` 类型和 `getRouteMetas()` 函数
- 路由元数据序列化为文本，注入 system prompt
- 新增 `navigate` 工具 schema，替代 capabilities 自动生成的 tools
- 弃用 `src/capabilities/` 全部能力
- 更新 `agentLoop` 中的 tool call 执行逻辑，支持 navigate 工具

## Out Of Scope

- 不涉及其他类型的 LLM 上下文信息（页面状态、表单数据等）
- 不涉及 system prompt 的完整构建机制设计（仅注入路由部分）
- 不涉及 LLM 侧的 prompt engineering 优化

## Main User Flows

### LLM 识别导航意图

1. 用户发送消息："帮我看看应用 xxx 的概览"
2. LLM 从 system prompt 中的路由列表识别出 `applicationOverview` 匹配用户意图
3. LLM 从用户消息中提取 `appId` 参数
4. LLM 调用 navigate 工具：`{ routeKey: "applicationOverview", routeParams: { appId: "xxx" } }`
5. 前端执行 `routes.applicationOverview.toUrl({ appId: "xxx" })` → `router.navigate(url)`

## Business Rules

### Route 接口扩展

- `Route` 接口增加 `path: string` 字段，存储原始模板路径（不含 basePath）
- `route()` 工厂函数自动设置 `path` 字段

### RouteMeta 类型

```typescript
interface RouteMeta {
    key: string;
    description?: string;
    params: string[]; // 从 path 中提取 {paramName}，无参路由为空数组
}
```

### getRouteMetas()

- 从 `src/routes/index.ts` 导出
- 遍历 `routes` Record，对每个路由提取 `path` 中的 `{paramName}` 参数
- 返回 `RouteMeta[]`

### System prompt 格式

路由上下文作为 system message 的一部分注入。格式：

```
## 可用路由
使用 navigate 工具进行页面导航，routeKey 从以下列表中选择：
- applications: 应用管理
- applicationOverview: 应用概览详情，参数: {appId}
- applicationDeployments: 应用部署管理，参数: {appId}
- clusters: 集群管理
- clusterDetail: 集群详情，参数: {clusterId}
```

规则：

- 无参数路由只显示 key 和 description
- 有参数路由追加 `参数: {param1}, {param2}`
- description 不存在时只显示 key

### navigate 工具 schema

```json
{
  "type": "function",
  "function": {
    "name": "navigate",
    "description": "导航到指定页面。routeKey 从 system prompt 路由列表中选择。",
    "parameters": {
      "type": "object",
      "properties": {
        "routeKey": {
          "type": "string",
          "description": "路由标识",
          "enum": ["applications", "applicationOverview", "..."]
        },
        "routeParams": {
          "type": "object",
          "description": "路由所需参数，键名参考 system prompt 中的参数列表",
          "additionalProperties": { "type": "string" }
        }
      },
      "required": ["routeKey"]
    }
  }
}
```

- `routeKey` 的 `enum` 值从 `getRouteMetas()` 动态生成
- `routeParams` 不设 required，因为无参路由不需要参数

### 弃用 capabilities

- `src/capabilities/` 目录下的所有文件（application.ts、cluster.ts、environment.ts、navigation.ts、index.ts、types.ts、utils.ts）标记为弃用
- `src/api/ai/tools.ts` 不再从 `allCapabilities` 导入，改为手动定义 navigate 工具
- `AIExecutorProvider.tsx` 中的 tool call 执行逻辑需适配新的 navigate 工具

### 执行层变更

`agentLoop` 中 navigate tool call 的处理：

1. 从 `toolCall.function.arguments` 解析 `routeKey` 和 `routeParams`
2. 调用 `routes[routeKey].toUrl(routeParams)` 生成 URL
3. 调用 `router.navigate(url)` 执行跳转
4. 返回执行结果（成功/失败）

## Edge Cases

- `routeKey` 不存在：LLM 传入了无效的路由 key，执行层应返回错误信息
- `routeParams` 缺少必要参数：`toUrl()` 会保留 `{paramName}` 占位符，URL 可能无效。执行层应校验参数完整性
- `capabilities` 弃用后的引用清理：`AIExecutorProvider.tsx`、`agentLoop.ts` 等引用了 capabilities 的文件需同步更新

## Acceptance Criteria

- [x] `Route` 接口包含 `path` 字段
- [x] `getRouteMetas()` 正确提取所有路由的 key、description、params
- [x] `getRouteMetas().length` 与 `routes` Record 的 key 数量一致
- [x] system prompt 文本格式符合 Business Rules 中的示例
- [x] `AI_TOOLS` 包含 navigate 工具，`routeKey.enum` 与路由列表一致
- [x] navigate tool call 能正确执行路由跳转（传入 routeKey + routeParams → router.navigate）
- [x] `src/capabilities/` 不再被任何文件 import
- [x] `yarn lint-type` 通过
- [x] `yarn lint` 通过
- [x] `yarn build` 通过

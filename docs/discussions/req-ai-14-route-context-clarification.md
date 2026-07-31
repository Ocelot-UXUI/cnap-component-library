# REQ-AI-14 需求澄清：路由信息暴露给 LLM

> 日期：2026-06-16

## 已确认

### 设计原则

- 从零设计上下文构建机制，不继承现有 `usePageContext`
- 路由信息是**静态的、全量的**，一次性注入 system prompt
- 未来其他类型的上下文信息（动态状态等）应复用同一套构建机制

### 弃用 capabilities

- **弃用 `src/capabilities/` 下的所有能力**（application、cluster、environment、navigation）
- 现有 capabilities 全部是 mock 实现，工具 schema 从 `allCapabilities` 自动生成的方式废弃
- `src/api/ai/tools.ts` 不再从 capabilities 导入，改为手动定义工具 schema

### LLM 获取的路由信息格式

将 `src/routes/` 中的 Route 定义序列化为 Agent 可理解的结构：

```typescript
interface RouteMeta {
    key: string; // 路由标识（如 'applicationOverview'）
    description?: string; // 文本描述（如 '应用概览详情'）
    params?: string[]; // 路由所需参数名列表（如 ['appId']）
}
```

序列化后示例：

```
- applicationOverview: 应用概览详情 (参数: appId)
- applicationDeployments: 应用部署管理 (参数: appId)
- applications: 应用管理
```

### 新 Navigation 工具

LLM 判断用户意图为路由导航时，调用 navigate 工具：

```json
{
  "name": "navigate",
  "parameters": {
    "routeKey": "applicationOverview",
    "routeParams": { "appId": "xxx" }
  }
}
```

- `routeKey`: enum 类型，值为所有路由 key
- `routeParams`: 额外参数对象（`additionalProperties: string`），按路由所需传入

### 执行层

tool call 执行时：

1. 接收 `routeKey` + `routeParams`
2. 从 `routes[routeKey].toUrl(routeParams)` 生成 URL
3. 调用 `router.navigate(url)` 执行跳转

### 注入方式

路由上下文作为 **system message** 的一部分，包含在 LLM 对话的 system prompt 中。

## 待讨论

~~- system prompt 中路由上下文的具体文本格式（如何平衡 token 消耗与信息完整性）~~
~~- Navigation 工具的 JSON Schema 定义细节（routeParams 的类型约束）~~
~~- 是否需要将 `RouteMeta` 序列化逻辑放在 `src/routes/` 中导出~~

以上均已确认，见下方补充。

### Route 接口扩展（已确认）

`Route` 增加 `path` 字段，存储原始模板路径：

```typescript
export interface Route {
    path: string; // 模板路径，如 '/applications/{appId}/overview'
    toUrl: (params?: Record<string, string>) => string;
    description?: string;
}
```

### RouteMeta 导出位置（已确认）

- 类型定义 `RouteMeta` 放在 `src/routes/create.ts`
- `getRouteMetas()` 函数放在 `src/routes/index.ts`，遍历 `routes` Record 生成

### System prompt 格式（已确认）

无参数路由不显示参数行，有参数的用 `参数: {param1}` 格式：

```
- applications: 应用管理
- applicationOverview: 应用概览详情，参数: {appId}
```

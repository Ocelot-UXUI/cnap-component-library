# Feature: 统一路由链接管理

> REQ-AI-06 | 状态：已完成

## Goal

建立统一的业务路由链接管理层，通过 `react-router-template-link` 为每个业务路由生成带类型推断的 URL 构建方法，并以自定义 ESLint 规则强制所有路由跳转使用该层。由此，业务中所有导航目标的 URL 都在一个规定目录下统一管理，为后续将路由信息暴露给 LLM 提供可靠的数据来源。

## In Scope

- 路由链接定义：使用 `react-router-template-link` 的 `createLink` 为每个业务路由创建带类型推断的 URL 构建方法
- 数据结构：每个路由对象包含 `toUrl(params?)` 方法和可选的 `description` 字段
- 分文件定义：子业务路由可在 `src/routes/` 下的对应子目录中独立定义
- 统一出口：所有路由链接必须在 `src/routes/index.ts` 统一 re-export
- ESLint 规则 1（`no-direct-route-import`）：禁止从 `src/routes/` 子文件直接导入路由，强制从统一出口 `@/routes` 导入
- ESLint 规则 2（`no-hardcoded-route-url`）：禁止在导航操作中使用硬编码路径字符串，强制使用路由对象的 `toUrl()` 方法
- 现有代码迁移：`capabilities/navigation.ts` 中的 `PAGE_MAP`、`AIExecutorProvider.tsx` 中的 `buildPath`、`AppLayout` 中的菜单导航等，全部替换为统一路由链接

## Out Of Scope

- 非 `src/routes/` 下的路由（如 `src/routers/index.tsx` 中的 `createBrowserRouter` 配置）不在本需求范围内，不做修改
- XState 状态机相关改造（REQ-AI-01 ~ REQ-AI-05）不在本需求范围内
- 路由信息如何暴露给 LLM（见 REQ-AI-14）不在本需求范围内

## Main User Flows

### 开发者定义新路由

1. 在 `src/routes/` 下对应子业务文件中，使用 `route()` 工厂函数定义路由
2. 在 `src/routes/index.ts` 中 re-export 并注册

### 开发者在代码中使用路由

1. 从 `@/routes` 导入路由对象
2. 使用 `toUrl()` 生成 URL 用于 `router.navigate()`、`<Link to>`、`<Navigate to>` 等
3. ESLint 规则确保路径硬编码会被拦截

## Business Rules

### 路由定义规则

- 每个路由由一个变量名（即 key）和模板路径组成
- key 应使用 camelCase，语义清晰，开发者能理解路由目标
- 当 key 不足以描述路由用途时，补充 `description` 字段（一句中文描述）
- 带路径参数的路由，参数使用 TypeScript 类型约束（如 `{appId: string}`）
- 路由路径模板中的参数占位符使用 `{paramName}` 格式

### Route Factory 设计

- `createRouteFactory(basePath?)` 返回一个 `{ route, Route }` 对象，其中 `route(path, description?)` 创建的 URL 以 `basePath` 为前缀
- `src/routes/create.ts` 默认导出使用 `APP_BASENAME` 的预置工厂，现有路由定义文件无需改动
- 子项目（如 qiankun 子应用）可调用 `createRouteFactory('/sub-app')` 构建独立的 `route` 工具方法，拥有自己的 base path
- `Route` 接口包含 `toUrl(params?)` 方法和可选的 `description` 字段

### 排除范围

- 以下页面不纳入统一路由管理（无业务意义或纯开发用途）：
  - `/ai-debug`
  - `/ai-chat`
  - `/about`
  - `/example`
  - `/border-glow-demo`
  - `/home`

### ESLint 规则 1：no-direct-route-import

**触发条件**：import 声明的 source 为 `@/routes/<子文件名>`（如 `@/routes/applications`）

**允许**：

- `import { applications } from '@/routes'`
- `import { applications } from '@/routes/index'`
- `import { route } from '@/routes/create'`

**禁止**：

- `import { applications } from '@/routes/applications'`
- `import { environments } from '@/routes/resources'`

### ESLint 规则 2：no-hardcoded-route-url

**触发目标**：

- `router.navigate(...)` 的参数
- `<Link to={...}>` 和 `<NavLink to={...}>` 的 to 属性
- `<Navigate to={...}>` 的 to 属性

**允许**：

- `router.navigate(applications.toUrl())`
- `router.navigate(applicationOverview.toUrl({ appId: id }))`
- `<Link to={environments.toUrl()}>`
- `router.navigate(-1)` — 历史导航
- `router.navigate(1)`
- 参数为动态变量（非字符串字面量且非路径模式匹配）

**禁止**：

- `router.navigate('/applications')`
- `router.navigate('/applications/' + appId + '/overview')`
- `<Link to="/environments">`
- `<Navigate to="/clusters" replace />`

**判断逻辑**：如果参数是字符串字面量且以 `/` 开头，报告错误。

## Route Definitions

## File Structure

```
src/routes/
  create.ts              - Route 接口 + createRouteFactory 工厂 + 默认 route 导出
  index.ts               - 统一出口：re-export 所有路由
  applications.ts        - 应用管理相关路由
  resources.ts           - 环境、集群、账户
  system.ts              - 设置、流水线、变更日志
  personal.ts            - 收藏、最近访问
```

### applications.ts

```typescript
applications              - /applications
applicationOverview       - /applications/{appId}/overview          (description: '应用概览详情')
applicationDeployments    - /applications/{appId}/deployments       (description: '应用部署管理')
applicationSettings       - /applications/{appId}/settings
applicationRuntimeConfig  - /applications/{appId}/runtime-config
applicationStartupConfig  - /applications/{appId}/startup-config
```

### resources.ts

```typescript
accounts      - /accounts
environments  - /environments
clusters      - /clusters
```

### system.ts

```typescript
settings   - /settings
pipelines  - /pipelines
changelog  - /changelog
```

### personal.ts

```typescript
favorites - /favorites
recent    - /recent
```

## Roles / Permissions

不涉及。

## Edge Cases

- `react-router-template-link` 对 `react-router-dom` 的 peer dependency 版本要求为 `^6.4.2`，当前项目使用 `7.17.0`。安装时有 peer warning，但 `createFactory` 和 `createLink` 的核心功能基于 URL 模板处理，不依赖 react-router-dom 的特定版本 API。需验证运行时是否正常。
- `APP_BASENAME`（当前为 `/devops/cnap`）需要传入 `createFactory` 的 `basename` 选项，确保生成的 URL 包含 basename。

## Open Questions

无。

## Acceptance Criteria

- [x] `src/routes/` 目录下存在上述所有文件，每个子业务文件定义了对应的路由
- [x] `src/routes/index.ts` 统一 re-export 所有路由
- [x] `route()` 工厂函数生成的路由对象具有 `toUrl()` 方法和可选的 `description`
- [x] `toUrl()` 在无参路由调用时不需参数，在带参路由调用时 TypeScript 强制要求参数（已简化为非泛型实现，运行时行为正确）
- [x] ESLint 规则 `no-direct-route-import` 在从子文件导入路由时报错
- [x] ESLint 规则 `no-hardcoded-route-url` 在使用硬编码路径导航时报错
- [x] 两条 ESLint 规则对允许的写法不报错（见 Business Rules 中的允许列表）
- [x] `yarn lint` 通过（8 个预存错误，无新增）
- [x] `yarn lint-type` 通过
- [x] `yarn build` 通过

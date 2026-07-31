# API Infrastructure

## Purpose

CNAP 前端所有 HTTP 请求通过服务级请求工厂发出。请求工厂集中管理 `baseURL`、公共请求头、query 序列化、成功响应解包和错误分派；业务 API 文件只声明接口契约。

## Service Factories

服务工厂位于 `src/api/services/*`。每个后端服务对应一个独立目录，内部使用 `axios-interface` 的 `createFactory` 建立请求工厂。

### Primary (AppSpace) — `src/api/services/primary/`

- `baseURL`: `/api/appspace`
- `withCredentials`: `true`（默认携带身份鉴权 cookie）
- `paramsSerializer`: `qs.stringify`，`arrayFormat: 'comma'` / `skipNulls: true` / `allowDots: true`
- `onResolve`: 直接返回 `response.data`，不做业务 code 二次判定
- `onReject`: 调用 `tryConfirmSessionLost(error.request, error.response)`，然后 `throw error` 原样抛出 `AxiosError`
- `enhance`: 见下文"Mock 机制"

导出：

```ts
import {createInterface, request} from '@/api/services/primary';
```

## Error Contract

- 错误路径**由 HTTP 状态码触发**：非 2xx 一律进入 `onReject`；不基于业务 `code` 字段做成功/失败判定
- 错误 body 契约：`{requestId: string, code: string, message: string}`
- `AxiosError` 原样向上抛出，调用方从 `error.response.data` 自行读取 `{requestId, code, message}`。当前**不封装 `RequestError` 类，不提供错误识别工具函数**；未来若出现重复读取样板再考虑抽象

## Session Loss Detection

`tryConfirmSessionLost`（`src/auth/login.ts`）挂载在 primary 服务的 `onReject`。触发时机：

- `error.request.status === 0`（UUAP 302 重定向）
- HTTP 500/401 + `data.code === 302` + `data.message.global === 'uuap认证失败，请重新登陆。'`

命中后弹出会话超时确认对话框；不阻断错误抛出。

## Interface Declaration

业务 API 文件通过 `createInterface<Params, Result>(method, urlTemplate)` 声明接口：

```ts
import {createInterface} from '@/api/services/primary';

const getOne = createInterface<{ uuid: string; }, Application>(
    'GET',
    '/rest/v1/application/{uuid}',
);
```

`axios-interface` 自动从 params 中提取 `{uuid}` 替换 URL，剩余参数按 HTTP 方法进入 query 或 body。`interpolate` 与 `encodePathVariable` 使用默认值。

## Mock Mechanism

Primary 工厂的 `enhance` 支持接口级 mock：

```ts
const getOne = createInterface<Params, Application>(
    'GET',
    '/rest/v1/application/{uuid}',
    { mock: { uuid: 'x', name: 'demo' } },
);
```

规则：

- 判定条件：`import.meta.env.DEV === true` 且合并后的 options 中 `'mock' in merged` 命中（允许 mock 值为 `undefined` / `null` / `0` / `''`）
- `mock` 值可以是静态值或函数：若为函数，则以请求参数调用 `mock(params)` 获取结果；若为静态值，直接 resolve
- 命中即 `Promise.resolve(mockValue)`，**请求不发出**；`onResolve` / `onReject` / `tryConfirmSessionLost` 均不触发
- 生产构建（`import.meta.env.DEV === false`）下整个 mock 分支被 Vite 编译期消除，`mock` 字段随之无效
- 类型层面：`Options` 的索引签名 `[whatever]: any` 使 `mock` 无法与 `TResult` 强绑定，需 code review 保证 mock 结构与真实返回值一致

## Multi-Service Extension

新增业务服务时：

1. 在 `src/api/services/<serviceName>/` 下建立新目录
2. 自行提供 `commonOptions.ts` / `paramsSerializer.ts` 等本服务专属配置；**不复用 primary 的公共头与错误契约**
3. 调用 `createFactory` 建立工厂，导出该服务专属的 `createInterface` 与 `request`（建议加服务名前缀避免命名冲突）
4. 该服务的错误契约、鉴权方式、序列化规则由该服务自行决定

Primary 服务的错误协议、会话失效检测、`withCredentials` 是 AppSpace 业务的约定，不是跨服务基线。

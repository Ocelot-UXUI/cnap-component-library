# 2026-07-13 API Infrastructure Migration

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-13
> Source: `API_BUILDING_MIGRATION_GUIDE.md`（用户提供的接口建设规范迁移指南）

## Implementation Notes

- Phase 1–3 已按 plan 落地，见 `docs/logs/2026/07-13.md` "API 基建：迁移到 axios-interface"
- `enhance` 在 TS 层面因 `Options` 索引签名 `[whatever]: any` 使 `callOptions` 被推断为 `never`，实现时移除了 "callOptions 是函数则调用" 分支，直接把 `callOptions` 当对象 spread（源码 `getMergedOptions` 保留了函数分支；本 factory 内不使用函数形式覆盖）
- `onReject` 中 `error.response.headers` 强制断言为 `Record<string, string>`（经 sub-agent 审查建议改为 `unknown as Record<string, string>` 明确 unsafe）
- Mock 环境门控经 sub-agent 审查从 `APP_IS_DEV`（运行时 hostname 判定）改为 `import.meta.env.DEV`（Vite 编译期常量），生产构建下整个 mock 分支被静态消除，避免生产 bundle 泄漏 mock 数据与 host 依赖歧义

## Current Baseline

- `src/api/base.ts` 直接使用原生 `axios.create` 建立单例 `axiosInstance`，`baseURL = /api/appspace`，注入 `X-Trace-ID` 头，并通过响应拦截器判定业务错误、触发 `tryConfirmSessionLost`。本次除保留 `tryConfirmSessionLost` 的调用外，其余逻辑全部丢弃；`base.ts` 文件本身在 Phase 3 一并删除。
- `tryConfirmSessionLost`（`src/auth/login.ts`）依赖响应错误分支触发 UUAP 重登流程，必须保留其触发时机。
- 当前项目**尚未接入真实后端接口**：`navigationContext/` 走 `Promise.resolve` 静态数据，`ai/chat.ts` 走 SSE `fetch`，`ai/tools.ts` 是静态聚合。`axiosInstance` 未被真实业务消费。
- `axios-interface@2.1.1` 与 `qs@6.15.3`、`@types/qs` 已安装并落到 `package.json` / `yarn.lock`。
- `axios-interface` 类型契约（来自 `node_modules/axios-interface/es/types.d.ts` 与 `createFactory.d.ts`）：
  - `Options` 继承 `AxiosRequestConfig`，扩展 `onPending`、`onResolve`、`onReject`、`enhance`、`interpolate`、`urlTemplate`、`encodePathVariable`、`transformDeleteParamsIntoBody`。
  - `onResolve(response, params, options)` 入参为 `AxiosResponse`；`onReject(error, params, options)` 入参为 `AxiosError`，可直接访问 `error.request` 与 `error.response`。
  - `createFactory(defaultOptions)` 返回 `{request, createInterface, options}`。
- 无 `src/interface/entities/` 目录，无 `createInterface` / URL 模板机制。

## Goals

- 建立 AppSpace 业务的主服务请求工厂目录 `src/api/services/primary/`，导出 `createInterface` 与 `request`，供后续接入真实接口使用。
- 集中定义 query 序列化（`qs.stringify` + comma / skipNulls / allowDots）、AppSpace 业务的公共请求头容器、成功响应解包。
- 通过 HTTP 状态码作为错误路径的唯一触发条件：错误一律走 `onReject`，成功响应不做业务 code 二次判定。
- 在 `onReject` 中调用 `tryConfirmSessionLost` 并原样抛出错误，`AxiosError.response.data` 中的 `{requestId, code, message}` 由调用方自行读取；不再引入 `RequestError` 或错误识别工具函数。
- 废弃 `src/api/base.ts`；`tryConfirmSessionLost` 调用点迁移到主服务 `onReject`。
- 建立多服务扩展位（`src/api/services/*` 目录约定），后续新业务在此目录下独立建 factory 并**自行处理**其公共头与错误契约。
- 提供接口级 mock 机制：`createInterface(method, url, {mock: data})` 在请求发出前短路，直接返回 `mock` 值；仅在开发环境生效，生产环境忽略。

## Non-Goals

- 不迁移任何现有业务 API 文件（`navigationContext/`、`ai/`）到新底座，也不修改其调用侧；后续接入真实接口时再做。
- 不搬迁 `src/types/*` 中的实体类型；本轮不建立 `src/interface/entities/`。
- 不由前端生成 `X-Trace-ID`。
- 不为非 AppSpace 业务预建 factory、公共头或错误契约；新业务自行处理。
- 不实现分页约定、SWR、预加载、缓存重新验证。
- 不实现生产环境 `PATCH` → `POST` 网关转换。
- 不修改 UUAP 登录流程本身，仅保证会话失效检测入口继续被触发。
- 本轮不涉及测试建设：不写单测 / 集成测试，也不把 `yarn test` 作为 Exit / Closure 条件。

## Task Route

- Type: architecture change（引入新的请求底座抽象）
- Owner Docs: `docs/architecture/api-infrastructure.md`（新增）、`docs/context/codebase-map.md`（更新 `src/api/` 组织约定）
- Skill: `none`

## Execution Plan

### Phase 1 - Primary Service Modules

Status: completed

- Add: 依赖 `axios-interface@2.1.1`、`qs@6.15.3`、`@types/qs` 已安装，确认 `package.json` / `yarn.lock` 已提交。
- Add: 新建 `src/api/services/primary/paramsSerializer.ts`，使用 `qs.stringify`（`arrayFormat: 'comma'`、`skipNulls: true`、`allowDots: true`）。
- Add: 新建 `src/api/services/primary/commonOptions.ts`，导出 `getCommonOptions()`。首版返回空 `headers` 与 `withCredentials: true`（默认携带身份鉴权 cookie），为后续接入公共头预留扩展点。**不生成 `X-Trace-ID`**。
- Decision: 公共选项模块作为 **AppSpace 主服务专属**（放在 `src/api/services/primary/` 下），不外提到 `src/api/core/`。理由：公共头是业务约定，跨业务差异大；新业务应自建对应模块。剩余风险：如果未来出现多个业务共享同一约定，再考虑抽取。
- Decision: 不引入 `RequestError` 类，也不引入错误识别工具函数。错误路径直接把 `AxiosError` 原样抛出，调用方从 `error.response.data` 自行读取 `{requestId, code, message}`。备选：封装成 `RequestError`；拒绝原因是当前尚无消费方，过早抽象会增加维护面；未来真实接入后如出现重复读取样板，再决定是否补齐。剩余风险：调用方需要显式知晓错误 body 结构；靠 architecture 文档记录。
- Decision: Mock 通过 `Options` 自定义字段 `mock` 传入，短路点选在 factory 的 `enhance` 中：`'mock' in mergedOptions` 命中则直接 `Promise.resolve(options.mock)`，不发出真实请求。备选 1：在 `onResolve` 判断 —— 拒绝，因为真实请求仍会发出，且接口未开发时会走 `onReject` 读不到 mock；备选 2：Axios `adapter` 合成 `AxiosResponse` —— 拒绝，需构造完整响应结构，成本更高。剩余风险：`Options` 的索引签名 `[whatever]: any` 无法把 `mock` 类型约束到 `TResult`，靠 code review 保证 mock 与真实返回值结构一致。
- Decision: Mock 受环境门控。判定条件为 `import.meta.env.DEV === true`；生产构建下 `enhance` 中的 mock 分支不生效，即使调用方传了 `mock` 字段也会走真实请求。备选：新增自定义 env（如 `VITE_API_MOCK`）—— 拒绝，首版直接复用 Vite 内置 `DEV` 减少配置面。剩余风险：本地生产构建预览时无法看到 mock 结果；如需覆盖再单独引入 env 开关。
- Skill: `none`

[x] Exit Criteria:

- [x] `src/api/services/primary/paramsSerializer.ts`、`commonOptions.ts` 存在。
- [x] `yarn lint-type` / `yarn lint` 通过。

### Phase 2 - Assemble Primary Factory

Status: completed

- Add: 新建 `src/api/services/primary/index.ts`，调用 `createFactory({baseURL: '/api/appspace', ...getCommonOptions(), paramsSerializer, onResolve, onReject, enhance})`，导出 `createInterface` 与 `request`。
- Fix: `onResolve(response)` 仅返回 `response.data`，不做业务 code 判定。
- Fix: `onReject(error: AxiosError)` 中：
  1. 调用 `tryConfirmSessionLost(error.request ?? null, error.response ? {status, data, headers} : null)`，保留 UUAP 会话失效检测语义。
  2. `throw error` 将原始 `AxiosError` 抛给上层。
- Fix: `enhance(request, factoryOptions)` 返回包装后的函数：合并 `factoryOptions` 与调用侧 `callOptions`；当 `import.meta.env.DEV === true` 且合并后的 options 中 `'mock' in options` 命中时，直接 `Promise.resolve(options.mock)` 短路；否则透传给原 `request(params, callOptions)`。生产构建下 mock 分支不生效。
- Decision: 用 `axios-interface` 原生 `onReject` 挂载 `tryConfirmSessionLost`，不再使用外部 axios 拦截器。备选：保留 `base.ts` 拦截器；拒绝原因是新工厂持有独立 axios 实例，外部拦截器不覆盖。剩余风险：`onReject` 若返回 non-throw 值会静默吞错，实现时必须 `throw`。
- Decision: `interpolate` 与 `encodePathVariable` 使用 `axios-interface` 默认值。备选：显式配置；拒绝原因是当前无对接后端 URL 编码约定的证据，等真实接口接入后再按需覆盖。剩余风险：真实接入时若默认编码与后端不符，需要在服务层显式调整。
- Skill: `none`

[x] Exit Criteria:

- [x] `src/api/services/primary/index.ts` 存在并导出 `createInterface` 与 `request`。
- [x] `onReject` 中已调用 `tryConfirmSessionLost` 并抛出 `AxiosError`。
- [x] `enhance` 中的 mock 短路仅在 `import.meta.env.DEV === true` 时生效，生产构建下即使传入 `mock` 也走真实请求。
- [x] `yarn lint-type` / `yarn lint` 通过。

### Phase 3 - Retire Legacy base.ts And Document

Status: completed

- Fix: 删除 `src/api/base.ts`；如仍存在对旧导出的引用，一并移除。
- Fix: 新增 `docs/architecture/api-infrastructure.md`，记录：
  - `axios-interface` 请求工厂边界与钩子（`onResolve` / `onReject` / `enhance`）职责
  - AppSpace 错误契约：错误由 HTTP 状态码触发；`AxiosError.response.data` 结构为 `{requestId, code, message}`，调用方直接读取
  - `tryConfirmSessionLost` 挂载在 primary 服务 `onReject`
  - Mock 机制：`createInterface(method, url, {mock: data})` 在 `enhance` 中短路请求；仅 `import.meta.env.DEV` 生效；短路后 `onResolve` / `onReject` / `tryConfirmSessionLost` 均不触发；`mock` 类型不与 `TResult` 强绑定，需 review 保证结构一致
  - `src/api/services/*` 多服务扩展方式：新业务自建 factory、公共头、错误契约
- Fix: 更新 `docs/context/codebase-map.md` 中 `src/api/` 目录结构条目，说明 `services/primary/` 的职责与"业务 API 尚未迁移到新底座"的当前状态。
- Fix: 追加 `docs/logs/2026/07-13.md` 实现记录。
- Proof: `yarn lint-type` / `yarn lint` / `yarn build` 通过。
- Proof: 独立关闭审计确认 non-goals 未越界（未修改 `navigationContext/`、`ai/*`、`src/types/*`；未生成 `X-Trace-ID`；未新建 `interface/entities/`；未为非 AppSpace 业务预建模块；未引入测试文件；mock 分支在生产构建下不生效）。
- Skill: `none`

[x] Exit Criteria:

- [x] `src/api/base.ts` 已删除。
- [x] `docs/architecture/api-infrastructure.md` 反映当前基线。
- [x] `docs/context/codebase-map.md` 更新。
- [x] `docs/logs/2026/07-13.md` 追加记录。
- [x] Closure audit 独立完成。

## Open Questions

（Q1、Q2、Q3 已收敛：`onReject` 挂载 UUAP 检测；`withCredentials` 默认 `true`；错误 body 结构由调用方直接读取，不再抽象识别函数。）

## Closure Gates

- [x] Phase 1–3 全部 Exit Criteria 已勾选
- [x] Open Questions 全部收敛并有决策记录
- [x] `yarn lint-type` / `yarn lint` / `yarn build` 全部通过并记入日志
- [x] UUAP 会话失效检测在新底座 `onReject` 中被触发（人工代码走查证明）
- [x] 未越界修改现有业务 API 与类型；未为非 AppSpace 业务预建 factory；未引入测试文件
- [x] 关闭审计独立完成
- [x] `docs/logs/` 与 owner docs 已对齐

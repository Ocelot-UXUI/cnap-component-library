# 2026-07-13 Mock Data Migration To API Interfaces

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-07-13
> Source: 用户指令 — 将可匹配的 mock 数据迁移至 `src/api/` 接口的 mock 配置上

## Current Baseline

- `src/api/navigationContext/` 下有 6 个函数通过 `Promise.resolve` 返回硬编码静态数据（`staticData.ts`），类型为 `AccountOption` / `ApplicationOption` / `EnvironmentOption`（ID 均为 `string`）。
- `src/api/navigationContext/mockData.ts` 是 `staticData.ts` 的废弃副本，未被 `index.ts` 引用。
- `src/contexts/navigationContextCandidates.ts` 的 `loadNavigationContextCandidates` 三级瀑布加载全部数据（accounts → applications → environments），结果存入 `NavigationContextCandidates`。
- `src/contexts/navigationContextSnapshot.ts` 的 `getSnapshot` 按 `accountId` + `applicationId` 客户端过滤 environments。
- `src/pages/Workloads/mockData.ts` 的 `primaryActions` / `moreActions` 是 `HeaderAction[]`（含 `key` / `label` / `danger?`），被 `WorkloadsHeader` 消费。
- `src/api/` 下 5 个新 API 文件已定义 `createInterface`，但均未传入 `{mock}` 参数。
- `src/api/services/primary/index.ts` 的 `enhance` 钩子支持 `{mock: value}` 短路（仅 DEV），但 **`mock` 只能是静态值，不支持按请求参数过滤**。

## Goals

- 将 `navigationContext` 中的 account / application / environment mock 数据迁移到 `src/api/account.ts` / `src/api/applicationEnvironment.ts` 对应接口的 `{mock}` 配置上。
- 将 `Workloads` 的 `primaryActions` / `moreActions` mock 数据迁移到 `src/api/runtimeOperation.ts` 的 `getOperations` 接口的 `{mock}` 配置上。
- 将消费侧的数据类型从旧 mock 类型（`AccountOption` / `ApplicationOption` / `EnvironmentOption` / `HeaderAction`）迁移到 API 实体类型（`Account` / `Application` / `AppEnvironment` / `RuntimeOperation`）。
- 扩展 mock 机制以支持 `mock: (params) => value` 函数形式，使 param 感知的 mock（按 accountId / applicationID 过滤）可行。

## Non-Goals

- 不迁移 `src/pages/Environments/mockData.ts`（环境管理页面展示模型，无对应 API）。
- 不迁移 `src/pages/Accounts/index.tsx` 的内联 mock（账户管理页面，无对应 API）。
- 不迁移 `src/pages/Clusters/mockData.ts`（集群管理页面，无对应 API）。
- 不迁移 `src/pages/Home/data.ts`（首页仪表盘，无对应 API）。
- 不迁移 `src/pages/Deployments/index.tsx` 的内联 mock（部署历史，无对应 API）。
- 不迁移 `src/pages/Settings/` 的 mock（API Keys / Webhooks，无对应 API）。
- 不调用真实后端接口（接口暂未上线）。
- 不写测试。

## Task Route

- Type: implementation-only change（在已有 API 基建上迁移 mock 数据与类型）
- Owner Docs: `docs/architecture/api-infrastructure.md`（更新 mock 机制说明）
- Skill: `none`

## Execution Plan

### Phase 1 - Extend Mock Mechanism

Status: planned

- Fix: `src/api/services/primary/index.ts` 的 `enhance` 中，`mock` 值若为函数则调用 `mock(params)` 获取结果，否则直接 `Promise.resolve(mock)`。判定改为 `typeof merged.mock === 'function' ? merged.mock(params) : merged.mock`。
- Decision: 扩展 mock 支持函数形式。备选：不扩展，mock 返回全量数据由消费侧过滤；拒绝原因是 mock 应模拟真实 API 行为（按参数返回子集），返回全量数据会导致消费侧逻辑与真实接入时不一致。剩余风险：函数形式的 `mock` 类型在 TS 层面无法与 `TResult` 强绑定（`Options` 的索引签名 `[whatever]: any`），需 review 保证返回类型一致。
- Skill: `none`

[ ] Exit Criteria:

- [ ] `enhance` 支持 `mock: (params) => value` 函数形式。
- [ ] `yarn lint-type` 通过。

### Phase 2 - Migrate Account & Application Mock

Status: planned

- Fix: 在 `src/api/account.ts` 中为 `getMany` 和 `getApplicationsByAccount` 传入 `{mock}` 第三参数：
  - `getMany`：`{mock: () => accountMockData}`（`accountMockData: Account[]`）
  - `getApplicationsByAccount`：`{mock: (params) => applicationMockData.filter(app => app.accountId === params.accountID)}`（`applicationMockData: Application[]`）
- Fix: 将 `staticData.ts` 中的 `staticAccounts` / `staticApplications` 数据转换为 `Account[]` / `Application[]` 类型（string ID → number ID，Account 补充 `displayName` 字段），放置在 `src/api/account.ts` 或同目录 `mockData.ts` 中。
- Fix: 更新 `src/contexts/navigationContextCandidates.ts` 的 `loadNavigationContextCandidates`，改为调用 `accountApi.getMany` 和 `accountApi.getApplicationsByAccount`，返回类型从 `AccountOption[]` / `ApplicationOption[]` 迁移到 `Account[]` / `Application[]`。
- Fix: 更新 `NavigationContextCandidates` 类型定义（`navigationContextSnapshot.ts`），`accounts: Account[]`、`applications: Application[]`。
- Fix: 更新 `navigationContextSnapshot.ts` 的 `getSnapshot` 中 `availableApplications` 过滤逻辑，ID 比较从 string 改为 number。
- Fix: 更新 `NavigationContextState` 的 `accountId` / `applicationId` / `environmentId` 从 `string` 改为 `number`。
- Fix: 更新 `normalizeNavigationContext` 中的 ID 比较逻辑（string → number）。
- Fix: 更新 localStorage 持久化逻辑（`readStoredContext` / `writeStoredContext`），升级时清空旧数据。
- Decision: ID 类型从 `string` 迁移到 `number`。备选：保持 string，在 API 层做 `String(id)` 转换；拒绝原因是这会在所有消费侧引入转换样板，且与 API 实体类型不一致。剩余风险：localStorage 旧数据不兼容，用户已确认可直接清空。
- Decision: localStorage 缓存值如果不符合当前数据类型（如旧数据中 ID 为 string，当前期望 number），则清空该缓存值并返回空 context。不尝试格式迁移。
- Skill: `none`

[ ] Exit Criteria:

- [ ] `account.ts` 的两个接口传入 `{mock}` 参数，DEV 模式下可短路返回。
- [ ] `NavigationContextCandidates` / `NavigationContextState` 使用 `number` ID。
- [ ] `loadNavigationContextCandidates` 调用新 API。
- [ ] `yarn lint-type` / `yarn lint` 通过。

### Phase 3 - Migrate Environment Mock

Status: planned

- Fix: 在 `src/api/applicationEnvironment.ts` 中为 `getEnvironments` 传入 `{mock: (params) => environmentMockData.filter(env => env.applicationId === params.applicationID)}`（`environmentMockData: AppEnvironment[]`）。
- Fix: 将 `staticEnvironments` 数据转换为 `AppEnvironment[]` 类型：
  - `id: string` → `id: number`
  - `name: string` → `environmentName: string`
  - `accountId: string` → 删除（`AppEnvironment` 无此字段）
  - `applicationId: string` → `applicationId: number`
  - 新增 `environmentId: number`（重新编号为 1, 2, 3, 4）
- Fix: 更新 `loadNavigationContextCandidates` 的第三级加载，改为调用 `applicationEnvironmentApi.getEnvironments`。
- Fix: 更新 `NavigationContextCandidates.environments` 类型为 `AppEnvironment[]`。
- Fix: 更新 `getSnapshot` 中 `availableEnvironments` 过滤逻辑：原逻辑按 `accountId + applicationId` 过滤，新逻辑按 `applicationId` 过滤（`AppEnvironment` 无 `accountId`；`availableApplications` 已按 account 过滤，级联保证正确性）。
- Decision: `AppEnvironment` 不含 `accountId`，过滤逻辑从 `accountId + applicationId` 改为仅 `applicationId`。备选：在实体中补充 `accountId`；拒绝原因是后端契约不含此字段。剩余风险：无（`availableApplications` 已按 account 过滤，级联保证 `availableEnvironments` 不会越界）。
- Skill: `none`

[ ] Exit Criteria:

- [ ] `applicationEnvironment.ts` 的 `getEnvironments` 传入 `{mock}` 参数。
- [ ] `NavigationContextCandidates.environments` 类型为 `AppEnvironment[]`。
- [ ] `getSnapshot` 的 `availableEnvironments` 过滤逻辑更新。
- [ ] `yarn lint-type` / `yarn lint` 通过。

### Phase 4 - Migrate Runtime Operations Mock

Status: planned

- Fix: 在 `src/api/runtimeOperation.ts` 中为 `getOperations` 传入 `{mock: () => runtimeOperationMockData}`（`runtimeOperationMockData: RuntimeOperation[]`）。
- Fix: 将 `src/pages/Workloads/mockData.ts` 的 `primaryActions` / `moreActions` 数据转换为 `RuntimeOperation[]`：
  - `label` → `displayName`
  - `key` → 映射到 `capability`（`'restart'` → `'ApplicationRestart'`、`'hpa'` → `'HorizontalScale'`、`'vpa'` → `'VerticalScale'`、`'rollback'` → 保持为业务操作、`'delete'` → `'ApplicationUninstall'` 等）
  - 新增 `name`（如 `'application.restart'`）、`description`、`targetKind: 'None'`、`disabled: false`、`reason: ''`
- Fix: 在 `WorkloadsHeader` 中调用 `runtimeOperationApi.getOperations` 获取 `RuntimeOperation[]`，直接用 `RuntimeOperation` 渲染 UI：
  - `displayName` → 按钮文字
  - `capability` → icon 和 onClick 的路由 key（通过 `capability → {icon, onClick}` 查找表）
  - `disabled` → 按钮禁用状态
  - `reason` → 禁用时的 tooltip
  - **danger 判定**：通过 `capability` 识别，`ApplicationUninstall` / `PodDelete` / `PodDeleteForce` 视为 danger 操作
- Fix: 删除 `HeaderAction` 类型定义和 `primaryActions` / `moreActions` 常量。`WorkloadsHeader` 直接消费 `RuntimeOperation[]`。
- Decision: 不保留 `HeaderAction` 类型，直接使用 `RuntimeOperation`。`danger` 属性通过 `OperationCapability` 识别（`ApplicationUninstall` / `PodDelete` / `PodDeleteForce` 为 danger）。备选：保留 `HeaderAction` 作为 UI 映射层；拒绝原因是 `HeaderAction` 只剩 `danger` 一个独有字段，且 `danger` 可从 `capability` 派生，保留额外类型增加维护成本。剩余风险：`WorkloadsHeader` 中需要维护一个 `dangerousCapabilities` 集合。
- Skill: `none`

[ ] Exit Criteria:

- [ ] `runtimeOperation.ts` 的 `getOperations` 传入 `{mock}` 参数。
- [ ] `WorkloadsHeader` 从 `getOperations` 获取 `RuntimeOperation[]` 并直接渲染。
- [ ] `HeaderAction` 类型已删除。
- [ ] `yarn lint-type` / `yarn lint` 通过。

### Phase 5 - Clean Up And Document

Status: planned

- Fix: 删除 `src/api/navigationContext/mockData.ts`（废弃副本）。
- Fix: 将 `src/api/navigationContext/staticData.ts` 重命名为 `selectorBuilders.ts`（文件不再含静态数据，只保留 `NavigationSelectorOption` 类型定义和 `buildXxxSelectorOptionGroups` builder 函数）。删除其中已迁移的 `staticAccounts` / `staticApplications` / `staticEnvironments`。
- Fix: 删除 `src/api/navigationContext/index.ts` 中的 6 个函数（3 个扁平数据 API + 3 个 selector option group API 包装函数），均已被 `src/api/account.ts` / `src/api/applicationEnvironment.ts` + builder 函数替代。消费侧（`navigationOptionGroupMachine.ts`）改为直接调用真实 API + builder 函数。
- Fix: 更新 `src/contexts/navigationContextData.ts` 中 `AccountOption` / `ApplicationOption` / `EnvironmentOption` 类型定义：改为 re-export `Account` / `Application` / `AppEnvironment`，或直接删除并让消费侧引用 `@/interface/entities/`。
- Fix: 更新 `docs/architecture/api-infrastructure.md` 的 Mock 机制段落，补充函数形式 mock 说明。
- Fix: 追加 `docs/logs/2026/07-13.md` 实现记录。
- Decision: 删除 3 个 selector option group API 包装函数（`getAccountSelectorOptionGroups` / `getApplicationSelectorOptionGroups` / `getEnvironmentSelectorOptionGroups`）。消费侧直接调用 `accountApi.getMany` + `buildAccountSelectorOptionGroups`。备选：保留包装函数；拒绝原因是它们只是 `API + builder` 的薄包装，保留会增加间接层且与新 API 体系不一致。剩余风险：`navigationOptionGroupMachine.ts` 的 XState actor 调用点需要相应更新。
- Skill: `none`

[ ] Exit Criteria:

- [ ] `staticData.ts` 已重命名为 `selectorBuilders.ts`，不含 mock 数据。
- [ ] `navigationContext/index.ts` 的 6 个旧函数已删除。
- [ ] `navigationContextData.ts` 的旧 Option 类型已迁移或删除。
- [ ] `docs/architecture/api-infrastructure.md` 更新。
- [ ] `docs/logs/2026/07-13.md` 追加记录。
- [ ] `yarn lint-type` / `yarn lint` / `yarn build` 通过。
- [ ] Closure audit 独立完成。

## Open Questions

（Q1、Q2 已收敛：localStorage 旧数据直接清空；删除 3 个 selector option group API 包装函数，保留 builder 函数并重命名 `staticData.ts` 为 `selectorBuilders.ts`。）

## Closure Gates

- [ ] Phase 1–5 全部 Exit Criteria 已勾选
- [ ] Open Questions 全部收敛
- [ ] `yarn lint-type` / `yarn lint` / `yarn build` 全部通过并记入日志
- [ ] 未越界修改 non-goals 中的 mock 数据
- [ ] 关闭审计独立完成
- [ ] `docs/logs/` 与 owner docs 已对齐

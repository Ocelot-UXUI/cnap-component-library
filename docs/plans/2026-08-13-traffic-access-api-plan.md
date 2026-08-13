# 2026-08-13 应用-流量接入接口层实现计划

> Plan Status: completed
> Owner: v_wangkaiyuan02
> Last Reviewed: 2026-08-13
> Source: 用户需求「根据文档实现对应的接口」；真源 `docs/input/source-api-traffic-access.md`（docGuid `BmpsRg9e55_8yB`，2026-08-13 落盘）

## Current Baseline

- `src/` 下无任何流量接入（access）相关代码；`src/api/` 按业务模块平铺（`applicationEnvironment.ts` 已覆盖 `/application-environments` 下的 environments/clusters，但无 accesses）。
- HTTP 封装 `createInterface(method, pathTemplate, options?)`：urlTemplate 中 `{name}` 占位符字段进路径；GET 剩余 params 进 query、POST/PUT 进 body、DELETE 进 query（`basicParamsTransform`）。
- 全局 `paramsSerializer`：qs `arrayFormat: 'comma'`（数组序列化为逗号分隔）；`createInterface` 第三参数可覆盖，覆盖值合并进 axios config。
- 实体类型位于 `src/interface/entities/`；应用模块既有惯例：REST 业务 ID 统一 string（见 `source-api-applications.md` 与 `application.ts`）。
- `onResolve` 直接返回 `response.data`；错误统一抛给调用方（`onReject` 仅处理会话丢失）。

## Goals

- 按接口文档新增流量接入 API 契约层：实体类型 + 8 个接口（accesses CRUD、access-types、access-name-preview、access-topology）。
- 忠实文档契约：`type` 查询参数按重复 key（`?type=service&type=headless`）序列化；POST 创建响应为数组；DELETE 为 204 无 body。
- `yarn lint-type` 通过；定向单测证明重复 key 序列化。

## Public Contract

- `src/interface/entities/trafficAccess.ts` 导出：`AccessRecord`、`AccessTarget`、`AccessBasic`、`AccessDetail`、`AccessListResult`、`AccessCreateBody`、`AccessUpdateBody`、`AccessType`、`AccessNamePreview`、`AccessTopology`、`AccessTopologyNode`、`AccessTopologyEdge` 等。
- `src/api/trafficAccess.ts` 导出：`getAccesses` / `createAccess` / `getAccessDetail` / `updateAccess` / `deleteAccess` / `getAccessTypes` / `getAccessNamePreview` / `getAccessTopology`。
- `type` 查询参数（仅 `getAccesses`）：`string[]`，该接口单独覆盖 `paramsSerializer` 为 `arrayFormat: 'repeat'`，保证 `type=service&type=headless`；序列化函数同时保留全局的 `skipNulls: true, allowDots: true`。
- `basic` / `detail`：按文档出现字段建模（可选）+ index signature 原样透传，不做按类型分支的联合；`targetEnsIds` 等服务端校验语义不建模。
- 文档标注「省略/仅某类节点有/可留空」的字段一律 optional：`AccessType.dependsOn/dependencyMode/nameTemplate/upstream/missingDependencies`、`AccessNamePreview.message`、`AccessTopologyNode.type/accessId/groupId`、PUT body（`AccessUpdateBody`）的 `type`。

## Non-Goals

- 不实现流量接入 UI 层（列表页、创建向导、拓扑图等页面/组件）。
- 不做错误码（400/404/409/412 → code）到用户提示的映射，`BaiduIntWarp` 错误体仅透传（属 UI 层）。
- 不改动全局 `paramsSerializer` / `commonOptions` / `createFactory`。
- 不为接口补充 mock 数据（`enhance` 的 DEV mock 机制现有 API 未使用，保持一致）。
- 不更新 `docs/requirements/`（无既有流量接入 requirement，本轮仅为 API 契约实现）。

## Task Route

- Type: implementation-only change（新增 API 契约层，不改既有行为）
- Owner Docs: `docs/input/source-api-traffic-access.md`（真源）；模式参考 `src/api/application.ts`、`src/api/runtimeOperation.ts`、`src/interface/entities/application.ts`
- Skill: api-sync-from-ku-prompt（`docs/skills/api-sync-from-ku-prompt.md`，Step 4/7/8 适用）；ku-doc-manage 已用于源文档抓取

## Execution Plan

### Phase 1 - 实体类型

Status: completed

- Decision: 模块归属新建 `src/interface/entities/trafficAccess.ts`，不并入 `applicationEnvironment.ts`。理由：流量接入是独立业务 feature，且文件行数限制（150 行）下并入会超限。Skill: none
- Decision: `appEnvID` / `accessID` / 各业务 ID 用 `string`（跟随应用模块「REST 业务 ID 统一字符串」惯例；path 参数在 URL 中天然为字符串）。接口文档标注 int64 视为类型标注差异。Skill: none
- Decision: `AccessBasic` / `AccessDetail` 建模为「文档出现字段（可选）+ `[key: string]: unknown`」透传对象。理由：文档明确「各类型不同，原样透传」，按类型分支建联合会过度设计且后端会继续演进字段。剩余风险：消费方读取透传字段需自行收窄；`basic.targetEnsIds` 的必填/白名单校验与删除保护 412 属服务端语义，透传对象不建模，UI 层需要时自行处理。Skill: none
- Add: 实现 `trafficAccess.ts` 实体类型，覆盖文档 §1 公共枚举、§2 Access 记录与请求体（含 PUT 的 `AccessUpdateBody`）、§3 AccessType、§4 名称预览、§5 拓扑节点/边。Skill: api-sync-from-ku-prompt
- Proof: `yarn lint-type`。Skill: none

[ ] Exit Criteria:

- [x] 实体类型覆盖文档 5 组接口的请求/响应字段，字段名与文档一致（如 `targets[].cluster` 非 `clusterId`）。
- [x] 透传对象（basic/detail）保留文档字段且开放扩展；文档「省略/仅某类节点有/可留空」字段均为 optional（清单见 Public Contract）。

### Phase 2 - API 接口

Status: completed

- Decision: 查询列表 `type` 参数序列化按文档重复 key，**仅 `getAccesses` 一个接口**覆盖 `paramsSerializer`（qs `arrayFormat: 'repeat'`，同时保留 `skipNulls: true, allowDots: true`）。理由：接口文档契约明确 `?type=service&type=headless`；全局 comma serializer 会输出 `type=service,headless`，与契约不符。替代方案被拒：修改全局 serializer（影响所有既有接口）。剩余风险：与全局序列化约定不一致，UI 调用方传 `string[]` 即可，无感知。该 serializer 作为模块内具名函数导出，便于定向单测。Skill: api-sync-from-ku-prompt
- Decision: `createAccess` 响应类型为 `AccessRecord[]`（201 恒为数组）；`updateAccess` 为单个 `AccessRecord`；`deleteAccess` 为 `void`（204，运行时 `onResolve` 返回空串，调用方不消费即可）。Skill: none
- Add: 实现 `src/api/trafficAccess.ts` 8 个接口，path 用 `/application-environments/{appEnvID}/accesses...` 模板，method 与文档一致。Skill: api-sync-from-ku-prompt
- Proof: 新增 `src/api/trafficAccess.test.ts` 定向单测，证明 repeat serializer 下 `type: ['service','headless']` 序列化为 `type=service&type=headless`、`null` 的 clusterId 被跳过、page 等标量不受影响。Skill: api-sync-from-ku-prompt
- Proof: `yarn lint-type`。Skill: none

[ ] Exit Criteria:

- [x] 8 个接口 method/path/query/body 与文档一一对应。
- [x] 单测证明重复 key 序列化与 null 跳过；`yarn lint-type` 通过。

### Phase 3 - 验证与关闭

Status: completed

- Proof: 运行 `yarn lint-type`、`yarn test`（全量，本次为纯新增文件，成本极低）、`yarn lint`，真实记录结果；失败不得作为通过基线。Skill: none
- Fix: 更新 `docs/logs/2026/08-13.md`（追加接口层实现记录）。Skill: none
- Follow-up: UI 阶段（列表页/创建向导/拓扑图）开始前，先按 AGE 流程合成 `docs/requirements/` 流量接入需求，再规划 UI 实现；本轮仅落地 API 契约层。Skill: none

[ ] Exit Criteria:

- [x] 验证命令通过（或如实记录失败及原因）。
- [x] `docs/logs/2026/08-13.md` updated。

## Closure Gates

- [x] in-scope behavior is complete
- [x] relevant docs are aligned
- [x] verification has run
- [x] closure audit was independent

## Draft Review Record

- Reviewer: General_7565217
- Verdict: passes draft review（首轮 needs revision 已修订）
- Revision: 已按审查修订——(1) Skill 标记统一为 `api-sync-from-ku-prompt` 应用于 Phase 1 Add / Phase 2 Add / Phase 2 Proof；(2) serializer 覆盖限定为 `getAccesses` 单接口并保留 `skipNulls/allowDots`，Proof 增补 null 跳过断言，serializer 具名导出；(3) Phase 1 Exit Criteria 补齐文档「省略/仅某类节点有/可留空」字段 optional 清单，新增 `AccessUpdateBody`（PUT `type` 可留空）；(4) basic/detail 透传 Decision 追加 `targetEnsIds` 服务端语义边界；(5) Phase 3 补全量 `yarn test`，并追加 UI 阶段前先合成 requirement 的 Follow-up。可开始实现。

## Closure

- Reviewer: General_7568940
- Verdict: passes closure audit（首轮 needs work：日志未追加，已修复）
- Evidence: 独立重跑核实——`yarn lint-type` 通过；定向单测 3/3；全量 38 files / 229 tests 通过；lint 新增文件 0 error 0 warning，仅既有 `src/utils/i18n/index.ts` 2 error（无未提交改动，非本次范围）。契约覆盖 8 接口与文档 §1-§6 逐一对应，`targets[].cluster`、POST 数组响应、DELETE 204、PUT `type` 可留空、optional 字段清单全部落地；日志已追加至 `docs/logs/2026/08-13.md`。

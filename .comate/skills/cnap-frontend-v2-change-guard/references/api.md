# 后端接口

**真源**：`src/api/services/primary/index.ts`（工厂）、`docs/context/conventions.md`（API And Data Source Boundaries）。**禁止业务代码裸用 axios / fetch。** 另据 `source-of-truth-and-precedence.md`，**API 契约的真源是 `src/api/`**（TS 定义 + 基础 axios 实例）——与后端字段有出入时以 `src/api/` 及确认过的契约为准，不按字段名臆测。

## 定义端点

按 domain 建 `src/api/<domain>.ts`，用工厂的 `createInterface` 定义，`default export` 一个对象聚合该 domain 的方法：

```ts
import {createInterface} from '@/api/services/primary';

interface ParamsGetEnvironments {
    applicationID: string; // 路径参数放 Params，不拼进 path 字符串
}

const getEnvironments = createInterface<ParamsGetEnvironments, AppEnvironment[]>(
    'GET',
    '/applications/{applicationID}/environments',
);

export default {getEnvironments};
```

- 泛型 `<Params, Response>` 显式声明；路径参数用 `{name}` 占位，值放 Params 接口。
- 命名：文件按 domain 实体；方法用动词短语（`getEnvironments`）；param 接口 `Params<Fn>`。
- baseURL 已由工厂统一注入（`/api/cnap/rest/v1`），别硬编码域名。
- **mock（仅 DEV）**：调用/定义时传 `mock` 选项（值或 `(params)=>value`），工厂的 `enhance` 在 `import.meta.env.DEV` 下直接返回 mock，prod 不受影响。

## 消费

```ts
import applicationEnvironment from '@/api/applicationEnvironment';
const envs = await applicationEnvironment.getEnvironments({applicationID});
```

## 数据源边界

- 该走接口的数据必须调对应 API 函数，不在本地派生/import 本地数据充当接口。
- API 模块可临时以静态数据实现，但要保持与将来服务端一致的对外契约；消费方不应知道数据来自静态还是服务端。
- UI 可把 API DTO 适配成 view model，但**不得在前端决定 API 归属的语义**（收藏/最近/权限/可用性/后端分类等）。
- 剪贴板等副作用走 `utils.md` 里的封装。

---
status: new
processed: pending
---

# 账户-基本能力（接口文档）

> - 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/wDHcvK7WzdAhj5>
> - docGuid：`wDHcvK7WzdAhj5`
> - 作者：龙秋云 (longqiuyun@baidu.com)
> - 抓取时间：2026-08-13
> - 抓取方式：`ku query-content --protocol markdown --show-doc-info`
> - 更新内容：账户列表拆分为导航栏接口 `/accounts`（精简字段）与统计接口 `/account-summaries`（含统计信息）；角色拆分为独立接口 `/user-account-roles`；账户 ID 类型由 number 改为 string；路径参数 `:accountID` 改为 `:accountId`；获取账户基本信息响应改为 `account` 嵌套结构；创建账户路径 3.4 节正文 `POST /rest/v1/accounts` 按接口总览修正为 `POST /rest/v1/account`（上游 3.4 正文疑为笔误，前端实现已同步采用 `/account`）
> - 备注：账户模块子模块"账户-基本能力"接口文档；以在线文档为准。

---

账户-基本能力

## 1. 接口总览
|描述|方法|路径|
|-|-|-|
|获取用户有权限的资源账户列表|GET|`/rest/v1/resource-accounts`|
|获取账户基本信息列表（导航栏接口）|GET|`/rest/v1/accounts`|
|获取账户列表及统计信息|GET|`/rest/v1/account-summaries`|
|获取用户账户角色|GET|`/rest/v1/user-account-roles`|
|创建账户|POST|`/rest/v1/account`|
|获取账户基本信息|GET|`/rest/v1/accounts/:accountId`|
|更新账户|PUT|`/rest/v1/accounts/:accountId`|



## 2. 资源账户接口
### 2.1. 查询用户资源账户树
请求：

```
GET /rest/v1/resource-accounts
```
响应：

```json
[
  {
    "accountUuid": "ra-root",
    "name": "技术中台测试",
    "type": "ORGANIZATION_UNIT",
    "children": [
      {
        "accountUuid": "ra-account-a",
        "name": "测试环境",
        "type": "ACCOUNT",
        "linkedAccounts": [
          {
            "id": 42,
            "name": "acme-corp",
            "displayName": "项目协同工具初始账户"
          }
        ]
      },
      {
        "accountUuid": "ra-account-b",
        "name": "生产环境",
        "type": "ACCOUNT",
        "linkedAccounts": []
      }
    ]
  }
]
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`accountUuid`|string|BCOP 资源账户或组织节点 UUID|
|`name`|string|资源账户或组织节点名称|
|`type`|string|BCOP 节点类型，常见值为 `ORGANIZATION_UNIT`、`ACCOUNT`|
|`children`|array|子节点列表；叶子节点不返回该字段|
|`linkedAccounts`|array|关联的 CNAP 账户；仅资源账户叶子节点返回，无关联账户时返回空数组|
|`linkedAccounts[].id`|number|CNAP 账户 ID|
|`linkedAccounts[].name`|string|CNAP 账户英文名称|
|`linkedAccounts[].displayName`|string|CNAP 账户中文名称|

使用说明：

1. 创建账户前调用本接口加载可选的资源账户树。
2. 用户选择 `type=ACCOUNT` 的资源账户叶子节点。
3. 创建账户时把节点的 `accountUuid` 作为 `externalId` 提交。
4. `linkedAccounts` 用于展示该资源账户已经关联的 CNAP 账户。



## 3. 账户接口
### 3.1. 获取账户基本信息列表（导航栏接口）
请求：

```
GET /rest/v1/accounts?keyword=测试
```
Query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`keyword`|string|否|搜索关键词，支持账户中文名称、账户英文名称|

响应：

```json
[
  {
    "id": "42",
    "name": "appspace-test",
    "displayName": "一站式测试账户",
    "icon": "https://bj.bcebos.com/cnap-test/account-icons/550e8400-e29b-41d4-a716-446655440000",
    "externalId": "559a4a8d48fd4269beef4d9fccdaf098"
  }
]
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`id`|string|CNAP 账户 ID，即后续 `accountID`|
|`name`|string|账户英文名称|
|`displayName`|string|账户中文名称|
|`icon`|string|账户图标的 BOS 公网地址|
|`externalId`|string|关联的 BCOP 资源账户 UUID|

搜索规则：

1. 账户中文名称和英文名称使用包含匹配。
2. `keyword` 为空时返回全部账户。



### 3.2. 查询账户列表及统计信息
请求：

```
GET  /rest/v1/account-summaries?keyword=测试
```
Query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`keyword`|string|否|搜索关键词，支持账户中文名称、账户英文名称、资源账户名称及资源账户完整路径|

响应：

```json
[
  {
    "account": {
      "id": "42",
      "name": "appspace-test",
      "displayName": "一站式测试账户",
      "icon": "https://bj.bcebos.com/cnap-test/account-icons/550e8400-e29b-41d4-a716-446655440000",
      "externalId": "559a4a8d48fd4269beef4d9fccdaf098"
    },
    "resourceAccount": {
      "name": "技术中台测试 / 测试环境 / appspace-test"
    },
    "applicationCount": "18",
    "environmentCount": "4",
    "clusterCount": "8"
  }
]
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`account`|object|账户基本信息，字段说明与“查询账户基本信息列表”一致|
|`resourceAccount`|object|关联的资源账户；无法匹配时不返回该字段|
|`resourceAccount.name`|string|包含父节点的资源账户完整路径|
|`applicationCount`|string|账户应用数|
|`environmentCount`|string|账户环境数|
|`clusterCount`|string|账户环境关联的集群记录数|

搜索规则：

1. 账户中文名称和英文名称使用包含匹配。
2. 资源账户搜索同时匹配节点名称和包含父节点的完整路径。
3. keyword 为空时返回全部账户。



### 3.3. 查询用户账户角色
请求：

```
GET  /rest/v1/user-account-roles
```
响应：

```json
[
  {
    "accountId": "42",
    "roles": [
      {
        "code": "ACCOUNT_ADMIN",
        "name": "账户负责人"
      }
    ]
  }
]
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`accountId`|string|CNAP 账户 ID|
|`roles`|array|用户在该账户下拥有的角色列表|
|`roles[].code`|string|角色编码|
|`roles[].name`|string|角色中文名称|

使用说明：

1. 账户统计信息通过/account-summaries 获取。
2. 用户在账户下的角色通过本接口单独获取，不放在账户列表项中。
3. 当前角色数据为 mock 数据，代码中保留 TODO，后续接入 CNAP 授权服务。



### 3.4. 创建账户
请求：

```
POST /rest/v1/account
Content-Type: multipart/form-data
```
Form Data 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`name`|string|是|账户英文名称，最长 256 个字符|
|`displayName`|string|是|账户中文名称，最长 512 个字符|
|`externalId`|string|是|BCOP 资源账户 UUID，最长 128 个字符|
|`icon`|file|是|账户图标，仅支持 JPG、PNG，最大 500 KB|
|`description`|string|否|账户描述，最长 1024 个字符|

响应：

```json
{
  "id": "42",
  "name": "appspace-test",
  "displayName": "一站式测试账户",
  "externalId": "559a4a8d48fd4269beef4d9fccdaf098",
  "icon": "https://bj.bcebos.com/cnap-test/account-icons/550e8400-e29b-41d4-a716-446655440000",
  "description": "xxxxx",
  "createdBy": "longqiuyun",
  "createdAt": "2026-07-28T10:00:00Z",
  "updatedAt": "2026-07-28T10:00:00Z"
}
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`id`|string|新创建的账户 ID|
|`name`|string|账户英文名称|
|`displayName`|string|账户中文名称|
|`externalId`|string|关联的 BCOP 资源账户 UUID|
|`icon`|string|上传到 BOS 后生成的公网地址|
|`description`|string|账户描述|
|`createdBy`|string|创建人，取自 `x-baidu-int-username` Header|
|`createdAt`|string|创建时间，RFC 3339 格式|
|`updatedAt`|string|更新时间，RFC 3339 格式|

图标处理：

1. 服务端验证文件大小、文件签名和图片格式。
2. 图标先上传到 BOS，再创建账户记录。



### 3.5. 获取账户基本信息
请求：

```
GET /rest/v1/accounts/:accountId
```
Path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`accountId`|number|是|CNAP 账户 ID|

响应：

```json
{
  "account": {
    "id": "42",
    "name": "appspace-test",
    "displayName": "一站式资源账号",
    "icon": "https://bj.bcebos.com/cnap-test/account-icons/550e8400-e29b-41d4-a716-446655440000",
    "externalId": "559a4a8d48fd4269beef4d9fccdaf098",
    "description": "xxxxxx",
    "createdBy": "longqiuyun",
    "createdAt": "2026-07-28T10:00:00Z",
    "updatedAt": "2026-07-28T10:00:00Z"
  },
  "resourceAccount": {
    "name": "技术中台测试 / 测试环境 / appspace-test"
  }
}
```


字段说明：

|字段|类型|说明|
|-|-|-|
|`account`|object|账户对象|
|`account.id`|string|CNAP 账户 ID|
|`account.name`|string|账户英文名称，不可编辑|
|`account.displayName`|string|账户中文名称|
|`account.icon`|string|账户图标的 BOS 公网地址|
|`account.externalId`|string|关联的 BCOP 资源账户 UUID|
|`account.description`|string|账户描述|
|`account.createdBy`|string|创建人|
|`account.createdAt`|string|创建时间，RFC 3339 格式|
|`account.updatedAt`|string|更新时间，RFC 3339 格式|
|`resourceAccount`|object|关联的资源账户；无法匹配时不返回该字段|
|`resourceAccount.name`|string|包含父节点的资源账户完整路径|



### 3.4. 编辑账户
请求：

```
PUT /rest/v1/accounts/:accountId
Content-Type: multipart/form-data
```
Path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`accountId`|number|是|CNAP 账户 ID|

Form Data 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`displayName`|string|是|账户中文名称，最长 512 个字符|
|`description`|string|是|账户描述，允许传空字符串，最长 1024 个字符|
|`icon`|file|否|新账户图标，仅支持 JPG、PNG，最大 500 KB；不传表示图标不修改|

响应：

```json
{
  "id": "42",
  "name": "appspace-test",
  "displayName": "新的账户中文名称",
  "externalId": "559a4a8d48fd4269beef4d9fccdaf098",
  "icon": "https://bj.bcebos.com/cnap-test/account-icons/8c27bfea-4369-4f46-a472-8e6238689450",
  "description": "新的账户描述",
  "createdBy": "longqiuyun",
  "createdAt": "2026-07-28T10:00:00Z",
  "updatedAt": "2026-07-28T11:00:00Z"
}
```
字段说明与“获取账户基本信息”中的账户字段一致

更新规则：

1. 仅允许修改 `displayName`、`description`、`icon`。
2. `name`、`externalId`、`createdBy` 等其他字段不可修改。
3. 不传 `icon` 时保留原图标，用户没有选择新图标时，不要在 Form Data 中添加 `icon` 字段
4. 传 `icon` 时更新新图标；用户选择新图标时，把文件作为 `icon` 提交。
5. 当前仅校验用户名存在，真实账户编辑权限将在角色模型完成后接入。

## 4. 错误响应
错误响应格式：

```json
{
  "requestId": "dff62150-50a8-4b65-9764-8b87e4b69c47",
  "code": "InvalidArgument",
  "message": "displayName is required"
}
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`requestId`|string|请求 ID，用于日志定位|
|`code`|string|错误码|
|`message`|string|错误说明|

常见 HTTP 状态码：

|HTTP 状态码|错误码|说明|
|-|-|-|
|`400`|`InvalidArgument` / `InvalidHTTPRequest`|参数缺失、格式错误、图片无效或超出大小限制|
|`401`|`Unauthenticated`|未提供用户名|
|`404`|`NotFound`|账户不存在|
|`412`|`PreconditionFailed`|BOS、BCOP 等必要服务配置未就绪|
|`500`|`InternalError`|下游服务或内部处理失败|

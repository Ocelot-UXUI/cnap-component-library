---
status: new
processed: pending
---

# 应用-基本能力（接口文档）

> - 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/zJ9Wp5AQ1cmFAU>
> - docGuid：`zJ9Wp5AQ1cmFAU`
> - 抓取时间：2026-08-13
> - 抓取方式：`ku query-content --protocol markdown`
> - 备注：应用模块接口文档；以在线文档为准。
> - 更新内容：列表接口查询参数 `type` 改为 `category`（按应用分类筛选，例如 microservice），响应字段 `type:"MICRO_SERVICE"` 改为 `category:"microservice"`（不返回应用类型名 type）；filter-options 响应 `applicationTypes` 改为 `applicationCategories`，用途由"应用类型"改为"应用分类"；接口总览移除"更新账户"（PUT /rest/v1/accounts/:accountId）；`pageSize` 说明由"范围为 1～100"改为"必须大于 0；不传时默认 20"。

---

应用-基本能力

## 1. 接口总览

|描述|方法|路径|
|-|-|-|
|获取账号下的应用列表|GET|/rest/v1/accounts/{accountID}/applications|
|获取应用列表筛选项|GET|/rest/v1/accounts/{accountID}/applications/filter-options|
|收藏应用|POST|/rest/v1/applications/{applicationID}/collection|
|取消收藏|DELETE|/rest/v1/applications/{applicationID}/collection|

## 2.获取账号下的应用列表

```
GET /rest/v1/accounts/{accountID}/applications
```

### 2.1. 请求头

|参数|必填|说明|
|-|-|-|
|x-baidu-int-username|否|当前用户名，用于判断应用是否收藏。UUAP 接入前临时由调用方注入；|

### 2.2 路径参数

|参数|类型|说明|
|-|-|-|
|accountID|int64|账号 ID|

### 2.3 查询参数

|参数|类型|默认值|说明|
|-|-|-|-|
|keyword|string|空|按应用名称、展示名称模糊搜索|
|category|string|空|按应用分类筛选，例如 microservice|
|environmentId|int64|0|按公共环境 ID 筛选|
|labelIds|string|空|用户标签 ID，多个 ID 使用英文逗号分隔，例如 7,8|
|page|int|1|页码，从 1 开始|
|pageSize|int|20|每页数量，必须大于 0；不传时默认 20|

请求示例：

```
GET /rest/v1/accounts/5/applications?keyword=checklist&category=microservice&environmentId=1&labelIds=7,8&page=1&pageSize=20
```

### 2.4 响应示例

```json
{
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "items": [
    {
      "id": "2",
      "accountId": "5",
      "name": "cnap-online-checklist-1",
      "displayName": "在线检查应用",
      "description": "应用描述",
      "category": "microservice",
      "systemLabels": ["CLONESET", "Python"],
      "userLabels": [
        {
          "id": "7",
          "name": "核心应用"
        }
      ],
      "environments": [
        {
          "applicationEnvironmentId": "15",
          "environmentName": "prod"
        },
        {
          "applicationEnvironmentId": "16",
          "environmentName": "test"
        }
      ],
      "defaultApplicationEnvironmentId": "15",
      "recentChanges": [
        {
          "applicationEnvironmentId": "15",
          "environmentId": "1",
          "environmentName": "prod",
          "changedBy": "zhangsan",
          "changedAt": "2026-08-05T07:52:26Z",
          "changeType": "workload-horizontal-scale"
        }
      ],
      "isCollected": true
    }
  ]
}
```

### 2.5 关键字段说明

|字段|说明|
|-|-|
|id、accountId 及其他 ID 字段|REST 响应中的业务 ID 统一使用字符串|
|category|应用分类，供列表展示和筛选使用；不返回应用类型名 type|
|systemLabels|系统标签|
|userLabels|用户标签|
|environments|应用环境|
|defaultApplicationEnvironmentId|默认进入的应用环境|
|recentChanges|每个环境最近一次成功操作|
|isCollected|当前请求用户是否收藏该应用|

应用本身不返回 `createdBy、createdAt、updatedAt`。

### 2.6 前端跳转规则

* 点击应用名称或整行：使用 defaultApplicationEnvironmentId 进入工作负载页面。
* 点击具体环境：使用对应环境的 applicationEnvironmentId。
* 点击环境时需要阻止事件冒泡，避免同时触发行点击。

工作负载接口示例：

```
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/summary
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/groups
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/pods
```

## 3 获取应用列表筛选项

```
GET /rest/v1/accounts/{accountID}/applications/filter-options
```

用于初始化应用列表页的应用分类、环境和用户标签筛选器，不需要查询参数。

### 3.1 路径参数

|参数|类型|说明|
|-|-|-|
|accountID|int64|账号 ID|

### 3.2 响应示例

```json
{
  "applicationCategories": ["microservice"],
  "environments": [
    {
      "id": "1",
      "name": "prod"
    }
  ],
  "userLabels": [
    {
      "id": "7",
      "name": "核心应用"
    }
  ]
}
```

### 3.3 字段说明

|字段|说明|
|-|-|
|applicationCategories|当前账号应用实际使用的应用分类，取 application_type.category，去重后按名称升序返回|
|environments|当前账号下未删除的公共环境，按 ID 升序返回|
|userLabels|当前账号下未删除的用户标签，按 ID 升序返回|
|environments.id、userLabels.id|REST 响应中的 ID 使用字符串|

没有数据时，对应字段返回空数组。

## 4 收藏应用

```
POST /rest/v1/applications/{applicationID}/collection
```

### 4.1 请求头：

```
x-baidu-int-username: xxx
```

x-baidu-int-username 必填，无请求体。重复收藏不会创建重复记录。

### 4.2 响应：

```json
{
  "applicationId": "2",
  "isCollected": true
}
```

## 5 取消收藏

```
DELETE /rest/v1/applications/{applicationID}/collection
```

x-baidu-int-username 必填，无请求体。应用未收藏时重复取消不会报错。

### 5.1 响应：

```json
{
  "applicationId": "2",
  "isCollected": false
}
```

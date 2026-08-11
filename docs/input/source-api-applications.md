---
status: new
processed: pending
---

# 应用（接口文档）

> - 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/zJ9Wp5AQ1cmFAU>
> - docGuid：`zJ9Wp5AQ1cmFAU`
> - 抓取时间：2026-08-11
> - 抓取方式：`ku query-content --protocol markdown`
> - 备注：应用模块接口文档；以在线文档为准。

---

应用

## 1. 接口总览

|描述|方法|路径|
|-|-|-|
|获取账号下的应用列表|GET|`/rest/v1/accounts/{accountID}/applications`|

## 2. 获取账号下的应用列表

```
GET /rest/v1/accounts/{accountID}/applications
```

### 请求头

|参数|必填|说明|
|-|-|-|
|x-baidu-int-username|是|当前用户名，用于判断应用是否收藏。UUAP 接入前临时由调用方注入|

### 路径参数

|参数|类型|说明|
|-|-|-|
|accountID|int64|账号 ID|

### 查询参数

|参数|类型|默认值|说明|
|-|-|-|-|
|keyword|string|空|按应用名称、展示名称模糊搜索|
|type|string|空|应用业务类型|
|environmentId|int64|0|环境id|
|labelIds|int64[]|空|用户标签 ID，可多选|
|page|int|1|页码，从 1 开始|
|pageSize|int|20|每页数量，范围为 1～100|

多标签请求示例：

```
GET /rest/v1/accounts/5/applications?keyword=checklist&type=MICRO_SERVICE&environmentId=1&labelIds=7&labelIds=8&page=1&pageSize=20
```

### 响应示例

```json
{
  "total": 1,
  "page": 1,
  "pageSize": 20,
  "items": [
    {
      "id": 2,
      "accountId": 5,
      "name": "cnap-online-checklist-1",
      "type": "MICRO_SERVICE",
      "displayName": "在线检查应用",
      "description": "应用描述",
      "systemTags": [
        {
          "key": "loadWay",
          "value": "CLONESET"
        }
      ],
      "labels": [
        {
          "id": 7,
          "accountId": 5,
          "name": "核心应用",
          "description": "核心链路应用",
          "createdBy": "zhangsan",
          "createdAt": "2026-08-01T08:00:00Z",
          "updatedAt": "2026-08-01T08:00:00Z"
        }
      ],
      "environments": [
        {
          "applicationEnvironmentId": 15,
          "environmentName": "prod"
        },
        {
          "applicationEnvironmentId": 16,
          "environmentName": "test"
        }
      ],
      "defaultApplicationEnvironmentId": 15,
      "recentChanges": [
        {
          "applicationEnvironmentId": 15,
          "environmentId": 1,
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

### 关键字段说明

|字段|说明|
|-|-|
|type|应用类型。|
|systemTags|系统标签|
|labels|用户标签|
|applicationEnvironmentId|应用环境ID|
|defaultApplicationEnvironmentId|默认进入的应用环境|
|recentChanges|每个环境最近一次成功操作|
|isCollected|当前请求用户是否收藏该应用|

### 前端跳转规则

* 点击应用名称或整行：使用 defaultApplicationEnvironmentId 进入工作负载页面。
* 点击具体环境：使用对应环境的 applicationEnvironmentId。
* 点击环境时需要阻止事件冒泡，避免同时触发行点击。

工作负载接口示例：

```
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/summary
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/groups
GET /rest/v1/application-environments/{applicationEnvironmentId}/runtime/pods
```

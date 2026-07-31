---
status: new
processed: pending
---

# 导航栏接口（源：ku 知识库）

- 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/6Fsg1TzBn4aKGs>
- 作者：贺义通 (heyitong@baidu.com)
- 抓取时间：2026-07-13
- 抓取方式：`ku query-content --protocol markdown`
- 备注：源文档结尾有一个空的三级标题占位符（`###`），未截断；如需最新版本请以在线文档为准。

---

## 查询账号列表

请求：

```
GET /rest/v1/accounts
```

query 参数：

| 参数    | 类型  | 必填 | 说明       |
| ------- | ----- | ---- | ---------- |
| keyword | int64 | 是   | 查询关键字 |

响应：

```json
{
  "id": 1,
  "name": "appspace-test",
  "display_name": "一站式测试账号"
}
```

## 查询账号下应用列表

请求：

```
GET /rest/v1/accounts/:accountID/applications
```

path 参数：

| 参数        | 类型  | 必填 | 说明    |
| ----------- | ----- | ---- | ------- |
| `accountID` | int64 | 是   | 账号 ID |

query 参数：

| 参数    | 类型  | 必填 | 说明       |
| ------- | ----- | ---- | ---------- |
| keyword | int64 | 是   | 查询关键字 |

响应：

```json
{
  "id": 1,
  "accountId": 1,
  "name": "test-app",
  ...
}
```

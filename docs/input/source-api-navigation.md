---
status: superseded
processed: done
superseded_by:
  - docs/input/source-api-account-basic.md
  - docs/input/source-api-applications.md
---

# 导航栏接口（源：ku 知识库）【已废弃】

- 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/6Fsg1TzBn4aKGs>
- 作者：贺义通 (heyitong@baidu.com)
- 抓取时间：2026-07-13
- 抓取方式：`ku query-content --protocol markdown`
- 备注：**本文档已废弃**——"查询账号列表"由 `source-api-account-basic.md` 取代，"查询账号下应用列表"由 `source-api-applications.md`（分页响应）取代；本文档内容过时（如 keyword 类型误写为 int64、应用响应未分页），仅作历史参考。

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

---
status: new
processed: pending
---

# 应用-流量接入（接口文档）

> - 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/BmpsRg9e55_8yB>
> - docGuid：`BmpsRg9e55_8yB`
> - 抓取时间：2026-08-13
> - 抓取方式：`ku query-content --protocol markdown`
> - 备注：应用模块流量接入（服务暴露）接口文档；以在线文档为准。
> - 更新内容：首次落盘。

---

应用-流量接入

# 应用-流量接入（服务暴露）
本组接口是应用的统一服务暴露模型。用户只选 `type` 并填 `basic`/`detail`，底层资源（K8s Service / NLB / ENS / 网关 / ALB）的映射由下游适配器完成。

## 1. 接口总览
|模块|方法|路径|
|-|-|-|
|流量接入|GET|`/rest/v1/application-environments/:appEnvID/accesses`|
|流量接入|POST|`/rest/v1/application-environments/:appEnvID/accesses`|
|流量接入|GET|`/rest/v1/application-environments/:appEnvID/accesses/:accessID`|
|流量接入|PUT|`/rest/v1/application-environments/:appEnvID/accesses/:accessID`|
|流量接入|DELETE|`/rest/v1/application-environments/:appEnvID/accesses/:accessID`|
|接入类型|GET|`/rest/v1/application-environments/:appEnvID/access-types`|
|名称预览|GET|`/rest/v1/application-environments/:appEnvID/access-name-preview`|
|流量拓扑|GET|`/rest/v1/application-environments/:appEnvID/access-topology`|

### 公共枚举：接入类型 `type`
|type|名称|分组 group|层级 layer|依赖 dependsOn（模式）|命名模板|备注|
|-|-|-|-|-|-|-|
|`service`|ClusterIP|inner|l4|无|`{workload}`|一期|
|`headless`|Headless|inner|naming|无|`{workload}-headless`|一期|
|`ens-inst`|ENS Service|inner|naming|无|`{workload}.K8S.{cluster}`|一期|
|`nodeport`|NodePort|cross|l4|无|`{workload}-nodeport`|一期|
|`loadbalancer`|LoadBalancer|cross|l4|无|`{workload}-lb`|一期|
|`nlb`|NLB-ENS|cross|l4|`ens-inst` / `ens-group`（any）|`{workload}-nlb-ens`|一期|
|`nlb-ens`|ENS NLB Service|cross|naming|`loadbalancer`（all）|`{workload}.K8S.{cluster}`|一期|
|`ens-group`|ENS Group|cross|naming|`ens-inst`（all）|`group.{workload}.K8S.all`|一期|
|`cnap`|CNAP 网关|cross|l7|无|无（名称=用户输入或 workload）|二期|
|`alb`|ALB|inbound|l7|`ens-inst` / `ens-group`（any）|`service_{workload}`|二期|

## 2. 流量接入接口
### 2.1 查询接入列表
请求：

```
GET /rest/v1/application-environments/:appEnvID/accesses?type=service&type=headless&clusterId=cluster-bjdd&workload=my-svc&page=1&pageSize=20
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|

query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`type`|string|否|接入类型，可重复传多个做「或」过滤|
|`clusterId`|string|否|按目标集群过滤|
|`workload`|string|否|按目标工作负载过滤|
|`page`|int|否|页码，从 1 开始|
|`pageSize`|int|否|每页条数；不传或小于 1 时返回全部|

响应：

```json
{  "total": 3,  "page": 1,  "pageSize": 20,  "items": [    {      "id": "b1f2...",      "type": "ens-inst",      "name": "my-svc.K8S.bjdd",      "targets": [        {"workload": "my-svc", "cluster": "cluster-bjdd"}      ],      "basic": {"workload": "my-svc", "container": "app"},      "detail": {"ports": [{"name": "main", "targetPort": 8080}]},      "createdAt": "2026-08-12T07:00:00Z"    }  ]}
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`total`|number|过滤后的总条数|
|`page` / `pageSize`|number|回显请求分页|
|`items[].id`|string|接入记录 ID，后续单条接口的 `:accessID`|
|`items[].type`|string|接入类型，见公共枚举|
|`items[].name`|string|最终名称（已按类型规则渲染）|
|`items[].targets`|array|目标工作负载@集群列表|
|`items[].targets[].workload`|string|工作负载名|
|`items[].targets[].cluster`|string|集群 ID（注意字段名是 `cluster`）|
|`items[].basic`|object|基础配置，各类型不同，原样透传|
|`items[].detail`|object|详细配置，各类型不同，原样透传|
|`items[].createdAt`|string|创建时间，RFC3339|

### 2.2 创建接入
请求：

```
POST /rest/v1/application-environments/:appEnvID/accesses
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|

请求体：

```json
{  "type": "ens-inst",  "name": "",  "targets": [    {"workload": "my-svc", "cluster": "cluster-bjdd"},    {"workload": "my-svc", "cluster": "cluster-gzhxy"}  ],  "basic": {    "workload": "my-svc",    "container": "app",    "useDefaultServiceName": true,    "runAccount": "work",    "deployPath": "/home/work",    "allClusters": false,    "selectedClusters": ["cluster-bjdd", "cluster-gzhxy"]  },  "detail": {    "ports": [{"name": "main", "targetPortName": "http", "targetPort": 8080}],    "tags": [{"name": "idc", "value": "bj"}],    "syncRules": {"syncEksLabels": true, "waitPodReady": true}  }}
```
请求字段：

|字段|类型|必填|说明|
|-|-|-|-|
|`type`|string|是|接入类型，见公共枚举|
|`name`|string|否|基础名/自定义名，见下方「命名规则」；ENS Group 外为空则取首个 target 的 workload|
|`targets`|array|是|非空，每项 `workload` 必填|
|`targets[].workload`|string|是|工作负载名|
|`targets[].cluster`|string|否|集群 ID|
|`basic`|object|否|基础配置，原样透传（仅 `nlb`/`alb` 的 `basic.targetEnsIds` 会被校验）|
|`detail`|object|否|详细配置，原样透传|

命名规则（`name` 的处理因类型而异）：

|类型|`name` 的作用|结果示例|
|-|-|-|
|`service`/`headless`/`nodeport`/`loadbalancer`/`nlb`/`cnap`/`alb`|直接作为最终名，不加后缀；为空走默认模板|`name=public` → `public`|
|`ens-inst`/`nlb-ens`|作为基础名，仍按集群 fan-out 加后缀|`name=custom` → `custom.K8S.bjdd`|
|`ens-group`|作为基础名，强制包装|`name=custom` → `group.custom.K8S.all`|

校验与依赖：

* `type` 必须是枚举内的值，否则 `400 InvalidArgument`
* `name` 非空时仅允许小写字母、数字、连字符（`-`），否则 `400`
* 有依赖的类型在依赖未满足时返回 `412 PreconditionFailed`（依赖按 workload 隔离判定）
* `nlb`/`alb` 必须提供 `basic.targetEnsIds`，且每个 id 指向的记录须存在、类型在其 downstream 白名单内，否则 `400`
* 同类型下名称重复返回 `409 AlreadyExists`

响应（`201`，body 为**数组**）：

> `ens-inst` / `nlb-ens` 按集群展开成多条记录，因此返回值恒为列表。
```json
[  {    "id": "b1f2...",    "type": "ens-inst",    "name": "my-svc.K8S.bjdd",    "targets": [{"workload": "my-svc", "cluster": "cluster-bjdd"}],    "basic": {"...": "..."},    "detail": {"...": "..."},    "createdAt": "2026-08-12T07:00:00Z"  },  {    "id": "c3d4...",    "type": "ens-inst",    "name": "my-svc.K8S.gzhxy",    "targets": [{"workload": "my-svc", "cluster": "cluster-gzhxy"}],    "createdAt": "2026-08-12T07:00:00Z"  }]
```
### 2.3 查询接入详情
请求：

```
GET /rest/v1/application-environments/:appEnvID/accesses/:accessID
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|
|`accessID`|string|是|接入记录 ID|

响应：单个 Access 对象，字段同 2.1 的 `items[]`。记录不存在返回 `404 NotFound`。

### 2.4 更新接入
请求：

```
PUT /rest/v1/application-environments/:appEnvID/accesses/:accessID
```
请求体：同 2.2。约束：

* `type` **不可变**：传入的 `type` 必须与原记录一致，或留空表示不变；不一致返回 `400`
* 对按集群 fan-out 的类型（`ens-inst`/`nlb-ens`），`targets` 只能属于单个集群，否则 `400`
* 会重新校验依赖与 `targetEnsIds`；重名检查排除自身
* 记录不存在返回 `404`

响应（`200`）：更新后的**单个** Access 对象。

### 2.5 删除接入
请求：

```
DELETE /rest/v1/application-environments/:appEnvID/accesses/:accessID
```
path 参数：同 2.3。

删除保护：当该记录被其他记录的 `basic.targetEnsIds` 引用、或删除后会使某个上游记录的依赖失效时，返回 `412 PreconditionFailed`，message 列出受影响的记录名。

响应：`204 No Content`，无 body。

## 3. 接入类型接口
### 3.1 查询可创建的接入类型
用于创建向导第一步、以及「新增上游接入」入口。

请求：

```
GET /rest/v1/application-environments/:appEnvID/access-types?workload=my-svc&downstreamType=pod
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|

query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`workload`|string|否|将依赖判定限定到该工作负载；为空为整个环境|
|`downstreamType`|string|否|只保留可位于该下游节点之前的类型；工作负载节点用 `pod`|

响应：

```json
[  {    "type": "service",    "label": "ClusterIP",    "group": "inner",    "layer": "l4",    "downstream": ["pod"],    "description": "K8s 原生 Service，分配集群内 IP 和 DNS 域名，仅支持集群内访问",    "selectable": true  },  {    "type": "ens-group",    "label": "ENS Group",    "group": "cross",    "layer": "naming",    "dependsOn": ["ens-inst"],    "dependencyMode": "all",    "downstream": ["ens-inst", "nlb-ens"],    "upstream": ["alb"],    "nameTemplate": "group.{workload}.K8S.all",    "description": "ENS 组，聚合若干 ENS 实例并配置跨集群流量调度规则",    "selectable": false,    "missingDependencies": ["ens-inst"]  }]
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`type`|string|接入类型|
|`label`|string|展示名|
|`group`|string|分组：`inner`/`cross`/`inbound`|
|`layer`|string|层级：`l4`/`naming`/`l7`|
|`dependsOn`|array|依赖的类型，无依赖时省略|
|`dependencyMode`|string|依赖模式：`any`（任一满足）/`all`（全部满足）|
|`downstream`|array|允许的下游节点类型（`pod` 表示工作负载）|
|`upstream`|array|可作为其上游的类型|
|`nameTemplate`|string|默认命名模板|
|`description`|string|说明|
|`selectable`|bool|当前依赖是否已满足、可否创建|
|`missingDependencies`|array|缺失的依赖类型，`selectable=true` 时省略|

## 4. 名称预览接口
### 4.1 预览默认名称并校验自定义名
请求：

```
GET /rest/v1/application-environments/:appEnvID/access-name-preview?type=ens-inst&workload=my-svc&clusterId=cluster-bjdd&name=custom
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|

query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`type`|string|是|接入类型；未知类型返回 `400`|
|`workload`|string|否|用于渲染默认名的工作负载|
|`clusterId`|string|否|用于渲染 `{cluster}` 占位符|
|`name`|string|否|用户输入的自定义基础名；非空时做字符集校验|

响应：

```json
{  "defaultName": "my-svc.K8S.cluster-bjdd",  "name": "custom.K8S.cluster-bjdd",  "valid": true}
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`defaultName`|string|默认服务名（基于 workload 渲染）；无命名模板的类型（如 `cnap`）为空|
|`name`|string|基于当前输入（`name` 或 workload）渲染出的最终名|
|`valid`|bool|自定义名是否合法|
|`message`|string|不合法时的原因，合法时省略|

## 5. 流量拓扑接口
### 5.1 查询流量拓扑
请求：

```
GET /rest/v1/application-environments/:appEnvID/access-topology?groupBy=workload
```
path 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`appEnvID`|int64|是|应用环境关系 ID|

query 参数：

|参数|类型|必填|说明|
|-|-|-|-|
|`groupBy`|string|否|分组方式：`workload`（默认）/`cluster`；其他值返回 `400`|

响应：

```json
{  "groupBy": "workload",  "layers": ["inbound", "cross", "inner", "workload"],  "nodes": [    {      "id": "access/alb-1",      "kind": "access",      "type": "alb",      "label": "ALB",      "name": "service_my-svc",      "layer": "inbound",      "layerIndex": 0,      "groupId": "my-svc",      "clusterIds": ["cluster-bjdd"],      "workloads": ["my-svc"],      "accessId": "alb-1"    },    {      "id": "workload/my-svc@cluster-bjdd",      "kind": "workload",      "label": "my-svc",      "name": "my-svc",      "layer": "workload",      "layerIndex": 3,      "groupId": "my-svc",      "clusterIds": ["cluster-bjdd"],      "workloads": ["my-svc"]    }  ],  "edges": [    {"from": "access/alb-1", "to": "workload/my-svc@cluster-bjdd"}  ]}
```
字段说明：

|字段|类型|说明|
|-|-|-|
|`groupBy`|string|回显分组方式|
|`layers`|array|从外到内的分层顺序，固定为 `inbound`/`cross`/`inner`/`workload`|
|`nodes[].id`|string|节点 ID：接入节点为 `access/{accessID}`，工作负载节点为 `workload/{workload}@{cluster}`|
|`nodes[].kind`|string|节点类型：`access`（接入）/`workload`（工作负载端点）|
|`nodes[].type`|string|接入类型，仅 `access` 节点有|
|`nodes[].label`|string|展示名|
|`nodes[].name`|string|接入名称或工作负载名|
|`nodes[].layer`|string|所在层|
|`nodes[].layerIndex`|number|层序号，用于纵向排序|
|`nodes[].groupId`|string|所属虚线框（按 workload 或 cluster）；跨多个时为空|
|`nodes[].clusterIds`|array|关联集群|
|`nodes[].workloads`|array|关联工作负载|
|`nodes[].accessId`|string|对应接入记录 ID，仅 `access` 节点有|
|`edges[].from` / `edges[].to`|string|有向边，从上游节点指向下游节点|

连线规则：

* 下游为 `pod` 的类型 → 指向其 `targets` 对应的工作负载节点
* `nlb` / `alb` → 依据 `basic.targetEnsIds` 精确指向被选中的接入节点
* 其余类型 → 指向同工作负载下、其 downstream 白名单内类型的接入节点
* 未知类型的记录会被跳过，不产生节点

## 6. 错误响应
所有接口错误体统一为（由 `BaiduIntWarp` 封装，同运行时接口）：

```json
{  "requestId": "……",  "code": "InvalidArgument",  "message": "target workload is required"}
```
常见映射：

|HTTP|code|触发场景|
|-|-|-|
|400|`InvalidHTTPRequest`|路径/请求体绑定失败、JSON 格式错误|
|400|`InvalidArgument`|类型未知、名称非法、targets 为空、targetEnsIds 非法、type 不可变冲突等|
|404|`NotFound`|接入记录不存在|
|409|`AlreadyExists`|同类型同名冲突|
|412|`PreconditionFailed`|依赖未满足、删除被依赖方阻止|

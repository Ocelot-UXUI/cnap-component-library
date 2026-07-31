---
status: updated
processed: done
---

# 运行时-工作负载接口（源：ku 知识库）

- 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/XwQwllaSaX2yvP>
- 抓取时间：2026-07-28
- 抓取方式：`ku query-content --protocol markdown` (via WSL)
- 更新内容：新增批量/单 Pod Usage 接口；ResourceQuota 改为 quantity 字符串并新增 gpus；补齐 Raw Resource 参数说明
- 校正说明：经接口确认，单 Pod Usage 的 `containers` 和 `initContainers` 均为同类型数组；Ku 示例中的单对象和字段遗漏已校正

---

## 接口总览

| 模块         | 方法 | 路径                                                                                                                    |
| ------------ | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 应用环境     | GET  | `/rest/v1/applications/:applicationID/environments`                                                                     |
| 应用环境     | GET  | `/rest/v1/application-environments/:appEnvID/clusters`                                                                  |
| 运行时操作   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/operations`                                                        |
| 运行时操作   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/operations/:operation/context`                                     |
| 运行时操作   | POST | `/rest/v1/application-environments/:appEnvID/runtime/operations/:operation/trigger`                                     |
| 运行时资源   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/summary`                                                           |
| 运行时资源   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/groups`                                                            |
| 运行时资源   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/workloads`                                                         |
| 运行时资源   | GET  | `/rest/v1/application-environments/:appEnvID/runtime/pods`                                                              |
| 运行时资源   | POST | `/rest/v1/application-environments/:appEnvID/runtime/pods/usage`                                                        |
| Pod          | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName`                                 |
| Pod          | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/usage`                           |
| Pod          | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/containers/:containerName/logs`  |
| Pod          | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/events`                          |
| Raw Resource | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/core/:resource/:name`            |
| Raw Resource | GET  | `/rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/:group/:version/:resource/:name` |

## 应用环境接口

### 查询应用环境列表

请求：

```
GET /rest/v1/applications/:applicationID/environments
```

path 参数：

| 参数            | 类型   | 必填 | 说明    |
| --------------- | ------ | ---- | ------- |
| `applicationID` | String | 是   | 应用 ID |

响应：

```json
[
  {
    "id": "99",
    "applicationId": "11",
    "environmentId": "22",
    "environmentName": "prod"
  }
]
```

字段说明：

| 字段              | 类型   | 说明                               |
| ----------------- | ------ | ---------------------------------- |
| `id`              | String | 应用环境关系 ID，即后续 `appEnvID` |
| `applicationId`   | String | 应用 ID                            |
| `environmentId`   | String | 环境 ID                            |
| `environmentName` | string | 环境名                             |

典型前端使用：

1. 用户选择应用。
2. 调用本接口拿环境列表。
3. 用户选择环境后，把 `id` 作为后续 runtime 接口的 `appEnvID`。

### 查询应用环境集群列表

请求：

```
GET /rest/v1/application-environments/:appEnvID/clusters
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

响应：

```json
[
  {
    "id": 1,
    "applicationEnvironmentId": "99",
    "clusterId": "cluster-bjdd",
    "clusterName": "bjdd",
    "clusterConnector": "EKS-CCE",
    "desiredReplicas": 16,
    "availableReplicas": 12
  }
]
```

字段说明：

| 字段                       | 类型   | 说明                                            |
| -------------------------- | ------ | ----------------------------------------------- |
| `id`                       | number | 应用环境集群关系 ID                             |
| `applicationEnvironmentId` | String | 应用环境关系 ID                                 |
| `clusterId`                | string | 集群 ID，后续 runtime 的 `clusterId` 使用这个值 |
| `clusterName`              | string | 展示在前端的集群名字                            |
| `clusterConnector`         | string | 集群提供方                                      |
| `desiredReplicas`          | number | 期望副本数                                      |
| `availableReplicas`        | number | 可用副本数                                      |

## 运行时操作接口

### 查询可用操作列表

```
GET /rest/v1/application-environments/:appEnvID/runtime/operations?clusterId=cluster-a
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

query 参数：

| 参数        | 类型   | 必填 | 说明    |
| ----------- | ------ | ---- | ------- |
| `clusterId` | string | 否   | 集群 ID |

响应：

```json
[
  {
    "name": "pod.restart",
    "capability": "PodRestart",
    "displayName": "实例重启",
    "description": "重启目标实例",
    "targetKind": "Pod",
    "disabled": false,
    "reason": ""
  }
]
```

字段说明：

| 字段            | 类型   | 说明                                                        |
| --------------- | ------ | ----------------------------------------------------------- |
| `name`          | string | 真实触发 operation 名，后续路径里的 `:operation` 使用这个值 |
| `capability`    | string | 用于前端功能识别                                            |
| `displayName`   | string | 展示名                                                      |
| `description`   | string | 操作描述                                                    |
| `targetKind`    | string | 目标资源类型                                                |
| `disabled`      | bool   | 是否禁用                                                    |
| `reason`        | string | 禁用原因，若禁用鼠标悬浮展示的内容                          |
| `supportsBatch` | bool   | 是否支持批量操作                                            |

- `capability` 用于识别具体的功能，目前有：
  - `ApplicationUninstall`: 删除部署资源/卸载应用
  - `Restart`: 重启（原 `ApplicationRestart`）
  - `HorizontalScale`: 横向扩缩
  - `VerticalScale`: 纵向扩缩
  - `PodDelete`: 删除/重建
  - `PodDeleteForce`: 强制删除
  - `PodRestart`: 重启
  - `PodBlock`: 屏蔽
  - `PodUnblock`: 解除屏蔽/接流
- `targetKind` 用于决定功能展示位置：
  - 为 `Workload`、`None` 时展示到右上角操作列表
  - 为 `Pod` 时展示到 pod 批量操作列表
  - `targetKind` 为 `Workload` 的需要指定一个工作负载名称，从分组右上角点进去的自动选择当前 group 的名称
- `supportsBatch`：`true` 表示该操作支持批量操作

### 查询操作上下文

- 部分操作发起时需要展示当前的状态信息，这些数据统一走这个接口

请求：

```
GET /rest/v1/application-environments/:appEnvID/runtime/operations/:operation/context
```

path 参数：

| 参数        | 类型   | 必填 | 说明                          |
| ----------- | ------ | ---- | ----------------------------- |
| `appEnvID`  | String | 是   | 应用环境关系 ID               |
| `operation` | string | 是   | 操作名，来自操作列表的 `name` |

响应：

```json
{
  "operation": {
    "name": "pod.restart",
    "capability": "PodRestart",
    "displayName": "重启",
    "description": "重启目标资源",
    "targetKind": "Pod",
    "supportsBatch": true
  },
  "paramsSchema": {
    "type": "object",
    "properties": {}
  },
  "paramsUi": {},
  "params": {}
}
```

前端使用：

- `paramsSchema`：参数表单校验 schema，暂不使用
- `paramsUi`：表单 UI schema，暂不使用
- `params`：前端展示参数

### 触发运行时操作

```
POST /rest/v1/application-environments/:appEnvID/runtime/operations/:operation/trigger
```

path 参数：

| 参数        | 类型   | 必填 | 说明                  |
| ----------- | ------ | ---- | --------------------- |
| `appEnvID`  | String | 是   | 应用环境关系 ID       |
| `operation` | string | 是   | 操作名 operation.name |

请求体：

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "name": "pod-a"
    }
  ],
  "params": {
    "gracePeriodSeconds": 30
  }
}
```

请求字段：

| 字段                     | 类型   | 必填 | 说明                                            |
| ------------------------ | ------ | ---- | ----------------------------------------------- |
| `targets`                | array  | 否   | 操作目标列表                                    |
| `targets[].clusterId`    | string | 否   | 目标所在集群                                    |
| `targets[].resourceType` | string | 否   | 资源类型，例如 `v1/pods`、`apps/v1/deployments` |
| `targets[].name`         | string | 否   | 资源名                                          |
| `targets[].container`    | string | 否   | 目标容器名（Restart/VerticalScale 等操作使用）  |
| `targets[].params`       | object | 否   | per-target 参数                                 |
| `params`                 | object | 否   | 操作参数，不同操作有不同参数                    |

响应：

```json
{
  "order": {
    "id": "101",
    "operation": "restart",
    "params": {
      "gracePeriodSeconds": 30
    },
    "status": "PENDING",
    "entries": [
      {
        "id": "1001",
        "orderId": "101",
        "clusterId": "cluster-a",
        "targets": [
          {
            "clusterId": "cluster-a",
            "resourceType": "v1/pods",
            "name": "pod-a"
          }
        ],
        "status": "PENDING",
        "applicationId": "11",
        "environmentId": "22"
      }
    ],
    "accountId": "1"
  }
}
```

典型流程：

1. 调用操作列表，拿到 `name` 和展示信息。
2. 调用 context，渲染参数表单。
3. 用户确认后调用 trigger。
4. 根据返回的 `order.status` 展示提交结果。

### 各 Operation 具体说明

#### Restart 重启（原应用重启）

重启操作 `targetKind` 为 `Workload`，需要选择一组具体的 workload 进行操作。用户先从 groups 列表中选择一个，然后调用 `listWorkloads` 接口获取 workload 列表：

```
GET /rest/v1/application-environments/:appEnvID/runtime/workloads?groupId=xxx
```

```json
[
  {
    "clusterId": "clus-xxx",
    "clusterName": "xxx",
    "resourceType": "apps.kruise.io/v1alpha1/clonesets",
    "name": "test-app",
    "replicas": 14,
    "updateStrategy": {
      "maxSurge": "0",
      "maxUnavailable": "25%"
    },
    "availabilityTarget": "75%",
    "containers": [
      {
        "name": "test-app",
        "resourceLimits": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        },
        "resourceRequests": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        }
      }
    ]
  }
]
```

用户指定一个 container，然后选择 >=1 个集群的 workload，可发起重启操作：

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "resourceType": "apps.kruise.io/v1alpha1/clonesets",
      "name": "pod-a",
      "container": "pod-a",
      "params": {
        "maxUnavailable": "25%"
      }
    }
  ],
  "params": {
    "exitTimeoutSeconds": 60
  }
}
```

#### HorizontalScale 横向扩缩

用于调整 workload 的期望副本数。`targetKind` 通常为 `Workload`，支持选择一个或多个 workload，可跨集群批量操作。

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "resourceType": "apps/v1/deployments",
      "name": "api",
      "params": {
        "replicas": 10
      }
    }
  ]
}
```

#### VerticalScale 纵向扩缩

用于调整 workload 中容器的资源配置，例如 CPU、内存等 requests 和 limits。`targetKind` 通常为 `Workload`，通过 `targets[].container` 指定目标容器。

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "resourceType": "apps/v1/deployments",
      "name": "api",
      "container": "api",
      "params": {
        "resourceLimits": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        },
        "resourceRequests": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        }
      }
    }
  ]
}
```

#### PodDelete 删除重建

用于删除选中的 Pod，并由所属 workload 根据控制器策略重新创建 Pod。`targetKind` 为 `Pod`，支持批量操作。

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "resourceType": "v1/pods",
      "name": "api-0"
    }
  ],
  "params": {}
}
```

#### PodDeleteForce 强制删除

用于在普通删除无法及时完成时立即删除选中的 Pod，`targetKind` 为 `Pod`，与 `PodDelete` 的目标选择和批量规则一致。

#### PodRestart 实例重启

用于重启用户选中的 Pod，不改变 workload 的期望副本数。`targetKind` 为 `Pod`，支持批量操作。

与 `Restart` 的区别：

- `Restart` 面向 workload
- `PodRestart` 面向具体 Pod 实例

```json
{
  "targets": [
    {
      "clusterId": "cluster-a",
      "resourceType": "apps.kruise.io/v1alpha1/clonesets",
      "name": "pod-a"
    }
  ],
  "params": {
    "clusters": [
      {
        "clusterId": "cluster-a",
        "maxUnavailable": "25%"
      }
    ],
    "exitTimeoutSeconds": 60
  }
}
```

#### PodBlock 屏蔽 & PodUnblock 解除屏蔽/接流

放到流量接入功能后再做。

#### ApplicationUninstall 卸载应用

用于删除应用对应的部署资源及运行时资源。

## 运行时资源接口

### 查询运行时汇总信息

```
GET /rest/v1/application-environments/:appEnvID/runtime/summary?clusterId=cluster-a&groupId=xxxxx
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

query 参数：

| 参数        | 类型   | 必填 | 说明                    |
| ----------- | ------ | ---- | ----------------------- |
| `clusterId` | string | 否   | 集群 ID                 |
| `groupId`   | string | 否   | 组 ID，按工作负载组筛选 |

响应：

```json
{
  "resourceRequirements": {
    "cpu": "32c",
    "memory": "128Gi",
    "gpu": "6"
  },
  "podStatistics": {
    "totalCount": 14,
    "blockedCount": 7,
    "statuses": [
      {
        "status": "Running Ready",
        "count": 6
      },
      {
        "status": "Terminating",
        "count": 7
      },
      {
        "status": "Running NotReady",
        "count": 1
      }
    ]
  }
}
```

podStatistics 字段说明：

| 字段           | 类型   | 说明                |
| -------------- | ------ | ------------------- |
| `totalCount`   | number | Pod 总数            |
| `blockedCount` | number | 已屏蔽 Pod 数量     |
| `statuses`     | array  | 各状态 Pod 数量分布 |

Pod 状态整理：

| Status                          | 展示名称          | 是否正常     | 颜色       |
| ------------------------------- | ----------------- | ------------ | ---------- |
| `Running Ready`                 | 运行中            | 是           | 绿 SUCCESS |
| `Completed`                     | 已完成            | 是           | 绿 SUCCESS |
| `Terminating`                   | 终止中            | 是（处理中） | 蓝 INFO    |
| `Running InPlaceUpdateNotReady` | 原地升级中        | 是           | 黄 WARN    |
| `Pending`                       | 等待调度          | 否（等待中） | 蓝 INFO    |
| `ContainerCreating`             | 容器创建中        | 否（处理中） | 蓝 INFO    |
| `PodInitializing`               | 初始化中          | 否（处理中） | 蓝 INFO    |
| `Running NotReady`              | 运行中未就绪      | 否           | 黄 WARN    |
| `Init:0/1`                      | 初始化中（0/1）   | 否（处理中） | 蓝 INFO    |
| `Init:0/2`                      | 初始化中（0/2）   | 否（处理中） | 蓝 INFO    |
| `Init:1/3`                      | 初始化中（1/3）   | 否（处理中） | 蓝 INFO    |
| `CrashLoopBackOff`              | 反复崩溃          | 否           | 红 ERROR   |
| `Init:CrashLoopBackOff`         | Init 容器反复崩溃 | 否           | 红 ERROR   |
| `CreateContainerError`          | 容器创建失败      | 否           | 红 ERROR   |
| `Init:CreateContainerError`     | Init 容器创建失败 | 否           | 红 ERROR   |
| `ErrImagePull`                  | 镜像拉取错误      | 否           | 红 ERROR   |
| `ImagePullBackOff`              | 镜像拉取失败      | 否           | 红 ERROR   |
| `Init:ImagePullBackOff`         | Init 镜像拉取失败 | 否           | 红 ERROR   |
| `InvalidImageName`              | 镜像名称无效      | 否           | 红 ERROR   |
| `ImageInspectError`             | 镜像检查失败      | 否           | 红 ERROR   |
| `OOMKilled`                     | 内存超限被终止    | 否           | 红 ERROR   |
| `Evicted`                       | 已驱逐            | 否           | 红 ERROR   |
| `PodFitsHostPorts`              | 节点端口冲突      | 否           | 红 ERROR   |
| `UnexpectedAdmissionError`      | 准入检查异常      | 否           | 红 ERROR   |
| `PostStartHookError: ...`       | 启动钩子失败      | 否           | 红 ERROR   |
| `Error`                         | 执行错误          | 否           | 红 ERROR   |
| `Failed`                        | 执行失败          | 否           | 红 ERROR   |

**状态展示规则：**

- 匹配到的 status 展示中文名称，未匹配到的直接展示 status 本身
- 鼠标悬浮时展示 status 原始内容

**状态筛选：**

- 下拉列表展示 `podStatistics.statuses` 字段下所有条目

**快捷筛选公式：**

- 全部 = `podStatistics.totalCount`
- 正常 = `Running Ready` + `Completed` + `Terminating` + `Running InPlaceUpdateNotReady`
- 异常 = 全部状态 - 正常状态（即 status 表中"是否正常"为"否"的所有状态）
- 已屏蔽 = `podStatistics.blockedCount`，筛选对应 `blocked=true`

### 查询运行时工作负载（分组）

```
GET /rest/v1/application-environments/:appEnvID/runtime/groups?clusterId=cluster-a
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

query 参数：

| 参数        | 类型   | 必填 | 说明                        |
| ----------- | ------ | ---- | --------------------------- |
| `clusterId` | string | 否   | 集群 ID，选择具体集群时传入 |

响应：

```json
[
  {
    "id": "workload:apps/v1/deployments/nginx",
    "name": "nginx",
    "kind": "Deployment",
    "currentVersion": "v1.0.0-123456",
    "workloads": [
      {
        "clusterId": "cluster-a",
        "clusterName": "a",
        "namespace": "default",
        "name": "nginx",
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "currentVersion": "v1.0.0-123456",
        "resourceType": "apps/v1/deployments",
        "replicas": 3,
        "readyReplicas": 2,
        "availableReplicas": 2
      }
    ]
  }
]
```

`workloads` 常用字段：

| 字段                | 类型   | 说明                                 |
| ------------------- | ------ | ------------------------------------ |
| `clusterId`         | string | 集群 ID                              |
| `clusterName`       | string | 集群名称                             |
| `namespace`         | string | namespace                            |
| `name`              | string | workload 名                          |
| `uid`               | string | Kubernetes UID                       |
| `apiVersion`        | string | API version                          |
| `kind`              | string | 资源 kind                            |
| `resourceType`      | string | 资源类型，例如 `apps/v1/deployments` |
| `replicas`          | number | 期望副本数                           |
| `readyReplicas`     | number | ready 副本数                         |
| `availableReplicas` | number | available 副本数                     |
| `labels`            | object | 标签                                 |
| `annotations`       | object | 注解                                 |
| `creationTimestamp` | string | 创建时间                             |
| `currentVersion`    | string | 当前版本                             |

分组标题栏信息：

- 外部的版本展示 group 顶层的 `currentVersion`
- 鼠标悬浮版本号后展示的版本列表从 workloads 中取
  - 名字为 `clusterName`
  - 版本为 `currentVersion`

### 查询 Workload 列表（Restart 操作专用）

```
GET /rest/v1/application-environments/:appEnvID/runtime/workloads?groupId=xxx
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

query 参数：

| 参数      | 类型   | 必填 | 说明  |
| --------- | ------ | ---- | ----- |
| `groupId` | string | 是   | 组 ID |

响应：

```json
[
  {
    "clusterId": "clus-xxx",
    "clusterName": "xxx",
    "resourceType": "apps.kruise.io/v1alpha1/clonesets",
    "name": "test-app",
    "replicas": 14,
    "updateStrategy": {
      "maxSurge": "0",
      "maxUnavailable": "25%"
    },
    "availabilityTarget": "75%",
    "containers": [
      {
        "name": "test-app",
        "resourceLimits": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        },
        "resourceRequests": {
          "cpu": "64c",
          "memory": "16Gi",
          "ephemeralStorage": "100Gi"
        }
      }
    ]
  }
]
```

### 查询 Pod 列表

```
GET /rest/v1/application-environments/:appEnvID/runtime/pods?clusterId=cluster-a&groupId=workload:apps/v1/deployments/nginx&page=1&pageSize=20&sort=status
```

path 参数：

| 参数       | 类型   | 必填 | 说明            |
| ---------- | ------ | ---- | --------------- |
| `appEnvID` | String | 是   | 应用环境关系 ID |

query 参数：

| 参数        | 类型   | 必填 | 说明                                                                |
| ----------- | ------ | ---- | ------------------------------------------------------------------- |
| `clusterId` | string | 否   | 集群 ID，选择集群时传入                                             |
| `groupId`   | string | 否   | 组 ID，选择工作负载（分组）时传入                                   |
| `page`      | number | 否   | 页码，从 1 开始                                                     |
| `pageSize`  | number | 否   | 每页数量                                                            |
| `sort`      | string | 否   | 排序表达式，如 status、-status                                      |
| `status`    | string | 否   | 过滤状态，支持用逗号分隔多个状态，如"Running Ready,Terminating,xxx" |
| `blocked`   | bool   | 否   | 按照是否屏蔽过滤，true 表示过滤已屏蔽的，false 表示过滤未屏蔽的     |
| `keyword`   | string | 否   | 关键词过滤，包括 IP 或 Pod 名                                       |

响应：

```json
{
  "total": 1,
  "page": 0,
  "pageSize": 0,
  "items": [
    {
      "clusterId": "clus-bj-yq02-1",
      "namespace": "appspace-test-prod",
      "name": "jtt-datatist2-72pj7",
      "uid": "35802b3f-3941-4140-9043-6b8260ee9201",
      "accountCode": "appspace-test",
      "environmentName": "prod",
      "applicationName": "jtt-datatist2",
      "clusterName": "yq02-1",
      "workloadType": "apps.kruise.io/v1alpha1/clonesets",
      "workloadName": "jtt-datatist2",
      "containers": [],
      "initContainers": [],
      "resourceLimits": {
        "cpu": "960",
        "memory": "4294967296",
        "ephemeralStorage": "10737418240",
        "others": {
          "baidu.com/pid": "1k",
          "eks.baidu-int.com/cpu": "15"
        }
      },
      "resourceRequests": {
        "cpu": "960",
        "memory": "4294967296",
        "ephemeralStorage": "10737418240",
        "others": {
          "baidu.com/pid": "1k",
          "eks.baidu-int.com/cpu": "15"
        }
      },
      "podIp": "10.92.162.107",
      "hostIp": "10.92.162.107",
      "restarts": 13157,
      "lastStartedAt": "2026-06-03T07:07:37Z",
      "errorMessages": [
        {
          "source": "init-data",
          "message": "容器异常退出, 退出码: 7."
        },
        {
          "source": "jtt-datatist2-72pj7",
          "message": "Pod未就绪: containers with unready status: [jtt-datatist2 agent-dts]"
        }
      ],
      "status": "Init:CrashLoopBackOff",
      "operations": [
        {
          "name": "pod.restart",
          "capability": "PodRestart",
          "displayName": "实例重启",
          "description": "重启目标实例",
          "targetKind": "Pod",
          "disabled": true,
          "reason": "Pod正在终止",
          "supportsBatch": true
        }
      ]
    }
  ],
  "summary": {
    "totalCount": 14,
    "blockedCount": 7,
    "statuses": [
      { "status": "Running Ready", "count": 6 },
      { "status": "Terminating", "count": 7 },
      { "status": "Running NotReady", "count": 1 }
    ]
  }
}
```

- `operations` 列表表示当前 pod 展示的操作
  - `disabled` 为 true 时表示该操作不可用，鼠标悬浮展示 `reason`
  - `supportsBatch` 为 true 时表示该操作支持批量操作
  - 批量操作选择的 pod 列表中若某个 pod 的某项操作不可用，对应的批量操作按钮置灰
- `summary` 字段用于 group 标题栏统计信息的展示，结构同 RuntimeSummary 的 `podStatistics`

Pod 常用字段：

| 字段                | 类型   | 说明               |
| ------------------- | ------ | ------------------ |
| `clusterId`         | string | 集群 ID            |
| `namespace`         | string | namespace          |
| `name`              | string | Pod 名             |
| `uid`               | string | Kubernetes UID     |
| `creationTimestamp` | string | Pod 创建时间       |
| `readyContainers`   | number | 就绪容器数         |
| `totalContainers`   | number | 总容器数           |
| `accountCode`       | string | 账号编码           |
| `environmentName`   | string | 环境名             |
| `applicationName`   | string | 应用名             |
| `clusterName`       | string | 集群名             |
| `workloadType`      | string | 所属 workload 类型 |
| `workloadName`      | string | 所属 workload 名   |
| `labels`            | object | 标签               |
| `annotations`       | object | 注解               |
| `containers`        | array  | 容器列表           |
| `initContainers`    | array  | init 容器列表      |
| `resourceLimits`    | object | 资源 limit         |
| `resourceRequests`  | object | 资源 request       |
| `resourceUsages`    | object | 资源 usage         |
| `podIp`             | string | Pod IP             |
| `hostIp`            | string | Node IP            |
| `restarts`          | number | 重启次数           |
| `lastStartedAt`     | string | 最近启动时间       |
| `errorMessages`     | array  | 错误信息           |
| `status`            | string | Pod 状态           |
| `links`             | array  | 相关链接           |
| `tags`              | array  | 标签信息           |
| `operations`        | array  | Pod 操作列表       |

### Container 字段

`containers[]` / `initContainers[]` 的元素结构相同。

- 容器详情页显示 containers 和 initContainers 里的所有容器
- 按照类型排序展示 MAIN → NORMAL → SIDECAR → INIT

```json
{
  "name": "app",
  "type": "MAIN",
  "image": "nginx:1.27",
  "imageId": "sha256:xxx",
  "command": ["/bin/sh"],
  "args": ["-c", "nginx -g 'daemon off;'"],
  "cmdline": "/bin/sh -c nginx -g 'daemon off;'",
  "resourceLimits": {},
  "resourceRequests": {},
  "resourceUsages": {},
  "env": [],
  "ports": [],
  "volumeMounts": [],
  "status": "Running",
  "reason": "",
  "message": "",
  "restarts": 0,
  "lastStartedAt": "2026-07-17T10:01:00Z"
}
```

Container 字段说明：

| 字段               | 类型     | 说明                                                                            |
| ------------------ | -------- | ------------------------------------------------------------------------------- |
| `name`             | string   | 容器名                                                                          |
| `type`             | string   | 容器类型 枚举: MAIN (主容器)、NORMAL (普通容器)、SIDECAR (Sidecar)、INIT (Init) |
| `image`            | string   | 镜像名                                                                          |
| `imageId`          | string   | 实际拉取到的镜像 ID                                                             |
| `command`          | string[] | 启动命令                                                                        |
| `args`             | string[] | 启动参数                                                                        |
| `cmdline`          | string   | command + args 的拼接文本                                                       |
| `resourceLimits`   | object   | 容器资源上限                                                                    |
| `resourceRequests` | object   | 容器资源请求                                                                    |
| `resourceUsages`   | object   | 容器资源使用量                                                                  |
| `env`              | array    | 环境变量                                                                        |
| `ports`            | array    | 暴露端口                                                                        |
| `volumeMounts`     | array    | 挂载卷                                                                          |
| `status`           | string   | 容器状态                                                                        |
| `reason`           | string   | 状态原因                                                                        |
| `message`          | string   | 状态消息                                                                        |
| `restarts`         | number   | 重启次数                                                                        |
| `lastStartedAt`    | string   | 最近一次启动时间                                                                |

### ResourceQuota

`resourceLimits`、`resourceRequests`、`resourceUsages` 使用同一个结构，资源量为带单位的 quantity 字符串。

```json
{
  "cpu": "1c",
  "memory": "16Gi",
  "ephemeralStorage": "200Gi",
  "gpus": [
    {
      "vendor": "NVIDIA",
      "model": "Tesla T4",
      "profile": "16GB",
      "count": 1
    }
  ],
  "others": {
    "nvidia.com/gpu": "1"
  }
}
```

| 字段               | 类型   | 说明                            |
| ------------------ | ------ | ------------------------------- |
| `cpu`              | string | CPU quantity，例如 `1c`、`500m` |
| `memory`           | string | 内存 quantity，例如 `16Gi`      |
| `ephemeralStorage` | string | 临时存储 quantity，例如 `200Gi` |
| `gpus`             | array  | GPU 厂商、型号、规格和数量      |
| `others`           | object | 其他扩展资源，例如 GPU、FPGA 等 |

### ErrorMessage

```json
{
  "source": "init-data",
  "message": "容器异常退出, 退出码: 7."
}
```

| 字段      | 说明     |
| --------- | -------- |
| `source`  | 错误来源 |
| `message` | 错误消息 |

## Pod Usage

### 批量查询 Pod Usage

```http
POST /rest/v1/application-environments/:appEnvID/runtime/pods/usage
```

请求体只包含当前页需要查询的 Pod：

```json
{
  "pods": [
    { "clusterId": "cluster-a", "name": "api-0" },
    { "clusterId": "cluster-b", "name": "worker-0" }
  ]
}
```

响应为直接数组，元素通过 `clusterId + name` 与 Pod 列表项关联：

```json
[
  {
    "clusterId": "cluster-a",
    "name": "api-0",
    "uid": "pod-uid",
    "resourceUsages": {
      "cpu": "480m",
      "memory": "256Mi"
    }
  }
]
```

### 查询单个 Pod Usage

```http
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/usage
```

响应包含 Pod 用量以及普通容器、Init 容器用量。`containers` 与 `initContainers` 的元素类型完全一致，均通过容器 `name` 与 Pod 详情关联。

```json
{
  "clusterId": "cluster-a",
  "name": "api-0",
  "uid": "pod-uid",
  "resourceUsages": {
    "cpu": "480m",
    "memory": "256Mi"
  },
  "containers": [
    {
      "name": "api",
      "resourceUsages": {
        "cpu": "400m",
        "memory": "224Mi"
      }
    }
  ],
  "initContainers": [
    {
      "name": "init-data",
      "resourceUsages": {
        "cpu": "80m",
        "memory": "32Mi"
      }
    }
  ]
}
```

Usage 响应类型：

| 类型             | 字段                                               |
| ---------------- | -------------------------------------------------- |
| `PodUsage`       | `clusterId`、`name`、`uid`、`resourceUsages`       |
| `PodDetailUsage` | `PodUsage` 字段以及 `containers`、`initContainers` |
| `ContainerUsage` | `name`、`resourceUsages`                           |

- `resourceUsages` 与 `resourceLimits`、`resourceRequests` 使用同一个 `ResourceQuota` 类型。
- 批量接口返回多个 `PodUsage`；单 Pod 接口返回一个 `PodDetailUsage`。
- Usage 数组缺失或为 `null` 时按空数组处理；未返回的 Pod 或容器表示用量不可用。

## Pod 详情、日志和事件

### 查询 Pod 详情

```
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName
```

完整字段同 Pod 列表。

### 查询容器日志

```
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/containers/:containerName/logs?tailLines=200&previous=false
```

path 参数：

| 参数            | 类型   | 必填 | 说明            |
| --------------- | ------ | ---- | --------------- |
| `appEnvID`      | String | 是   | 应用环境关系 ID |
| `clusterId`     | string | 是   | 集群 ID         |
| `podName`       | string | 是   | Pod 名          |
| `containerName` | string | 是   | 容器名          |

query 参数：

| 参数        | 类型   | 必填 | 说明                                                                   |
| ----------- | ------ | ---- | ---------------------------------------------------------------------- |
| `source`    | string | 否   | 日志来源，不指定默认来自容器标准输出，设置为 `file` 时从容器内文件获取 |
| `tailLines` | int64  | 否   | 返回最后 N 行                                                          |
| `headLines` | int64  | 否   | 返回最前 N 行                                                          |
| `previous`  | bool   | 否   | 上次运行日志，source 不指定时可选                                      |
| `filePath`  | string | 否   | source=file 时用于指定容器内文件路径                                   |
| `follow`    | bool   | 否   | 是否持续获取新增日志                                                   |

响应：

```json
2026-07-09T10:00:00Z line one
2026-07-09T10:00:01Z line two
```

### 查询 Pod 事件

```
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/pods/:podName/events?type=Warning&pageSize=20&pageToken=cursor&orderBy=last_seen%20desc
```

path 参数：

| 参数        | 类型   | 必填 | 说明            |
| ----------- | ------ | ---- | --------------- |
| `appEnvID`  | String | 是   | 应用环境关系 ID |
| `clusterId` | string | 是   | 集群 ID         |
| `podName`   | string | 是   | Pod 名          |

query 参数：

| 参数        | 类型   | 必填 | 说明                                |
| ----------- | ------ | ---- | ----------------------------------- |
| `container` | string | 否   | 容器名称                            |
| `type`      | string | 否   | 事件类型，例如 `Normal` / `Warning` |
| `orderBy`   | string | 否   | 排序表达式，原样转发                |
| `pageSize`  | number | 否   | 每页数量                            |
| `pageToken` | string | 否   | 翻页游标                            |

该接口不支持完整分页功能，只支持通过 `nextPageToken` 按顺序往后翻页。

响应：

```json
{
  "nextPageToken": "next-cursor",
  "items": [
    {
      "clusterId": "cluster-a",
      "namespace": "default",
      "name": "pod-a.123",
      "type": "Warning",
      "reason": "BackOff",
      "message": "Back-off restarting failed container",
      "count": 3,
      "objectApiVersion": "v1",
      "objectKind": "Pod",
      "objectName": "pod-a",
      "objectNamespace": "default",
      "sourceComponent": "kubelet",
      "sourceHost": "node-a",
      "firstSeen": "2026-07-09T10:00:00Z",
      "lastSeen": "2026-07-09T10:05:00Z"
    }
  ]
}
```

事件常用字段：

| 字段               | 类型          | 说明                       |
| ------------------ | ------------- | -------------------------- |
| `clusterId`        | string        | 集群 ID                    |
| `namespace`        | string        | namespace                  |
| `name`             | string        | Event 名                   |
| `createdAt`        | string        | 创建时间                   |
| `firstSeen`        | string        | 首次出现时间               |
| `lastSeen`         | string        | 最近出现时间               |
| `resourceVersion`  | string/number | Kubernetes resourceVersion |
| `type`             | string        | `Normal` / `Warning`       |
| `reason`           | string        | 原因                       |
| `message`          | string        | 事件消息                   |
| `count`            | number        | 出现次数                   |
| `objectApiVersion` | string        | 关联对象 apiVersion        |
| `objectKind`       | string        | 关联对象 kind              |
| `objectName`       | string        | 关联对象名称               |
| `objectNamespace`  | string        | 关联对象 namespace         |
| `sourceComponent`  | string        | 来源组件                   |
| `sourceHost`       | string        | 来源节点                   |

## Raw Resource 接口

Raw Resource 用于获取 Kubernetes 资源原始 JSON/YAML。

### 查询 core 资源

```
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/core/:resource/:name?format=yaml
```

### 查询 group/version 资源

```
GET /rest/v1/application-environments/:appEnvID/runtime/clusters/:clusterId/raw-resources/:group/:version/:resource/:name?format=json
```

略（与旧版相同，无变化）。

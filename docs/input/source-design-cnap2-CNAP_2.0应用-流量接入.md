---
status: frozen
source: https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/ebuKbGyWCDaLe5
source_type: source-design
description: CNAP 2.0应用-流量接入（流量接入模块原始需求文档，参考来源）
processed: done
frozen_reason: CNAP 2.0 流量接入模块原始需求文档，静态归档作为开发参考；可作基础需求了解及参考，但不是绝对、完整、唯一正确的需求来源
---

# CNAP 2.0应用-流量接入

> - 源文档：<https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/ebuKbGyWCDaLe5>
> - docGuid：`ebuKbGyWCDaLe5`
> - 作者：董淑照 (dongshuzhao@baidu.com)
> - 抓取时间：2026-08-10
> - 抓取方式：`ku query-content --protocol markdown --show-doc-info`
> - 备注：该需求文档的内容可做基础的需求内容了解及参考，但不是绝对的、完整的、唯一正确的需求来源；如需最新版本请以在线文档为准。

---

CNAP 2.0应用-流量接入

**原型地址：**

[https://cnap-demo-app-traffic.popo.baidu-int.com/](https://cnap-demo-app-traffic.popo.baidu-int.com/)

大致对应CNAP 1.0运行时的"服务暴露"、"服务暴露（关系视图）"及运行配置里的"服务访问"部分。

![流量拓扑](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=bd48ed350bac4fe19e65e9530ae7d0e6&docGuid=ebuKbGyWCDaLe5 "流量拓扑")
![流量拓扑（按集群分组）](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=61e49abf2b9f4cd9a92db6ff0f5b02fd&docGuid=ebuKbGyWCDaLe5 "流量拓扑（按集群分组）")
![配置列表](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=98fdfb6767b448f98055ba70b01dbccd&docGuid=ebuKbGyWCDaLe5 "配置列表")
![右侧抽屉](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7799643bb70249ec8b8097f159d96765&docGuid=ebuKbGyWCDaLe5 "右侧抽屉")
![创建向导](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a92b61d0de2b49cdb5abd60ff78e638c&docGuid=ebuKbGyWCDaLe5 "创建向导")
![基础配置](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3911f8018dd74dea8968956987341683&docGuid=ebuKbGyWCDaLe5 "基础配置")
![详细配置](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5d2263ad7fef4c32a0d12ba374b13bc0&docGuid=ebuKbGyWCDaLe5 "详细配置")
![确认信息](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ed60f50d467e4d75ac30e7296c9114dc&docGuid=ebuKbGyWCDaLe5 "确认信息")
![删除提示](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=59b3884332614b6fa0c785620a13e96a&docGuid=ebuKbGyWCDaLe5 "删除提示")
![缩放控制](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=bbe6c595ada540d0a5f0a630236f55ab&docGuid=ebuKbGyWCDaLe5 "缩放控制")
![快速创建](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=96f7d30451c04c998d093a7d352c4d1e&docGuid=ebuKbGyWCDaLe5 "快速创建")
![hover高亮全链路](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ee5b728791c44602ba204028d6005154&docGuid=ebuKbGyWCDaLe5 "hover高亮全链路")

**设计原则：**

* 一张图、一个界面实现一个应用的完整流量路径配置和可视化
* 原生支持多负载、多种接入方式
* 清晰展现上下游关系

**主要设计点：**

* 拓扑图、流量配置两种展现方式
    * 拓扑图：纵向展示从外到内的流量逻辑，集群内或者应用内用单独的虚线框区分，纵向对应流量中"南北流量"的概念
    * 流量配置：用列表列出现有的接入方式，设计上复用列表页统一风格

* 点击每个接入方式，右侧弹出抽屉，显示具体的接入配置；抽屉与工作负载等界面风格保持一致
* 创建、配置时，使用向导方式

**待定问题：**

* "应用级BNS Group"在这里没有配置入口，需要考虑如何配置
    * 增加一个特殊类型？（因为这个页面是环境级的）
    * 放到应用设置里？

**流量接入方式整理：**

|**类型**|**名称**|**实现方式**|**类型**|**支持下游**|**支持上游**|**简介**|**实例命名规则**|**集群启用条件**|
|-|-|-|-|-|-|-|-|-|
|集群内|ClusterIP|Servce (type=ClusterIP)|四层|Pod||K8s原生Service，为服务分配集群内部的IP和DNS域名实现访问，仅支持集群内访问|DNS名称 (ClusterIP)<br/>my-svc (172.16.1.1)|容器网络|
||Headless|Service (type=ClusterIP, clusterIP=None)|名字解析|Pod||K8s原生Service，为服务分配集群内部的DNS并指向Pod，通常用于集群内服务发现|DNS名称<br/>my-svc|容器网络|
||ENS Service|EnsService|名字解析|Pod|ENS Group|ENS实例，通过ENS直接指向Pod，实现集群内服务发现，也可支持跨集群发现，因ENS的被动更新机制设计，变更较慢|ENS名称<br/>account-my-svc-dev.K8S.bj|ENS|
|跨集群|NodePort|Service (type=NodePort)|四层|Pod||K8s原生Service，为服务分配节点IP和端口，并通过端口转发实现访问，集群外可见性取决于节点IP|DNS名称:端口<br/>my-svc:32001|容器网络|
||LoadBalancer|Service (type=LoadBalancer)|四层|Pod|ENS NLB Service|K8s原生Service，通过平台提供的四层负载均衡实现服务访问，通常集群外可见|NLB IP:端口<br/>10.2.3.4:8033||
||NLB-ENS|NLB关联ENS Group更新|四层|ENS Service<br/>ENS Group||NLB实例，即BGW/VIP，集团内的四层负载均衡系统，通过关联ENS Group实现自动更新，提供内网访问|NLB IP:端口<br/>10.2.3.4:8033||
||ENS NLB Service|EnsNlbService|名字解析|LoadBalancer (NLB)|ENS Group|ENS实例，通过ENS指向NLB IP，实现集群内和集群间服务发现和访问|ENS名称<br/>account-my-svc-dev.K8S.bj|ENS|
||ENS Group|CNAP平台调用ENS API|名字解析|ENS Service<br/>ENS NLB Service|ALB|ENS组，可包含若干个ENS实例，并配置其流量调度规则，实现跨集群的内网服务发现和流量调度|ENS Group名称<br/>group.account-my-svc-dev.K8S.all||
||CNAP网关|CNAP网关转发+泛域名|七层|ClusterIP<br/>ENS Service||通过CNAP网关和泛域名（*.*.appspace.baidu.com），实现跨集群的内网服务访问|域名<br/>my-svc-dev.account.appspace.baidu.com|百度内网|
|外网|ALB|（尚未实现）|七层|ENS Service<br/>ENS Group||通过ALB（BFE）实现对外访问和外网调度|ALB后端服务名称<br/>service_my-svc-cnap||

---

（以下内容为AI生成，供参考）

## 1. 概述
### 1.1 背景
应用包含多个工作负载（Workload），工作负载分布在多个集群（Cluster）中。流量接入（Access）是独立配置项，通过 `targets` 关联到具体的工作负载@集群。部分接入方式之间存在依赖关系（如 NLB-ENS 依赖 ENS Service 或 ENS Group）。

### 1.2 功能模块
|模块|说明|
|-|-|
|流量拓扑|纵向分层展示流量链路，支持按工作负载/按集群分组，节点 hover 高亮链路，点击查看详情|
|接入配置|列表展示所有流量接入，支持按方式/集群筛选，卡片内可编辑/删除/新增上游|
|新增流量接入向导|4 步：选择方式 → 基础配置 → 详细配置 → 确认创建|
|右侧详情抽屉|展示接入的基础信息、目标工作负载、各类型专属配置|

### 1.3 接入方式分组
|分组|标签|包含类型|
|-|-|-|
|inner|集群内|ClusterIP、Headless、ENS Service|
|cross|跨集群|NodePort、LoadBalancer、NLB-ENS、ENS NLB Service、ENS Group、CNAP 网关|
|inbound|外网|ALB|

---

## 2. 接入方式元信息
|类型|标签|范围|依赖|依赖模式|下游|上游|说明|
|-|-|-|-|-|-|-|-|
|`service`|ClusterIP|集群内|无|—|Pod|无|K8s 原生 Service，分配集群内 IP 和 DNS，仅集群内访问|
|`headless`|Headless|集群内|无|—|Pod|无|K8s 原生 Headless Service，DNS 直接指向 Pod|
|`ens-inst`|ENS Service|集群内|无|—|Pod|ENS Group|ENS 实例指向 Pod，支持集群内/跨集群服务发现|
|`nodeport`|NodePort|跨集群|无|—|Pod|无|K8s 原生 Service，通过节点 IP+端口转发|
|`loadbalancer`|LoadBalancer|跨集群|无|—|Pod|ENS NLB Service|K8s 原生 Service，通过平台四层负载均衡|
|`nlb`|NLB-ENS|跨集群|ENS Service / ENS Group|any|ENS Service、ENS Group|无|BGW/VIP 四层负载均衡，通过关联 ENS 自动更新|
|`nlb-ens`|ENS NLB Service|跨集群|LoadBalancer|all|LoadBalancer (NLB)|ENS Group|ENS 实例指向 NLB IP，实现集群间发现和访问|
|`ens-group`|ENS Group|跨集群|ENS Service|all|ENS Service、ENS NLB Service|ALB|ENS 组，包含若干 ENS 实例，配置流量调度规则|
|`cnap`|CNAP 网关|跨集群|无|—|Pod|无|CNAP 网关+泛域名，跨集群内网访问，仅限开发测试|
|`alb`|ALB|外网|ENS Service / ENS Group|any|ENS Service、ENS Group|无|ALB(BFE) 对外访问和外网调度，通过创建并控制 ALB 后端服务与 ALB 实例实现对接|

> 依赖模式 `any` 表示满足任一依赖即可；`all` 表示需全部满足。依赖不满足时，向导第一步该类型卡片锁定不可选。

---

## 3. 通用规则
### 3.1 服务名称规则
|类型|默认名称格式|自定义名称校验|
|-|-|-|
|ClusterIP|`{工作负载名}`|仅小写字母、数字、连字符（-）|
|Headless|`{工作负载名}-headless`|同上|
|NodePort|`{工作负载名}-nodeport`|同上|
|LoadBalancer|`{工作负载名}-lb`|同上|
|ENS Service|`{工作负载名}.K8S.{集群}`|同上，创建后按集群自动生成每集群一条|
|ENS NLB Service|`{工作负载名}.K8S.{集群}`|同上，创建后按集群自动生成|
|ENS Group|`group.{工作负载名}.K8S.all`|同上|
|NLB-ENS|`{工作负载名}-nlb-ens`|—|
|CNAP 网关|自动生成|—|
|ALB|`service_{工作负载名}`|—|

### 3.2 服务名称交互
* 默认开启"使用默认服务名称"开关，输入框禁用
* 关闭开关后输入框可编辑，初始值为工作负载名
* 输入框下方显示示例：
    * Service 类型：`DNS 示例：{名称}.svc.local`
    * ENS Service / ENS NLB Service：`示例：{名称}.K8S.{首个集群}（按所选集群自动生成）`
    * ENS Group：`示例：group.{名称}.K8S.all`

* 示例随输入框内容实时更新
* 自定义名称校验：仅允许小写字母、数字、连字符（-），不符合时输入框标红并提示

### 3.3 拓扑图节点展示
每个节点三行信息：

* 第一行：节点名称（NLB-ENS 显示 `NLB IP:NLB端口`）
* 第二行：接入类型标签
* 第三行：按类型不同的摘要信息

|类型|第三行内容|
|-|-|
|ClusterIP / Headless|集群名|
|NodePort|单端口：`节点端口:目标端口名称 · 集群名`；多端口：`N个端口映射 · 集群名`|
|LoadBalancer|`LB IP · 集群名`（无 IP 时仅集群名）|
|ENS Service|集群名|
|ENS NLB Service|集群名|
|ENS Group|`N 个 ENS Service`|
|NLB-ENS|`地域·可用区 :关联ENS端口`|
|CNAP 网关|`N 个集群`|
|ALB|`N 个目标 ENS`|

### 3.4 拓扑图节点交互
* hover 节点：高亮完整链路
* 点击节点：打开右侧详情抽屉
* access/workload 节点 hover 时，顶部边缘中间显示"新增上游接入"圆圈按钮（灰色边框白色底），点击打开新增上游向导

### 3.5 新增上游接入
* 从某个接入/工作负载发起"新增上游"
* 向导第一步自动按下游类型筛选可选接入方式
* 表单自动带入目标工作负载/目标 ENS 等

---

## 4. 各类型详细配置
### 4.1 ClusterIP / Headless
#### 基础配置（向导第二步）
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|全部工作负载列表|
|使用默认服务名称|开关|开启时禁用输入框|
|服务名称|文本输入|默认值见 3.1，下方显示 DNS 示例|
|为所有集群启用|开关|开启时在所有集群创建|
|目标集群|复选框表格|集群名 + 当前副本数，关闭"所有集群"时显示|

#### 详细配置（向导第三步）
|配置项|类型|说明|
|-|-|-|
|端口映射|表格|列：端口名称、对外端口号、目标端口名称。Headless 的对外端口号自动填充不可编辑。可增删行|

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础信息|类型、名称、创建时间|
|目标工作负载|工作负载 @ 集群列表|
|基础配置|服务类型、目标工作负载|
|端口映射|端口名称、对外端口号、目标端口名称|

---

### 4.2 NodePort
#### 基础配置
同 ClusterIP，默认名称为 `{工作负载名}-nodeport`。

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|外部流量策略|单选|Cluster / Local|
|端口映射|表格|列：端口名称、服务端口号、节点端口（空=自动分配）、目标端口名称。可增删行|

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础配置|服务类型、目标工作负载|
|高级配置|外部流量策略|
|端口映射|端口名称、服务端口、节点端口、目标端口名称|

---

### 4.3 LoadBalancer
#### 基础配置
同 ClusterIP，默认名称为 `{工作负载名}-lb`。

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|LoadBalancer 类型|下拉|Default / EKSLoadBalancer / CCELoadBalancer / NLBLoadBalancer|
|客户端 IP 透传|开关|仅 EKSLoadBalancer 显示，默认开启|
|创建公网 IP|开关|仅 CCELoadBalancer 显示，默认关闭|
|外部流量策略|单选|Cluster / Local|
|端口映射|表格|列：名称、Service 端口、目标端口、协议(TCP/UDP)。可增删行|
|LB IP|—|创建后自动分配，存储在 detail.lbIp|

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础配置|服务类型、目标工作负载|
|高级配置|LoadBalancer 类型、LB IP、（客户端 IP 透传 / 创建公网 IP）、外部流量策略|
|端口映射|名称、Service 端口、目标端口、协议|

---

### 4.4 ENS Service
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|—|
|容器|下拉选择|工作负载的容器列表|
|使用默认服务名称|开关|格式：`{工作负载名}.K8S.{集群}`|
|服务名称|文本输入|占位符显示 `{集群}`，下方显示示例|
|运行账户|文本输入|候选值：work / root，默认 work|
|部署路径|文本输入|默认 `/home/work`|
|为所有集群启用|开关|—|
|目标集群|复选框表格|—|

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|端口映射|表格|列：端口名称、目标端口名称。**第一行固定为 main 端口（只读、不可删除）**。可增删后续行|
|Tag|表格|列：Tag 名称、Tag 值。可增删行|
|同步规则|开关组|同步 EKS 标签(默认开)、同步 Pod 标签(默认关)、移除 Terminating Pod(默认开)、等待 Pod Ready 后接流(默认开)|
|忽略特定容器名|文本输入|仅"等待 Pod Ready"开启时显示|

#### 创建逻辑
* 每个选中的集群创建一条独立的接入记录
* 名称格式：`{基础名}.K8S.{集群ID}`
* 默认模式基础名 = 工作负载名；自定义模式基础名 = 用户输入

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础配置|目标工作负载、容器、运行账户、部署路径|
|端口映射|端口名称、目标端口名称、目标端口号|
|Tag|Tag 名称、Tag 值|
|同步规则|同步 EKS 标签、同步 Pod 标签、移除 Terminating Pod、等待 Pod Ready、忽略特定容器名|

---

### 4.5 ENS Group
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|—|
|使用默认服务名称|开关|格式：`group.{工作负载名}.K8S.all`|
|服务名称|文本输入|下方显示示例|
|目标 ENS Service|开关列表|该工作负载下所有 ENS Service 实例，可逐个开关。无实例时禁用下一步|

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|ENS Group 配置|JSON 编辑器|默认含 groupName、multiClusterDiscovery、clusterTraffic。实时校验 JSON 格式|

#### 创建逻辑
* 创建单条记录
* 名称：默认 `group.{基础名}.K8S.all`；自定义 `group.{用户输入}.K8S.all`
* targets 从启用的 ENS Service 实例的 targets 汇总

#### 右侧抽屉展示
|区块|字段|
|-|-|
|目标 ENS Service|ENS Service 实例列表 + 集群|
|ENS Group 配置|JSON 配置内容|

---

### 4.6 NLB-ENS（BGW/VIP）
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|—|
|目标 ENS|单选列表|该工作负载下可用的 ENS Service / ENS Group，显示类型+集群。推荐优先使用 ENS Service|

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|NLB 实例|单选|自动分配 / 手动选择|
|NLB IP 列表|下拉|手动选择时显示，含地域/可用区信息|
|关联 ENS 端口|下拉|从目标 ENS 的端口列表中选择，默认 main|
|负载均衡算法|下拉|轮询(RR) / 源地址哈希(SH) / 一致性哈希(CH) / 最少连接数(LC)|

#### 创建逻辑
* 创建单条记录
* 名称：`{工作负载名}-nlb-ens`
* NLB 端口：创建时自动分配（8000~8999 区段，避免重复）
* NLB IP：创建时固定分配

#### 右侧抽屉展示
|区块|字段|
|-|-|
|目标 ENS|ENS 名称 + 类型（ENS Group 不显示地域，其他显示类型+集群）|
|配置|NLB IP、NLB 端口、关联 ENS 端口、负载均衡算法|

#### 拓扑图
* 节点标题：`NLB IP:NLB端口`
* 连线：使用 `basic.targetEnsIds` 确定目标 ENS（非依赖推断）

---

### 4.7 ENS NLB Service
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|—|
|目标 NLB LoadBalancer|下拉|该工作负载下 LoadBalancer 类型的接入列表。无则禁用下一步|
|使用默认服务名称|开关|格式：`{工作负载名}.K8S.{集群}`|
|服务名称|文本输入|占位符显示 `{集群}`，下方显示示例|
|运行账户|文本输入|默认 work|
|部署路径|文本输入|默认 `/home/work`|
|为所有集群启用|开关|—|
|目标集群|复选框表格|—|

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|主端口|文本|—|
|Tag|表格|列：Tag 名称、Tag 值|
|同步规则|开关|同步所有端口（默认开）|

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础配置|目标工作负载、目标 NLB LoadBalancer、运行账户、部署路径|
|主端口|主端口|
|Tag|Tag 名称、Tag 值|
|同步规则|同步所有端口|

---

### 4.8 CNAP 网关
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|CNAP 名称|文本输入|—|
|访问域名|只读|自动生成：`{应用名}-{环境名}.{账户名}.appspace.baidu-int.com`|
|目标工作负载+映射路径|表格|列：工作负载、映射路径。可增删行|

#### 详细配置
|配置项|类型|说明|
|-|-|-|
|连接超时|数字|毫秒，默认 5000|
|读超时|数字|毫秒，默认 60000|
|写超时|数字|毫秒，默认 60000|

#### 右侧抽屉展示
|区块|字段|
|-|-|
|基础配置|访问域名|
|目标工作负载|工作负载、映射路径|
|超时配置|连接超时、读超时、写超时|

---

### 4.9 ALB
#### 基础配置
|配置项|类型|说明|
|-|-|-|
|目标工作负载|下拉选择|—|
|目标 ENS|单选列表|该工作负载下可用的 ENS Service / ENS Group。无则禁用下一步|

#### 详细配置
|分组|配置项|类型|默认值|
|-|-|-|-|
|健康检查|健康检查协议|下拉(TCP/HTTP)|TCP|
|健康检查|健康检查间隔|数字|1000|
|健康检查|健康检查启动阈值|数字|10|
|后端协议|后端协议|下拉(HTTP/HTTPS/TCP)|HTTP|
|超时及重传|与用户长连接超时|数字(毫秒)|900000|
|超时及重传|读请求内容超时|数字(毫秒)|900000|
|超时及重传|连接后端超时|数字(毫秒)|5000|
|超时及重传|读响应头部超时|数字(毫秒)|10000|
|超时及重传|写响应超时|数字(毫秒)|900000|
|超时及重传|同后端实例组重试次数|数字(次)|1|
|超时及重传|跨后端实例组重试次数|数字(次)|0|
|会话保持及连接管理|会话保持级别|下拉(后端实例组/后端实例/关闭)|后端实例组|
|会话保持及连接管理|会话保持哈希策略|下拉(用户标识/源IP)|用户标识|
|会话保持及连接管理|会话保持哈希头部|文本|Cookie:BAIDUID|
|会话保持及连接管理|连接池大小|数字|0|
|会话保持及连接管理|连接级联关闭|开关|关闭|
|会话保持及连接管理|请求缓存大小|数字(禁用)|512|
|会话保持及连接管理|请求刷出间隔|数字(禁用)|0|
|会话保持及连接管理|响应刷出间隔|数字(禁用)|-1|

#### 创建逻辑
* 创建单条记录
* 名称：`service_{工作负载名}`
* 连线：使用 `basic.targetEnsIds` 确定目标 ENS

#### 右侧抽屉展示
|区块|字段|
|-|-|
|目标 ENS|ENS 名称 + 类型（ENS Group 不显示地域）|
|健康检查|健康检查协议、健康检查间隔、健康检查启动阈值|
|后端协议|后端协议|
|超时及重传|与用户长连接超时、读请求内容超时、连接后端超时、读响应头部超时、写响应超时、同后端实例组重试次数、跨后端实例组重试次数|
|会话保持及连接管理|会话保持级别、会话保持哈希策略、会话保持哈希头部、连接池大小、连接级联关闭、请求缓存大小、请求刷出间隔、响应刷出间隔|

---

## 5. 向导流程
### 5.1 第一步：选择接入方式
* 视图切换：常用 / 全部
* 下游类型筛选：下拉选择，筛选结果为空时显示"无支持此下游类型的接入方式"
* 依赖检查：依赖不满足的类型卡片锁定（显示锁图标），不可选择
* 卡片展示：图标+名称、描述、下游（含未满足标记）、上游

### 5.2 第二步：基础配置
* 各类型表单见第 4 节
* 服务名称实时校验（DNS 安全字符、重名检测）
* 部分类型在无可用依赖时禁用"下一步"

### 5.3 第三步：详细配置
* 各类型表单见第 4 节

### 5.4 第四步：确认配置
* 展示配置概览：接入方式、名称、目标、访问范围
* 点击"发起操作"创建/更新接入

### 5.5 校验规则
|校验项|规则|
|-|-|
|服务名称必填|非空（ENS Group 除外）|
|DNS 安全字符|自定义名称仅允许小写字母、数字、连字符（-）|
|重名检测|同类型同范围下名称不可重复|
|目标 ENS 必选|NLB-ENS / ALB 至少选择一个目标 ENS|
|ENS Group 实例|ENS Group 至少有一个启用的 ENS Service|
|ENS NLB Service|需存在 LoadBalancer 类型的接入|
|CNAP 路由|至少一条路由，映射路径不可为空且不可重复|

---

## 6. 数据模型
### 6.1 接入记录结构
```
Access {
  id: string           // 唯一标识
  type: string         // 接入类型
  name: string         // 接入名称
  targets: [{          // 目标工作负载@集群
    workload: string,
    cluster: string
  }]
  basic: object        // 基础配置（各类型不同）
  detail: object       // 详细配置（各类型不同）
  createdAt: string    // 创建日期
}
```
### 6.2 各类型 basic 字段
|类型|basic 字段|
|-|-|
|ClusterIP / Headless / NodePort / LoadBalancer|serviceType, namespace, workload, useDefaultServiceName, customServiceName, allClusters, selectedClusters|
|ENS Service|workload, container, useDefaultServiceName, customServiceName, runAccount, deployPath, allClusters, selectedClusters|
|ENS Group|workload, useDefaultServiceName, customServiceName, instanceStates|
|NLB-ENS|workload, targetEnsIds|
|ENS NLB Service|workload, nlbLbId, useDefaultServiceName, customServiceName, runAccount, deployPath, allClusters, selectedClusters|
|CNAP|appName, envName, accountName, routes|
|ALB|workload, targetEnsIds|

### 6.3 各类型 detail 字段
|类型|detail 字段|
|-|-|
|ClusterIP / Headless|ports[{name, port, targetPortName}], selector, clusterIPPolicy, sessionAffinity, externalTrafficPolicy, publishNotReadyAddresses, annotations|
|NodePort|同上 + ports 增加 nodePort|
|LoadBalancer|同上 + lbType, lbIp, clientIpPassthrough / createPublicIp|
|ENS Service|ports[{name, targetPortName, targetPort}], tags[{name, value}], syncRules, healthCheck, instancesPreview|
|ENS Group|configJson|
|NLB-ENS|instanceMode, nlbIp, sourcePort, ensPort, algorithm|
|ENS NLB Service|mainPort, tags, syncRules|
|CNAP|connectTimeout, readTimeout, writeTimeout|
|ALB|healthcheckScheme, healthcheckInterval, healthcheckFailnum, backendProtocol, timeoutReadClientAgain, timeoutReadbodyClient, timeoutConnServ, timeoutResponseHeader, timeoutWriteClient, retryInBackendInstanceGroup, retryCrossBackendInstanceGroup, sessionSticky, sessionHashStrategy, sessionHashHeader, maxIdleConnPerHost, cancelOnClientClose, reqWriteBufferSize, reqFlushInterval, resFlushInterval|

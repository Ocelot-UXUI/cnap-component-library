---
status: frozen
source: https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/1lWT09Mn5MSmeB
source_type: source-design
description: CNAP 2.0产品原型设计
processed: done
frozen_reason: CNAP 2.0 产品设计文档，静态归档作为开发参考
---

CNAP 2.0产品原型设计

# 原型

使用v0搭建，仅用于参考页面结构、功能、交互示意；具体视觉风格、功能细节需要进一步设计。

↓ 点击这里查看 ↓

[https://v0.app/chat/cloud-native-application-platform-OjJWefiyO9P?ref=F6MZ2N](https://v0.app/chat/cloud-native-application-platform-OjJWefiyO9P?ref=F6MZ2N)

# 总体设计原则

1. 以用户为中心，设计排版围绕用户日常高频活动开展
   1. 大部分用户日常活动主要集中在少数账号、少数应用，因此突出账号、应用收藏功能
   2. 增加了用户Dashboard，体现正在进行的部署、需要注意的问题、常用的应用账号、使用数据等

2. 保证功能承载的前提下，减少导航深度，增加快捷到达
   1. 主要功能页面至多2次跳转可达
   2. 支持通过Cmd+K/Ctrl+K调起搜索栏，直接搜索具体功能和资源

3. 融入AI能力和元素
   1. 除了尴尬式对话之外，更多应考虑功能与AI能力的融合与应用
   2. （？）考虑实现AI直接调用页面操作的能力

# 页面结构

## 顶部导航

顶部导航主要从账号和资源（应用、环境）维度，实现用户在主要业务实体间的快捷跳转穿梭。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=9a8c4b5e2ada455c8597886b22dc3172&docGuid=1lWT09Mn5MSmeB)

| **账号选择** | **应用选择** | **环境选择** | **联动** | **页面**             | **主要后续页面**           | **下层内容****主要展现形式** | **主要展现内容**                              | **后续操作**                             |
| ------------ | ------------ | ------------ | -------- | -------------------- | -------------------------- | ---------------------------- | --------------------------------------------- | ---------------------------------------- |
| ×            | ×            | ×            | ←        | 账号列表页（及其他） | 账号详情页                 | 卡片                         | 用户有权限的所有账号                          | 添加账号、申请账号权限                   |
| ✓            | ×            | ×            | ↔        | 账号详情页           | 环境列表页、应用环境列表页 | 列表                         | 账号下的应用、环境、集群等信息                | 账号设置                                 |
| ✓            | ✓            | ×            | ↔        | 应用环境列表页       | 运行时页                   | 卡片（？）                   | 应用下的环境列表，按照生产/测试级别分组       | 发起应用部署、创建应用环境、修改应用配置 |
| ✓            | ×            | ✓            | ↔        | 环境详情页           | 运行时页                   | 卡片                         | 环境下的应用列表                              | 发起应用部署、创建应用                   |
| ✓            | ✓            | ✓            | ↔        | 运行时页             | --                         | Tab+列表                     | 应用特定环境的资源信息及操作                  | 发起应用部署、修改应用配置、清理资源     |
| ✓            | ×            | ×            | ←        | 环境列表页           | 环境详情页                 | 列表（带层级）               | 账号下的所有环境列表，按照生产/测试级别分组   | 添加环境（base环境、特性环境）           |
| ✓            | ×            | ×            | ←        | 集群列表页           | 集群详情页                 | 卡片                         | 账号管理的及可用的所有集群列表、凭证列表      | 添加集群、添加凭证                       |
| ✓            | ×            | ×            | ←        | 集群详情页           | 资源管理页                 | 列表                         | 集群状态，集群的节点、Addon等，及集群下的环境 | 集群分享                                 |
| ✓            | ×            | ✓            | ←        | 资源管理页           | 资源详情页（如Pod详情等）  | 列表                         | 一个简单的网页K8s资源管理器                   | K8s基础资源查看和管理功能                |
| ~~×~~        | ~~×~~        | ~~✓~~        |          | ~~（不存在此状态）~~ | ~~~~                       | ~~~~                         |                                               |                                          |
| ~~×~~        | ~~✓~~        | ~~✓~~        |          | ~~（不存在此状态）~~ | ~~~~                       | ~~~~                         |                                               |                                          |
| ~~×~~        | ~~✓~~        | ~~×~~        | ~~~~     | ~~（不存在此状态）~~ | ~~~~                       | ~~~~                         | ~~~~                                          | ~~~~                                     |

（导航选择：✓ - 已选择 × - 未选择；联动：← - 页面联动导航，导航不联动页面；↔ - 导航与页面双向联动）

### 面包屑

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d040bfd5453e465fbf73cd19d33e0562&docGuid=1lWT09Mn5MSmeB)
“账号 > 应用 > 环境”三级选择器，方便用户在主要资源之间穿梭。

- **账号选择器**：按照收藏的账号、最近使用的账号、所有其他有权限的账号三级使用频度分组。最底下增加查看所有账号的链接，跳转至账号列表页。
- **应用选择器**：按照收藏的应用（当前账号下、其他账号下）、当前账号下最近使用的应用（访问时间排序）、当前账号下其他的应用（字典序）三级使用频度分组。最底下增加查看应用列表的链接，跳转至当前账号的应用列表页。
- **环境选择器**：（仅当账号和应用都选中时可用）列出当前账号、当前应用下的所有环境，按照环境类型分组。最底下增加查看环境列表的链接，跳转至当前账号的环境列表页。

### 快捷搜索

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=71b8b2652f344aa9ac3a2e1953b0a9fa&docGuid=1lWT09Mn5MSmeB)
快捷搜索使用Ctrl+K/Cmd+K呼出，作为统一的快捷跳转入口，可跳转以下内容：

- 主要页面：导航各页面
- 界面功能：细化到具体功能项
- 资源搜索：账号、应用、环境、集群等
- AI能力：（后续再加）

### 通知

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=03e610c83e9048aa9b41bd9157d6cb60&docGuid=1lWT09Mn5MSmeB)
通过站内方式给用户提供的通知列表。

### 用户菜单

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=284168f2ea5140c4a072e560be909ea0&docGuid=1lWT09Mn5MSmeB)
包括用户信息、用户个人账号设置等。

### 界面切换

切换界面明暗、自动模式。

## 侧边导航

侧边导航主要负责展现和手动切换用户当前关注的资源或功能板块。

### **用户导航**

![仪表板](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=85f3f498c80a4108b83b1aff31233cd9&docGuid=1lWT09Mn5MSmeB "仪表板")
![收藏](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1fd7159389b54333aa6a29946c3e249e&docGuid=1lWT09Mn5MSmeB "收藏")
![最近访问](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=bb3f4df8dc8842d1bb663bede85e19d4&docGuid=1lWT09Mn5MSmeB "最近访问")
以用户为中心的、包含个性化数据的导航页面。

- **仪表板（Dashboard）**：作为用户默认的CNAP入口页。用户个性化概览页面，包括需要留意的信息、正在进行的部署、常用账号、个人数据等。
- **收藏（Favorites）**：已收藏的应用和账户。
- **最近访问（Recent）**：最近交互的资源和应用

### **资源导航 (Resources)**

- **应用程序 (Applications)**：管理已部署的应用程序
  - 应用列表页：点击应用后的主入口，当前账号下的所有应用。
  - 应用创建页：新建应用的页面，选模板、向导式。应用创建页中包含了应用配置页里必填的基础信息。
  - 应用环境列表页（应用）：列出应用下的所有可用环境。
  - 运行时页（应用+环境+[集群]）：Overview去掉，列出特定应用、特定环境的详情。
  - 应用配置页（应用）：应用的整体配置，支持全局>环境>集群级别继承和覆盖。
  - ~~Pod列表页（应用+环境+[集群]）：列出特定应用、特定环境下的详细Pod列表。~~
  - Pod详情页（应用+环境+[集群]）：从Pod列表页或应用详情页的负载标签点击后进入，列出单个Pod的信息。
  - 应用部署（应用+环境）：

![应用列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f524951b999c4c41980463c768bafa3c&docGuid=1lWT09Mn5MSmeB "应用列表页")
![应用-环境列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a29e5be64b1745d699ad1359d57030c6&docGuid=1lWT09Mn5MSmeB "应用-环境列表页")
![应用详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ca6af895104b403788afb20a1d17abcd&docGuid=1lWT09Mn5MSmeB "应用详情页")
![应用配置页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=498ba606f8dc40e89ac6588a6c7b4a99&docGuid=1lWT09Mn5MSmeB "应用配置页")
![Pod列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=cfbbb07425374c948b0fe5f20ce56085&docGuid=1lWT09Mn5MSmeB "Pod列表页")
![Pod详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5d393106c22d4e0f9e9834372221a718&docGuid=1lWT09Mn5MSmeB "Pod详情页")
![应用创建页1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=afb185da878840bb88e6b713d305d7ef&docGuid=1lWT09Mn5MSmeB "应用创建页1")
![应用创建页2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a4c6acd5afc94d7583718de0d9ad916d&docGuid=1lWT09Mn5MSmeB "应用创建页2")
![应用创建页3](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6abe04c348e54801a0cd04a3fbc6f898&docGuid=1lWT09Mn5MSmeB "应用创建页3")

- **环境 (Environments)**：管理账号下的环境。
  - 环境列表页：点击环境后的主入口，当前账号下的所有环境列表。
  - 环境详情页：列出环境下的所有应用，点击应用后进入应用详情页。
  - 新建环境页（对话框？）：创建新的环境。

![环境列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b9906da14a084af1ace92dcc041aba16&docGuid=1lWT09Mn5MSmeB "环境列表页")
![环境详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6b6d5117870148789fc3500dfdb6316c&docGuid=1lWT09Mn5MSmeB "环境详情页")
![新建环境页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d797ba492ad84c69b2a3ac8e71a2e436&docGuid=1lWT09Mn5MSmeB "新建环境页")

- **集群 (Clusters)**：管理当前账号相关的所有Kubernetes集群。
  - 集群列表页：点击集群后的主入口，当前账号下的所有集群列表。点击后进入集群详情页。
  - 集群详情页：集群的详细信息和管理操作。
  - 新建集群：创建新的集群。
  - 新建凭证：创建新的凭证。

![集群列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a3c318ba22b9480aac56f007b9f6a72b&docGuid=1lWT09Mn5MSmeB "集群列表页")
![集群详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c56e2c9943b9477ba3458c4b36204804&docGuid=1lWT09Mn5MSmeB "集群详情页")
![新建集群](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ff88d24897be425db840a92106aa1451&docGuid=1lWT09Mn5MSmeB "新建集群")
![新建凭证](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3c2d04848f2341b684f74cf50d1b83b0&docGuid=1lWT09Mn5MSmeB "新建凭证")

### **部署管理导航 (Deployments)**

- **流水线 (Pipelines)**：部署活动管理。
  - 部署列表页：显示用户最近的部署，按照时间倒序。
  - 部署操作页：点击后显示当前部署的状态和操作。
  - 新建部署页：手动发起新的部署。

- ~~**活动 (Activity)**~~~~：部署活动和日志~~

![部署列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0a27764c24ef421f89fa57f9ab020122&docGuid=1lWT09Mn5MSmeB "部署列表页")
![部署详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=efba519a0f2b4dc4b48e9bd40edb989e&docGuid=1lWT09Mn5MSmeB "部署详情页")
![部署详情-工作负载](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f799751e0205408faea8c6b5e6fbcd62&docGuid=1lWT09Mn5MSmeB "部署详情-工作负载")
![部署详情-日志](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d959d4dbc98f4dbc8a7474f234957d68&docGuid=1lWT09Mn5MSmeB "部署详情-日志")
![部署详情-人工确认](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c050e28e14b34ab4a8b8bf205889d30b&docGuid=1lWT09Mn5MSmeB "部署详情-人工确认")
![新建部署](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a17d7cd200ce4bc8b6741bdc3a8dbe6a&docGuid=1lWT09Mn5MSmeB "新建部署")

### **账户与标签管理**

- **账户 (Accounts)**：组织账户和权限管理。
  - 账户列表页：显示当前用户拥有的账户列表，以及申请、创建入口。
  - 账户详情页：显示账户的详细信息，包括总览、应用信息、环境信息。
  - 账户设置页：

![账户列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=86ea0f29e6f047a9b2b7d65eadc8831f&docGuid=1lWT09Mn5MSmeB "账户列表页")
![账户详情页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b22744465b5a4fed9d7470c454a3ab2b&docGuid=1lWT09Mn5MSmeB "账户详情页")
![帐户设置-基本信息](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=aa7aba266d094ac796fd631864a963a2&docGuid=1lWT09Mn5MSmeB "帐户设置-基本信息")
![帐户设置-环境类型](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7169f9e9f25b4f3fa6c866656879eab6&docGuid=1lWT09Mn5MSmeB "帐户设置-环境类型")
![帐户设置-成员权限](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=9e891614521d45a7bc14a3c6dbeaf9f9&docGuid=1lWT09Mn5MSmeB "帐户设置-成员权限")
![帐户设置-部署控制](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=aecadf32c9d7403aac09fcaf06a2b053&docGuid=1lWT09Mn5MSmeB "帐户设置-部署控制")
![帐户设置-部署策略](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0d6a62f3ffc244d3b23f79274485af87&docGuid=1lWT09Mn5MSmeB "帐户设置-部署策略")
![账户策略-通知](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=27df1e15fc0247a5a6d202606c17e9d3&docGuid=1lWT09Mn5MSmeB "账户策略-通知")
![账户策略-高级](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f1afc77db3174515b8e897fb02d78a99&docGuid=1lWT09Mn5MSmeB "账户策略-高级")

- **标签 (Labels)**：标签管理，通过标签的方式管理一组应用的权限继承（及其他，后续如果有）。
  - 标签列表页：列出当前账户下所有的应用标签。点击后链接到应用列表，并使用当前标签筛选。
  - 新建标签页：新建一个标签。
  - 编辑标签角色权限：与账户的角色权限对应。
  - 编辑标签应用：编辑标签绑定的应用。

![标签列表页](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=8c5bfeef267b41c1afd1fea16c8faf22&docGuid=1lWT09Mn5MSmeB "标签列表页")
![新建标签](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e3ffd1b19af34c878a39ce9e74405643&docGuid=1lWT09Mn5MSmeB "新建标签")
![编辑标签权限](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=605709ede8e14603be4fdb8a1d2686f9&docGuid=1lWT09Mn5MSmeB "编辑标签权限")
![编辑标签应用](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ee0e3cca71294046847617cc1dd56017&docGuid=1lWT09Mn5MSmeB "编辑标签应用")

### **系统设置**

看左侧空间情况，可以考虑移动到右上角用户菜单中。

- **用户设置 (User Settings)**：用户级别的平台偏好和配置。（待细化）

![用户设置](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=efeb242a190c44f78f621660a3193692&docGuid=1lWT09Mn5MSmeB "用户设置")

## **辅助功能页面**

### **智能助手**

- **AI 助手 (AI Assistant)**：AI 辅助功能（待细化）

### **系统信息**

- **更新日志 (Changelog)**：平台更新记录
- **帮助文档 (Help & Docs)**：帮助和文档（页面待实现）

![Changelog](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=98bb22a01b4d4127b03566aab74e3714&docGuid=1lWT09Mn5MSmeB "Changelog")

# 修改意见

用TODO List记在这里，我会抽空让AI实现（credits用光了）

- [x] 集群级配置如何避免用户误解（新增集群）
- [x] 环境、集群顶部导航：账号、应用始终保持（无应用时，应用列表出“选择应用”）；环境按需出
- [x] 应用上的部署入口
- [ ] 左侧导航加一层展开，当前激活的项目展开
- [x] 每种列表页，卡片/列表视图固定一种（已记入3.1表格）
- [x] 环境页按prod/testing区分tab，每种tab下把环境类型按列表+树形展示；按基准环境筛选
- [x] 部署中Activity删掉，增加部署策略等
- [x] 面包屑导航增加创建环境、创建账号、申请账号权限
- [ ] Quota放到集群管理中

# 💰💰💰帮我充钱💰💰💰

如果没用过v0的，可以点这里免费注册一下，这样我和你都会得到$5：[https://v0.app/ref/F6MZ2N](https://v0.app/ref/F6MZ2N)

---
status: frozen
source: https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/gY7D1EdOBbfbFv
source_type: source-article
description: CNAP 1.0 用户操作指南（合订本），静态归档，不再更新。包含从开通账户到高级功能的完整操作流程。CNAP 2.0 前端重新从 0 到 1 开发，业务逻辑相似但 UI/交互重新设计。此文档作为业务参考和新人了解项目的入口。
processed: done
frozen_reason: CNAP 1.0 已停止维护，此文档为 2.0 开发的静态参考
---

3、CNAP操作指南（合订本）

# 1、开通账户

更新时间：2023-03-29

## CNAP账户

开通CNAP，需要基于已有的百度智能云度厂版资源账户。 但CNAP拥有自己独立的账户体系和权限体系，需要单独添加成员和权限。

## 开通账户

进入[CNAP](https://console.cloud.baidu-int.com/devops/appspace/account/list)平台主页，可以查看您有权限的CNAP账户。若没有需要访问的账户，可选择一个百度智能云度厂版的资源账户进行开通。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=93b7b8729d55434a9d7d50d4155d3331&docGuid=FOajLj1u9rmxeP)
点击`开通账户`按钮，打开如下页面。

### 账户基础信息配置

资源账户：须选择一个有权限的百度智能云度厂版资源账户。

账户英文名称：填写一个账户的英文名。

账户中文名称：默认与资源账户同名。

默认QA：填写QA成员的erp，用于设置流水线模版中默认提测/准出确认人，后续可自定义修改。

联系方式：须提供一个邮件组和如流群号，可用于接收平台发送的上线通知等消息。

noah节点：用户指定BNS的挂载节点，可自定义指定节点或使用CNAP节点。需要注意的是，使用CNAP节点后将无法修改BNS配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c850c1d75f3b43c9880face7e5fc6ff3&docGuid=FOajLj1u9rmxeP)

### 集群配置

集群配置：为便于快速接入使用，系统将为新开通的账户默认创建4套环境：生产环境prod，测试环境 dev/test/sandbox。

此处须选择每个环境的初始化集群配置，以及默认集群。仅用于初始化创建环境和默认集群信息，之后可在【环境】页进行调整。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d971d38bf8c843789bde83d337919c7e&docGuid=FOajLj1u9rmxeP)

### 运行时配置库

需提供一个用于存放所有应用运行配置的代码库，可新建一个。

```
什么是运行时配置库？在CNAP上，一个微服务应用要运行起来，通常需要包含两部分内容（参见下图应用构建打包模型）：1、应用程序的代码；2、应用运行的相关配置。运行时配置库，便是用于存放程序代码以外的其余配置信息，包括运行的实例数、需要的CPU/内存等资源大小、健康检查设置、启动命令配置、环境变量配置、服务暴露方式、监控配置等等。一个账户下的所有应用将共用一个运行时配置库。
```

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5ddc14a9d45343d7b8f3c0fad7fcdfbb&docGuid=FOajLj1u9rmxeP)
应用构建打包模型

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=650374cfb2b34a0b89efa80605f8c4c4&docGuid=FOajLj1u9rmxeP)

# 2、应用管理

## 新建应用

进入账户后，可在应用列表页点击`新建应用`按钮，添加一个应用。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0676e90419bc4dff9a6f27819af77b92&docGuid=5c631vbBbNFGdK)
打开如下页面。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e28076ddb3c44cc0865327ea1a381791&docGuid=gY7D1EdOBbfbFv)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=191e2e29ecbf41be972020a8d4c60f99&docGuid=gY7D1EdOBbfbFv)
**（1）基础配置**

```
- 应用名称：为创建的应用命名；  
- 应用模板：应用配置模板，通常选择【官方模板】即可；
```

**（2）单个容器的配置**

> 如何选择镜像来源？
> ![](https://bce.bdstatic.com/doc/icloud/Appspace/image_4b85085.png)
> 1）镜像来源：基础镜像-官方基础镜像/自定义基础镜像

```
- 基础镜像：选择官方基础镜像类型及其版本；或填写自定义基础镜像的地址和版本；
- 启动命令：必填项，指服务的启动命令，支持绝对路径（须以/开头，如/home/work/bin/start.sh）和相对路径（相对部署路径，须以./开头，如./bin/sh）；
- 参数：启动命令所需的参数；
- 代码库：填写代码库地址；支持配置多个代码库（目前仅支持单容器多代码的场景）；
- 部署路径：即编译产出Output在镜像中所处路径；
```

2）镜像来源：基础镜像-来自代码库Dockerfile

```
- 代码库：填写代码库地址；
- 部署路径：即编译产出Output在镜像中所处路径；
```

3）镜像来源：中间件

```
镜像：须选择中间件的类型及版本。
```

4）镜像来源：固定镜像

```
镜像：须选择中间件的类型及版本。
```

（3）应用负载

选择应用部署使用的k8s工作负载。

```
-- 无状态应用：原生k8s负载类型，使用Deployment资源，所有pod（实例）都是相互等价的。
--原地升级无状态应用：EKS负载类型。在无状态应用基础上，当只有镜像变更时，具备原地升级、实例IP不变的能力； 修改运行时配置信息，变更时非原地升级。
--原地升级有状态应用：EKS负载类型，使用StatefulSet资源， 如需将数据作持久存储，可以使用该类型的负载。 同样在仅有镜像变更时，具备原地升级、实例IP不变的能力。
--定时任务：原生k8s负载类型CronJob，用于定义需反复运行任务的实例。
```

## 应用初始化

应用创建过程，系统自动初始化了哪些内容？

1、初始化该应用的若干套环境（每个环境默认使用的集群在【环境】页可修改）；

2、生成若干套环境的部署策略；

3、生成若干套环境的运行配置（数目与账户维度的环境数对应）；

## 下一步

应用创建完成后，可直接尝试【去部署】，也可进一步【完善配置】。

# 3、构建配置

更新时间：2023-03-29

## 功能介绍

入口：【部署】-【构建配置】

构建配置主要是指应用的镜像和代码库配置。

## 基础配置

按`容器`配置镜像和代码库等信息。

**镜像配置**选择不同镜像来源，对应的配置项如下。

1）镜像来源：基础镜像-官方基础镜像/自定义基础镜像

```
- 基础镜像：选择官方基础镜像类型及其版本；或填写自定义基础镜像的地址和版本；- 启动命令：必填项，指服务的启动命令，支持绝对路径（须以/开头，如/home/work/bin/start.sh）和相对路径（相对部署路径，须以./开头，如./bin/sh）；- 参数：启动命令所需的参数；- 代码库：填写代码库地址；- 部署路径：即编译产出Output在镜像中所处路径；
```

2）镜像来源：基础镜像-来自代码库Dockerfile

```
- 代码库：填写代码库地址；- 部署路径：即编译产出Output在镜像中所处路径；
```

3）镜像来源：中间件

```
镜像：须选择中间件的类型及版本。
```

4）镜像来源：固定镜像

```
镜像：须选择中间件的类型及版本。
```

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=20fe3076c001490c9d5b4a81ebeeaab6&docGuid=tKUjmsZgTQBvEj)

## 高级配置

包含测试环境镜像、测试环境改包脚本的配置。

测试环境镜像：单独配置测试环境的镜像，用于测试环境须使用不同于生产环境镜像配合完成测试的场景。

测试环境改包脚本：提供自定义shell，对编译后output产出内容做修改。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=de24385a932540f4b600440390477899&docGuid=tKUjmsZgTQBvEj)

## 参考文档

Dockerfile参考文档：

- Dockerfile最佳实践：[https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/pKzJfZczuc/kb_Pd4AYBC/GSNgEvc3Oul5Zy?source=1](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/pKzJfZczuc/kb_Pd4AYBC/GSNgEvc3Oul5Zy?source=1)
- [https://docs.docker.com/engine/reference/builder/](https://docs.docker.com/engine/reference/builder/)
- [http://www.dockerinfo.net/dockerfile介绍](http://www.dockerinfo.net/dockerfile%E4%BB%8B%E7%BB%8D)

# 4、运行配置

更新时间：2023-03-29

## 1、什么是运行配置？

应用的运行时配置，主要指与程序运行相关的各类配置信息，包括各个环境下**程序部署的实例数、需要的资源配额、健康检查、监控配置、环境变量、启动命令 以及 配置文件**等等。

运行配置以代码形式存储在代码库中，该代码库是区别于程序代码库的另一个库，且账户下所有应用的运行时配置统一存储在一个代码库中。

应用交付模型如图所示。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=85b29006102143d09dcee68f7b37f0cb&docGuid=1u7DXQV8yTZXbh)

## 2、运行时配置的代码文件

系统会默认为各个环境生成对应的运行时配置，对应于代码库中的一个个values文件。

如图所示，为应用`mej-test-022002`的配置代码库中，四个环境的运行时配置文件

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c99f8a6b72ff481ab1c5bb42c29a4d85&docGuid=1u7DXQV8yTZXbh)

## 3、修改运行配置

在【部署】-【运行配置】页，默认展示了最新版本的配置信息。

在运行时配置页，可以查看最新版本的配置信息。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b253a2597dfe46a09cfb8e86ecd35aac&docGuid=1u7DXQV8yTZXbh)
**版本信息**：包括最新版本的commitID、更新人和更新时间，以及已部署的环境。

**运行时配置列表**：展示了各个环境的概要配置信息。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=43726bc42e3340bbb522b2fbc316653f&docGuid=1u7DXQV8yTZXbh)
点击`修改运行配置`，打开配置编辑页，可根据业务需求更新实例配置、服务定义、环境变量、服务暴露方式、日志配置、监控配置、配置文件等各项内容。

修改完成后即可提交，系统会自动合入代码。

注意：修改完运行配置，须重新打包、部署后才可生效~

### 实例配置

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ea44e43f65134f569a0a4db57f151ec8&docGuid=1u7DXQV8yTZXbh)

| 配置项                                                                                                                                                  | 含义                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 实例数量                                                                                                                                                | 即pod个数，当前环境要部署多少个pod/实例                                                                                                                                                                          |
| 容器名称                                                                                                                                                | 定义容器的名称，默认第一个为主容器，名称同应用名。                                                                                                                                                               |
| 实例资源                                                                                                                                                | 配置容器所需的CPU、内存、存储等资源需求。                                                                                                                                                                        |
| 当您的pod上启用了EFK日志、BLS日志或其他的sidecar，须为sidecar单独指定所需的资源配额。                                                                   |                                                                                                                                                                                                                  |
| 并且，对于EKS native CCE集群，主容器资源配额+ sidecar的资源配额，须满足给定的资源套餐。                                                                 |                                                                                                                                                                                                                  |
| 端口                                                                                                                                                    | 即程序暴露的端口，须指定端口使用的通信协议、端口名称及端口号。支持以下两种定义方式：                                                                                                                             |
| 1）命名端口：指定端口名称和端口范围；                                                                                                                   |                                                                                                                                                                                                                  |
| 2）端口段：即为pod分配一段**若干数量**的**连续**端口。还可针对其中的端口，分别配置名称。                                                                |                                                                                                                                                                                                                  |
| 需要注意的是：使用ECI集群时，须提前改造代码，实现动态端口。配置方式：${小写的端口名称}。例如：配置main或MAIN端口，程序中须使用环境变量${main}获取端口。 |                                                                                                                                                                                                                  |
| 存活探针                                                                                                                                                | 存活探针用于检查容器是否还在运行，如果探测失败了，Kubernetes将重启容器。                                                                                                                                         |
| 就绪探针                                                                                                                                                | 就绪探针用于检查容器是否准备就绪，可以开始接收流量。就绪探针通过才会把流量转发到Pod。如果就绪探针检测失败，Kubernetes将停止向该容器发送流量。                                                                    |
| 环境变量                                                                                                                                                | 以键值对形式为容器配置环境变量。                                                                                                                                                                                 |
| 启动命令&参数                                                                                                                                           | 自定义容器启动时运行的命令及参数。                                                                                                                                                                               |
| 配置文件                                                                                                                                                | 配置文件映射，是指通过引用的方式，直接将应用程序代码库或运行时配置库（即chart库）中的配置文件，挂载到容器里（CNAP上每个应用的代码包含两部分：程序代码+配置代码，因此建议用户将相关的信息都放在这两个代码库里）。 |
| 容器中挂载路径：填写配置文件在容器中的挂载目录（如路径不存在会默认创建）。注意：挂载配置文件之前，会先清空所提供目录下已有的内容，请谨慎配置。          |                                                                                                                                                                                                                  |
| 配置文件目录：配置文件在代码库的目录，支持填写到目录或具体文件名，如/conf或/conf/config-dev.json。                                                      |                                                                                                                                                                                                                  |
| 系统将在打包时获取所选代码库分支中的配置文件，因此在此处不需填写分支信息。                                                                              |                                                                                                                                                                                                                  |

### 服务访问

可配置集群内调用即service的端口名称、端口号及对应的容器端口。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c0963425849a451ab52f51e9ec82b4c4&docGuid=1u7DXQV8yTZXbh)

### 监控日志

日志采集：可选EFK或BLS。更多配置说明参考 [日志采集配置](https://cloud.baidu-int.com/icloud/Appspace/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/%E5%BA%94%E7%94%A8%E8%BF%90%E7%BB%B4/%E6%97%A5%E5%BF%97%E9%87%87%E9%9B%86/%E6%97%A5%E5%BF%97%E9%87%87%E9%9B%86%E6%96%B9%E5%BC%8F%E8%AF%B4%E6%98%8E)

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b86d2dc1a5ff451099fd70472e4d7308&docGuid=1u7DXQV8yTZXbh)
监控功能由[noahee智能监控](https://cloud.baidu-int.com/icloud/IntelligentMonitoring/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/Prometheus%E7%9B%91%E6%8E%A7/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0/)提供，在一站式开启监控后，将会自动采集实例的基础资源监控指标。[查看监控说明](https://cloud.baidu-int.com/icloud/Appspace/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/%E5%BA%94%E7%94%A8%E8%BF%90%E7%BB%B4/%E7%9B%91%E6%8E%A7/%E7%9B%91%E6%8E%A7%E6%96%B9%E5%BC%8F%E8%AF%B4%E6%98%8E)。

### 部署并发度

最大不可用实例：百分比，允许值1-100。k8s滚动更新策略的部署并发度参数。指升级过程中允许一次性缩掉的实例数。

最大可超出实例 ：百分比，允许值1-100。k8s滚动更新策略的部署并发度参。允许一次性扩容的实例数。并发度设置越大，部署速度越快。

## 4、集群配置

更新时间：2022-10-25

环境级的配置（values-env.yaml文件）由系统默认生成，定义了环境下所有集群的通用配置。

当某个参数（如实例数）在各集群的配置不同时，可通过集群级配置（values-evn-cluster.yaml）单独定义，相同参数值不同时，以集群维度生效。

集群级配置可通过表单或代码库两种方式完成配置。

### 表单配置

菜单进入【应用设置】-【运行配置】。点击 更新运行配置 按钮，打开如图所示页面。

第一步：选择需要添加集群配置的环境，在左侧页签上，点击【+集群】按钮，选择需要单独配置的集群，即可在环境配置页签下看到所选集群的配置文件标题。

第二步：在右侧对需要单独定义的配置项进行参数设置，当参数值与上层环境维度不同时，会标记【已单独配置】。

- 单独配置项，集群级参数值将覆盖环境级的，以集群级配置生效。
- 未单独配置的项以环境级生效；
- 集群级配置文件只存储增量不同的配置参数。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e200c854b6ed4e09859db410305a4ac4&docGuid=YE5T-Pl6my2gyP)
配置完成后提交保存，重新打包部署，即可生效到线上。

### 代码库配置

操作步骤如下：

**第一步. 在配置库添加values-env-clustername.yaml文件**

其中，clustername是机房/集群的名字，如bjdd、szth。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=edb808e33aff46baa2d30ccfb22b767c&docGuid=YE5T-Pl6my2gyP)
第二步. 在文件中填写该机房的特殊配置(通用配置项无需填写，统一在环境级管理）

示例：为**生产环境**、**机房bjdd**设置不同于其他机房的实例数和资源规格。

在配置代码库中添加机房bjdd的配置文件，文件名称：values-prod-bjdd.yaml

文件内容：

```
appspaceChartVersion: health-v1appspace:container:replicaCount:8  resources:cpu:2memory: 4Gi      ephemeralStorage: 50Gi
```

> 完整的values文件详解

```
# chart版本，无需关注appspaceChartVersion: app123-v1# 注意，appspace结构下全部为系统默认的参数#（包括容器副本数、资源规格、端口、探针、服务、环境变量、ingress/服务暴露方式、日志、监控、配置文件）# 如需为某个机房设置特殊的系统默认参数，必须在appspace这一层结构下appspace:container:# replicaCount为副本数/实例数，指当前环境/或机房 要部署多少个pod/实例replicaCount:4# 单个实例的资源规格，包括CPU、内存、本地存储，须从给定的资源组合套餐中进行选择。resources:cpu:1memory: 2Gi      ephemeralStorage: 50Gi    # 程序暴露的端口，须指定端口使用的通信协议、端口名称及端口号，支持数组形式添加多个端口ports:-name: main      port:8080protocol: TCP    # k8s滚动更新策略的部署并发度参数。# maxSurge指升级过程中允许一次性缩掉的实例数# maxUnavailable标识允许一次性扩容的实例数。并发度设置越大，部署速度越快。rollingUpdate:maxSurge: 100%      maxUnavailable: 50%    # 探针设置（包括存活探针和就绪探针），不建议分机房配置probe:livenessProbe:enable:truetype: TCP        scheme: HTTP        port:8080path: /hello        initialDelaySeconds:0periodSeconds:30failureThreshold:5successThreshold:1timeoutSeconds:5readinessProbe:enable:truetype: TCP        scheme: HTTP        port:8080path: /hello        initialDelaySeconds:0periodSeconds:30failureThreshold:5successThreshold:1timeoutSeconds:5# 集群内service/服务定义，须指定服务的端口和映射的pod端口，不建议分机房配置service:-portName: main    port:80targetPort: main  # 环境变量，支持多个，以数组形式添加envs:-name: port    value:8080-name: MAIN_PORT    value:'8080'# 服务暴露方式，type可填写可选bgw或none，不建议分机房配置# bnsType，可选ENS或noneingress:type: BGW    bnsType: ENS  # 日志收集开关以及日志路径配置，不建议分机房配置log:type: EFK    enable:truefiles:- /home/log/accesslog  # 监控基础指标的采集开关，不建议分机房配置monitor:enable:truetype: noahee  # 配置文件的引用，支持从应用程序的代码库或chart库引用配置文件# codePath字段标识配置文件来源代码库or chart库，为代码库地址# confPath 为配置文件在代码库中的具体路径# containerPath为配置文件在容器中的挂载路径configs:configType: reference    reference:-codePath: baidu/health/budweiser      confPath: /conf_online/      containerPath: /home/work/budweiser/conf/    -codePath: baidu/appspace-test/charts      confPath: /budweiser/conf_online/      containerPath: /home/work/budweiser/conf_online/# 说明，以上为系统默认配置项# command以及args为用户自定义参数，不需要放在appspace结构下，直接添加即可。command:- /bin/shargs:--c- cd /home/app123 && ./bin/app123
```

## 5、CPU单位

更新时间：2023-02-27

### CPU单位换算

常见用法：1vCPU=1虚拟机标准核=15归一化核=×个物理核。

### CPU归一化问题背景

随着公司的快速发展和机器硬件的更新换代，公司目前的各个机房中，存在不同时期的多种 CPU 型号，而其性能的差异逐渐暴露出一些问题，主要包括：

- 在进行资源分配时，无法充分利用高配置机型，导致一定的资源浪费；
- 在进行资源预算时，无法评估高配置机型和低配置机型之间的折算方式；
- 在进行资源结算时，无法准确计算高配置机型和低配置机型之间的账单差异

### CPU 归一化的基本原理

使用系统部发布的 [CPU 归一化表](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/Jk_2Ea1IJe/bxHz8Xb0eb/vH6gf9ne1qGq2H)，根据 Node 节点实际的 CPU 型号、HyperThread、Turbo 开关配置，计算得到 Node 对应的归一化核数，并在创建 Pod 时声明归一化核需求，使用归一化核进行调度。

### 不同集群类型的CPU单位

| 集群类型                   | CPU单位  |
| -------------------------- | -------- |
| EKS native CCE(自运维CCE） | vCPU     |
| EKS CCE                    | 归一化核 |
| EKS ECI                    | 归一化核 |

## 6、环境变量

更新时间：2023-01-09

### 环境变量清单

Appspace在容器环境中默认提供以下环境变量，用户可以在代码中直接使用

- APPSPACE_IDC_NAME： 机房的名称，例如bjdd、gzbh、szth
- APPSPACE_Pod_IP：pod ip地址
- APPSPACE_Pod_NAME： pod名称
- APPSPACE_NAMESPACE：namespace名称
- APPSPACE_ENS_GROUP_NAME/APPSPACE_BNS_GROUP_NAME： CNAP提供的该环境的bns group名称，如group.appspace-test-demo-dev.K8S.all
- APPSPACE_MAIN_PORT：名称为main的端口，通常在values文件中定义
- ENS_LIDC：用于ENS的逻辑机房名称，例如hbe
- ENS_PIDC：用于ENS的IDC名称，其值等同于APPSPACE_IDC_NAME，例如bjdd
- ENS_PRODUCT：用于ENS的产品线名称，当前为固定值default
- ENS_HOST_ADDRESS：用于ENS的pod ip地址，等同于APPSPACE_Pod_IP
- MATRIX_RESOURCE_CPU_PHYSICAL_CORES: 容器分配到的百度智能云度厂版CPU标准核数
- MATRIX_RESOURCE_CPU_CORES: 容器分配到的百度智能云度厂版CPU归一化核数（=标准核*15）

### 已存在的环境变量

针对历史代码中已经存在的环境变量，如果不想替换新的变量名，可以使用将A环境变量赋值给B环境变量的方法，实现无缝对接。

比如，历史代码中有一个ENS_IDC的环境变量，想要Appspace提供的ENS_LIDC的取值，进行如下配置

values-*.yaml

```
envs:-name: ENS_IDC
    value:'$(ENS_LIDC)'
```

运行时表单配置方式

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3276062ac78a4360b127aeadee9c81e5&docGuid=og056HSDIxxj7R)

# 5、部署

## 部署策略

更新时间：2023-03-29

### 1、部署方式介绍

CNAP基于argo rollout搭建了CD模块，提供以下发布方式。

**1.1 滚动部署/基于滚动更新的全量部署**

滚动部署是 Kubernetes 中的默认部署策略。它用新版本的 Pod 一个一个地替换我们应用程序的先前版本的 Pod，而没有任何集群停机时间。滚动部署缓慢地用新版本应用程序的实例替换之前版本的应用程序实例。

如下两个参数可用于调整滚动更新的粒度：

maxSurge：更新期间可以创建的 Pod 数量超过所需的 Pod 数量。支持绝对数量或百分比。默认值为 25%。

maxUnavailable：更新过程中可能不可用的 Pod 数。支持绝对数量或百分比。默认值为 25%。

> 优点：
> 1、用户无感知，平滑过渡；
>
> 2、节约资源。
> 缺点：
> 1、部署时间慢，取决于每阶段更新时间；
>
> 2、流量会直接流向已经启动起来的新版本，如果发现了问题，也比较难以确定是新版本还是老版本造成的问题。。
> **1.2 金丝雀部署**

金丝雀发布的思想是将少量的请求引流到新版本上，因此部署新版本服务只需极小数的机器。验证新版本符合预期后，逐步调整流量权重比例，使得流量慢慢从老版本迁移至新版本，期间可以根据设置的流量比例，对新版本服务进行扩容，同时对老版本服务进行缩容，使得底层资源得到最大化利用。

如图，某服务当前版本为 v1，现在新版本 v2 要上线。为确保流量在服务升级过程中平稳无损，采用金丝雀发布方案，逐步将流量从老版本迁移至新版本。

> 优点：
> 1、按比例将流量无差别地导向新版本，新版本故障影响范围小；
> 2、发布期间逐步对新版本扩容，同时对老版本缩容，资源利用率高。
> 缺点：
> 1、流量无差别地导向新版本，可能会影响重要用户的体验；
> 2、发布周期长。
> ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3b99c6ddcd76421599704b3b6eea6ccf&docGuid=C0wmESd6-fS-7-)
> **1.3 蓝绿部署**

蓝绿发布需要对服务的新版本进行冗余部署，一般新版本的机器规格和数量与旧版本保持一致，相当于该服务有两套完全相同的部署环境，只不过此时只有旧版本在对外提供服务，新版本作为热备。

当服务进行版本升级时，只需将流量全部切换到新版本即可，旧版本作为热备。由于冗余部署的缘故，所以不必担心新版本的资源不够。如果新版本上线后出现严重的程序 BUG，只需将流量全部切回至旧版本，大大缩短故障恢复的时间。待新版本完成BUG修复并重新部署之后，再将旧版本的流量切换到新版本。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=640c0227193a4aff813c583334f98178&docGuid=C0wmESd6-fS-7-)

> 优点：
> 1、部署结构简单，运维方便；
> 2、服务升级过程操作简单，周期短。
> 缺点：
> 1、资源冗余，需要部署两套生产环境；
> 2、新版本故障影响范围大。

### 2、默认生成的部署策略

系统默认为每个环境生成了对应的部署策略，其中包含机房的编排和分级发布规则。您可根据实际的业务发布需求，基于此进行自定义调整。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f243e6e1c06547d79ecb79304c316310&docGuid=C0wmESd6-fS-7-)
系统提供的默认策略如下：

| 环境                  | 逻辑机房编排       | 分级发布规则 |
| --------------------- | ------------------ | ------------ |
| 生产环境              | 串行（单个机房）   |              |
| 串行+并行（多个机房） | 金丝雀部署 1%-100% |              |
| 测试环境              | 串行（单个机房）   | 全量部署     |

#### 2.1 修改部署策略

点击列表中的编辑，可对所选策略进行自定义配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=97f47c8edbff462c93b87406efa53c92&docGuid=C0wmESd6-fS-7-)
**2.1.1 选择部署方式**

可根据业务需求，选择需要使用的部署方式。

**2.1.2 修改集群**

在部署策略中，可以选择需要部署的集群，需要注意的是：

- 可选集群，为当前环境绑定的集群（可在【环境】页查看）；
- 测试环境目前仅支持使用一个集群（此为平台限制，如有线下环境部署多集群的需求，可提需求给CNAP同学）
- 测试环境如需换集群，须先清除原有集群上所有的部署资源，再在部署策略中勾选新的集群。（清除资源操作方式：在【运行时】-【工作负载】页点击`删除部署资源`按钮，选择不需要使用的集群，等待几分钟后将会删除集群上创建的所有实例、deployment等资源）
- 生产环境可选择多个集群：新增集群时，默认仅部署实例，不接流量，需要在部署完成后，在【运行时】-【服务】页点击`接流管理`按钮操作切流。
- 生产环境不需要使用某个集群时，同样须清除部署资源后才可取消勾选。

**2.1.3 集群编排**

支持的集群编排方式包括：

- 串行：所有集群串行部署，依次更新；
- 并行：所有集群同时全并发部署；
- 串行+并行：先串行部署一个或多个集群，再并行部署其他所有集群。

**2.1.4 分级规则**

需要特别说明的是：分级规则定义的是**每个集群**的更新过程。 通过分级规则可以实现：

- 滚动更新：选择全量部署即可，默认会滚动部署；
- 金丝雀部署：先部署1%或1个实例，人工确认新版本无误后，再部署到100%实例。
- 自定义分级规则：可以自定义分成多少级，以及每级部署的实例百分比，是一种更加自定义的金丝雀发布。

**2.1.5 人工确认**

开启后，完成前述操作将会暂停，等待人工确认后才继续后面的部署。

用于部署过程中的新版本检查，以减少因新版本问题对业务造成的影响。

## 构建打包

更新时间：2023-03-29

构建打包功能支持手动构建(相比于流水线的自动构建而言），完成程序代码的编译、镜像构建，然后将镜像与运行时配置打包，之后可将所得的包部署到指定环境中。

### **包版本列表**

列表展示：包版本，应用程序代码分支和commitID，构建状态，构建触发时间，构建耗时，操作人以及查看日志和部署操作入口。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e1cdcb31c5ed403a97b52967ee74c05d&docGuid=qJKB60Wxex3Z-k)

### 新增构建

点击新增构建按钮，打开如下所示弹窗。

一个完整的应用，包含应用程序代码，和应用的配置（代码）两部分内容。因此构建时，须选择

```
- 应用代码的分支和commit信息 ；      - 运行配置的分支和commit信息；
```

复用：指镜像复用，默认选择上次更新代码时，构建所得的包。

镜像是程序代码编译构建产生的，当应用的程序代码无改动，仅更新了运行时配置的内容时，可以复用上次构建所产生的镜像，此操作可以节省构建时间。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f4f2a461b45c4c049ab3eba76b826122&docGuid=qJKB60Wxex3Z-k)
执行构建后，可查看构建日志。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=fbf4deb581fc413b8534e479b83fcacc&docGuid=qJKB60Wxex3Z-k)

### 构建部署模型

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=181575fb03c541889443b77bdbd3d713&docGuid=qJKB60Wxex3Z-k)

## 部署

更新时间：2023-03-29

### 1、部署前置操作

```
- 更新程序代码- 更新构建配置（可选）- 更新[运行时配置](https://cloud.baidu-int.com/icloud/Appspace/操作指南/运行时配置/运行时配置)（可选）- 修改部署策略（可选）- [构建打包](https://cloud.baidu-int.com/icloud/Appspace/操作指南/部署/构建打包)
```

### 2、部署

方法一：使用流水线进行部署

在正常的软件研发和交付过程中，您可通过提交CR触发持续交付流水线的执行，以实现代码提交到持续集成、持续测试、持续部署的完整流程。

方法二：使用手动部署

对构建所得包，点击部署，将其部署到一个指定环境中。

### 3、部署记录

进入【部署】菜单，可查看所有的部署记录。 包括：部署时间、部署状态、操作人、包版本、部署的机房、变更类型等。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=24534878c61848a8b803fedfe70afaa8&docGuid=ctbmWahYCVtO9K)

### 4、部署详情

在部署记录列表，选择一个部署记录，点击`查看详情`，可以打开部署详情页。

需要说明的是：当前仅最新一次的部署会显示实例详情，已完成的部署未保存当时的实例信息。

4.1 变更内容

变更内容tab页，显示当前变更包含的代码变更信息，包括：

- **chart版本**：显示本次部署的包版本和线上最近一次部署的包版本。
- **代码变更**：代码变更列表显示本次变更包含的代码提交内容，包括提交人、commitID、评审主题，点击commitID可以打开当前commit的代码diff页，查看具体更新内容。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=38ef75cd4aa54e619379394f67faee21&docGuid=ctbmWahYCVtO9K)
4.2 部署进度

部署详情tab页，顶部为所部属的集群，可点击进行切换，查看各个集群的部署进度。

内容包括：当前所选集群的部署进度、新旧实例的展示、部署过程概览及部署日志。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=68247e63630141b1a86ef70c6abff715&docGuid=ctbmWahYCVtO9K)
点击实例色块，可以查看每个实例的状态、事件及日志。当实例色块飘红时，可查看实例详情中的事件和日志帮助定位异常。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=af24ede1b68249fdb2569df123898719&docGuid=ctbmWahYCVtO9K)
4.3、部署日志

部署日志tab页显示部署插件的执行情况，可查看部署具体的执行过程，以及失败时的提示。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=295b44ee497840e8b6a016627b45e4b3&docGuid=ctbmWahYCVtO9K)

### 5、回滚

在部署记录列表或部署详情页，点击“回滚”按钮，可默认回滚到当前部署记录的版本。

需要说明的是：当前回滚时，统一使用全机房并发、全量滚动更新的部署策略。（如有自定义部署策略的需求，可提需求给CNAP同学）

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=fe93616b882b41c5b7dff5127567bb8a&docGuid=ctbmWahYCVtO9K)

## Pod生命周期说明

一站式目前使用Deployment/Argo-Rollouts、CloneSet、InplaceStatefulSet、InplaceStatelessSet、CronJob管理Pod的。

Pod由负载进行管控，主要分为有状态、无状态两种管理方式。

### Pod更新流程

**无状态应用Pod更新状态**

无状态负载主要有:

- 无状态应用: Deployment、Argo-Rollouts
- 原地无状态应用: InplaceStatelessSet
- 原地无状态应用: CloneSet

针对无状态负载，Pod变更遵从两个配置项：最大不可用和最大可超出。具体流程如下

[流程图]

**有状态应用Pod更新状态**

有状态负载目前K8S原生负载类型StatefulSet还未正式支持。一站式目前仅支持有状态负载InplaceStatefulSet。

有状态与上图类似，但是不在先超出副本数创建Pod，而是直接销毁旧Pod到最大不可用，之后滚动更新。

### Pod生命周期

Pod生命周期分为容器间生命周期、容器内生命周期：

**容器间生命周期**

容器分为initContainer、container两种:

initContainer之间串行进行，一个容器结束后开启下一个容器。

container之间并行，无先后关系

[流程图]

**容器内生命周期**

容器内生命周期比较复杂，正常情况下一个容器运行受到3类探针、preStop脚本综合控制。如下图：

[流程图]

注意：evicted，宿主机异常摘除，等流程不会经过PreStop。

## 上线通知

更新时间：2022-10-28

### 通知方式说明

CNAP平台的部署进度通知，将通过如流群中的机器人——**DevOps小助手**自动发出。

前提是1）须在CNAP平台绑定群号；2）在如流群中添加机器人**DevOps小助手**。

### 通知接收配置

（1）通知群配置

创建账户时填写的如流群，将用于接收上线过程中的进度通知以及人工确认、部署失败等消息。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b39c3cb0ad0a467ba78b0a9edca7bf93&docGuid=O3gXvesx2dVLV4)
（2）查看通知群

在【账户】-【基本信息】页可以查看所配置的如流群号。

目前还不支持编辑，如有变更需求，可先联系值班同学修改（5602724）。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5b39a53efe384f458d1b935bc73b0859&docGuid=O3gXvesx2dVLV4)
（3）群机器人配置

检查如流群中是否添加了DevOps小助手，如没有，须联系群管理员操作添加。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=17e824e89b934b7fa91b9feb0bf4ee88&docGuid=O3gXvesx2dVLV4)
（4）订阅appspace消息

打开上图devops小助手，订阅一站式消息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a6301d831c5843a7b089b174a3b43b3d&docGuid=O3gXvesx2dVLV4)

### 上线通知事件类型

| 通知事件         | 通知内容/图示                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 开始上线         | ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=df2cb866f11b43cda36e07ef2621645f&docGuid=O3gXvesx2dVLV4) |
| 待人工确认       | ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6810942dd78e404b8b32fc48250a7afb&docGuid=O3gXvesx2dVLV4) |
| 部署终止         | ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ff55817e886a4a21a3f3a6279c9644f0&docGuid=O3gXvesx2dVLV4) |
| 串行集群部署完成 | ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c1506e5ce4d84eae8cf5f3058812c44b&docGuid=O3gXvesx2dVLV4) |
| 并行集群部署完成 | ![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d9e9e9456bc044d9b836802bd6e9b70f&docGuid=O3gXvesx2dVLV4) |

## 上线审批

更新时间：2022-11-01

上线审批功能支持创建审批策略，在审批通过后才可发起上线操作。 目前仅生产环境支持。

### 创建审批策略

**注意：在某一环境下，每个应用最多仅可创建一条正常审批和一条紧急审批策略。**

在【账户】-【审批策略】页面，可以点击`新增审批策略`按钮，打开创建审批策略的弹窗。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=de8cad9f1d164e81be4a469a694f4f83&docGuid=WqRqeq_k8PdKma)
配置审批策略，需填写以下信息：

- 策略名称：自定义审批策略的名称；
- 类型：支持正常审批和紧急审批两种类型，其中紧急审批用于上线封禁期间的紧急上线。
- 审批人：可添加多级审批人，每级可添加多个人；
- 生效环境：默认仅支持生产环境；
- 生效应用范围：可对全部应用添加相同的审批策略，也可对不同的应用配置不同的审批；
- 生效应用：选择具体生效的应用。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1321e3f7cf04489b9111fe23e63345d3&docGuid=WqRqeq_k8PdKma)

### 发起上线-手动部署

对于需要进行上线审批的应用，通过手动部署发起上线，在选择生产环境后，会展示已配置好的审批策略。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=042a03d6c33e4c85bb8d6b2d6576ff4f&docGuid=WqRqeq_k8PdKma)
点击`确定`按钮后，会生成对应的部署记录，并可查看审批详情。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=52759eca88d240c89827739563b20cca&docGuid=WqRqeq_k8PdKma)
审批详情页面。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1848cb63661d45fb8e4ed8c17370e2a7&docGuid=WqRqeq_k8PdKma)
上线审批操作已接入BPM平台，发起上线审批后，审批人会收到APPROVAL服务号推送的消息，在如流上可直接操作确认或拒绝，也可查看审批详情。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=8ec0db29cbab48608e3c971bc65a89b2&docGuid=WqRqeq_k8PdKma)

### 发起上线-流水线部署

待补充。

## 上线封禁

更新时间：2022-11-01

对于节假日或特殊原因下不允许上线的情况，可通过添加封禁策略加以控制。

- 封禁开始后，正在进行的部署、回滚将不受影响继续执行。
- 封禁期间，所有人不可执行部署、回滚等操作，如有特殊情况必须上线，可发起紧急审批流程。

### 新增封禁策略

入口：【账户】-【上线封禁】

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=4493ecbb811b4fbda6f2b3ff2070838b&docGuid=KJPOTfnVRpno2m)
配置项说明： 策略名称：自定义封禁策略的名称； 策略描述：添加描述说明； 生效环境：仅支持生产环境； 生效应用范围：可选全部应用，也可指定应用； 封禁时间：可配置一段固定的时间实现一次性封禁；也可配置周期性循环的时间实现周期性封禁。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c30eca2ba61e4d9fb99b36ad7a17aa13&docGuid=KJPOTfnVRpno2m)

### 封禁期上线-手动部署

当应用处于封禁期时，生产环境上线时，手动部署弹窗会增加相关的提醒。

且上线审批策略，需要配置紧急审批，如果没有紧急审批，则不可发起上线。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=084372c450544138979e4c5abc0f0d70&docGuid=KJPOTfnVRpno2m)

### 封禁期上线-流水线部署

待补充。

### 封禁期回滚

当封禁期执行对生产环境的回滚，会弹窗提示不可操作，需要通过紧急审批流程后才可上线。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6cb1d78c76db4ad1a53c72e037927101&docGuid=KJPOTfnVRpno2m)

## 上线描述

更新时间：2023-09-22

现已支持在流水插件部署及CNAP页面部署时添加上线描述信息

### 流水线插件部署

目前"**一站式线下环境部署**"及"**一站式生产环境部署插件**"支持添加上线描述, 具体操作如下

1. 进入流水线配置页, 找到相应的插件所在阶段点击阶段配置按钮点击

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7206195d68f4447cbf11a3b435d8cd98&docGuid=HoE3fHNLfdH3Pn)
2. 将阶段触发方式设置为**手动触发**, 以便执行到相应阶段时能填入描述信息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1f5898a6a46c4c758f200a04591ad4e7&docGuid=HoE3fHNLfdH3Pn)
3. 点击**新增参数**, 增加一个自定义阶段参数, 并记住您定义的**参数名**

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2db92c1c226c4440aace85f64b857895&docGuid=HoE3fHNLfdH3Pn)
4. 点击插件配置插件信息, 在"**上线描述**"内填入刚刚定义的参数名, 格式为:${参数名}

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2659040bf00f4e34a1e830a9a55cb635&docGuid=HoE3fHNLfdH3Pn)
5. 流水执行到阶段时, 会等待手动执行, 在弹出的对话框, 找到阶段参数, 填入上线描述信息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=083b6df8dfdc4e2caf9f7ce1ecf28798&docGuid=HoE3fHNLfdH3Pn)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1d7921d1ead145f3a9213f50c514bb5c&docGuid=HoE3fHNLfdH3Pn)

### CNAP页面部署

CNAP部署页面触发部署时, 可以填入上线描述信息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=da2955ecd1f148cd814a2820810f0619&docGuid=HoE3fHNLfdH3Pn)

## 部署打散

**EKS2.0集群**

此类集群CNAP提供一键配置, 操作流程如下:

运行时配置 --> 调度 --> 修改单机副本数

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=59925581f1744ece855c08f9bb6ef693&docGuid=-SossdrMNlt1iT)
**非EKS2.0集群**

可通过extension自行添加topologySpreadConstraints 详情: [https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/topology-spread-constraints/](https://kubernetes.io/zh-cn/docs/concepts/scheduling-eviction/topology-spread-constraints/)

```json
apiVersion: apps.baidu.com/v2
kind: StatefulSet
spec:
  template:
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: "kubernetes.io/hostname"
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: {{ .Chart.Name }}
```

# 6、数据配送

## 什么是数据配送

更新时间：2022-10-14

概念参考：[http://devops.baidu.com/new/datadist/index.md](http://devops.baidu.com/new/datadist/index.md)

数据配送系统相当于B2C中的快递，将数据从生产者（源模块）按照使用者的要求快递（配送）给消费者（目标模块）。

### 使用场景

当您的业务使用了mis数据流，数据更新后需要传输/更新至线上。CNAP平台提供了数据配送的能力，对接MIS平台，能够将更新后的数据配送并生效。

### 使用流程

涉及到的平台：MIS、CNAP

1、用户在MIS配置数据流，完成数据注册

2、用户在CNAP上进入目标应用，启用数据配送，创建配送策略

3、在MIS上更新数据源，产生新的数据版本

4、MIS数据源的更新，会自动触发CNAP的数据配送，针对更新数据源的配送策略，产生一条配送任务

5、在CNAP上可以查看任务的记录和详情，可以终止、或回滚本次配送

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ddce8bef42cc41ef93672206edf36078&docGuid=phQFQvxr-n0b-r)

### 名词解释

| 名词                                                                                                                                     | 说明                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MIS                                                                                                                                      | **MIS能干什么**：MIS管理数据，管理数据信息，管理数据历史版本，对数据监控，对数据做处理。MIS只跟数据本身相关。一句话概括，MIS是数据正确地的引入到MIS系统中并做相应处理，任务结束。 |
| **MIS不能干什么** ：数据的分发不是MIS做的；MIS只是与noah的数据配送（提供noahkey），与自动化运维合作，能够对用户透明地实现数据分发。      |                                                                                                                                                                                   |
| 用户文档参见：[http://wiki.baidu.com/pages/viewpage.action?pageId=70935587](http://wiki.baidu.com/pages/viewpage.action?pageId=70935587) |                                                                                                                                                                                   |
| 数据项                                                                                                                                   | MIS中「本地数据名称」。                                                                                                                                                           |
| 配送策略                                                                                                                                 | 一个配送策略，描述了将一个数据项，配送到线上的规则。一个应用可以创建多个配送策略。包括：数据源、版本、配送地址、下载过程说明、机房编排和分级生效规则定义等等。                    |
| 配送任务                                                                                                                                 | 一个配送策略，触发一次配送，即产生一个配送任务，可以理解为配送记录（类似部署记录）。配送任务应支持查看配送的详情，并可执行跳过、重试、阶段终止、任务回滚等操作。                  |

## 功能介绍

### 1、功能开关

数据配送功能默认处于未启用状态，如需使用该功能，可在【账户设置】-【功能开关】页开启。

开启数据配送功能后，左侧菜单增加【数据配送】。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_a010584.png)

### 2、创建配送策略

配送策略主要配置要配送的环境及配送规则，不同数据项可以使用相同的配送策略，只需在数据项中绑定对应的策略即可。

在【配送策略】页面，点击新建配送策略，打开如下弹窗。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_42a8899.png)
各配置条目说明如下：

| 配置项       | 说明                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 配送策略名称 | 自定义配送策略的名称                                                                  |
| 所属环境     | 选择配送策略生效的环境                                                                |
| 并发度       | 配送过程中每次并发更新多少实例，可以按实例个数或实例百分比进行设置。                  |
| 集群编排     | 设置配送时各集群的串并行顺序。                                                        |
| 分级规则     | 可以分级配送，可选项为0-1%-100%、0-100%、自定义。选择自定义时，可自定义配置分级策略。 |
| 任务步骤     | 设置每一步分级配送的实例百分比，以及是否需要人工确认。                                |
| 报警通知     | 可开启报警，在数据配送失败时，通过服务号或邮件的形式，通知报警信息。                  |

配置完成后，保存。

### 3、创建配送项

在【配送项】页面，点击新建配送项，打开如下弹窗。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_aa1b633.png)
各配置条目说明如下：

| 配置项                                                                                                                                                                                          | 说明                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 名称                                                                                                                                                                                            | 自定义配送项的名称                                                                                                 |
| 配送策略                                                                                                                                                                                        | 选择要使用的配送策略                                                                                               |
| 数据项                                                                                                                                                                                          | 数据项名称须与MIS中「本地数据名称」字段的值保持一致。                                                              |
| 注意：数据项是关联MIS数据源与CNAP数据配送的关键字段，须确保填写无误。                                                                                                                           |                                                                                                                    |
| 数据源                                                                                                                                                                                          | MIS上的数据源地址。                                                                                                |
| 注意：策略创建完成后，可以通过`部署`立即触发一次配送，前提是需要手动填入数据源和版本。如创建策略时不填数据源和版本，将会在下次MIS平台数据源更新时，触发一次配送，同时自动更新并填入这两个信息。 |                                                                                                                    |
| 版本                                                                                                                                                                                            | 数据源的版本。同数据源，策略创建时选填。                                                                           |
| 配送地址                                                                                                                                                                                        | 填写数据被配送到容器中的具体地址。                                                                                 |
| 注意：须确保地址存在，否则首次配送会失败。如地址不存在，将会在应用部署后生效地址，后续才可正常配送。。                                                                                          |                                                                                                                    |
| 生效方式                                                                                                                                                                                        | 热加载：不重启容器直接加载最新版本数据，数据加载结果将以通知形式发送，可以设置通知中包含的参数，如数据项、版本等。 |
| 选择热加载时，可以配置通知方式、地址以及通知包含的参数。                                                                                                                                        |                                                                                                                    |
| 前置命令                                                                                                                                                                                        | 数据生效前执行的命令。                                                                                             |
| 后置命令                                                                                                                                                                                        | 数据生效后执行的命令。                                                                                             |

配置完成后，保存。

### 4、触发配送

触发配送的场景包括：

- 部署触发：配送策略创建完成后，每次部署应用，会自动触发一次配送，该情况下的配送目前并未展示其任务记录；
- MIS更新：更新MIS上的数据源后，会自动触发CNAP上对应数据项的配送；
- 回滚配送：对配送记录进行回滚操作时，将会重新配送旧版本。
- 扩容：扩容时，新部署的实例会自动配送最新的数据版本（无配送记录）。

### 5、查看配送任务

在配送任务页，可以查看每一次触发产生的配送任务记录。

列表展示配送任务的状态、ID、所属环境、配送的数据项、版本、所属策略、配送时间和触发人以及可执行的操作。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_5220ceb.png)
选择一个配送任务，可查看其配送详情。

基本信息页展示配送的数据源地址、版本等内容。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_b2118db.png)
任务详情页：

- 左侧展示配送的集群，包括集群配送状态、配送的实例个数、以及各集群之间的关系；
- 页面右侧展示每个集群的配送详情，包括分级规则、每个分级步骤的配送状态、每个实例的配送时间、结果、日志等信息
- 实例列表右上方可根据实例状态进行筛选，还可查看整体的配送日志，帮助排查配送过程中出现的问题。

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_a3f2375.png)

# 7、应用运维

## 运行时

更新时间：2022-10-25

### 运行时是什么？

运行时指应用运行过程中，各个层面的运行状态以及数据反映。 主要包括工作负载、服务、日志、k8s事件 等内容。

### 工作负载

1）集群选择：左上方展示集群的切换选项，集群前面的色块标识集群的运行状态——运行中（绿色）、部署中（黄色）；

2）工作负载的基本信息：包括可用副本数与期望副本数、负载类型（deployment类型的负载资源，部署后类型统一展示未argo rollout)、更新时间、deployment资源的yaml、最近部署时间及部署结果、namespace、创建时间及创建人。

3）实例列表：显示当前工作负载下的所有pod列表。

- 状态筛选：可按状态选择pod；
- pod搜索：可搜索pod IP；
- 批量删除：可以批量删除重建pod；
- pod概览：包括pod名称、状态、所属集群、包版本、Pod IP、重启次数、CPU和内存的使用情况、创建时间、流量接入情况；
- pod操作：可选择一个pod后，执行webssh登录、查看标准输出日志、重建pod、屏蔽流量、查看yaml、复制CLI命令等操作。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=33ef9c7206ea43ccb23587e6fcc3ea49&docGuid=xbZzZUlHFc60jb)
**容器信息**

在pod列表，点击pod名称，可进入下钻页，查看pod上的容器信息。

容器列表：展示容器的镜像、名称、状态及重启次数、端口等信息;

容器配置：包括容器的存储挂载、环境变量、启动命令等。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e3388ee3253c49d8861d0adbecd42833&docGuid=xbZzZUlHFc60jb)

### 服务

服务页展示集群间服务调用的相关信息，和集群内服务调用的配置。

**集群间服务调用**

**（1）BGW/VIP**

展示VIP的启用状态，VIP信息，及其使用的端口。

vip基于bns group生成，首次部署成功后，大概需要5分钟生成；一旦vip生成后，后续部署将不再创建新的vip而只同步实例（pod），同步延迟约5分钟。

当vip创建失败时，可在页面点击`重试创建`，手动请求重新生成VIP。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=55cb5d6292324676b7e9601b29a59493&docGuid=xbZzZUlHFc60jb)
**（2）BNS**

[BNS](https://cloud.baidu-int.com/icloud/ENS/%E4%BA%A7%E5%93%81%E6%8F%8F%E8%BF%B0/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0/)提供服务名称到服务所有运行实例的映射，用于满足服务交互中常见的资源定位、流量调度以及其他任何依赖于这些信息的开发、测试和运维需求。

当BNS开启后，页面将展示以下信息：

- 向调用方暴露的 BNS GROUP
- 数据库授权使用的 BNS GROUP
- ENS服务单元：包括 是否接流的状态展示，以及BNS service内容

**接流管理**

接流管理功能，支持人工操作完成集群粒度的流量控制。

- 新集群首次部署时，为防止流量有损影响业务服务，默认在部署过程中不执行切流操作，需要部署完成后，人工操作开始接入流量；
- 当有集群不再使用需要下线时，也可先关闭流量，观察服务是否正常，确认无误后再删除资源上的资源；

### 标准输出及应用日志

标准输出：支持切换pod和容器，查看容器的标准输出日志。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=9936377411164245ba04e0d40dce2eb6&docGuid=xbZzZUlHFc60jb)
应用日志：显示所配置的应用日志采集路径以及日志查看入口，可以点击跳转打开kibana查询应用的日志。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=16d1a66856194b188992e9b0a218f5e2&docGuid=xbZzZUlHFc60jb)

### 事件

显示该应用所包含的service、deployment、pod等资源产生的k8s事件。

当部署失败或服务异常时，可通过查询事件排查可能的原因。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=8dae73f537de4736ba4ef767cd084a4f&docGuid=xbZzZUlHFc60jb)

## 服务暴露

6月中更新说明

从6月中开始，CNAP将逐步上线对ENS创建和接流管理的逻辑优化，期间如遇任何与ENS相关的问题，请及时联系相关RD同学（longqiuyun、xiezhida）排查处理。

此番ENS相关优化的主要目的是：

- 将ENS相关配置，从运行配置中解耦，独立于部署流程之外进行管理，以避免因部署异常影响线上服务的流量状态；
- ENS创建及接流管理等操作完全交由用户手动配置，逻辑更加清晰，安全性更高；

### 1、ENS配置

优化后，ENS相关的配置存在以下变化：

- 新建应用时**不再默认生成所有的bns group**，须在部署完成后手动配置生效；
- **运行配置**中不再支持配置ENS和VIP的开关，须在部署完成后手动配置；

1.1 功能入口

包括ENS开关、VIP开关、bns group及ens service的配置，统一收敛到【运行时】-【服务暴露】页面的【ENS管理】操作中，不管是首次开启还是后续的更新，都须通过该入口进行。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c12998aebedb421f945640e9a8ff0050&docGuid=a2uc1Xtghbxe2s)

![BNS/ENS及VIP的使用逻辑](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a5ebaea371184f7faa6d482b568377b4&docGuid=1u7DXQV8yTZXbh "BNS/ENS及VIP的使用逻辑")
1.2 配置时间

首次配置

应用的接流/服务暴露管理，必须在应用部署完成后，进行手动开启和配置。

有集群变更时

- 当增加一个集群并成功部署后，可通过【ENS管理】页面创建新增集群的ENS service及接流状态；
- 当需要删除一个集群的ENS service时，可通过【ENS管理】页面操作删除，需要注意的是，删除ENS service是高危操作，可能造成流量损失，操作前需要谨慎确认；

1.3 ENS管理操作说明

**1）ENS开关**

点击打开【ENS管理】页面，默认BNS类型选中的是【无】，即未配置状态。

如需使用ENS ，可选中ENS选项。在使用ENS时，可选是否同时启用VIP。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=41e151d92d0a49b9b80bd8f00ab0972e&docGuid=a2uc1Xtghbxe2s)
**2）BNS group配置**

- 首次配置时，默认展示的bns group为系统即将生成的默认项，如无特殊需求，可不作调整，直接使用默认bns group；
- 可以点击添加新的bns group；
- 也可点击删除一行，需要注意的是，删除bns group是高危操作，可能造成流量损失，操作前需要谨慎确认；
- 直接修改bns group也是高危操作，建议不要直接在原bns group信息上进行修改；

如已有使用中的bns group，强烈建议【先添加并提交生效新的bns group】→【再删除不需使用的旧bns group】（仅首次配置可以直接修改，因为首次保存前bns group还未创建），以防因bns group信息删除造成的流量损失。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=dd116b02834548a08004c5bd428d53f6&docGuid=a2uc1Xtghbxe2s)
**3）ENS service配置**

ENS service需要在应用部署完成后，对每个集群进行添加和配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=4769080d49de46d49ddcfa6572c9e058&docGuid=a2uc1Xtghbxe2s)
如图所示，添加集群后，将会默认展示其ens service信息：

- ens service名称
- ens service状态：ens service生成后才会展示具体状态，首次添加时（未保存则未实际创建）将会展示null；
- 是否加入bns group：此处将会展示全部bns group的信息，及接流状态，加入bns group意味着将ens service挂载到对应的bns group下，流量路由可通过bns group访问。
- 高级配置
  - 同步EKS tags：创建的ens service是否要同步eks tag，默认会同步；
  - ignore Terminating：忽略Terminating状态的pod，表示terminating状态的pod将不会接流。默认忽略；
  - pod Ready：是否当pod状态为Ready才可以接流，默认是；
  - 运行账户：默认使用work，特殊情况可自行修改；
  - 端口名称：ens service使用的端口，默认使用main端口，如有需要可自行修改；
  - tag：ens service的tags，可自行编辑；

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7b820e83f12d4b89a3db6c0dbef237c2&docGuid=a2uc1Xtghbxe2s)

### 2、优化前后对比

|                       | **优化前**                                                                                                                                                             | **优化后**                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| bns group创建         | 应用初始化/新建应用时，系统默认为所有环境生成其bns group。存在问题：可能会创建出许多不需要的bns group，造成资源浪费；同时还可能触发bns group的接口限流，影响应用创建。 | 当应用部署完成后，在【运行时】-【服务暴露】-【ENS管理】中按需添加和生成。                                         |
| 仅新增bns group       | 不支持。                                                                                                                                                               | 在【运行时】-【服务暴露】-【ENS管理】中配置。                                                                     |
| 编辑bns group         | 在【运行时】-【服务】页，提供了独立的编辑入口。                                                                                                                        | 在【运行时】-【服务暴露】-【ENS管理】中可统一配置。                                                               |
| 删除bns group         | 不支持。                                                                                                                                                               | 如不需使用某个bns group，可在【ENS管理】中操作删除。需要注意的是，删除bns group可能会造成流量损失，需要谨慎操作。 |
| ens的启用             | 在【运行配置】中配置，须构建打包、部署后生效。存在问题：与部署流程耦合在一起，如果部署异常，则会影响流量管理的状态，导致服务流量有损。                                 | 应用部署完成后，在【运行时】-【服务暴露】-【ENS管理】中手动配置。后续的更新也将直接修改k8s集群中的线上信息。      |
| 接流管理              | 在【运行时】-【服务】-【接流管理】中可以按集群粒度修改其接流状态（加入bns group即表示接流）。                                                                          | 应用部署完成后，在【运行时】-【服务暴露】-【ENS管理】中手动配置。                                                 |
| 新增集群的ens service | 新集群部署时，会自动为其创建ens service。                                                                                                                              | 新集群部署完成后，须在【ENS管理】中手动配置。                                                                     |
| 删除集群的ens service | 在【部署】-【部署策略】中删除对应环境的对应部署集群，重新部署后会删除对应集群的ens service。                                                                           | 在【运行时】-【服务暴露】-【ENS管理】中手动删除。                                                                 |

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=58f2d9a8b6844da7b1eafbfd65eb73d2&docGuid=a2uc1Xtghbxe2s)

## 日志采集

更新时间：2022-07-01

### 功能简介

在研发与运维过程中，日志的查询与分析是快速定位问题的重要方式。CNAP支持您通过以下方式实现对应用日志的收集与查询。

BLS

[BLS](https://cloud.baidu.com/doc/BLS/s/pjwvyjaya)是百度智能云提供的托管式日志收集与投递服务，可实现对日志的采集、聚合和传输，支持基于不同的应用场景将日志投递到百度智能云对象存储BOS、百度Kafka、百度Elasticsearch和日志服务自身的日志集等多种存储、计算系统，用于大数据处理、分析。

您可在CNAP上通过配置，将日志发送到BLS进行存储、查询及分析。

使用流程：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d790e89288ea49fa98b89f41240cb504&docGuid=jA1561XiwYAv31)
产生的费用：参考[BLS计费说明](https://cloud.baidu.com/doc/BLS/s/akz0xh9c6)

EFK

CNAP搭建了EFK日志存储及查询方案，使用ES对日志进行存储，对于已收集的日志，可以通过kibana进行查询。

使用流程：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=98382b00bfa04a22ad09d3dbba7269fb&docGuid=jA1561XiwYAv31)
产生的费用：购买ES的费用

### BLS日志采集

更新时间：2022-08-01

BLS方式启用后，会在您的pod中安装一个BLS的日志采集agent（sidecar方式），用于采集和传输日志。

#### 1 BLS简介

（1）BLS是百度智能云提供的托管式日志收集与投递服务。可实现对日志的采集、聚合和传输，支持基于不同的应用场景将日志投递到百度智能云**对象存储BOS**、**百度Kafka**、**百度Elasticsearch**和**日志服务自身的日志集**等多种存储、计算系统，用于大数据处理、分析。

您可配置CNAP应用的日志传输到BLS，实现多实例的日志查看、避免日志丢失。

（2）BLS收费信息，参考[BLS产品定价](https://cloud.baidu.com/product-price/bls.html)

| 计费项   | 数据写入   | 数据读取   | 存储空间      | 索引流量  |
| -------- | ---------- | ---------- | ------------- | --------- |
| 定价     | 0.036元/GB | 0.036元/GB | 0.011元/GB/天 | 0.32元/GB |
| 免费额度 | 500MB/月   | 500MB/月   | 500MB/月      | 500MB/月  |

参考文档：

BLS使用文档：[https://cloud.baidu.com/doc/BLS/s/pjwvyjaya](https://cloud.baidu.com/doc/BLS/s/pjwvyjaya)

如何在k8s环境部署收集器：[https://cloud.baidu.com/doc/BLS/s/Fkwcadnfy](https://cloud.baidu.com/doc/BLS/s/Fkwcadnfy)

#### 2 BLS配置过程

———以传输到日志集为例

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f1a01c731e44488da281248106ba26a4&docGuid=wQl1Y_m4n26qW_)

##### 2.1 注册并登录百度智能云控制台

注册并登录百度智能云平台，具体操作请参考[注册](https://cloud.baidu.com/doc/UserGuide/s/ejwvy3fo2#%E6%B3%A8%E5%86%8C%E7%99%BE%E5%BA%A6%E8%B4%A6%E5%8F%B7)和[登录](https://cloud.baidu.com/doc/UserGuide/s/jjwvy3dk5)。

##### 2.2 开通日志服务BLS

直接登录[百度智能云控制台](https://login.bce.baidu.com/)，搜索“日志服务”，进入日志服务页面，按照页面提示开通服务

**备注：若您的应用在多个地域部署，建议对应地域的BLS服务都开通，目前日志数据跨地域传输有延迟**

##### 2.3 配置日志传输目的地——创建BLS日志集

日志集是日志数据的存储单元。日志查询时，可按日志集进行统一查询。

您可将有业务关联关系的日志传输任务，存储到相同的日志集中。

> ！！！注意
> 关于跨地域传输：BLS仅在北京、苏州、广州三个region提供了日志集存储，当您的服务部署在保定、武汉等其他地域时，或您期望日志统一存储到 某一个地域（如北京）时，您的日志需要跨地域传输。
> 跨地域传输时，需进行如下配置：修改容器的/etc/hosts，写入域名和ip。
> 具体操作：第一步，进入运行时配置库
> 第二步，通过hostAliases方式，增加需要跨地域传输日志的域名和ip。（原理参考：[https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/iu5Vy7I5pdA4Xy）](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/iu5Vy7I5pdA4Xy%EF%BC%89)
> 具体方法：在extension/deployment.yaml中加入如下配置（举例：如需将武汉和保定的日志都传输到北京的日志集，需要将武汉和保定的控制面IP和域名，都按图中方式进行配置。）

| **控制面/日志采集** |                      |               |
| ------------------- | -------------------- | ------------- |
| 北京                | bls.bj.baidubce.com  | 100.64.80.72  |
| 苏州                | bls.su.baidubce.com  | 100.67.0.48   |
| 广州                | bls.gz.baidubce.com  | 100.67.8.5    |
| 保定                | bls.bd.baidubce.com  | 100.67.100.11 |
| 武汉                | bls.fwh.baidubce.com | 100.67.160.38 |
| 香港                | bls.hkg.baidubce.com | 100.67.65.41  |

| 数据面/日志集存储 |                         |               |
| ----------------- | ----------------------- | ------------- |
| region            | 域名                    | VIP           |
| 北京              | bls-log.bj.baidubce.com | 100.67.200.17 |
| 苏州              | bls-log.su.baidubce.com | 100.67.107.1  |
| 广州              | bls-log.gz.baidubce.com | 100.67.8.8    |

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2c6b1e0f18454937bfd571e5cfe586c0&docGuid=wQl1Y_m4n26qW_)

```
apiVersion: apps/v1
kind: Deployment
spec:template:spec:hostAliases:-ip:"111.206.210.93"hostnames:-"bj.bcebos.com"
```

（1）登陆百度智能云控制台，选择“产品服务>日志服务BLS”，进入“日志集”页面

_注意：请根据您应用的部署地域，在页面左上角下拉按钮选择对应的地域创建日志集_

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=fd7325f9051a49b7a9ce89b06cfaa9c5&docGuid=wQl1Y_m4n26qW_)
（2）点击“新建日志集”，弹出新建日志集页面，填写配置信息

_备注：名称创建后不支持修改，并且同一region下名称具有唯一性。支持1～180天范围的存储周期。如需更大存储周期，请在百度智能云提交工单_

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=211561657e0b45859a45fe3d1b5e47ab&docGuid=wQl1Y_m4n26qW_)
（3）完成配置后点击“确定”，完成日志集的创建

_备注：若想对日志集有查遍、编辑、删除的操作需求，请参考_[日志集](

##### 2.4 创建BLS传输任务

**！！！注意：目前BLS只支持一个日志文件对应一个传输任务，请针对每个日志文件创建单独的传输任务**

（1）在日志服务页面中点击“传输任务”，进入传输任务列表页面后，点击“创建传输任务”，进入创建传输任务页面

（2）填写任务信息

需要注意的是：

- 源端设置：须选择主机，原因见[https://cloud.baidu.com/doc/BLS/s/Fkwcadnfy#sidecar%E6%A8%A1%E5%BC%8F](https://cloud.baidu.com/doc/BLS/s/Fkwcadnfy#sidecar%E6%A8%A1%E5%BC%8F)
- 源日志目录：日志目录的填写，须添加/logs/应用名称作为前缀
- 举例：对于应用app123的日志目录 /log/access.log（此为日志绝对路径），此处应填写/logs/app123/log/access.log

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f7fa21dfab054c259afeeca3e6e31abf&docGuid=wQl1Y_m4n26qW_)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0ac582291ad44eedb37e3bde5ec5cd44&docGuid=wQl1Y_m4n26qW_)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3ce7cdb6f6c64c5b86a1caf6d92f5a4a&docGuid=wQl1Y_m4n26qW_)
（3）点击保存即可

##### 2.5 在CNAP上启用并配置BLS

在【应用设置】-【环境模板配置】页，点击`更新环境模板配置`，进入【日志配置】tab下，开启日志采集，选择BLS方式，并完成以下信息的配置：

- BLS Token
- BLS Endpoint
- BLS传输任务id
- bls-agent资源规格
- 要采集的日志路径

注意：

不同集群的日志如果跨地域传输到同一个集群，将会造成一定时间的延迟。

建议最好是通过【[集群级配置](https://cloud.baidu-int.com/icloud/Appspace/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/%E5%BA%94%E7%94%A8%E8%AE%BE%E7%BD%AE/%E8%BF%90%E8%A1%8C%E6%97%B6%E9%85%8D%E7%BD%AE/%E6%9C%BA%E6%88%BF%E7%BA%A7%E9%85%8D%E7%BD%AE%E8%AF%B4%E6%98%8E)】，为每个集群单独配置日志传输任务。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3f69997575204a9386802f4a95c229e7&docGuid=wQl1Y_m4n26qW_)

1. bls Token获取方法

登录日志服务控制台，在收集器-收集器安装页，查看并复制token。（Token是用于认证用户身份的验证字符串，在收集器的配置文件中使用）

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=69d5f0d94e784feab552a29dd75c12ea&docGuid=wQl1Y_m4n26qW_)
2）bls Endpoint不同地域终端地址

endpoint是日志收集agent的心跳汇报地址，不同集群的endpoint不同。

| region | endpoint                                                                |
| ------ | ----------------------------------------------------------------------- |
| 北京   | [https://bls.bj.baidubce.com:8185](https://bls.bj.baidubce.com:8185/)   |
| 广州   | [https://bls.gz.baidubce.com:8185](https://bls.gz.baidubce.com:8185/)   |
| 苏州   | [https://bls.su.baidubce.com:8185](https://bls.su.baidubce.com:8185/)   |
| 保定   | [https://bls.bd.baidubce.com:8185](https://bls.bd.baidubce.com:8185/)   |
| 武汉   | [https://bls.fwh.baidubce.com:8185](https://bls.fwh.baidubce.com:8185/) |
| 香港   | [https://bls.hkg.baidubce.com:8185](https://bls.hkg.baidubce.com:8185/) |

3）blsTasks，传输任务id获取方法

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1d19fb48b21a428cae1beeb4bb7dbfb6&docGuid=wQl1Y_m4n26qW_)

- bls agent对应的资源配置，需要注意的是

##### 2.6 应用部署上线

在CNAP上，构建打包、并部署生效：部署过程中，将会自动安装agent，并开始采集日志。

##### 2.7 在百度智能云控制台查询BLS日志

（1）直接登录[百度智能云控制台](https://login.bce.baidu.com/)，搜索“日志服务”，进入日志服务页面

（2）点击进入日志查询页面，选择您的日志集，开通日志全文索引，索引开通后就可以进行关键字查询了

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2ff04391b8cc4bf18c82b3a3087bce3d&docGuid=wQl1Y_m4n26qW_)
_备注：日志全文索引开启后，需要等几分钟才能进行关键字查询_

（3）日常查询参考文档

快速查询：[https://cloud.baidu.com/doc/BLS/s/hk5atihy6](https://cloud.baidu.com/doc/BLS/s/hk5atihy6)

日志检索语法：[如何检索您的日志](https://cloud.baidu.com/doc/BLS/s/Ok5argumm)

##### 相关参考

- [BLS常见问题处理](https://cloud.baidu.com/doc/BLS/s/7k3gxhww4)
- BLS官方文档：[BLS快速入门](https://cloud.baidu.com/doc/BLS/s/Gjwvyjbvg)

### EFK日志采集

更新时间：2022-07-01

CNAP搭建了EFK日志存储及查询方案，使用ES对日志进行存储，对于已收集的日志，可以通过kibana进行查询。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=009e89be21eb4b2ea271f6e28b915a2c&docGuid=c-a4qEhnLg4Bcn)

#### EFK配置过程

##### 1、购买百度智能云ES

百度智能云ES用户文档：[https://cloud.baidu.com/doc/BES/s/Ejwvyk5uh](https://cloud.baidu.com/doc/BES/s/Ejwvyk5uh)

##### 2、提供ES信息，接入CNAP

联系一站式值班RD，并提供如下信息：

a. superuser的密码

b. es的ip和port

c. kibana的ip和port

**注意：IP需要是10段的**

##### 3、在CNAP上完成日志采集的配置

在CNAP，进入需要配置日志采集的应用。

选择【应用设置】-【环境模板配置】，点击更新环境模板配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=829a6d42ec704f79bfa314b8485283fe&docGuid=c-a4qEhnLg4Bcn)
在日志配置标签页，开启日志采集，并配置要采集的日志绝对路径。

日志的路径：支持文件名或目录，目录须以/_结尾，如/var/logs/access.log，/var/logs/orderlog/_。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2b8e375b92244fcfbc76c2dde174c164&docGuid=c-a4qEhnLg4Bcn)

##### 4、完成应用的构建打包、部署，生效日志采集配置

##### 5、在【运行时】-【应用日志】页面查看Kibana的登录信息

应用部署完成后，日志采集配置才可生效。

一方面：系统会根据配置，在启用日志采集配置的实例上，自动安装采集agent（sidecar形式）

另一方面：采集插件会根据配置，开始日志的收集。

收集到的日志，将会存储到ES，并可通过kibana进行查询。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0ba16cdc134040ad94bef674614d7c03&docGuid=c-a4qEhnLg4Bcn)
在【运行时】-【应用日志】页面查看Kibana的登录信息，在操作列点击查看日志即可跳转并计入kibana。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b47d1c97448d4d518a981d3679cb92f5&docGuid=c-a4qEhnLg4Bcn)

## 监控

### 监控说明

更新时间：2022-10-10

监控作为应用运维的必备手段，对于故障的发现与解决起着关键作用，是服务稳定性的重要保障。

CNAP平台通过与厂内监控系统对接，为用户提供了一键启用监控的能力，更多的报警、分析、监测等功能由监控系统提供支持。

2022年8月之前，CNAP默认对接的是noahee监控，在传统监控的基础上，兼容了对k8s容器的指标采集、监控和报警。

自2022年8月20日起，CNAP默认对接的系统改为**Prometheus监控**，旨在为用户提供完整的云原生监控产品和能力。

`在界面启用Prometheus监控后，将会默认采集cpu、内存等基础资源指标，对于其他业务指标，可前往监控平台配置自定义采集任务。`

Prometheus监控是什么？

[点此查看原文](http://chanpin.family.baidu.com/article/164277)

Prometheus 是一个开源的容器和微服务监控报警系统，是继Kubernetes之后第二个正式加入CNCF的项目，现最常见的Kubernetes容器管理系统中，通常会搭配Prometheus进行监控。

监控团队推出了Prometheus+Grafana监控，一方面对齐开源能力，一方面兼容厂内场景，提供指标实时查询、基础监控自动化配置以及报警等功能。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5b9ee12dab044adba82743ee8243f13d&docGuid=NPcnTDPnw9PJV1)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c94098c9db5a4d32971c978f37439de5&docGuid=NPcnTDPnw9PJV1)
更多参考

查看[Prometheus用户手册](https://cloud.baidu-int.com/icloud/IntelligentMonitoring/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/Prometheus%E7%9B%91%E6%8E%A7/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0)

### Prometheus监控配置

更新时间：2023-11-30

CNAP对接了[监控平台](https://cloud.baidu-int.com/icloud/IntelligentMonitoring/%E6%93%8D%E4%BD%9C%E6%8C%87%E5%8D%97/Prometheus%E7%9B%91%E6%8E%A7/%E4%BA%A7%E5%93%81%E6%A6%82%E8%BF%B0/)提供的Prometheus监控，支持一键启用云原生Prometheus监控，并默认采集基础监控指标。

Prometheus配置过程

1、启用环境级监控

目前，CNAP默认只打开生产环境的prometheus监控采集，如果要对测试环境打开监控，需要到对应的环境页面里操作，如下所示：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c1cfb837d29e40f9a0ccb0d0365fabca&docGuid=oRySnyWLtquN67)
2、启用Prometheus监控

在CNAP平台，进入需要开启Prometheus的应用。

选择【应用设置】-【环境模板配置】，点击更新环境模板配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=343d3fb5a6da41efb21f283d8087d98f&docGuid=oRySnyWLtquN67)
在监控配置标签页，开启监控开关，并选择Prometheus监控。

提交保存配置。

3、构建打包、部署生效

环境模板配置更新后，需要重新将应用代码与配置代码打包，得到一个新的包版本。并将该版本的包部署到指定环境中，即可生效Prometheus监控的配置。

4、在【运行时】-【监控】页，查看监控配置信息

可通过监控链接，跳转到监控平台，查看采集到的基础指标数据。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=9fda187a2b924a35b38175b2af29d612&docGuid=oRySnyWLtquN67)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=251ce01afe7947d2b723c7241aea5ac1&docGuid=oRySnyWLtquN67)

### GPU监控

#### 一、在k8s集群上，安装dcgm插件

参考：[https://cloud.baidu.com/doc/CCE/s/1kp80bcb4](https://cloud.baidu.com/doc/CCE/s/1kp80bcb4)

#### 二、prometheus上配置

**1. 创建prometheus gpu采集任务**

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=8b8321ae041b475f894109401c309cd8&docGuid=4b5uF5fdNecYK2)
选择高级配置，配置信息如下：

```yaml
job_name: k8s_gpu_config_job  # 任务名称
scheme: http  # 采集接口协议，默认HTTP
scrape_interval: 10s   # 采集周期
scrape_timeout: 10s   # 单次采集超时时间
metrics_path: /metrics   # 采集的路径
kubernetes_sd_configs:   # Kubernetes服务发现配置
  - clusters:     # 服务所在的k8s集群名称，k8s集群名称可以联系CNAP同学获取
      - clus-bj-xxx
    namespaces:   # dcgm组件所在的k8s namespace名称
      names:
        - dcgm-system
    role: pod    # 采集的资源类型，填写pod即可
    selectors:
      - role: pod
        label: app.kubernetes.io/name=dcgm-exporter        # dcgm组件的label筛选，按实际情况写，比如app=dcgm-exporter
relabel_configs:   # Prometheus relabel配置
  - action: keep
    source_labels:
      - __meta_kubernetes_pod_container_port_name
    regex: metrics
  - action: replace
    source_labels:
      - __meta_kubernetes_pod_ip        # 如果使用的是主机网络，这个字段需要改成__meta_kubernetes_pod_host_ip
    regex: (.+)
    target_label: __address__
    replacement: $1:9400        # dcgm组件的端口
```

**2. Grafa上快速搭建服务监控**

** a. 新建自己需要的服务的dashboard**

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=77ff1377359e41668836ae914061816a&docGuid=qy7xremaxcm1TR)
**b. 修改dashboard名后直接保存**

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0b082bcf828e4ced8b9b1a7143607550&docGuid=JFca7-dJhQnt7z)

**c. 进入新建监控的控制面板修改promQL语句，保存后退出**

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=4b3df466d9344e86b10717066e1b369d&docGuid=qy7xremaxcm1TR)
**d. 当前dcgm暴露出来的GPU指标**

| 指标                                    | 说明                                                 | 备注 |
| --------------------------------------- | ---------------------------------------------------- | ---- |
| DCGM_FI_DEV_CORRECTABLE_REMAPPED_ROWS   | GPU 内可矫正重映射的内存行数。                       |      |
| DCGM_FI_DEV_DEC_UTIL                    | GPU 解码单元的利用率。                               |      |
| DCGM_FI_DEV_ENC_UTIL                    | GPU 编码单元的利用率。                               |      |
| DCGM_FI_DEV_FB_FREE                     | GPU 显存中剩余的空闲空间，以字节为单位。             |      |
| DCGM_FI_DEV_FB_USED                     | GPU 显存中已使用的空间，以字节为单位。               |      |
| DCGM_FI_DEV_GPU_TEMP                    | GPU 温度，以摄氏度为单位。                           |      |
| DCGM_FI_DEV_GPU_UTIL                    | GPU 的利用率，以百分比表示。                         |      |
| DCGM_FI_DEV_MEM_CLOCK                   | GPU 显存时钟频率，通常以赫兹（Hz）表示。             |      |
| DCGM_FI_DEV_MEM_COPY_UTIL               | GPU 内存复制单元的利用率。                           |      |
| DCGM_FI_DEV_NVLINK_BANDWIDTH_TOTAL      | GPU 与其他 GPU 之间的总 NVLink 带宽，以字节/秒表示。 |      |
| DCGM_FI_DEV_PCIE_REPLAY_COUNTER         | GPU PCIe 重发计数。                                  |      |
| DCGM_FI_DEV_POWER_USAGE                 | GPU 的电源使用情况，通常以瓦特（Watt）表示。         |      |
| DCGM_FI_DEV_ROW_REMAP_FAILURE           | GPU 内存行重映射失败次数。                           |      |
| DCGM_FI_DEV_SM_CLOCK                    | GPU 流处理器时钟频率，通常以赫兹（Hz）表示。         |      |
| DCGM_FI_DEV_TOTAL_ENERGY_CONSUMPTION    | GPU 总能耗，通常以瓦特-小时（Wh）表示。              |      |
| DCGM_FI_DEV_UNCORRECTABLE_REMAPPED_ROWS | GPU 内不可矫正重映射的内存行数。                     |      |
| DCGM_FI_DEV_VGPU_LICEN                  | GPU 虚拟 GPU 许可证信息。                            |      |
| DCGM_FI_PROF_DRAM_ACTIVE                | GPU DRAM 存储器的活跃性。                            |      |
| DCGM_FI_PROF_GR_ENGINE_ACTIVE           | GPU 图形引擎的活跃性。                               |      |
| DCGM_FI_PROF_PCIE_RX_BYTES              | PCIe 接收的字节数。                                  |      |
| DCGM_FI_PROF_PCIE_TX_BYTES              | PCIe 发送的字节数。                                  |      |
| DCGM_FI_PROF_PIPE_TENSOR_ACTIVE         | GPU 张量处理管道的活跃性。                           |      |
| DCGM_FI_PROF_SM_ACTIVE                  | GPU 流处理器的活跃性。                               |      |
| DCGM_FI_PROF_SM_OCCUPANCY               | GPU 流处理器的占用率。                               |      |

# 8、环境管理

## 简介

### 总述

一站式为每个组织单元提供了4套开箱即用的环境，每个环境都可以通过一站式部署更新与查看环境状态；如默认环境无法满足需求，也可以并可通过一站式纳管的环境管理平台进行环境创建、删除、变更等操作。

### 什么是环境？

用于部署和运行应用的一组资源，可以是K8S集群、主机；典型名称有开发、测试、预发（沙盒）、生产环境；典型用途是管理部署历史、跟踪部署的代码和配置变更。

### 环境类型

1. 一站式环境可以按照使用场景不同，将环境分为4种场景。分别为开发环境（dev）、测试环境（test）、沙盒环境（sandbox）、生产环境（prod）。

详细描述

| 环境类型 | 使用场景                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| 开发环境 | 用于开发自测使用，每个人都可以为开发中的功能创建独立使用的、不与他人共享的、可与测试环境稳定服务相连的个人开发环境。      |
| 测试环境 | 用于准入测试环节、QA自动化与手动测试验收环境的程序执行环境；最小为包含可完成1个提测单元的完整应用与所需资源。通常为多个。 |
| 沙盒环境 | 也就是常说的稳定环境、预生产环境、仿真环境，通常沙盒环境验证后才可以正式上线，是bug的最后一道关卡。                       |
| 生产环境 | 为用户正式提供使用的运行环境，是唯一的一个。                                                                              |

2. 一站式环境还可以按照类型不同，将环境分为固化环境、基准环境、特性环境。

详细描述

| 环境类型 | 使用场景                                                                                                                                                                                                                                                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 固化环境 | 普通环境，环境中可以部署整个业务系统的全部或者部分应用，不具有环境复用能力。                                                                                                                                                                                                                                                                               |
| 基准环境 | 一套固定且完整的业务系统环境，为特性环境中的应用提供复用能力。固化环境(测试环境)可以升级为基准环境。详细见 [环境复用](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/5TnAOxXr61n6iR#anchor-160dc850-5ab0-11ee-99ce-a5bd1954b8ad?t=mention&mt=doc&dt=doc)                                                                              |
| 特性环境 | 业务方针对每个需求进行测试、联调的需求，可以单独创建一套特性环境，特性环境中不会重新搭建系统中的全部模块，而是仅部署当前业务本次变更的应用，而其他应用则直接复用基准环境中的应用。详细见[环境复用](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/5TnAOxXr61n6iR#anchor-160dc850-5ab0-11ee-99ce-a5bd1954b8ad?t=mention&mt=doc&dt=doc) |

## 使用环境

### 环境配置

环境配置由各个应用运行配置组成，新建环境配置会在账户下全部应用中新建一个同名的运行配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=db11a078f30c400892b358f0631a21c6&docGuid=PYC_aNhbzWmIDG)
创建环境时候需要选择环境配置来生效对应环境下应用的配置。

### 创建和删除

CNAP提供平台侧和ipipe插件2种方式进行环境的创建和删除，创建环境有“固化环境”和“特性环境”2种类型可选。

#### 固化环境

##### CNAP平台侧

创建

CNAP平台侧选择“创建环境”，弹窗中选择“环境配置”、“环境类型”、“部署集群”、“默认集群”、“部署应用”，手动输入“环境名称”。

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=40db2ea26b74493e834c7424836e27ad&docGuid=PYC_aNhbzWmIDG "1")
![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d84bda48e3d840beb9d916fb31b315dc&docGuid=PYC_aNhbzWmIDG "2")
![3](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=73fa0679059f4102a2b9579f70ae959f&docGuid=PYC_aNhbzWmIDG "3")
其中：“部署应用”是可选项项，可以帮助用户创建环境的同时部署多个应用

删除

在CNAP平台选择需要删除的环境，点击“删除”即可

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a466a3ea58ff400aa5b5b111b53e3098&docGuid=PYC_aNhbzWmIDG "1")
或者进入环境页面，选中“删除”进行环境释放

![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=677e5ff2181c4c19a2f6779872a37c54&docGuid=PYC_aNhbzWmIDG "2")

##### ipipe插件

创建

创建环境可以输入固定的名字，如下图：

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d34a986494594827ba578d6d41d34575&docGuid=PYC_aNhbzWmIDG "1")
也可以通过自定义参数将参数传递到表单中，如下图：

![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=a655addf0ac440a8826b8704818a3ec8&docGuid=PYC_aNhbzWmIDG "2")
删除

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=36c98d5c40894dfda2e11e300289ba63&docGuid=PYC_aNhbzWmIDG "1")

#### 特性环境

CNAP平台侧选择“创建环境”，弹窗中选择“环境配置”、“环境类型”、“所属基准环境”、“部署集群”、“默认集群”、“部署应用”，手动输入“环境名称”。

##### CNAP平台侧

创建

配置项如下：

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=886130d689bd480c86c11ad8887042cc&docGuid=PYC_aNhbzWmIDG "1")
其中：

1. 所属基准环境：是环境复用中的概念，表示当前特性环境中未部署的应用将复用对应基准环境下的应用。
2. 可用时间：表示当前特性环境释放时间。可以通过CNAP平台官方服务号接收释放预警。

删除

同 固化环境 的删除

##### ipipe插件

创建

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ca731202a3d64834b8ef2df208534aa6&docGuid=PYC_aNhbzWmIDG "1")
其中：环境保留时间 的上限是在账户设置中设置：

![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=cf06eb1216ec4520bf3d0ab70d391433&docGuid=PYC_aNhbzWmIDG "2")
删除

同 固化环境 的删除

### 查看环境状态

可以在环境页面看到"最近访问"、"生产环境"、"测试环境"的tab页，每个tab页中以卡片形式展示各个环境的概览信息，概览信息中包括：环境类型、是否开启mesh、是否锁定、部署的应用、集群信息、最后更新时间。点击具体的环境卡片进入具体环境页面。

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=afe1029ed98f49dfa9db6035f17eb6c4&docGuid=PYC_aNhbzWmIDG "1")

### 具体环境页

1. 具体环境页中包含下图中的信息。

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6bd1ece662844b428f2f7427b1dcc71a&docGuid=PYC_aNhbzWmIDG "1")
其中：

- 锁定：环境锁定后只有锁定环境的用户可以对环境进行更新等操作，从而实现用户对某一个环境独占的效果；
- 开启环境复用：环境复用支持以极低成本为待验证的功能特性快速搭建一套临时环境。 开启环境复用后，当前环境会变为【基准环境】，可基于当前环境创建【特性环境】。详细见[环境复用](https://ku.baidu-int.com/d/5TnAOxXr61n6iR?t=mention&mt=doc&dt=doc)。
- 启用mesh：启用 Mesh 后，可以通过自行配置 Istio 策略的方式来使用 Mesh 的能力。
- 一键删除资源：一键删除资源将会彻底清除所选集群上环境所有应用的部署资源，且不可撤销。
- 重置：会将环境内所有一站式应用使用【线上版本】重新部署
- 开启监控&关闭监控：对环境下的应用开启基础监控，并通过cprom展示，
- 增删集群：一个环境下可以有多个集群，可以通过增删集群调整环境下的集群。新增集群时，须在应用上完成：1、修改部署策略，添加集群；2、重新部署应用。删除集群时，会删除上面已经部署的所有应用（点击确定操作时执行），同时需要为绑定应用重新选择集群，以更新部署策略中的集群配置。
- 本地调试：[使用环境](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/PYC_aNhbzWmIDG#anchor-d87b3450-4e2a-11ee-bdac-b5e0f18753bc?t=mention&mt=doc&dt=doc)
- 其他：环境页面下还可以看到应用列表中的应用名、运行状态、最后部署人、最后部署时间

也可以点击“应用信息”跳转到单应用运行时查看单应用整体运行信息

![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b74d4877b2bb4df6aee2638344b54457&docGuid=PYC_aNhbzWmIDG "2")

### 本地调试

环境页面中的【本地调试】功能可以将Pod上游模块的访问实时转发到本地， 本地应用进程对下游模块的访问被实时转发到环境中的下游模块，从而实现无需构建部署， 即可与环境中的其他应用联调、测试，方便进行本地debug，使用方法如下：

1. 打开需要进行调试的应用开关

![1](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=49ef292374494ab492aa66b73b9025de&docGuid=PYC_aNhbzWmIDG "1")
2. 按照弹框引导内容进行操作

![2](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=4a1b998191644c539be168a025380695&docGuid=PYC_aNhbzWmIDG "2")
3. 此时从环境中访问被劫持应用的Pod，请求即会转发到本地，本地访问下游模块的请求也会被转回cnap环境中。

## 部署环境

CNAP平台提供3种部署入口。

1. 在相应应用的部署界面，点击“部署”跳转到部署页面选择相应的部署策略和包版本即可进行部署：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=aa9dfea7cb6d45f68bcdd308c2836a2e&docGuid=UT4e030K5tKse9)
2. 在相应的应用部署界面，切换到“构建打包”页，选择需要部署的包版本，点击部署

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=57b7f45a7c254a318f9dc4b61b3fd0bd&docGuid=UT4e030K5tKse9)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=710c22f4720d426ea18a9e9058ab649e&docGuid=UT4e030K5tKse9)
上述2种方式部署页面中的 “代码版本 + 运行配置版本”方式会在部署前进行部署包构建操作，构建部署包后自动进行部署操作。

3. 通过ipipe部署插件进行部署。在流水线任务配置中使用“一站式线下环境部署”或者“一站式生产环境部署插件”进行线下部署环境或者生产环境的部署。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c6c4d0d4afc245269d7323b43c198782&docGuid=UT4e030K5tKse9)

## 环境复用

### 简介

环境复用是指首先维护一套固定且完整的系统环境作为基础环境，然后针对每个 Feature 进行测试或联调的时候，再单独动态创建一个Feature测试环境(也叫做项目环境等)，不过这个Feature测试环境其实并不会重新搭建这个系统中的全部模块，而是仅仅搭建出本次Feature改动的模块，而其他的模块调用，则直接复用了基准环境的对应模块。每次在针对 feature 进行自测、联调、集成测试等需求的时候，都可以以极低的时间成本和资源成本来完成一套 Feature 环境的搭建。

环境复用流程如下图：

[流程图]

基准环境部署了业务的全链路 A -> B -> C，特性环境只部署了部分模块 C。用户开启环境复用后，即可在特性环境中复用基准环境中的应用A和应用B，从而实现了特性环境C应用可以在不部署应用A和应用B情况下进行全链路验证。

### 原理

CNAP平台环境复用系统有2种实现方式：servicemesh和域名网关。这两种方式都需要业务应用能够透传环境相关的标识信息。

servicemesh：业务调用链路中通过header透传环境名称，servicemesh将根据header中的环境名称对流量进行转发，从而实现环境复用。

域名网关：业务调用链路中通过应用域名调用上下游应用，同时业务应用在header等位置传递Trace信息。此时所有的请求都会被应用域名网关拦截，网关会在流量入口处将目标环境和Trace信息绑定。业务应用每次请求其他应用时候根据请求中的Trace信息反查目标环境信息，如果目标环境上有部署对应的应用，择将流量转发到目标环境上，否则将流量转发到基准环境。

下面就servicemesh和域名网关两中环境复用方式分别进行说明。

### Service Mesh

#### 前置条件

业务调用链路中上下游地址需要设置成完全限定域名（FQDN - Fully Qualified Domain Name），格式：{app-name}.{namespace-name}.svc.cluster.local。例如： app-core.nlp-base-stable.svc.cluster.local

#### 设置账户环境复用配置

想要开启环境复用，需要首先在账户级别设置环境复用方式和配置等信息。账户级别设置后，该账户下的应用自动继承该配置。

1. 账户级别开启环境复用，并选择环境复用方式

![开启环境复用](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3c35966abfe84a7aa958f25d487f4b33&docGuid=fi4Dsi38-bR9h8 "开启环境复用")
2. 配置环境复用规则

![配置环境复用](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=5106824da56b4a8c9e4b8779e50184e5&docGuid=fi4Dsi38-bR9h8 "配置环境复用")
其中：

- 链路透传规则：根据链路透传规则将流量路由到正确的环境上。
- 链路透传标识位置：取值 headerBaggage、header。headerBaggage表示使用使用了opentelementry协议，链路透传标识放到baggage字段中；header表示 链路透传标识 放到header根下。业务应用中需要在调用链路中透传header信息，以此保证在一次调用中能够进行正确的流量转发。
- 链路透传标识：使用指定的key存放环境名称。

上述配置保存后，找到需要作为基准环境的固化环境进行升级：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=22b8ec0468ff44799c982e066d61275a&docGuid=fi4Dsi38-bR9h8)
点开后会对集群进行检查是否支持mesh，点击确定后即将固化环境升级为基准环境：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=81afedf501204a61b4dd6bac629d2832&docGuid=fi4Dsi38-bR9h8)

#### 设置应用环境复用配置

如果账户下有些应用无法直接使用账户级别的配置，需要单独配置，可以在应用级别进行环境复用规则的单独配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=c97f70f4b2934850b919c82bb57722d7&docGuid=fi4Dsi38-bR9h8)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e7f1e82541704256b90cbde825260991&docGuid=fi4Dsi38-bR9h8)
当应用级别单独设置后，该应用不再继承账户级别的配置。

#### VS规则查看

上述2个纬度环境复用配置设置后，平台会根据实际特性环境的应用部署情况在VirtualService中生存VS规则，如下图：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=36a5f2240f0d4f45b1eb734e01f7e37b&docGuid=fi4Dsi38-bR9h8)

### 域名网关

#### 前置条件

业务调用链路中上下游地址需要设置成应用域名，格式：http://{app-core}.{env-name}.{account-name}.{platform-name}.env-smart-router.baidu-int.com。例如： http://app-fe.base-stable.nlp-demo.cnap.env-smart-router.baidu-int.com

注：调用链路中应用域名的配置统一配置成对应的基准环境下应用域名地址。

#### 设置账户环境复用配置

1. 账户级别开启环境复用，并选择环境复用方式

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=702e0fbe84f241f49b20474d952b1b25&docGuid=OWu3a7L7tHWAbu)
2. 配置环境复用规则

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b3a64919d3884b0cbd321fa2b55019b4&docGuid=OWu3a7L7tHWAbu)
其中：

- 请求协议：可以选择 HTTP协议、BRPC协议
- 链路透传规则：根据链路透传规则将流量路由到正确的环境上，可以选择 TraceID或者环境名称
- 启用平台链路追踪：当 链路透传规则 使用 TraceID后，可以选择是否启用平台链路追踪。启用平台链路追踪后，平台将会链路透传标识中注入字母数字组合的字符串，然后业务可以在 [http://jaeger-query.prod.easyenv.appspace.baidu.com/search](http://jaeger-query.prod.easyenv.appspace.baidu.com/search) 输入条件信息查看trace拓扑关系。注：trace只有在全链路走域名网关HTTP协议才能生效，如果业务中既有brpc也有http，请不要启用平台链路追踪。
- 链路透传标识位置：取值 headerBaggage、header、cookie。headerBaggage表示使用使用了opentelementry协议，链路透传标识放到baggage字段中；header表示 链路透传标识 放到header根下。业务应用中需要在调用链路中透传header、cookie或者body中的透传标识信息，以此保证在一次调用中能够进行正确的流量转发。
- 链路透传标识：使用指定的key存放TraceID或者环境名称。

上述配置保存后，找到需要作为基准环境的固化环境进行升级：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7fba63659b5d45768b3dbd77f74ed0ab&docGuid=OWu3a7L7tHWAbu)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=be31743abfbd4c8f8365564886898568&docGuid=OWu3a7L7tHWAbu)

#### 设置应用环境复用配置

如果账户下有些应用无法直接使用账户级别的配置，需要单独配置，可以在应用级别进行环境复用规则的单独配置。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6cf01300d8034d809dfd47c4dfa0484b&docGuid=OWu3a7L7tHWAbu)
可以在应用中添加多个环境复用规则

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=32e652399aa749779511ad06978afb4e&docGuid=OWu3a7L7tHWAbu)
特别：如果在账户中选中的链路透传规则是TraceID时，会有高级操作选项：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=284943fed4e34fbaa2e47b081167f8a1&docGuid=OWu3a7L7tHWAbu)
其中：

- 转成uint32表示将traceID转成uint32类型。
- 删除 表示删除该链路透传标识。

# 9、账户设置

## 子网配置

更新时间：2023-02-08

子网配置支持您在部署实例时，使用自己申请的IP网段。以便**添加白名单，解决redis等数据库的授权问题**。

配置说明

1、关于默认子网

默认子网是EKS集群统一申请并提供的，通过CNAP部署时无法确定分配的IP。

2、指定子网/IP网段

如需指定IP网段，须先在[IPAM平台](https://console.cloud.baidu-int.com/bcn/ipam/subnet)申请，申请后即可在CNAP上进行关联。

3、在CNAP配置子网

操作入口：【账户设置】-【子网配置】

子网配置页面展示了账户下各环境以及应用，部署到指定集群时使用的子网。未配置时，默认使用default子网。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=94ba57286fc0474c99d250c0ac03728b&docGuid=TwW5QJVj785HmL)
点击【添加子网配置】按钮，可选择生效的环境、应用，配置所选集群使用的子网。 配置完成后，再次部署时，实例IP将使用子网范围内的可用IP.

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6143659a660d435680ec19113b69e578&docGuid=TwW5QJVj785HmL)

## 逻辑机房

### 逻辑机房功能介绍

您可将若干个集群配置为一个逻辑机房。

之后在创建ENS时，同一个逻辑机房的多个集群，将生成拥有以逻辑机房名称为后缀的ENS Service，从而便于在流量路由中进行管理，减少集群变化对相关配置频繁修改带来的流量影响。

### 操作说明

入口：【账户设置】-【逻辑机房】

![](https://bce.bdstatic.com/doc/icloud/Appspace/image_5803bcb.png)
如图在逻辑机房配置页，点击【编辑】按钮，进入逻辑机房配置编辑状态。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b5686db23443447c943e0b6e5b3f65be&docGuid=9NsHuk1vUfiZ3L)
可点击添加按钮，添加一个逻辑机房。依次填写逻辑机房名称、所在地域、所包含的物理集群等信息。完成配置后，保存即可。

！！注意：需要说明的是，修改逻辑机房只会影响新部署应用的ens后缀，对已有应用的ens，则无法直接修改，如有修改需求，需先删除后再重建ens。

## 一键停更

### 一键停更功能介绍

当遇到机房故障、机器故障或其他影响范围大的故障时，可通过一键停更功能，批量暂停整个账户下所有应用的进行中部署，以便排查和解决问题。

### 操作说明

入口：账户设置-一键停更

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=75bdf7106c8d40628548ab6098b18d01&docGuid=AhhQTv3cT6BzTX)
点击页面右上方的【一键停更】按钮，打开如下弹窗。

选择需要停止变更的环境后，系统会查询指定环境下进行中的所有变更记录，并展示出来，以便确认停更操作影响的应用及变更事件。

此外，还可同时对所选环境配置封禁，以防后续有新的变更发起。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=25e6a6497f5840fda746957c79e1e08b&docGuid=AhhQTv3cT6BzTX)
需要说明的是，暂停变更的操作不一定会执行成功。原因在于，系统会尝试执行暂停操作，但可能存在以下情况：

1）状态更新延迟：可以成功暂停，部署状态更新会存在延迟；

2）无法暂停：除正在部署的记录外，处于【待人工确认】、【部署异常】等状态的部署无法暂停；

因此对于部署中的记录，如果当前部署阶段所有实例已开始创建或创建完成，将无法直接暂停，可在人工确认或后续部署阶段中执行暂停。

# 10、权限管理

## 权限模型

更新时间：2022-02-10

### 名词解释

| 名词   | 说明                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- |
| 企业   | 指一个组织，是使用一站式产品的一个根账户，企业可以拥有自己的一站式服务平台，成员加入企业，才可使用一站式功能。              |
| 账户   | 账户属于企业，对应目前的资源账户概念，包含多个有业务关系的应用。                                                            |
| 应用   | 指一站式上的一个单应用，是实践DevOps 的最小单位，也是团队成员进行合作与交互的基本单元。                                     |
| 角色   | 角色代表某一类成员，角色会被赋予一系列的操作权限，成员属于某种角色就拥有对应的权限。                                        |
| 成员   | 成员指企业的成员，可以访问一站式，并加入到一个或多个项目、应用，成员被分配或标记为某种角色后就拥有相应的操作权限。          |
| 权限点 | 权限点是指对某一对象/资源的某种操作权限，例如对实例的删除权限、对应用的创建权限等等。每一个角色可以被赋予拥有若干个权限点。 |

### 权限模型

CNAP使用RBAC权限模型。

#### 关于RBAC

RBAC是基于角色的访问控制（Role-Based Access Control ）。在RBAC中，权限与角色相关联，用户通过成为适当角色的成员而得到这些角色的权限，解耦了用户与权限的直接关系。

RBAC认为授权实际上是Who 、What 、How 三元组之间的关系，也就是Who 对What 进行How 的操作，也就是“主体”对“客体”的操作。

- Who：是权限的拥有者或主体（如：User，Role）。
- What：是操作或对象（operation，object）。
- How：具体的权限（Privilege,正向授权与负向授权）。

其中，【What+How】的组合为权限点，对某资源的某种操作权限。角色可以拥有若干个权限点，这些权限点的集合即某一角色的权限。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=46a8a63e2fb9456caeb33adac655ae83&docGuid=EVZyZNBZ8l9zs2)

#### 8s支持的的RBAC

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=7ff9355bac34404392374dcb85855291&docGuid=EVZyZNBZ8l9zs2)

### CNAP的权限分层

权限分两层：账户维度和应用维度。

默认角色

账户维度和应用维度，分别提供默认的角色，拥有默认的权限。

| 权限维度 | 默认角色                        |
| -------- | ------------------------------- |
| 账户维度 | 账户负责人、账户运维、账户研发  |
| 应用维度 | 应用负责人、应用运维、 应用研发 |

### 已支持的权限点

#### 账户级角色的权限点

账户级角色默认拥有所有应用级对应角色的所有权限~

| 操作内容 | 权限           | 权限点说明                               |
| -------- | -------------- | ---------------------------------------- |
| 应用     | 新建应用       | 用户可以新建一个应用                     |
| 账户成员 | 账户成员管理   | 可以对账户成员进行添加、删除、编辑等操作 |
| 权限     | 账户权限管理   | 可以对账户角色的权限进行修改             |
|          | 应用权限管理   | 可修改应用级角色的权限                   |
| 生产环境 | kubeconfig使用 | 对生产环境的kubeconfig有可见可用的权限   |

#### 应用级角色的权限点

| 操作内容     | 权限            | 权限点说明                             |
| ------------ | --------------- | -------------------------------------- |
| 应用成员     | 应用成员管理    | 可以添加、删除、编辑应用成员           |
| 应用生成环境 | 部署            | 拥有对指定应用的生产环境进行部署的权限 |
|              | 扩缩容          | 可对应用的生产环境执行扩缩容操作       |
|              | 删除实例        | 可删除生产环境的实例                   |
|              | 重启            | 对生产环境的容器执行重启操作           |
|              | 屏蔽/生效实例   | 可屏蔽/解屏蔽生产环境实例的流量        |
|              | BNS配置         | 对生产环境的BNS拥有编辑权限            |
|              | webssh root登录 | 可以root权限登录生产环境的实例         |

## 权限管理

更新时间：2022-10-23

### 账户默认成员设置说明

说明：权限管理功能初版上线后，平台统一将账户下所有的`应用创建人`和账户接入时所提供的`邮件组`一并设为了账户负责人。

如与实际需求不符，用户可自行调整。

### 权限管理操作说明

#### 1、设置账户级角色的权限

进入账户后，左侧菜单选择【账户设置】-【账户权限】。

在账户权限页，展示所有的账户级角色，当前系统默认定义了三种角色：账户负责人、账户研发、账户运维。

如需对各角色的权限进行修改，可点击角色后方的编辑权限按钮，进入权限编辑页。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e56bb0d1017f49ffbdd738119a14a086&docGuid=DH3QqoEmQglRVC)
在编辑权限页面，可根据业务需求对当前角色的权限进行增删。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b1a80b14f7df4cb59aebd1c63d8eb602&docGuid=DH3QqoEmQglRVC)

#### 2、设置应用级角色的权限

说明：不同应用相同角色的权限在整个账户下面是一致的，因此对应用角色的权限控制，由账户级成员进行管理。

进入账户后，左侧菜单选择【账户设置】-【应用权限】。

在账户权限页，展示了当前系统默认定义的三种应用角色：应用负责人、应用研发、应用运维。

如需对各角色的权限进行修改，可点击角色后方的编辑权限按钮，进入权限编辑页。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=bccc511f3130459e9a05384d2272a096&docGuid=DH3QqoEmQglRVC)
在编辑权限页面，可根据业务需求对当前角色的权限进行增删。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=9915a6ab714f42c29bc33c99c2d233bf&docGuid=DH3QqoEmQglRVC)

#### 3、添加账户成员

如需将某一人员添加到账户中，并为其指定账户级角色，可在【账户设置】-【成员管理】页面，点击添加成员按钮。

需要注意的是，cnap的账户与百度智能云度厂版的账户是相对独立的，如需在一站式平台使用ens、监控等百度智能云度厂版的快捷入口，须将成员信息加入到百度智能云度厂版资源账户下才可。否则页面内的快速跳转将会出错。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1127fb4302e94b588ea68134c88adb40&docGuid=DH3QqoEmQglRVC)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f473a0baee2b4faab64cc566e984f647&docGuid=DH3QqoEmQglRVC)

#### 4、添加应用成员

添加应用成员的操作，需在进入应用后才可进行。

如图所示，在【应用设置】-【成员管理】页，可对该应用的成员进行增删改查等操作。

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=cebf198039a94740b93567eb13998d11&docGuid=DH3QqoEmQglRVC)

# 11、高级功能

## 支持千帆appbuilder

CNAP深度集成了千帆appbuilder的sdk，通过CNAP，可以方便的进行appbuilder代码库创建、创建appbuilder应用、管理token、发布部署等操作

### token管理

在账户设置->基本信息->大模型调用密钥管理，可以添加千帆sdk的token：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d493b74c64cf496186312a07ba02bef3&docGuid=3D9FuMKvfJe6JA)
token申请流程，可参考：https://cloud.baidu.com/doc/AppBuilder/s/Olq6grrt6#1%E3%80%81%E5%88%9B%E5%BB%BA%E5%AF%86%E9%92%A5

一个账号可以申请多个token，每个应用根据自己的需要，选择使用对应的token。token暂时是应用级别的，不支持分环境使用。

### 新建应用

新建应用，可以选择千帆appbuilder的代码库，也可以选择现存代码库。选择新建千帆appbuilder代码库的操作如下：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=ff52dbcd03254299b8407eee3fc138d3&docGuid=3D9FuMKvfJe6JA)

### 运行配置

在运行配置中，选择为appbuilder应用，并选择对应的token

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=edf3dc2ebaeb40ea8fd9c2d259aa82d4&docGuid=3D9FuMKvfJe6JA)

### 构建部署

提交后，按照CNAP的正常流程，进行构建和部署即可：

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=b6ba125cd87945f2afe310cebbb44a0b&docGuid=3D9FuMKvfJe6JA)
打开端口，即可获得一个最简单的appbuilder应用

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=47913c3b046a451e9797ff1c4c600835&docGuid=3D9FuMKvfJe6JA)

## 支持GPU使用

### 环境集群配置

环境集群配置中会展示存在GPU卡资源的集群，若没有联系CNAP值班同学添加；

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=6bd0e22e5ddf4762b1e37370b6a95d93&docGuid=gY7D1EdOBbfbFv)

### 新建应用

新建应用勾选 [支持GPU使用] 后，该应用就可以使用GPU资源；

若选择使用基础镜像，CNAP将提供默认可选CUDA, cuDNN版本，选择后会默认下载安装；

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=399e1c04b20f454aad69537cacc0b1dc&docGuid=gY7D1EdOBbfbFv)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=f51876c1df98427c957bae57441f3b90&docGuid=gY7D1EdOBbfbFv)

### 运行配置

应用配置支持打开关闭 [支持GPU使用]，打开后，会增加宿主机资源nvidia-smi，勾选后会通过hostPath方式挂载显卡；

环境配置中可以添加GPU卡信息，下面配置代表申请一张A10 10%卡；

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3465e0b59ed543008a3d3ae3f8e6e305&docGuid=gY7D1EdOBbfbFv)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=226a4db9120d40d19092be6f1e2135a2&docGuid=gY7D1EdOBbfbFv)

### 运行时

部署成功后，会在运行时页面展示申请的GPU卡信息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=05f82c4fd93c4a81bc14ddcdca902d2b&docGuid=gY7D1EdOBbfbFv)

## SidecarSet应用

### 新建SidecarSet应用

应用模板选择sidecarset模板，镜像填写sidecarset容器所用镜像，应用名称同时也是sidecar容器名字

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=4799dababa6e456fabc0922b1c74bfc9&docGuid=gY7D1EdOBbfbFv)

### 应用配置与全新部署

可在运行配置页面修改配置，添加集群，全新部署

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e1c81b8c26c6434c89de838762b2f9f8&docGuid=gY7D1EdOBbfbFv)

### 更新部署

全新部署成功的集群会自动添加到部署策略里，后续可在部署页面进行更新部署

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=53e8e4869bf445538346f9006fb2d5fc&docGuid=gY7D1EdOBbfbFv)

### 添加组件

找值班同学在数据库中添加组件（component表，product为sidecarset，type为sidecarset应用名）

添加成功后，账户设置-组件管理页面会展示sidecarset组件，点击开启

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=77a688b73f664d2794a61d7c409b3c7a&docGuid=gY7D1EdOBbfbFv)

### 设置注入SidecarSet容器（只能cloneset类型应用）

组件开启成功后，打开需要注入的应用运行时配置，选择SidecarSet标签，开启对应的Sidecarset即可

（需要SidecarSet应用部署集群包含当前应用环境所用集群），提交配置，重新打包部署即可生效

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=14b9b710f64b45209ec0b550c1f98b8f&docGuid=gY7D1EdOBbfbFv)
～全文完～

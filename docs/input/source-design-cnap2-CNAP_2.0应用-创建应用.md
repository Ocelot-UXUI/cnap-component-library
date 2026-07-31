---
status: frozen
source: https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/wNA9tGCV6tD-EK
source_type: source-design
description: CNAP 2.0应用-创建应用
processed: done
frozen_reason: CNAP 2.0 产品设计文档，静态归档作为开发参考
---

CNAP 2.0应用-创建应用

- v0链接：[https://v0.app/dongshuzhao-9914/chat/cloud-native-application-platform-OjJWefiyO9P?ref=F6MZ2N](https://v0.app/dongshuzhao-9914/chat/cloud-native-application-platform-OjJWefiyO9P?ref=F6MZ2N)
- 原始应用部分需求：[CNAP 2.0应用相关](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/AZqLtErZTudJj_?t=mention&mt=doc&dt=doc) [运行时](https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/hGx3p91vLznHQc?t=mention&mt=doc&dt=doc)
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

- 问题：
  - 应用
    - 应用创建
    - 应用部署（应用+环境）
      - 运行时页

    - 应用列表
      - 应用环境列表页
      - Pod详情页（应用+环境+[集群]）

    - 应用修改
      - 应用配置页（应用）
        - 构建配置 (构建相关)
        - 运行配置（环境集群相关）
        - 其他配置
          - 模板自定义配置
          - extension
          - ...

    - 应用回收

  - 应用创建
    - 现有应用创建缺少从模板创建，这个应该是在选择应用类型之后，再选择模板
      - 新增来源字段：新应用、从应用、从模板
      - 现有应用想保存成模板，怎么保存
      - 新建应用想保存成模板，怎么保存
      - 应用类型
        - 选择应用模板后根据模板和应用类型决定是否需要选择负载类型
          - 现有应用创建过程缺少应用负载类型选择，哪些需要选择应用负载类型

        - 负载类型列表也来自于具体的模板和应用类型
          - 这个对应关系是什么

    - 应用创建的时候，应该有应用头像可以让用户上传
    - 创建完成应用之后，想修改创建时候的字段，怎么修改？
      - 应用修改？
        - 应用配置页（应用）

  -

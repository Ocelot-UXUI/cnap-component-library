---
status: frozen
source: https://ku.baidu-int.com/knowledge/HFVrC7hq1Q/_SKPgSwp2G/7MvddZrBEx/_AgzYM5GPzcCFJ
source_type: source-meeting
description: CNAP 2.0应用-工作负载-需求评审-会议记录，CNAP 2.0 应用中工作负载业务需求再次评审后的会议记录。
processed: done
frozen_reason: CNAP 2.0 工作负载需求评审会议记录，静态归档作为业务需求参考
---

CNAP 2.0应用-工作负载-需求评审-会议记录

- DONE 列表中，所有字段都有顺序，最重要的放在最左边，不重要的放在右边：字段重要性待定

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=8506ee4a00564925a21ae004cfb69661&docGuid=_AgzYM5GPzcCFJ)

- DONE gpu的颜色只是做品牌区分，实际上这个地方可以用别的视觉展示方式做设计：GPU需要提供所有品牌给视觉，demo上 只有 英伟达/华为等，需要更详细信息

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=af997fecefb24b62866549509a5197ae&docGuid=_AgzYM5GPzcCFJ)

- DONE 需要明确工作负载表单里面默认的排序顺序：~~状态是一级，时间是二级~~（状态列已支持排序；默认按状态排，对有状态应用似乎不太友好）

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0924cf2583444352a448b7a20cb3c880&docGuid=_AgzYM5GPzcCFJ)

- DONE pod详情页面右侧滑出，但是需要能单独打开🔗进入，点击这个链接，进入的页面就自动定位到具体的pod-容器-页面，比如到某个容器的日志页面

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=3ab787a122124035b50d1f0acc10cb9b&docGuid=_AgzYM5GPzcCFJ)

- pod详细信息中增加探针项：探针配置，探针状态

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=28c3da81568a4cf093954a1068c550c2&docGuid=_AgzYM5GPzcCFJ)
增加一个新的tab：高级

    *

- DONE 工作负载列左右滑动时，实例名称/集群+操作列 固定不动，其他列可以左右滑动

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=267621157bb64728a72ecafa73521b2a&docGuid=_AgzYM5GPzcCFJ)

- DONE 默认放高级模式

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=74c4cdffa96c4b67abb8a6d585014643&docGuid=_AgzYM5GPzcCFJ)

- DONE 如果整个负载没有gpu，那么gpu这一列可以隐藏掉

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=13cff3c640bc40fe8910dfe28b0ccfcd&docGuid=_AgzYM5GPzcCFJ)

- DONE 需要有排序：重启，存活必须要有，其他列也都增加上

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=59a392b3967a4b228cfeaa0347c44938&docGuid=_AgzYM5GPzcCFJ)

- DONE 每个负载增加单独统计

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d5bf7b1035db49b591d7a6e95afcb089&docGuid=_AgzYM5GPzcCFJ)

- DONE 增加负载的全展开/全折叠，默认所有负载都全展开

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=01d400ace1ed40ce86179f88c5d46a8f&docGuid=_AgzYM5GPzcCFJ)

- DONE 每个负载默认展示10个，每个负载增加单独分页

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=1ca275c06a374c6f95ee1ab218133766&docGuid=_AgzYM5GPzcCFJ)

- DONE 版本号需要注意每组多个版本号的情况

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2c264a5cc7194d1aa90f178aaa06b817&docGuid=_AgzYM5GPzcCFJ)

- DONE 当批量操作时，批量操作框放在最下面吸底

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=2f2082671d524138a3dd9d11debd98e5&docGuid=_AgzYM5GPzcCFJ)

- DONE 工作负载中，增加工作负载字段吸顶，如果多个负载都有多选，到哪个负载就把那个负载的字段进行吸顶

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=96e5129cb78946aca496b81b5ef7f2ee&docGuid=_AgzYM5GPzcCFJ)

- DONE 筛选按照多选设计

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=0c0749eeacdf4baaabce9cd00f318b13&docGuid=_AgzYM5GPzcCFJ)

- DONE 可用度锁：放最右边，如果没有开，就不展示可用度锁这一列

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=e2a81ac5ebb8491583b67e88cb332b7b&docGuid=_AgzYM5GPzcCFJ)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=590b837325d24a3d87ca01db940589d4&docGuid=_AgzYM5GPzcCFJ)

- DONE 全选：单页全选，全部选择，默认本页全选

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d01e0d7ca52b4e3da37946d1059f6570&docGuid=_AgzYM5GPzcCFJ)
![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=140c9ed576ef42ccb1844097815791e9&docGuid=_AgzYM5GPzcCFJ)

- DONE 日志搜索：搜索出来点击下一个可以定位到下一个被搜索到的内容

![](https://rte.weiyun.baidu.com/wiki/attach/image/api/imageDownloadAddress?attachId=d7d9487db576446298bc2880253c8a9a&docGuid=_AgzYM5GPzcCFJ)

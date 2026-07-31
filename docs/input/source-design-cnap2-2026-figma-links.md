---
status: supplement
source_type: source-design
processed: pending
description: CNAP 2026 Figma visual and interaction design links for navigation and workload modules
---

# CNAP 2026 Figma Design Links

## Purpose

归档 CNAP 2026 视觉设计与交互设计 Figma 源材料链接。本文仅作为原始输入索引，不直接构成实现级需求。

## UI 视觉设计

### 工作负载

- Source: Figma visual design
- Module: 工作负载
- Link: https://www.figma.com/design/JCMQwLARXjuh6FisEahXA4/%E3%80%902026%E8%A7%86%E8%A7%89%E3%80%91CNAP?node-id=151-7761&p=f&t=KT9KErmCsixHUd7w-0
- Notes: 用于工作负载页面视觉样式、布局和组件呈现参考。

### 导航优化

- Source: Figma visual design
- Module: 导航优化
- Link: https://www.figma.com/design/JCMQwLARXjuh6FisEahXA4/%E3%80%902026%E8%A7%86%E8%A7%89%E3%80%91CNAP?node-id=114-13091&p=f&t=KT9KErmCsixHUd7w-0
- Notes: 用于导航系统视觉样式、布局和状态呈现参考。

### 应用整体布局规范

- Source: Figma visual design
- Module: CNAP 应用整体布局
- Link: https://www.figma.com/design/JCMQwLARXjuh6FisEahXA4/%E3%80%902026%E8%A7%86%E8%A7%89%E3%80%91CNAP?node-id=147%3A24362
- Selected node: 布局规则
- Notes: 用于整理 CNAP 应用外壳、顶部导航、一级侧边导航、二级侧边导航、页面内容区间距和折叠规则。

### 导航 UI 状态规范

- Source: Figma visual design
- Module: 导航优化
- Link: https://www.figma.com/design/JCMQwLARXjuh6FisEahXA4/%E3%80%902026%E8%A7%86%E8%A7%89%E3%80%91CNAP?node-id=114-13091&p=f&t=KT9KErmCsixHUd7w-0
- Selected nodes: 一级导航/带二级导航/二级导航收起、一级导航/带二级导航/二级导航展开、一级导航/带二级导航/页面带下一级分类、小屏高度不足，出现更多、小屏展开更多、小屏更多，点击账户，选中二级、窗口展开效果
- Notes: 用于整理一级导航、二级导航展开/收起、页面下一级分类、小屏高度不足时的更多入口和更多弹层交互规范。

## 交互设计

### 导航

- Source: Figma interaction design
- Module: 导航
- Link: https://www.figma.com/design/6ZzcNjWplPxNkrZMK4Jc9C/%E3%80%902026%E3%80%91CNAP%E4%BA%A4%E4%BA%92%E8%AE%BE%E8%AE%A1?node-id=335-6743&p=f&t=P8u0YuySr4JmyyTF-0
- Notes: 用于导航结构、维度联动、页面跳转和交互状态参考。

### 工作负载

- Source: Figma interaction design
- Module: 工作负载
- Link: https://www.figma.com/design/6ZzcNjWplPxNkrZMK4Jc9C/%E3%80%902026%E3%80%91CNAP%E4%BA%A4%E4%BA%92%E8%AE%BE%E8%AE%A1?node-id=565-4796&p=f&t=P8u0YuySr4JmyyTF-0
- Notes: 用于工作负载页面流程、控件行为和操作反馈参考。

## Processing Guidance

- 后续实现前，应先将对应模块的 Figma 源材料合成为 `docs/requirements/` 中的实现级需求。
- 导航相关内容应与 `docs/design/navigation-system.md`、`docs/architecture/navigation-system.md` 和 `docs/architecture/agent-context-capabilities.md` 对齐。
- 工作负载相关内容应与已有工作负载输入材料共同分析，不应单独从链接直接推导完整实现范围。

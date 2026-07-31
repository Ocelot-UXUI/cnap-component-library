# 图标资源目录（src/assets）

本目录集中管理项目图标。开发或 Agent 需要图标时，先在此表查找语义，再通过 barrel 引用，**避免重复下载**。

## 使用方式

```ts
import {block, restart, search} from '@/assets/icons';

<img src={search} alt="" aria-hidden="true" />;
```

- 统一入口：`src/assets/icons/index.ts`（barrel，具名导出资源 URL）。
- 命名规范：功能化英文 kebab-case，去业务前缀；导出名为对应 camelCase。
- 新增图标：放入本目录 → 在 barrel 追加导出 → 在下表补一行。
- 颜色：SVG 以 `#545454`（= `semantic.text.secondary`）着色；需随主题变色时以 `?react` 组件方式引入并改用 `currentColor`。

## SVG 图标（69）

### 导航 / 方向

| 文件               | 导出          | 语义                 |
| ------------------ | ------------- | -------------------- |
| arrow-up.svg       | arrowUp       | 向上箭头（含杆）     |
| arrow-down.svg     | arrowDown     | 向下箭头（含杆）     |
| chevron-up.svg     | chevronUp     | 向上尖角             |
| chevron-down.svg   | chevronDown   | 向下尖角             |
| chevron-left.svg   | chevronLeft   | 向左尖角             |
| chevron-right.svg  | chevronRight  | 向右尖角             |
| expand.svg         | expand        | 展开 / 上下双向撑开  |
| expand-panel.svg   | expandPanel   | 面板展开（含右尖角） |
| collapse-panel.svg | collapsePanel | 面板收起（含左尖角） |
| pin.svg            | pin           | 置顶 / 固定          |

### 通用操作

| 文件               | 导出          | 语义                  |
| ------------------ | ------------- | --------------------- |
| add.svg            | add           | 添加（加号）          |
| add-circle.svg     | addCircle     | 添加（圆形加号）      |
| close.svg          | close         | 关闭（叉号）          |
| close-circle.svg   | closeCircle   | 关闭（圆形叉号）      |
| search.svg         | search        | 搜索                  |
| refresh.svg        | refresh       | 刷新                  |
| settings.svg       | settings      | 设置（齿轮）          |
| config.svg         | config        | 配置                  |
| edit-file.svg      | editFile      | 编辑文件              |
| pause.svg          | pause         | 暂停                  |
| restart.svg        | restart       | 重启                  |
| zoom-in.svg        | zoomIn        | 放大                  |
| zoom-out.svg       | zoomOut       | 缩小                  |
| standalone.svg     | standalone    | 独立展示 / 新窗口打开 |
| switch.svg         | switchIcon    | 开关                  |
| feature-toggle.svg | featureToggle | 功能开关              |
| visible.svg        | visible       | 可见（睁眼）          |
| hidden.svg         | hidden        | 不可见（闭眼）        |

### 内容 / 展示

| 文件              | 导出         | 语义                 |
| ----------------- | ------------ | -------------------- |
| code.svg          | code         | 代码模式             |
| document.svg      | document     | 文档                 |
| details.svg       | details      | 详情                 |
| logs.svg          | logs         | 日志                 |
| terminal.svg      | terminal     | 终端                 |
| monitor.svg       | monitor      | 监控                 |
| tag.svg           | tag          | 标签                 |
| books.svg         | books        | 书籍 / 资料          |
| view-simple.svg   | viewSimple   | 列表简洁视图（少行） |
| view-detailed.svg | viewDetailed | 列表详细视图（多行） |

### 状态 / 提示

| 文件          | 导出      | 语义           |
| ------------- | --------- | -------------- |
| check.svg     | check     | 正确 / 成功    |
| attention.svg | attention | 注意（信息圆） |
| remind.svg    | remind    | 提醒           |
| tip.svg       | tip       | 提示           |
| help.svg      | help      | 帮助           |

### 工作负载 / 运维操作

| 文件                 | 导出            | 语义                   |
| -------------------- | --------------- | ---------------------- |
| block.svg            | block           | 阻断                   |
| unblock.svg          | unblock         | 解除阻断               |
| scale-horizontal.svg | scaleHorizontal | 横向扩缩               |
| scale-vertical.svg   | scaleVertical   | 纵向扩缩               |
| scaling.svg          | scaling         | 扩缩容                 |
| hammer.svg           | hammer          | 调试 / 工具            |
| permission.svg       | permission      | 权限 / 安全（盾牌+人） |

### 平台资源域

| 文件                   | 导出              | 语义       |
| ---------------------- | ----------------- | ---------- |
| workload.svg           | workload          | 工作负载   |
| cluster.svg            | cluster           | 集群       |
| subnet.svg             | subnet            | 子网       |
| quota.svg              | quota             | 配额       |
| deploy.svg             | deploy            | 部署       |
| multi-app-deploy.svg   | multiAppDeploy    | 多应用部署 |
| service-expose.svg     | serviceExpose     | 服务暴露   |
| service-network.svg    | serviceNetwork    | 服务网络   |
| environment-type.svg   | environmentType   | 环境类型   |
| environment-config.svg | environmentConfig | 环境配置   |
| image-registry.svg     | imageRegistry     | 镜像仓库   |
| pipeline.svg           | pipeline          | 流水线     |
| build-package.svg      | buildPackage      | 构建打包   |
| data-delivery.svg      | dataDelivery      | 数据配送   |
| change-control.svg     | changeControl     | 变更控制   |
| change-history.svg     | changeHistory     | 变更历史   |
| basic-info.svg         | basicInfo         | 基本信息   |
| components.svg         | components        | 组件       |

### 品牌

| 文件            | 导出       | 语义             |
| --------------- | ---------- | ---------------- |
| icloud-logo.svg | icloudLogo | iCloud 平台 Logo |

## 遗留 PNG（37，待替换）

以下 PNG 为早期开发位图，无对应 SVG 或仍以复合方式在 Workloads 渲染。有 SVG 对应者将在 `docs/plans/2026-07-30-workloads-icon-upgrade-plan.md` 中替换并删除；位图类（CPU/GPU/内存、厂商 Logo、概览插画）暂保留。

- 资源用量 / 概览位图：`pod-resource-usage-{cpu,gpu,memory,huawei,kunlunxin,nvidia}.png`、`workloads-overview-{cpu,gpu,memory,arrow-right,config-artwork,deployment-artwork}.png`
- 复合拼装碎片（restart/close/logs/refresh/delete-rebuild）：`workloads-header-actions-restart-{ring,stem}.png`、`batch-action-bar-{restart-ring,restart-stem,close-left,close-right,delete-rebuild,force-delete}.png`、`pod-content-header-{chevron-down,chevron-up,refresh-cap,refresh-ring}.png`、`pod-row-actions-{logs-dot,logs-frame,logs-line,delete-rebuild-head,delete-rebuild-handle,terminal}.png`、`group-header-chevron-down.png`
- 三点 / 菜单位图：`{group-header,pod-row-actions,workloads-header-actions}-more-dot.png`
- 暂无 SVG 对应：`workloads-header-menu-{debug,delete,temporary-auth}.png`

/**
 * 单色图标库统一入口（barrel）。
 *
 * 用法（组件消费，自动继承容器 `currentColor`）：
 *   import { Search, Restart } from '@/assets/icons';
 *   <Search />
 *
 * 约定：
 *   - 本目录仅放单色图标，源文件以 `#545454` 着色；由 vite-plugin-svgr 作用域
 *     （见 `vite.config.ts`）在导入期把 `#545454` 注入为 `currentColor`，图标颜色
 *     随容器 `color` 变化。
 *   - 新增图标：把 `#545454` 单色 SVG 放入本目录，在下方对应分组追加一条组件导出，
 *     并在 `../README.md` 目录表补一行。
 *   - 多彩插画（保留原色、以 URL 消费）放在 `../illustrations/`，不从本入口导出。
 *   - 少数以 `<img>` 方式消费的单色图标可直接 `import x from '@/assets/icons/x.svg'`
 *     取 URL；此时不经过 `currentColor` 注入，保持 `#545454`。
 */

// 导航 / 方向
export {default as ArrowDown} from './arrow-down.svg?react';
export {default as ArrowUp} from './arrow-up.svg?react';
export {default as ChevronDown} from './chevron-down.svg?react';
export {default as ChevronLeft} from './chevron-left.svg?react';
export {default as ChevronRight} from './chevron-right.svg?react';
export {default as ChevronUp} from './chevron-up.svg?react';
export {default as CollapsePanel} from './collapse-panel.svg?react';
export {default as ExpandPanel} from './expand-panel.svg?react';
export {default as Expand} from './expand.svg?react';
export {default as Pin} from './pin.svg?react';
export {default as Unexpand} from './unexpand.svg?react';

// 通用操作
export {default as AddCircle} from './add-circle.svg?react';
export {default as Add} from './add.svg?react';
export {default as CloseCircle} from './close-circle.svg?react';
export {default as Close} from './close.svg?react';
export {default as Config} from './config.svg?react';
export {default as EditFile} from './edit-file.svg?react';
export {default as FeatureToggle} from './feature-toggle.svg?react';
export {default as Hidden} from './hidden.svg?react';
export {default as Pause} from './pause.svg?react';
export {default as Refresh} from './refresh.svg?react';
export {default as Restart} from './restart.svg?react';
export {default as Search} from './search.svg?react';
export {default as Settings} from './settings.svg?react';
export {default as Standalone} from './standalone.svg?react';
export {default as Switch} from './switch.svg?react';
export {default as Visible} from './visible.svg?react';
export {default as ZoomIn} from './zoom-in.svg?react';
export {default as ZoomOut} from './zoom-out.svg?react';

// 内容 / 展示
export {default as Books} from './books.svg?react';
export {default as Code} from './code.svg?react';
export {default as Details} from './details.svg?react';
export {default as Document} from './document.svg?react';
export {default as Logs} from './logs.svg?react';
export {default as Monitor} from './monitor.svg?react';
export {default as Tag} from './tag.svg?react';
export {default as Terminal} from './terminal.svg?react';
export {default as ViewDetailed} from './view-detailed.svg?react';
export {default as ViewSimple} from './view-simple.svg?react';

// 状态 / 提示
export {default as Attention} from './attention.svg?react';
export {default as Check} from './check.svg?react';
export {default as Help} from './help.svg?react';
export {default as Remind} from './remind.svg?react';
export {default as Tip} from './tip.svg?react';

// 工作负载 / 运维操作
export {default as Block} from './block.svg?react';
export {default as Hammer} from './hammer.svg?react';
export {default as Permission} from './permission.svg?react';
export {default as ScaleHorizontal} from './scale-horizontal.svg?react';
export {default as ScaleVertical} from './scale-vertical.svg?react';
export {default as Scaling} from './scaling.svg?react';
export {default as Unblock} from './unblock.svg?react';

// 平台资源域
export {default as BasicInfo} from './basic-info.svg?react';
export {default as BuildPackage} from './build-package.svg?react';
export {default as ChangeControl} from './change-control.svg?react';
export {default as ChangeHistory} from './change-history.svg?react';
export {default as Cluster} from './cluster.svg?react';
export {default as Components} from './components.svg?react';
export {default as DataDelivery} from './data-delivery.svg?react';
export {default as Deploy} from './deploy.svg?react';
export {default as EnvironmentConfig} from './environment-config.svg?react';
export {default as EnvironmentType} from './environment-type.svg?react';
export {default as ImageRegistry} from './image-registry.svg?react';
export {default as MultiAppDeploy} from './multi-app-deploy.svg?react';
export {default as Pipeline} from './pipeline.svg?react';
export {default as Quota} from './quota.svg?react';
export {default as ServiceExpose} from './service-expose.svg?react';
export {default as ServiceNetwork} from './service-network.svg?react';
export {default as Subnet} from './subnet.svg?react';
export {default as Workload} from './workload.svg?react';

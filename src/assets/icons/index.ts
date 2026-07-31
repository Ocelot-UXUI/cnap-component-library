/**
 * 图标库统一入口（barrel）。
 *
 * 用法：
 *   import { search, restart } from '@/assets/icons';
 *   <img src={search} alt="" aria-hidden="true" />
 *
 * 每个导出为经 Vite 处理后的资源 URL 字符串。新增图标时：
 *   1. 将 SVG 放入 `src/assets/`，使用功能化英文 kebab-case 命名；
 *   2. 在此文件追加一条具名导出；
 *   3. 在 `src/assets/README.md` 目录表补充语义描述。
 */

// 导航 / 方向
export {default as arrowDown} from '../arrow-down.svg';
export {default as arrowUp} from '../arrow-up.svg';
export {default as chevronDown} from '../chevron-down.svg';
export {default as chevronLeft} from '../chevron-left.svg';
export {default as chevronRight} from '../chevron-right.svg';
export {default as chevronUp} from '../chevron-up.svg';
export {default as collapsePanel} from '../collapse-panel.svg';
export {default as expandPanel} from '../expand-panel.svg';
export {default as expand} from '../expand.svg';
export {default as pin} from '../pin.svg';

// 通用操作
export {default as addCircle} from '../add-circle.svg';
export {default as add} from '../add.svg';
export {default as closeCircle} from '../close-circle.svg';
export {default as close} from '../close.svg';
export {default as config} from '../config.svg';
export {default as editFile} from '../edit-file.svg';
export {default as featureToggle} from '../feature-toggle.svg';
export {default as hidden} from '../hidden.svg';
export {default as pause} from '../pause.svg';
export {default as refresh} from '../refresh.svg';
export {default as restart} from '../restart.svg';
export {default as search} from '../search.svg';
export {default as settings} from '../settings.svg';
export {default as standalone} from '../standalone.svg';
export {default as switchIcon} from '../switch.svg';
export {default as visible} from '../visible.svg';
export {default as zoomIn} from '../zoom-in.svg';
export {default as zoomOut} from '../zoom-out.svg';

// 内容 / 展示
export {default as books} from '../books.svg';
export {default as code} from '../code.svg';
export {default as details} from '../details.svg';
export {default as document} from '../document.svg';
export {default as logs} from '../logs.svg';
export {default as monitor} from '../monitor.svg';
export {default as tag} from '../tag.svg';
export {default as terminal} from '../terminal.svg';
export {default as viewDetailed} from '../view-detailed.svg';
export {default as viewSimple} from '../view-simple.svg';

// 状态 / 提示
export {default as attention} from '../attention.svg';
export {default as check} from '../check.svg';
export {default as help} from '../help.svg';
export {default as remind} from '../remind.svg';
export {default as tip} from '../tip.svg';

// 工作负载 / 运维操作
export {default as block} from '../block.svg';
export {default as hammer} from '../hammer.svg';
export {default as permission} from '../permission.svg';
export {default as scaleHorizontal} from '../scale-horizontal.svg';
export {default as scaleVertical} from '../scale-vertical.svg';
export {default as scaling} from '../scaling.svg';
export {default as unblock} from '../unblock.svg';

// 平台资源域
export {default as basicInfo} from '../basic-info.svg';
export {default as buildPackage} from '../build-package.svg';
export {default as changeControl} from '../change-control.svg';
export {default as changeHistory} from '../change-history.svg';
export {default as cluster} from '../cluster.svg';
export {default as components} from '../components.svg';
export {default as dataDelivery} from '../data-delivery.svg';
export {default as deploy} from '../deploy.svg';
export {default as environmentConfig} from '../environment-config.svg';
export {default as environmentType} from '../environment-type.svg';
export {default as imageRegistry} from '../image-registry.svg';
export {default as multiAppDeploy} from '../multi-app-deploy.svg';
export {default as pipeline} from '../pipeline.svg';
export {default as quota} from '../quota.svg';
export {default as serviceExpose} from '../service-expose.svg';
export {default as serviceNetwork} from '../service-network.svg';
export {default as subnet} from '../subnet.svg';
export {default as workload} from '../workload.svg';

// 品牌
export {default as icloudLogo} from '../icloud-logo.svg';

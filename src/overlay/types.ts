import type {BatchPodDeleteRebuildModalProps} from '@/pages/Workloads/operations/batchDelete/BatchPodDeleteRebuildModal';
import type {BatchPodForceDeleteModalProps} from '@/pages/Workloads/operations/batchDelete/BatchPodForceDeleteModal';
import type {BatchRestartPodModalProps} from '@/pages/Workloads/operations/batchRestart/BatchRestartPodModal';

/** overlay 宿主统一注入的受控 props，调用方无需（也不应）传入 */
export interface OverlayManagedProps {
    open: boolean;
    onClose: () => void;
}

/** 弹窗注册表：key → 该弹窗组件的完整 props 类型（单一真源，新增弹窗在此登记） */
export interface ModalRegistry {
    'pod-restart': BatchRestartPodModalProps;
    'pod-delete': BatchPodDeleteRebuildModalProps;
    'pod-force-delete': BatchPodForceDeleteModalProps;
}

export type ModalKey = keyof ModalRegistry;

/** openModal 调用方需传入的 props：组件 props 去除宿主受控项（open/onClose） */
export type ModalInvocationProps<K extends ModalKey> = Omit<ModalRegistry[K], keyof OverlayManagedProps>;

/** 活动弹窗：按 key 关联其调用 props 的判别联合 */
export type ActiveModal = {
    [K in ModalKey]: { key: K; props: ModalInvocationProps<K>; };
}[ModalKey];

/**
 * 抽屉轴：状态模型与 openDrawer/closeDrawer API 已就绪并与弹窗轴对称。
 * 现有抽屉（Pod 详情 / YAML）迁移列为 follow-up，故当前注册表为空（DrawerKey = never）。
 * 接入首个抽屉时新增 DrawerRegistry interface（镜像 ModalRegistry），详见
 * docs/architecture/overlay-registry.md。
 */
export type DrawerKey = never;
export type DrawerInvocationProps<K extends DrawerKey> = Record<K, never>;
export type ActiveDrawer = {
    [K in DrawerKey]: { key: K; props: DrawerInvocationProps<K>; };
}[DrawerKey];

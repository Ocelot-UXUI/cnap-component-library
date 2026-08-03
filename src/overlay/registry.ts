import type {ComponentType} from 'react';

import {BatchPodDeleteRebuildModal} from '@/pages/Workloads/operations/batchDelete/BatchPodDeleteRebuildModal';
import {BatchPodForceDeleteModal} from '@/pages/Workloads/operations/batchDelete/BatchPodForceDeleteModal';
import {BatchRestartPodModal} from '@/pages/Workloads/operations/batchRestart/BatchRestartPodModal';

import type {DrawerKey, ModalKey, ModalRegistry, OverlayManagedProps} from './types';

/** 擦除后的 overlay 组件类型：宿主统一以「受控 props + 任意调用 props」渲染 */
export type OverlayComponent = ComponentType<OverlayManagedProps & Record<string, unknown>>;

/**
 * 注册弹窗：入参按 key 编译期校验组件 props 与注册表一致，返回擦除类型供宿主统一渲染。
 * 类型擦除仅发生在此单点；对外 openModal<K> 调用仍完全类型安全。
 */
function registerModal<K extends ModalKey>(component: ComponentType<ModalRegistry[K]>): OverlayComponent {
    return component as unknown as OverlayComponent;
}

/** 弹窗注册表：key → 组件（成员来自 Pod 操作弹窗） */
export const MODAL_COMPONENTS: Record<ModalKey, OverlayComponent> = {
    'pod-restart': registerModal<'pod-restart'>(BatchRestartPodModal),
    'pod-delete': registerModal<'pod-delete'>(BatchPodDeleteRebuildModal),
    'pod-force-delete': registerModal<'pod-force-delete'>(BatchPodForceDeleteModal),
};

/** 抽屉注册表：机制就绪，暂无注册项（现有抽屉迁移为 follow-up） */
export const DRAWER_COMPONENTS: Record<DrawerKey, OverlayComponent> = {};

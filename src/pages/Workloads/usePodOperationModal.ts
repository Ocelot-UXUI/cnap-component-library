import {useOverlay} from '@/overlay';

import type {Pod, PodOperation} from '@/interface/entities/pod';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';
import type {ModalKey} from '@/overlay';

/** Pod 操作能力 → 全局弹窗 key；未列出的能力（如屏蔽/解除屏蔽占位）不触发弹窗 */
export const CAPABILITY_TO_MODAL: Partial<Record<OperationCapability, ModalKey>> = {
    PodRestart: 'pod-restart',
    PodDelete: 'pod-delete',
    PodDeleteForce: 'pod-force-delete',
};

interface UsePodOperationModalParams {
    /** 当前应用环境 ID；缺失时不打开弹窗 */
    appEnvID: string | undefined;
    /** 环境名（弹窗展示用），独立页面场景可缺省 */
    environmentName?: string;
    /** 弹窗提交成功回调（关闭弹窗前触发，如清空选择） */
    onSuccess?: () => void;
}

/**
 * Pod 操作弹窗统一入口：将 Pod 操作经全局 overlay 机制打开对应弹窗。
 * 供 Pod 表格、详情 Drawer、独立详情页面共用，避免重复实现能力映射与开关逻辑。
 */
export function usePodOperationModal({ appEnvID, environmentName, onSuccess }: UsePodOperationModalParams) {
    const { openModal, closeModal } = useOverlay();

    const openForPods = (key: ModalKey, pods: Pod[], operationName?: string) => {
        if (appEnvID === undefined) {
            return;
        }
        openModal(key, {
            appEnvID,
            pods,
            environmentName,
            operationName: operationName ?? '',
            onSuccess: () => {
                onSuccess?.();
                closeModal();
            },
        });
    };

    /** 单 Pod 操作：映射到对应弹窗，仅以该 Pod 为目标 */
    const handlePodOperation = (pod: Pod, operation: PodOperation) => {
        const key = CAPABILITY_TO_MODAL[operation.capability];
        if (!key || operation.disabled) {
            return;
        }
        openForPods(key, [pod], operation.name);
    };

    return { openForPods, handlePodOperation };
}

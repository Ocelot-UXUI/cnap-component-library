/** 批量操作栏按钮定义与可用性聚合（纯逻辑）。 */

import {listBatchCapabilities} from '@/domain/workload';
import type {Pod} from '@/interface/entities/pod';
import type {OperationCapability} from '@/interface/entities/runtimeOperation';

export interface BatchActionDef {
    key: string;
    capability: OperationCapability;
    label: string;
    /** 危险操作（红字 + 左分隔线） */
    danger?: boolean;
    /** 占位（本期点击不触发弹窗，后端能力待补充） */
    placeholder?: boolean;
}

/**
 * 批量按钮的 UI 展示表（key/label/danger/placeholder + 固定顺序）。
 * 成员最终由能力注册表（targetKind === 'Pod'）派生，此表仅决定"长什么样"。
 */
const BATCH_ACTION_PRESENTATION: BatchActionDef[] = [
    { key: 'restart', capability: 'PodRestart', label: '重启' },
    { key: 'delete', capability: 'PodDelete', label: '删除重建' },
    { key: 'block', capability: 'PodBlock', label: '屏蔽', placeholder: true },
    { key: 'unblock', capability: 'PodUnblock', label: '解除屏蔽', placeholder: true },
    { key: 'force-delete', capability: 'PodDeleteForce', label: '强制删除', danger: true },
];

/** 固定顺序的批量操作按钮：展示表 ∩ 注册表 Pod 能力（成员来源为注册表） */
export const BATCH_ACTIONS: BatchActionDef[] = (() => {
    const batchCapabilities = new Set(listBatchCapabilities());
    return BATCH_ACTION_PRESENTATION.filter(action => batchCapabilities.has(action.capability));
})();

export interface ActionAvailability {
    enabled: boolean;
    /** 禁用原因（去重逐条；缺能力时为前端兜底文案） */
    reasons: string[];
}

const MISSING_REASON = '部分所选 Pod 不支持此操作';

/**
 * 按 capability 在所有所选 Pod 的 operations 中聚合：
 * 任一 Pod 缺该操作 → 禁用（兜底文案）；任一 disabled → 禁用（收集其 reason，去重）。
 */
export function aggregateAction(pods: Pod[], capability: string): ActionAvailability {
    if (pods.length === 0) {
        return { enabled: false, reasons: [] };
    }
    const reasons = new Set<string>();
    let enabled = true;
    for (const pod of pods) {
        const operation = (pod.operations ?? []).find(item => item.capability === capability);
        if (!operation) {
            enabled = false;
            reasons.add(MISSING_REASON);
            continue;
        }
        if (operation.disabled) {
            enabled = false;
            if (operation.reason) {
                reasons.add(operation.reason);
            }
        }
    }
    return { enabled, reasons: [...reasons] };
}

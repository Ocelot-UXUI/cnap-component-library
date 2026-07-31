/**
 * 能力注册表与操作命令组装。
 *
 * 以 capability 为 key 声明操作元数据（targetKind / supportsBatch / dialog）；
 * 标题栏弹窗路由与批量栏成员统一从本表派生，替代散落的硬编码清单。
 * build 纯函数将领域选择映射为 OperationCommand（目前仅 VerticalScale 走此路径）。
 *
 * 关于批量能力「前端写死」：虽然 `/runtime/operations` 与 pod `operations[]` 接口
 * 会按 operation 动态返回 `supportsBatch`，但当前实际支持的批量操作是固定的 5 个——
 * 重启(PodRestart) / 删除重建(PodDelete) / 屏蔽(PodBlock) / 解除屏蔽(PodUnblock) / 强制删除(PodDeleteForce)，
 * 因此这里直接静态声明，避免「注册表 vs 后端」双源不一致；待后端扩展批量能力集合时再评估切换到后端驱动。
 */

import type {OperationCapability, OperationTargetKind} from '@/interface/entities/runtimeOperation';
import type {OperationCommand, ResourceRef} from './model';
import type {ResourceSpec} from './resource';
import {fromResourceSpec} from './resource';

/** 弹窗 key：UI 层据此映射到具体 React 组件（registry 不持有组件） */
export type DialogKey =
    | 'verticalScale'
    | 'horizontalScale'
    | 'restart'
    | 'batchRestart'
    | 'batchDelete'
    | 'batchForceDelete';

/** 能力元数据 */
export interface CapabilityDef {
    capability: OperationCapability;
    targetKind: OperationTargetKind;
    /** 批量是否已实现（占位能力为 false）；不参与批量栏成员判定 */
    supportsBatch: boolean;
    /** 对应弹窗 key；无（占位/未实现）为 undefined */
    dialog?: DialogKey;
}

/**
 * 能力注册表。
 * Workload 维度：标题栏操作弹窗；Pod 维度：批量栏操作。
 * PodBlock / PodUnblock / ApplicationUninstall 已登记但为占位（dialog: undefined）。
 */
export const capabilityRegistry: Partial<Record<OperationCapability, CapabilityDef>> = {
    VerticalScale: {
        capability: 'VerticalScale',
        targetKind: 'Workload',
        supportsBatch: false,
        dialog: 'verticalScale',
    },
    HorizontalScale: {
        capability: 'HorizontalScale',
        targetKind: 'Workload',
        supportsBatch: false,
        dialog: 'horizontalScale',
    },
    Restart: { capability: 'Restart', targetKind: 'Workload', supportsBatch: false, dialog: 'restart' },
    PodRestart: { capability: 'PodRestart', targetKind: 'Pod', supportsBatch: true, dialog: 'batchRestart' },
    PodDelete: { capability: 'PodDelete', targetKind: 'Pod', supportsBatch: true, dialog: 'batchDelete' },
    PodDeleteForce: {
        capability: 'PodDeleteForce',
        targetKind: 'Pod',
        supportsBatch: true,
        dialog: 'batchForceDelete',
    },
    PodBlock: { capability: 'PodBlock', targetKind: 'Pod', supportsBatch: false },
    PodUnblock: { capability: 'PodUnblock', targetKind: 'Pod', supportsBatch: false },
    ApplicationUninstall: { capability: 'ApplicationUninstall', targetKind: 'Workload', supportsBatch: false },
};

function entries(): CapabilityDef[] {
    return Object.values(capabilityRegistry).filter((def): def is CapabilityDef => def !== undefined);
}

/** 可通过标题栏按钮打开弹窗的能力（targetKind None/Workload 且有 dialog） */
export function listModalCapabilities(): OperationCapability[] {
    return entries()
        .filter(def => (def.targetKind === 'Workload' || def.targetKind === 'None') && def.dialog !== undefined)
        .map(def => def.capability);
}

/**
 * 出现在批量操作栏的能力（targetKind === 'Pod'）。
 * 按 targetKind 派生而非 supportsBatch——block/unblock 为可见占位，仍需出现。
 */
export function listBatchCapabilities(): OperationCapability[] {
    return entries().filter(def => def.targetKind === 'Pod').map(def => def.capability);
}

/** 纵向扩缩：单行（一个集群 Workload）的资源配置 */
export interface VerticalScaleRow {
    ref: ResourceRef;
    container?: string;
    requests: ResourceSpec;
    limits: ResourceSpec;
}

/**
 * 组装纵向扩缩命令。
 * 调用方仅传入已选中的行；resourceLimits / resourceRequests 序列化为字符串放入 per-target params。
 */
export function buildVerticalScaleCommand(rows: VerticalScaleRow[]): OperationCommand {
    return {
        capability: 'VerticalScale',
        targets: rows.map(row => ({
            ref: row.ref,
            container: row.container,
            params: {
                resourceLimits: fromResourceSpec(row.limits),
                resourceRequests: fromResourceSpec(row.requests),
            },
        })),
    };
}

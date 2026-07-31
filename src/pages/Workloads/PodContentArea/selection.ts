/** 跨组多选累计（纯逻辑）。选中键为 `${clusterId}/${name}`；按 group 维护对象 map 以支持逐组 reconcile。 */

import type {Pod} from '@/interface/entities/pod';

export function podKey(pod: Pod): string {
    return `${pod.clusterId}/${pod.name}`;
}

/** groupId → (podKey → Pod) */
export type SelectedPods = Record<string, Record<string, Pod>>;

/**
 * 用某组当前选中键 + 当前页记录 reconcile 该组选择。
 * 已选键优先取当前页真实对象，其次沿用已缓存对象（跨页保留）。
 */
export function reconcileGroup(selection: SelectedPods, groupId: string, keys: string[], rows: Pod[]): SelectedPods {
    const known = selection[groupId] ?? {};
    const rowMap: Record<string, Pod> = {};
    for (const pod of rows) {
        rowMap[podKey(pod)] = pod;
    }
    const next: Record<string, Pod> = {};
    for (const key of keys) {
        const pod = rowMap[key] ?? known[key];
        if (pod) {
            next[key] = pod;
        }
    }
    const result = { ...selection };
    if (Object.keys(next).length === 0) {
        delete result[groupId];
    } else {
        result[groupId] = next;
    }
    return result;
}

/** 某组当前选中键（供 rowSelection.selectedRowKeys） */
export function groupKeys(selection: SelectedPods, groupId: string): string[] {
    return Object.keys(selection[groupId] ?? {});
}

/** 跨组累计选中总数 */
export function totalSelected(selection: SelectedPods): number {
    return Object.values(selection).reduce((sum, group) => sum + Object.keys(group).length, 0);
}

/** 跨组扁平化所选 Pod 列表 */
export function selectedList(selection: SelectedPods): Pod[] {
    return Object.values(selection).flatMap(group => Object.values(group));
}

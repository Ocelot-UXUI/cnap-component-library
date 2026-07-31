/** 容器排序与类型 Badge（纯逻辑）。 */

import type {Container} from '@/interface/entities/pod';

const TYPE_ORDER: Record<string, number> = { MAIN: 0, NORMAL: 1, SIDECAR: 2, INIT: 3 };

export interface ContainerBadge {
    label: string;
    /** 圆点 / Badge 是否高亮（主容器） */
    primary: boolean;
}

const TYPE_LABEL: Record<string, string> = {
    MAIN: '主容器',
    NORMAL: '普通',
    SIDECAR: 'Sidecar',
    INIT: 'Init',
};

/** 合并 containers + initContainers 并按 type 排序：MAIN→NORMAL→SIDECAR→INIT */
export function orderedContainers(containers: Container[] = [], initContainers: Container[] = []): Container[] {
    return [...containers, ...initContainers].sort(
        (a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99),
    );
}

export function containerBadge(type: string): ContainerBadge {
    return { label: TYPE_LABEL[type] ?? type, primary: type === 'MAIN' };
}

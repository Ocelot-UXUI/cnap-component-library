import {Button, Tooltip} from 'antd';
import type {TableColumnsType} from 'antd';

import Code from '@/assets/code.svg?react';
import Details from '@/assets/details.svg?react';
import {semantic} from '@/constants/colors';
import type {Pod, PodOperation} from '@/interface/entities/pod';
import {
    renderAge,
    renderIp,
    renderName,
    renderOperations,
    renderPorts,
    renderRestarts,
    renderStatus,
} from './podCells';
import {renderCpu, renderMemory} from './podUsageCells';
import type {ViewMode} from './types';

/** 该组是否存在 GPU 资源（无则整列隐藏） */
export function groupHasGpu(pods: Pod[]): boolean {
    return pods.some(pod =>
        Boolean(pod.resourceLimits?.gpus?.length)
        || Object.keys(pod.resourceLimits?.others ?? {}).some(key => key.toLowerCase().includes('gpu'))
    );
}

export function gpuText(pod: Pod): string {
    const gpus = pod.resourceLimits?.gpus ?? [];
    if (gpus.length) {
        return gpus
            .map(gpu => `${[gpu.vendor, gpu.model, gpu.profile].filter(Boolean).join(' ')}:${gpu.count}`)
            .join(', ');
    }
    const entries = Object.entries(pod.resourceLimits?.others ?? {})
        .filter(([key]) => key.toLowerCase().includes('gpu'));
    return entries.length ? entries.map(([name, value]) => `${name}:${value}`).join(', ') : '-';
}

export function buildPodColumns(
    mode: ViewMode,
    hasGpu: boolean,
    onOpenDetail: (pod: Pod) => void,
    onPodYamlView: (pod: Pod) => void,
    onPodOperation: (pod: Pod, operation: PodOperation) => void,
): TableColumnsType<Pod> {
    const detailed = mode === 'detailed';
    const columns: TableColumnsType<Pod> = [
        {
            title: detailed ? 'POD 名称 / 集群' : 'POD 名称',
            key: 'name',
            width: 220,
            fixed: 'left',
            render: (_, pod) => renderName(pod, detailed),
        },
        {
            title: detailed ? '状态 / 容器' : '状态',
            key: 'status',
            width: 140,
            sorter: true,
            render: (_, pod) => renderStatus(pod, detailed),
        },
        {
            title: detailed ? 'POD IP / 节点 IP' : 'POD IP',
            key: 'podIp',
            width: 160,
            render: (_, pod) => renderIp(pod, detailed),
        },
        { title: '端口', key: 'ports', width: 130, render: (_, pod) => renderPorts(pod, detailed) },
        {
            title: '服务暴露',
            key: 'serviceExpose',
            width: 120,
            render: () => <span style={{ color: semantic.text.placeholder }}>-</span>,
        },
        { title: '重启', key: 'restarts', width: 80, sorter: true, render: (_, pod) => renderRestarts(pod) },
        { title: '存活', key: 'creationTimestamp', width: 100, sorter: true, render: (_, pod) => renderAge(pod) },
        { title: 'CPU', key: 'cpu', width: detailed ? 200 : 90, render: (_, pod) => renderCpu(pod, detailed) },
        { title: '内存', key: 'memory', width: detailed ? 200 : 90, render: (_, pod) => renderMemory(pod, detailed) },
    ];
    if (hasGpu) {
        columns.push({ title: 'GPU', key: 'gpu', width: 120, render: (_, pod) => gpuText(pod) });
    }
    columns.push({
        title: '操作',
        key: 'operations',
        width: 200,
        render: (_, pod) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tooltip title="详情">
                    <Button
                        type="text"
                        size="small"
                        icon={<Details width="1em" height="1em" />}
                        onClick={() => onOpenDetail(pod)}
                    />
                </Tooltip>
                <Tooltip title="查看 YAML">
                    <Button
                        type="text"
                        size="small"
                        icon={<Code width="1em" height="1em" />}
                        onClick={() => onPodYamlView(pod)}
                    />
                </Tooltip>
                {renderOperations(pod, onPodOperation)}
            </div>
        ),
    });
    return columns;
}

/** antd sorter → getPods sort 参数（仅 restarts / creationTimestamp / status） */
export function toSortParam(field?: string, order?: 'ascend' | 'descend' | null): string | undefined {
    if (!field || !order) {
        return undefined;
    }
    return order === 'descend' ? `-${field}` : field;
}

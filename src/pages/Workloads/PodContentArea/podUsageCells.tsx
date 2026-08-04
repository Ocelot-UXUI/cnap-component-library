import {Progress} from 'antd';

import cpuIcon from '@/assets/images/pod-resource-usage-cpu.png';
import memoryIcon from '@/assets/images/pod-resource-usage-memory.png';
import {semantic} from '@/constants/colors';

import {formatCpu, formatMemory, isHighLoad, usagePercent} from './PodDetailDrawer/resourceUsage';
import {ResourceUsageTooltip} from './PodDetailDrawer/ResourceUsageTooltip';
import {
    DetailedBar,
    DetailedCell,
    DetailedPercent,
    DetailedValue,
    UsageCell,
    UsageCellIcon,
} from './podUsageCells.style';

import type {Pod} from '@/interface/entities/pod';

function renderUsageCell(
    pod: Pod,
    displayKey: 'cpu' | 'memory',
    numericKey: 'cpuMilli' | 'memoryBytes',
    label: string,
    icon: string,
    format: (value?: string) => string,
    detailed: boolean,
) {
    const usage = pod.resourceUsages?.[displayKey];
    const request = pod.resourceRequests?.[displayKey];
    const limit = pod.resourceLimits?.[displayKey];
    const usageNumeric = pod.resourceUsages?.[numericKey];
    const limitNumeric = pod.resourceLimits?.[numericKey];
    const percent = usagePercent(usageNumeric, limitNumeric);
    const highLoad = isHighLoad(percent);
    return (
        <ResourceUsageTooltip
            label={label}
            usage={usage}
            request={request}
            limit={limit}
            usageNumeric={usageNumeric}
            limitNumeric={limitNumeric}
            format={format}
        >
            {detailed
                ? (
                    <DetailedCell>
                        <DetailedValue>
                            <UsageCellIcon src={icon} alt="" aria-hidden="true" />
                            <span>{format(usage)}/{format(request)}/{format(limit)}</span>
                        </DetailedValue>
                        <DetailedBar>
                            <Progress
                                percent={percent ?? 0}
                                showInfo={false}
                                size="small"
                                strokeColor={highLoad ? semantic.state.error.default : undefined}
                            />
                            <DetailedPercent data-high-load={highLoad}>
                                {percent === undefined ? '-' : `${percent}%`}
                            </DetailedPercent>
                        </DetailedBar>
                    </DetailedCell>
                )
                : (
                    <UsageCell>
                        <UsageCellIcon src={icon} alt="" aria-hidden="true" />
                        <span>{percent === undefined ? '-' : `${percent}%`}</span>
                    </UsageCell>
                )}
        </ResourceUsageTooltip>
    );
}

export function renderCpu(pod: Pod, detailed: boolean) {
    return renderUsageCell(pod, 'cpu', 'cpuMilli', 'CPU', cpuIcon, formatCpu, detailed);
}

export function renderMemory(pod: Pod, detailed: boolean) {
    return renderUsageCell(pod, 'memory', 'memoryBytes', '内存', memoryIcon, formatMemory, detailed);
}

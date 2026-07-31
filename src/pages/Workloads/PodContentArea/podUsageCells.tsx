import cpuIcon from '@/assets/pod-resource-usage-cpu.png';
import memoryIcon from '@/assets/pod-resource-usage-memory.png';

import {formatCpu, formatMemory, usagePercent} from './PodDetailDrawer/resourceUsage';
import {ResourceUsageTooltip} from './PodDetailDrawer/ResourceUsageTooltip';
import {UsageCell, UsageCellIcon} from './podUsageCells.style';

import type {Pod} from '@/interface/entities/pod';

function renderUsageCell(
    pod: Pod,
    displayKey: 'cpu' | 'memory',
    numericKey: 'cpuMilli' | 'memoryBytes',
    label: string,
    icon: string,
    format: (value?: string) => string,
) {
    const percent = usagePercent(pod.resourceUsages?.[numericKey], pod.resourceLimits?.[numericKey]);
    return (
        <ResourceUsageTooltip
            label={label}
            usage={pod.resourceUsages?.[displayKey]}
            request={pod.resourceRequests?.[displayKey]}
            limit={pod.resourceLimits?.[displayKey]}
            usageNumeric={pod.resourceUsages?.[numericKey]}
            limitNumeric={pod.resourceLimits?.[numericKey]}
            format={format}
        >
            <UsageCell>
                <UsageCellIcon src={icon} alt="" aria-hidden="true" />
                <span>{percent === undefined ? '-' : `${percent}%`}</span>
            </UsageCell>
        </ResourceUsageTooltip>
    );
}

export function renderCpu(pod: Pod) {
    return renderUsageCell(pod, 'cpu', 'cpuMilli', 'CPU', cpuIcon, formatCpu);
}

export function renderMemory(pod: Pod) {
    return renderUsageCell(pod, 'memory', 'memoryBytes', '内存', memoryIcon, formatMemory);
}

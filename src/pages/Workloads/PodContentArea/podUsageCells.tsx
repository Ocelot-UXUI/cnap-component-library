import cpuIcon from '@/assets/pod-resource-usage-cpu.png';
import memoryIcon from '@/assets/pod-resource-usage-memory.png';

import {formatCpu, formatMemory, parseBytes, parseCpu, usagePercent} from './PodDetailDrawer/resourceUsage';
import {ResourceUsageTooltip} from './PodDetailDrawer/ResourceUsageTooltip';
import {UsageCell, UsageCellIcon} from './podUsageCells.style';

import type {Pod} from '@/interface/entities/pod';

function renderUsageCell(
    pod: Pod,
    key: 'cpu' | 'memory',
    label: string,
    icon: string,
    format: (value?: string) => string,
    parse: (value?: string) => number | undefined,
) {
    const percent = usagePercent(pod.resourceUsages?.[key], pod.resourceLimits?.[key], parse);
    return (
        <ResourceUsageTooltip
            label={label}
            usage={pod.resourceUsages?.[key]}
            request={pod.resourceRequests?.[key]}
            limit={pod.resourceLimits?.[key]}
            format={format}
            parse={parse}
        >
            <UsageCell>
                <UsageCellIcon src={icon} alt="" aria-hidden="true" />
                <span>{percent === undefined ? '-' : `${percent}%`}</span>
            </UsageCell>
        </ResourceUsageTooltip>
    );
}

export function renderCpu(pod: Pod) {
    return renderUsageCell(pod, 'cpu', 'CPU', cpuIcon, formatCpu, parseCpu);
}

export function renderMemory(pod: Pod) {
    return renderUsageCell(pod, 'memory', '内存', memoryIcon, formatMemory, parseBytes);
}

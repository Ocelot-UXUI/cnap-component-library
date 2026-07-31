import {Progress} from 'antd';

import cpuIcon from '@/assets/pod-resource-usage-cpu.png';
import memoryIcon from '@/assets/pod-resource-usage-memory.png';
import {semantic} from '@/constants/colors';

import {GpuUsageCard} from './GpuUsageCard';
import {
    formatCpu,
    formatMemory,
    isHighLoad,
    parseBytes,
    parseCpu,
    usagePercent,
} from './resourceUsage';
import {ResourceUsageTooltip} from './ResourceUsageTooltip';
import {
    GpuBlock,
    GpuLabel,
    GpuList,
    MetricBar,
    MetricBlock,
    MetricIcon,
    MetricLabel,
    MetricPercent,
    MetricValue,
    UsageDivider,
    UsageRoot,
    UsageSection,
    UsageTitle,
} from './ResourceUsageView.style';

import type {Container} from '@/interface/entities/pod';

interface ResourceUsageProps {
    container: Container;
}

interface MetricProps {
    icon: string;
    label: string;
    usage?: string;
    request?: string;
    limit?: string;
    format: (value?: string) => string;
    parse: (value?: string) => number | undefined;
}

// 展示规则：数值行为 usage/request/limit，进度条按 usage/limit 比例，其后百分比为 usage/limit。
const Metric = ({ icon, label, usage, request, limit, format, parse }: MetricProps) => {
    const percent = usagePercent(usage, limit, parse);
    const highLoad = isHighLoad(percent);
    return (
        <ResourceUsageTooltip
            label={label}
            usage={usage}
            request={request}
            limit={limit}
            format={format}
            parse={parse}
        >
            <MetricBlock>
                <MetricValue>
                    <MetricIcon src={icon} alt="" aria-hidden="true" />
                    <span>{format(usage)}/{format(request)}/{format(limit)}</span>
                </MetricValue>
                <MetricBar>
                    <Progress
                        percent={percent ?? 0}
                        showInfo={false}
                        size="small"
                        strokeColor={highLoad ? semantic.state.error.default : undefined}
                    />
                    <MetricPercent data-high-load={highLoad}>
                        {percent === undefined ? '-' : `${percent}%`}
                    </MetricPercent>
                </MetricBar>
                <MetricLabel>{label}</MetricLabel>
            </MetricBlock>
        </ResourceUsageTooltip>
    );
};

export const ResourceUsageView = ({ container }: ResourceUsageProps) => {
    const gpus = container.resourceLimits?.gpus ?? [];
    return (
        <UsageRoot>
            <UsageTitle>资源用量</UsageTitle>
            <UsageSection>
                <Metric
                    icon={cpuIcon}
                    label="CPU"
                    usage={container.resourceUsages?.cpu}
                    request={container.resourceRequests?.cpu}
                    limit={container.resourceLimits?.cpu}
                    format={formatCpu}
                    parse={parseCpu}
                />
                <UsageDivider />
                <Metric
                    icon={memoryIcon}
                    label="内存"
                    usage={container.resourceUsages?.memory}
                    request={container.resourceRequests?.memory}
                    limit={container.resourceLimits?.memory}
                    format={formatMemory}
                    parse={parseBytes}
                />
                {gpus.length > 0 && (
                    <>
                        <UsageDivider />
                        <GpuBlock>
                            <GpuList>
                                {gpus.map((gpu, index) => <GpuUsageCard key={index} gpu={gpu} />)}
                            </GpuList>
                            <GpuLabel>GPU</GpuLabel>
                        </GpuBlock>
                    </>
                )}
            </UsageSection>
        </UsageRoot>
    );
};

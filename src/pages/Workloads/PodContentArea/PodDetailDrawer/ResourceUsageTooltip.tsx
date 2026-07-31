import {Progress, Tooltip} from 'antd';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';

import {isHighLoad, usagePercent} from './resourceUsage';
import {
    LegendDot,
    LegendRow,
    LegendValue,
    TooltipBar,
    TooltipBody,
    TooltipLegend,
    TooltipPercent,
    TooltipTitle,
} from './ResourceUsageTooltip.style';

import type {ReactNode} from 'react';

interface ResourceUsageTooltipProps {
    label: string;
    usage?: string;
    request?: string;
    limit?: string;
    format: (value?: string) => string;
    parse: (value?: string) => number | undefined;
    children: ReactNode;
}

// 图例顺序与配色对齐 Figma：Limit(红) / usage(浅蓝灰) / request(浅灰)。
export const ResourceUsageTooltip = ({
    label,
    usage,
    request,
    limit,
    format,
    parse,
    children,
}: ResourceUsageTooltipProps) => {
    const percent = usagePercent(usage, limit, parse);
    const highLoad = isHighLoad(percent);
    const legend = [
        { tone: 'limit', label: 'Limit', value: limit },
        { tone: 'usage', label: 'usage', value: usage },
        { tone: 'request', label: 'request', value: request },
    ] as const;

    const content = (
        <TooltipBody>
            <TooltipTitle>{label}</TooltipTitle>
            <TooltipBar>
                <Progress
                    percent={percent ?? 0}
                    showInfo={false}
                    size="small"
                    strokeColor={highLoad ? semantic.state.error.default : undefined}
                />
                <TooltipPercent data-high-load={highLoad}>
                    {percent === undefined ? '-' : `${percent}%`}
                </TooltipPercent>
            </TooltipBar>
            <TooltipLegend>
                {legend.map(item => (
                    <LegendRow key={item.tone}>
                        <LegendDot data-tone={item.tone} />
                        <span>{item.label}</span>
                        <LegendValue>{format(item.value)}</LegendValue>
                    </LegendRow>
                ))}
            </TooltipLegend>
        </TooltipBody>
    );

    return (
        <Tooltip
            title={content}
            color={semantic.bg.default}
            styles={{ container: { padding: `${spacing.s}px ${spacing.m}px` } }}
        >
            {children}
        </Tooltip>
    );
};

import {Progress, Tooltip} from 'antd';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';

import {isHighLoad, isUsageValid, usagePercent} from './resourceUsage';
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
    /** 比例分子（无单位派生字段，如 cpuMilli / memoryBytes） */
    usageNumeric?: string;
    /** 比例分母（无单位派生字段） */
    limitNumeric?: string;
    format: (value?: string) => string;
    children: ReactNode;
}

// 图例顺序与配色对齐 Figma：Limit(红) / usage(浅蓝灰) / request(浅灰)。
export const ResourceUsageTooltip = ({
    label,
    usage,
    request,
    limit,
    usageNumeric,
    limitNumeric,
    format,
    children,
}: ResourceUsageTooltipProps) => {
    const percent = isUsageValid(usage, limit) ? usagePercent(usageNumeric, limitNumeric) : undefined;
    const highLoad = isHighLoad(percent);
    const legend = [
        { tone: 'usage', label: 'usage', value: usage },
        { tone: 'request', label: 'request', value: request },
        { tone: 'limit', label: 'Limit', value: limit },
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

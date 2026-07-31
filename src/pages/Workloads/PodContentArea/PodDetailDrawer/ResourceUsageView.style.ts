import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const UsageRoot = styled.div`
    display: flex;
    align-items: flex-start;
    gap: ${spacing.l}px;
`;

export const UsageTitle = styled.span`
    flex-shrink: 0;
    ${typography.body.regular}
    color: ${semantic.text.tertiary};
`;

export const UsageSection = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xl2}px;
`;

export const UsageDivider = styled.span`
    flex-shrink: 0;
    width: 1px;
    height: 48px;
    background: ${semantic.border.divider};
`;

export const MetricBlock = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 157px;
`;

export const MetricValue = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs}px;
    ${typography.body.regular}
    color: ${semantic.text.primary};
    white-space: nowrap;
`;

export const MetricIcon = styled.img`
    width: 16px;
    height: 16px;
`;

export const MetricBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    margin: ${spacing.xs}px 0;

    .ant-5-progress {
        width: 120px;
        margin: 0;
    }
`;

export const MetricPercent = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.primary};

    &[data-high-load='true'] {
        color: ${semantic.state.error.default};
    }
`;

export const MetricLabel = styled.span`
    ${typography.caption.regular}
    color: ${semantic.text.placeholder};
`;

export const GpuBlock = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs}px;
`;

export const GpuList = styled.div`
    display: flex;
    gap: ${spacing.xs}px;
`;

export const GpuLabel = styled.span`
    ${typography.caption.regular}
    color: ${semantic.text.placeholder};
`;

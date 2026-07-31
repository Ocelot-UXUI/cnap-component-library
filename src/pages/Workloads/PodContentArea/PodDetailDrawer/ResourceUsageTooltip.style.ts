import styled from '@emotion/styled';

import {navigation, semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const TooltipBody = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 157px;
`;

export const TooltipTitle = styled.div`
    ${typography.body.medium}
    color: ${semantic.text.primary};
    margin-bottom: ${spacing.xs2}px;
`;

export const TooltipBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    margin-bottom: ${spacing.xs}px;

    .ant-5-progress {
        width: 120px;
        margin: 0;
    }
`;

export const TooltipPercent = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.primary};

    &[data-high-load='true'] {
        color: ${semantic.state.error.default};
    }
`;

export const TooltipLegend = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs2}px;
`;

export const LegendRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    ${typography.body.small}
    color: ${semantic.text.primary};
`;

export const LegendDot = styled.span`
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: ${radius.sm}px;

    &[data-tone='limit'] {
        background: ${semantic.state.error.default};
    }

    &[data-tone='usage'] {
        background: ${navigation[3]};
    }

    &[data-tone='request'] {
        background: ${semantic.border.divider};
    }
`;

export const LegendValue = styled.span`
    margin-left: ${spacing.xs}px;
`;

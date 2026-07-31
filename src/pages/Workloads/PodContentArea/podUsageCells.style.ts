import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const UsageCell = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${spacing.xs}px;
`;

export const UsageCellIcon = styled.img`
    width: 16px;
    height: 16px;
`;

/** 详细模式单元格：数值行（usage/request/limit）+ 进度条行（usage/limit 百分比） */
export const DetailedCell = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 157px;
`;

export const DetailedValue = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs}px;
    ${typography.body.regular}
    color: ${semantic.text.primary};
    white-space: nowrap;
`;

export const DetailedBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;

    .ant-5-progress {
        width: 120px;
        margin: 0;
    }
`;

export const DetailedPercent = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.primary};

    &[data-high-load='true'] {
        color: ${semantic.state.error.default};
    }
`;

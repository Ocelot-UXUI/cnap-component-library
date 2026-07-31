import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

export const ClusterTableWrapper = styled.div`
    min-height: 158px;
    max-height: 238px;
    overflow-y: auto;

    .cluster-row td {
        cursor: pointer;
    }

    .cluster-row:hover td {
        background: ${semantic.state.component.selectHover};
    }

    .cluster-row-selected td,
    .cluster-row-selected:hover td {
        background: ${semantic.state.component.selectActive};
    }
`;

export const ClusterStateBox = styled.div`
    min-height: 158px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${spacing.s}px;
    color: ${semantic.text.secondary};
`;

export const ClusterRetryButton = styled.button`
    height: 28px;
    padding: 0 ${spacing.m}px;
    border: 1px solid ${semantic.border.card};
    border-radius: ${radius.md}px;
    background: ${semantic.bg.default};
    color: ${semantic.text.primary};
    font: inherit;
    cursor: pointer;
`;

import styled from '@emotion/styled';

import {spacing} from '@/constants/spacing';

export const VersionList = styled.div`
    display: flex;
    min-width: 240px;
    flex-direction: column;
    gap: ${spacing.s}px;
`;

export const VersionRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${spacing.xl2}px;
`;

export const MoreTrigger = styled.button`
    display: inline-flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
`;

export const MoreDots = styled.span`
    display: flex;
    align-items: center;
    gap: ${spacing.xs / 2}px;

    img {
        width: 2px;
        height: 2px;
    }
`;

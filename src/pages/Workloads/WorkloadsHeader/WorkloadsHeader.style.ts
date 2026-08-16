import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: ${spacing.xl4}px 0;
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xl2}px;
`;

export const HeaderTitle = styled.h1`
    ${typography.heading.h2}
    color: ${semantic.text.primary};
    margin: 0;
`;

export const HeaderDivider = styled.div`
    width: 1px;
    height: 20px;
    background-color: ${semantic.border.divider};
`;

export const WorkloadGroupSelector = styled.div`
    display: flex;
    align-items: center;
    min-width: 160px;

    .anticon {
        color: ${semantic.text.tertiary};
    }
`;

export const HeaderRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    min-width: 0;
    white-space: nowrap;
`;

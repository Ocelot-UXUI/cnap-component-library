import styled from '@emotion/styled';

import {spacing} from '@/constants/spacing';

/** 视觉规范给定的抽屉宽度档位（px），默认档为 m */
export const DRAWER_SIZE_WIDTH = {
    s: 600,
    m: 800,
    l: 980,
} as const;

export const HeaderExtra = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

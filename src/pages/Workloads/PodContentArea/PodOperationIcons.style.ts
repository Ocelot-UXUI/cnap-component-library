import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';

export const IconFrame = styled.span`
    position: relative;
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
`;

export const IconPart = styled.img<{ top: number; left: number; width?: number; height?: number; }>`
    position: absolute;
    top: ${({ top }) => top}px;
    left: ${({ left }) => left}px;
    width: ${({ width }) => width ? `${width}px` : 'auto'};
    height: ${({ height }) => height ? `${height}px` : 'auto'};
`;

export const SvgIcon = styled.span`
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    color: ${semantic.text.secondary};

    svg {
        width: 16px;
        height: 16px;
    }
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

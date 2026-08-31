import styled from '@emotion/styled';

import {spacing} from '@/constants/spacing';

interface PaneScrollProps {
    $isFullBleed: boolean;
}

const paneScrollStyleProps = new Set(['$isFullBleed']);

export const PaneScroll = styled('div', {
    shouldForwardProp: prop => !paneScrollStyleProps.has(prop),
})<PaneScrollProps>`
    box-sizing: border-box;
    height: 100%;
    padding: ${({$isFullBleed}: PaneScrollProps) => ($isFullBleed ? 0 : `${spacing.xl3}px ${spacing.xl5}px`)};
    overflow-x: hidden;
    overflow-y: ${({$isFullBleed}: PaneScrollProps) => ($isFullBleed ? 'hidden' : 'auto')};

    @media (max-width: 768px) {
        padding: ${({$isFullBleed}: PaneScrollProps) => ($isFullBleed ? 0 : `${spacing.xl}px ${spacing.l}px`)};
    }
`;

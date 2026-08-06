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
    overflow-x: hidden;
    overflow-y: ${({$isFullBleed}: PaneScrollProps) => ($isFullBleed ? 'hidden' : 'auto')};
    padding: ${({$isFullBleed}: PaneScrollProps) => ($isFullBleed ? 0 : `${spacing.xl2}px ${spacing.xl4}px`)};
`;

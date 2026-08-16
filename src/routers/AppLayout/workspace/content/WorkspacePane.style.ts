import styled from '@emotion/styled';

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
`;

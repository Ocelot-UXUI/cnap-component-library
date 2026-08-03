import {css} from '@emotion/react';
import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

export const TerminalPanel = styled.div<{ fullscreen: boolean; }>`
    display: flex;
    flex-direction: column;
    gap: ${spacing.s}px;
    ${({ fullscreen }) =>
    fullscreen
        ? css`
                  position: fixed;
                  inset: 0;
                  z-index: 1050;
                  background: ${semantic.bg.default};
                  padding: ${spacing.l}px;
              `
        : css`
                  height: 460px;
              `}
`;

export const TerminalSurface = styled.div`
    flex: 1;
    min-height: 240px;
    overflow: hidden;
    border-radius: ${radius.lg}px;
    padding: ${spacing.s}px;
    background: ${semantic.logConsole.bg};

    .xterm,
    .xterm-viewport,
    .xterm-screen {
        background: transparent;
    }
`;

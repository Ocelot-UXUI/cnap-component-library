import {css} from '@emotion/react';
import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';

export const LogsPanel = styled.div<{ fullscreen: boolean; }>`
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

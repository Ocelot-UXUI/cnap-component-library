import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

import type {StatusTone} from './podStatus';

/** 各 tone 的药丸标签配色：浅底（light）+ 深字（default），均来自 semantic state token */
const TONE_STYLE: Record<StatusTone, { bg: string; fg: string }> = {
    success: { bg: semantic.state.success.light, fg: semantic.state.success.default },
    info: { bg: semantic.state.info.light, fg: semantic.state.info.default },
    warning: { bg: semantic.state.warning.light, fg: semantic.state.warning.default },
    error: { bg: semantic.state.error.light, fg: semantic.state.error.default },
};

/** 状态药丸标签：圆角浅底 + 对应状态色文字（替代 antd Badge） */
export const StatusTag = styled.span<{ $tone: StatusTone; }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    padding: 0 ${spacing.s}px;
    border-radius: ${radius.xl2}px;
    ${typography.caption.regular}
    line-height: 20px;
    white-space: nowrap;
    background-color: ${({ $tone }) => TONE_STYLE[$tone].bg};
    color: ${({ $tone }) => TONE_STYLE[$tone].fg};
`;

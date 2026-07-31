import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

import type {LogLevel} from './logLine';

const LEVEL_COLOR: Record<LogLevel, string> = {
    INFO: semantic.logConsole.level.info,
    WARN: semantic.logConsole.level.warn,
    ERROR: semantic.logConsole.level.error,
    DEBUG: semantic.logConsole.level.debug,
    OTHER: semantic.logConsole.text,
};

export const ConsoleSurface = styled.div`
    flex: 1;
    min-height: 240px;
    overflow: auto;
    background: ${semantic.logConsole.bg};
    border-radius: ${radius.lg}px;
    padding: ${spacing.s}px ${spacing.m}px;
    ${typography.code.small}
    color: ${semantic.logConsole.text};
`;

export const EmptyHint = styled.div`
    height: 100%;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${semantic.text.tertiary};
`;

export const LogRow = styled.div`
    white-space: pre-wrap;
    word-break: break-all;
    padding: 1px 0;
`;

export const Timestamp = styled.span`
    color: ${semantic.logConsole.timestamp};
    margin-right: ${spacing.s}px;
`;

export const LevelTag = styled.span<{ level: LogLevel; }>`
    color: ${({ level }) => LEVEL_COLOR[level]};
    margin-right: ${spacing.s}px;
    font-weight: 500;
`;

export const Message = styled.span<{ level: LogLevel; }>`
    color: ${({ level }) => (level === 'OTHER' ? semantic.logConsole.text : LEVEL_COLOR[level])};
`;

export const Mark = styled.mark`
    background: ${semantic.logConsole.highlightBg};
    color: ${semantic.logConsole.highlightText};
    border-radius: ${radius.sm}px;
`;

export const MarkerLine = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    margin: ${spacing.xs}px 0;
    color: ${semantic.logConsole.marker};
    ${typography.caption.regular}

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: ${semantic.logConsole.marker};
        opacity: 0.6;
    }
`;

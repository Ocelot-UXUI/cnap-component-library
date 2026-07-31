import {Fragment, useEffect, useRef} from 'react';

import {ConsoleSurface, EmptyHint, LevelTag, LogRow, Mark, MarkerLine, Message, Timestamp} from './LogConsole.style';
import {splitByKeyword} from './logLine';

import type {ReactNode} from 'react';
import type {LogLine} from './logLine';

interface LogConsoleProps {
    lines: LogLine[];
    keyword: string;
    /** 在该 id 的日志行下方渲染分隔标记线；无标记时为 null */
    markerAfterId: number | null;
    /** 是否随新日志自动滚动到底部 */
    autoScroll: boolean;
    emptyText: string;
}

interface LogParts {
    timestamp: string;
    levelText: string;
    message: string;
}

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+/;
const LEVEL_TOKEN_RE = /^(INFO|WARN|WARNING|ERROR|ERR|FATAL|DEBUG|TRACE)\s+/i;

const parseLogParts = (raw: string): LogParts => {
    let rest = raw;
    let timestamp = '';
    const tsMatch = rest.match(TIMESTAMP_RE);
    if (tsMatch) {
        timestamp = tsMatch[1];
        rest = rest.slice(tsMatch[0].length);
    }
    let levelText = '';
    const lvMatch = rest.match(LEVEL_TOKEN_RE);
    if (lvMatch) {
        levelText = lvMatch[1];
        rest = rest.slice(lvMatch[0].length);
    }
    return { timestamp, levelText, message: rest };
};

const renderHighlighted = (text: string, keyword: string): ReactNode[] =>
    splitByKeyword(text, keyword).map((segment, index) =>
        segment.match
            ? <Mark key={index}>{segment.text}</Mark>
            : <Fragment key={index}>{segment.text}</Fragment>
    );

export const LogConsole = ({ lines, keyword, markerAfterId, autoScroll, emptyText }: LogConsoleProps) => {
    const surfaceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && surfaceRef.current) {
            surfaceRef.current.scrollTop = surfaceRef.current.scrollHeight;
        }
    }, [lines, autoScroll]);

    if (lines.length === 0) {
        return (
            <ConsoleSurface>
                <EmptyHint>{emptyText}</EmptyHint>
            </ConsoleSurface>
        );
    }

    return (
        <ConsoleSurface ref={surfaceRef}>
            {lines.map(line => {
                const { timestamp, levelText, message } = parseLogParts(line.raw);
                return (
                    <Fragment key={line.id}>
                        <LogRow>
                            {timestamp && <Timestamp>{renderHighlighted(timestamp, keyword)}</Timestamp>}
                            {levelText && <LevelTag level={line.level}>{levelText}</LevelTag>}
                            <Message level={line.level}>{renderHighlighted(message, keyword)}</Message>
                        </LogRow>
                        {markerAfterId === line.id && <MarkerLine>最新</MarkerLine>}
                    </Fragment>
                );
            })}
        </ConsoleSurface>
    );
};

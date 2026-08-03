export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'OTHER';

export type LogLevelFilter = 'ALL' | LogLevel;

export interface LogLine {
    id: number;
    raw: string;
    level: LogLevel;
}

export interface HighlightSegment {
    text: string;
    match: boolean;
}

/** 前端保留的最大日志行数，超出后丢弃最旧行以防内存膨胀 */
export const MAX_LOG_LINES = 2000;

/** 暂停期间增量缓存的时间窗上限（毫秒），超窗的最旧缓存增量被丢弃 */
export const PAUSE_CACHE_WINDOW_MS = 3 * 60 * 1000;

/** 暂停缓存条目：日志行 + 客户端到达时间（接口不下发时间戳，按到达时间裁剪时间窗） */
export interface CachedLogLine {
    line: LogLine;
    at: number;
}

/** 按客户端到达时间裁剪暂停缓存，丢弃超出时间窗的最旧增量 */
export const pruneCache = (
    cache: CachedLogLine[],
    now: number,
    windowMs: number = PAUSE_CACHE_WINDOW_MS,
): CachedLogLine[] => cache.filter(item => now - item.at <= windowMs);

const LEVEL_ALIASES: Record<string, LogLevel> = {
    INFO: 'INFO',
    WARN: 'WARN',
    WARNING: 'WARN',
    ERROR: 'ERROR',
    ERR: 'ERROR',
    FATAL: 'ERROR',
    DEBUG: 'DEBUG',
    TRACE: 'DEBUG',
};

/** 从行首若干 token 中识别日志级别，未命中记为 OTHER */
export const detectLogLevel = (raw: string): LogLevel => {
    const tokens = raw.split(/\s+/, 4);
    for (const token of tokens) {
        const level = LEVEL_ALIASES[token.toUpperCase()];
        if (level) {
            return level;
        }
    }
    return 'OTHER';
};

export const toLogLine = (raw: string, id: number): LogLine => ({
    id,
    raw,
    level: detectLogLevel(raw),
});

const matchesKeyword = (line: LogLine, keyword: string): boolean =>
    line.raw.toLowerCase().includes(keyword.toLowerCase());

const matchesLevel = (line: LogLine, level: LogLevelFilter): boolean => level === 'ALL' || line.level === level;

/** 前端过滤：按关键字（大小写不敏感子串）与日志级别筛选 */
export const filterLogLines = (
    lines: LogLine[],
    keyword: string,
    level: LogLevelFilter,
): LogLine[] => {
    const trimmed = keyword.trim();
    return lines.filter(line => matchesLevel(line, level) && (!trimmed || matchesKeyword(line, trimmed)));
};

/** 保留最近 max 行，超出丢弃最旧行 */
export const trimLogLines = (lines: LogLine[], max: number = MAX_LOG_LINES): LogLine[] =>
    lines.length > max ? lines.slice(lines.length - max) : lines;

/** 将文本按关键字切成高亮/非高亮片段（大小写不敏感） */
export const splitByKeyword = (text: string, keyword: string): HighlightSegment[] => {
    const trimmed = keyword.trim();
    if (!trimmed) {
        return [{ text, match: false }];
    }
    const segments: HighlightSegment[] = [];
    const lowerText = text.toLowerCase();
    const lowerKeyword = trimmed.toLowerCase();
    let cursor = 0;
    for (;;) {
        const index = lowerText.indexOf(lowerKeyword, cursor);
        if (index === -1) {
            break;
        }
        if (index > cursor) {
            segments.push({ text: text.slice(cursor, index), match: false });
        }
        segments.push({ text: text.slice(index, index + trimmed.length), match: true });
        cursor = index + trimmed.length;
    }
    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), match: false });
    }
    return segments;
};

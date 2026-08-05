import dayjs from 'dayjs';

/**
 * 日期数组类型 [year, month, day, hour, minute, second]
 */
export type DateArray = [number, number, number, number, number, number];

/**
 * 将日期数组转换为 ISO 字符串
 * @param dateArray [year, month, day, hour, minute, second]
 * @returns ISO 格式的日期字符串
 */
export const convertDateArrayToISO = (dateArray: number[]): string => {
    if (!Array.isArray(dateArray) || dateArray.length < 6) {
        return '';
    }
    const [year, month, day, hour, minute, second] = dateArray;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
};

/**
 * 标准化日期值（支持字符串和数组格式）
 * @param date 日期值，可能是字符串或数组
 * @returns ISO 格式的日期字符串
 */
export const normalizeDateValue = (date: string | number[] | undefined): string => {
    if (!date) {
        return '';
    }
    if (Array.isArray(date)) {
        return convertDateArrayToISO(date);
    }
    return date;
};

export const formatISOTime = (dateString: string | number, formatRule = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return dayjs(dateString).format(formatRule);
    } catch {
        return '';
    }
};

/**
 * 格式化日期为短格式 (YYYY-MM-DD)
 * @param dateStr 日期字符串或数组
 * @returns 格式化后的日期字符串，空值返回 '-'
 */
export const formatDateShort = (dateStr?: string | number[] | null): string => {
    if (!dateStr) {
        return '-';
    }
    const normalized = normalizeDateValue(dateStr);
    if (!normalized) {
        return '-';
    }
    try {
        return dayjs(normalized).format('YYYY-MM-DD');
    } catch {
        return '-';
    }
};

/**
 * 格式化日期为完整格式 (YYYY-MM-DD HH:mm:ss)
 * @param dateStr 日期字符串或数组
 * @returns 格式化后的日期字符串，空值返回 '-'
 */
export const formatDateFull = (dateStr?: string | number[] | null): string => {
    if (!dateStr) {
        return '-';
    }
    const normalized = normalizeDateValue(dateStr);
    if (!normalized) {
        return '-';
    }
    try {
        return dayjs(normalized).format('YYYY-MM-DD HH:mm:ss');
    } catch {
        return '-';
    }
};

/**
 * @author zulu
 * 计算两个时间的时间差，返回人性化的描述
 * @param targetTime 目标时间，可以是Date对象、时间戳(毫秒)或日期字符串
 * @param relativeTime 相对时间(选填，默认为当前时间)，可以是Date对象、时间戳(毫秒)或日期字符串
 * @returns 返回如"前2年"、"前3个月"、"前5天"、"前10分钟"、"前30秒"这样的字符串
 * @throws 时间格式错误时抛出错误
 */
export const howLongAgo = (
    targetTime: Date | number | string,
    relativeTime: Date | number | string = Date.now(),
): string => {
    const targetDate = new Date(targetTime);
    const relativeDate = new Date(relativeTime);

    if (isNaN(targetDate.getTime()) || isNaN(relativeDate.getTime())) {
        throw new Error('无效的时间格式');
    }

    const relativeTimestamp = relativeDate.getTime();
    const targetTimestamp = targetDate.getTime();

    const diffInSeconds = Math.floor(Math.abs(relativeTimestamp - targetTimestamp) / 1000);

    if (diffInSeconds < 60) {
        return `${diffInSeconds}秒`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}分钟`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}小时`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays}天`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}个月`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);

    return `${diffInYears}年`;
};

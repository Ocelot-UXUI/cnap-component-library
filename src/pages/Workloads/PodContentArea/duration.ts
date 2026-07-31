/** 存活时长格式化（纯逻辑）：creationTimestamp → "Nd Nh" / "Nh Nm" / "Nm"。 */

import dayjs from 'dayjs';

/** 计算从 creationTimestamp 到 now 的存活时长，缺失/非法返回 '-' */
export function formatAge(creationTimestamp?: string, now: dayjs.ConfigType = undefined): string {
    if (!creationTimestamp) {
        return '-';
    }
    const start = dayjs(creationTimestamp);
    if (!start.isValid()) {
        return '-';
    }
    const end = dayjs(now);
    let diff = end.diff(start, 'minute');
    if (diff < 0) {
        diff = 0;
    }
    const days = Math.floor(diff / 1440);
    const hours = Math.floor((diff % 1440) / 60);
    const minutes = diff % 60;
    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

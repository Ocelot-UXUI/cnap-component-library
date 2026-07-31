/** Pod 事件视图逻辑（纯逻辑）：级别色调 / 相对时间 / 关键字过滤。 */

import dayjs from 'dayjs';

import type {PodEvent, PodEventType} from '@/interface/entities/podEvent';
import type {StatusTone} from '../podStatus';

/** 事件级别 → 徽章色调 */
export function eventTone(type: PodEventType): StatusTone {
    if (type === 'Warning') {
        return 'warning';
    }
    if (type === 'Normal') {
        return 'info';
    }
    return 'error';
}

/** lastSeen → 相对时间（"3d前" / "7h40m前" / "5m前"） */
export function relativeTime(iso?: string, now: dayjs.ConfigType = undefined): string {
    if (!iso) {
        return '-';
    }
    const time = dayjs(iso);
    if (!time.isValid()) {
        return '-';
    }
    let diff = dayjs(now).diff(time, 'minute');
    if (diff < 0) {
        diff = 0;
    }
    const days = Math.floor(diff / 1440);
    const hours = Math.floor((diff % 1440) / 60);
    const minutes = diff % 60;
    if (days > 0) {
        return `${days}d前`;
    }
    if (hours > 0) {
        return `${hours}h${minutes}m前`;
    }
    return `${minutes}m前`;
}

/** 按原因 / 消息 / 对象名称模糊匹配（不区分大小写） */
export function matchEvent(event: PodEvent, keyword: string): boolean {
    const kw = keyword.trim().toLowerCase();
    if (!kw) {
        return true;
    }
    return [event.reason, event.message, event.objectName]
        .some(field => (field ?? '').toLowerCase().includes(kw));
}

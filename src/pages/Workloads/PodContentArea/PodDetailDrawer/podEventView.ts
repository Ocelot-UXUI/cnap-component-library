/** Pod 事件视图逻辑（纯逻辑）：级别色调 / 相对时间 / 关键字过滤。 */
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

/** 按原因 / 消息 / 对象名称模糊匹配（不区分大小写） */
export function matchEvent(event: PodEvent, keyword: string): boolean {
    const kw = keyword.trim().toLowerCase();
    if (!kw) {
        return true;
    }
    return [event.reason, event.message, event.objectName]
        .some(field => (field ?? '').toLowerCase().includes(kw));
}

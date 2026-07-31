import dayjs from 'dayjs';

export function formatDateTime(dateTimeStr: string) {
    return dayjs(dateTimeStr).format('MM-DD HH:mm:ss');
}
export function formatYYDateTime(dateTimeStr: string) {
    return dayjs(dateTimeStr).format('YYYY-MM-DD HH:mm:ss');
}

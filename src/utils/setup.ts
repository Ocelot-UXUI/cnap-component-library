import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 扩展 dayjs 插件
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.locale('zh-cn');

// 兼容性处理
window.global ||= window;

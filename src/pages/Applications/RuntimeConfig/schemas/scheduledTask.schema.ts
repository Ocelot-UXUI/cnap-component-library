/* eslint-disable no-useless-escape */
import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const scheduledTaskSchema: TabSchema = {
    key: 'scheduledTask',
    label: '定时任务',
    fields: [
        {
            name: 'cronMinute',
            label: '分钟',
            component: 'Input',
            initialValue: '0',
            required: true,
            placeholder: '0-59 或 */5',
            tooltip: 'Cron 分钟字段，支持 * / , - 语法',
            validators: [{ name: 'cronField' }],
            aiMeta: { role: 'field', param: 'cronMinute', desc: 'Cron 分钟' },
        },
        {
            name: 'cronHour',
            label: '小时',
            component: 'Input',
            initialValue: '*',
            required: true,
            placeholder: '0-23 或 */6',
            tooltip: 'Cron 小时字段',
            validators: [{ name: 'cronField' }],
            aiMeta: { role: 'field', param: 'cronHour', desc: 'Cron 小时' },
        },
        {
            name: 'cronDay',
            label: '日',
            component: 'Input',
            initialValue: '*',
            required: true,
            placeholder: '1-31 或 *',
            tooltip: 'Cron 日字段',
            validators: [{ name: 'cronField' }],
            aiMeta: { role: 'field', param: 'cronDay', desc: 'Cron 日' },
        },
        {
            name: 'cronMonth',
            label: '月',
            component: 'Input',
            initialValue: '*',
            required: true,
            placeholder: '1-12 或 *',
            tooltip: 'Cron 月字段',
            validators: [{ name: 'cronField' }],
            aiMeta: { role: 'field', param: 'cronMonth', desc: 'Cron 月' },
        },
        {
            name: 'cronWeek',
            label: '星期',
            component: 'Input',
            initialValue: '*',
            required: true,
            placeholder: '0-6 或 *（0=周日）',
            tooltip: 'Cron 星期字段，0 表示周日',
            validators: [{ name: 'cronField' }],
            aiMeta: { role: 'field', param: 'cronWeek', desc: 'Cron 星期' },
        },
        {
            name: 'concurrencyPolicy',
            label: '并发策略',
            component: 'Select',
            initialValue: 'Forbid',
            options: [
                { label: 'Allow（允许并发）', value: 'Allow' },
                { label: 'Forbid（禁止并发）', value: 'Forbid' },
                { label: 'Replace（替换旧任务）', value: 'Replace' },
            ],
            tooltip: '当上一次任务还未完成时，新任务的处理策略',
            aiMeta: { role: 'field', param: 'concurrencyPolicy', desc: 'CronJob 并发策略' },
        },
        {
            name: 'successfulJobsHistoryLimit',
            label: '保留成功任务数',
            component: 'InputNumber',
            initialValue: 3,
            componentProps: { min: 0, max: 100, style: { width: '100%' } },
            tooltip: '保留最近成功完成的 Job 数量',
            aiMeta: { role: 'field', param: 'successfulJobsHistoryLimit', desc: '保留成功 Job 数量' },
        },
        {
            name: 'failedJobsHistoryLimit',
            label: '保留失败任务数',
            component: 'InputNumber',
            initialValue: 1,
            componentProps: { min: 0, max: 100, style: { width: '100%' } },
            tooltip: '保留最近失败的 Job 数量',
            aiMeta: { role: 'field', param: 'failedJobsHistoryLimit', desc: '保留失败 Job 数量' },
        },
    ],
};

export const scheduledTaskValidators: ValidatorRegistry = {
    cronField: (_params, _form) => ({
        validator: async (_rule, value: string | undefined) => {
            if (!value) {
                return;
            }
            // 简单校验：只允许数字、* / , - 字符
            if (!/^[\d*/,\-]+$/.test(value)) {
                return Promise.reject(new Error('Cron 字段只能包含数字、* / , - 字符'));
            }
        },
    }),
};

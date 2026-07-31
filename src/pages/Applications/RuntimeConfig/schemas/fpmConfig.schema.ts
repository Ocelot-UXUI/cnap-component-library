import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const fpmConfigSchema: TabSchema = {
    key: 'fpmConfig',
    label: 'FPM配置',
    fields: [
        {
            name: 'fpmEnableFaults',
            label: '启用故障迁移',
            component: 'Switch',
            initialValue: false,
            tooltip: '开启后，检测到故障的 Pod 将自动迁移',
            aiMeta: { role: 'field', param: 'fpmEnableFaults', desc: '是否启用故障迁移' },
        },
        {
            name: 'fpmFaultType',
            label: '故障类型',
            component: 'Select',
            visible: { fieldName: 'fpmEnableFaults', value: true },
            options: [
                { label: 'OOM', value: 'OOM' },
                { label: 'CrashLoop', value: 'CrashLoop' },
                { label: 'NodeNotReady', value: 'NodeNotReady' },
            ],
            placeholder: '选择故障类型',
            aiMeta: { role: 'field', param: 'fpmFaultType', desc: '触发迁移的故障类型' },
        },
        {
            name: 'fpmTimeoutSeconds',
            label: '故障超时时间(s)',
            component: 'InputNumber',
            initialValue: 300,
            visible: { fieldName: 'fpmEnableFaults', value: true },
            componentProps: { min: 60, max: 3600, style: { width: '100%' } },
            tooltip: '故障持续超过此时间后触发迁移',
            aiMeta: { role: 'field', param: 'fpmTimeoutSeconds', desc: '故障超时时间' },
        },
        {
            name: 'fpmEnableMigrationPeriod',
            label: '启用迁移周期限制',
            component: 'Switch',
            initialValue: false,
            aiMeta: { role: 'field', param: 'fpmEnableMigrationPeriod', desc: '是否启用迁移周期限制' },
        },
        {
            name: 'fpmMigrationPeriodSeconds',
            label: '迁移周期(s)',
            component: 'InputNumber',
            initialValue: 3600,
            visible: { fieldName: 'fpmEnableMigrationPeriod', value: true },
            componentProps: { min: 60, style: { width: '100%' } },
            tooltip: '在此时间窗口内限制迁移次数',
            aiMeta: { role: 'field', param: 'fpmMigrationPeriodSeconds', desc: '迁移周期时间窗口' },
        },
        {
            name: 'fpmEnableSafemode',
            label: '启用安全模式阈值',
            component: 'Switch',
            initialValue: false,
            tooltip: '当迁移比例超过阈值时停止迁移，防止雪崩',
            aiMeta: { role: 'field', param: 'fpmEnableSafemode', desc: '是否启用安全模式阈值' },
        },
        {
            name: 'fpmSafemodeThreshold',
            label: '安全模式阈值 (%)',
            component: 'InputNumber',
            initialValue: 30,
            visible: { fieldName: 'fpmEnableSafemode', value: true },
            componentProps: { min: 1, max: 100, style: { width: '100%' } },
            tooltip: '迁移 Pod 比例超过此阈值时停止迁移',
            aiMeta: { role: 'field', param: 'fpmSafemodeThreshold', desc: '安全模式阈值' },
        },
    ],
};

export const fpmConfigValidators: ValidatorRegistry = {};

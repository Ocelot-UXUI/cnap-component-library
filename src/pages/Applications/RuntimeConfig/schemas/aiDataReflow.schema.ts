import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const aiDataReflowSchema: TabSchema = {
    key: 'aiDataReflow',
    label: 'AI数据回流',
    fields: [
        {
            name: 'flywheelEnable',
            label: '启用 AI 数据回流',
            component: 'Switch',
            initialValue: false,
            tooltip: '开启后将自动采集推理数据回流到训练平台',
            aiMeta: { role: 'field', param: 'flywheelEnable', desc: '是否启用 AI 数据回流' },
        },
        {
            name: 'flywheelCpu',
            label: '回流 CPU',
            component: 'Input',
            initialValue: '100m',
            visible: { fieldName: 'flywheelEnable', value: true },
            placeholder: '如 100m、0.5',
            validators: [{ name: 'cpuFormat' }],
            aiMeta: { role: 'field', param: 'flywheelCpu', desc: '数据回流 sidecar CPU' },
        },
        {
            name: 'flywheelMemory',
            label: '回流 Memory',
            component: 'Input',
            initialValue: '128Mi',
            visible: { fieldName: 'flywheelEnable', value: true },
            placeholder: '如 128Mi、1Gi',
            validators: [{ name: 'memoryFormat' }],
            aiMeta: { role: 'field', param: 'flywheelMemory', desc: '数据回流 sidecar Memory' },
        },
        {
            name: 'flywheelSampleRate',
            label: '采样率 (%)',
            component: 'Slider',
            initialValue: 100,
            visible: { fieldName: 'flywheelEnable', value: true },
            componentProps: { min: 1, max: 100, marks: { 1: '1%', 50: '50%', 100: '100%' } },
            tooltip: '推理数据采样比例，100% 表示全量采集',
            aiMeta: { role: 'field', param: 'flywheelSampleRate', desc: '数据回流采样率' },
        },
        {
            name: 'flywheelStoragePath',
            label: '存储路径',
            component: 'Input',
            visible: { fieldName: 'flywheelEnable', value: true },
            placeholder: '如 /data/reflow',
            validators: [{ name: 'absolutePath' }],
            tooltip: '回流数据在容器内的临时存储路径',
            aiMeta: { role: 'field', param: 'flywheelStoragePath', desc: '数据回流存储路径' },
        },
    ],
};

export const aiDataReflowValidators: ValidatorRegistry = {};

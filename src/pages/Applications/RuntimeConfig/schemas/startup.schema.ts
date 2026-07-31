/* eslint-disable max-lines */
import type {ObjectSchema, TabSchema} from '../schema/types';

/**
 * 启动配置 Schema
 * 参考 CNAP1.0 的 PluginConfigForm/PluginConfigContent/StartupFields
 */

// 启动方式选项
const startTypeOptions = [
    { label: 'supervisor模式', value: 'supervisor' },
    { label: '后台启动模式', value: 'background' },
    { label: '前台启动模式', value: 'foreground' },
];

// 探针协议选项
const probeTypeOptions = [
    { label: 'TCP', value: 'TCP' },
    { label: 'HTTP', value: 'HTTP' },
    { label: 'NONE', value: 'NONE' },
];

// 是/否选项
const booleanOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
];

/**
 * 启动配置项 Schema
 * 每个启动项是一个对象，包含多个字段
 */
const startupItemSchema: ObjectSchema = {
    type: 'object',
    fields: [
        // 始终显示的字段
        {
            type: 'field',
            name: 'startCommand',
            label: '启动命令',
            component: 'Input',
            placeholder: '请输入',
            required: true,
        },

        // 展开后显示的字段（通过 expanded 字段控制）
        {
            type: 'field',
            name: 'stopCommand',
            label: '停止命令',
            component: 'Input',
            placeholder: '请输入',
            visible: { fieldName: 'expanded', value: true },
        },
        {
            type: 'row',
            fields: [
                {
                    type: 'field',
                    name: 'killGroup',
                    label: '停止进程组',
                    component: 'Radio',
                    options: booleanOptions,
                    initialValue: false,
                    visible: { fieldName: 'expanded', value: true },
                },
                {
                    type: 'field',
                    name: 'keyModule',
                    label: '关键模块',
                    component: 'Radio',
                    options: booleanOptions,
                    initialValue: true,
                    visible: { fieldName: 'expanded', value: true },
                },
            ],
            visible: { fieldName: 'expanded', value: true },
        },
        {
            type: 'row',
            fields: [
                {
                    type: 'field',
                    name: 'startType',
                    label: '启动方式',
                    component: 'Select',
                    options: startTypeOptions,
                    placeholder: '请选择',
                    visible: { fieldName: 'expanded', value: true },
                },
                {
                    type: 'field',
                    name: 'startTimeout',
                    label: '启动超时',
                    component: 'InputNumber',
                    placeholder: '请输入',
                    initialValue: 0,
                    visible: { fieldName: 'expanded', value: true },
                },
            ],
            visible: { fieldName: 'expanded', value: true },
        },
        {
            type: 'field',
            name: 'workDir',
            label: '工作路径',
            component: 'Input',
            placeholder: '请输入',
            initialValue: './',
            visible: { fieldName: 'expanded', value: true },
        },
        {
            type: 'field',
            name: 'enableProbe',
            label: '探针配置',
            component: 'Switch',
            initialValue: true,
            visible: { fieldName: 'expanded', value: true },
        },

        // 探针配置（enableProbe=true 时显示）
        {
            type: 'row',
            fields: [
                {
                    type: 'field',
                    name: 'probeType',
                    label: '协议',
                    component: 'Select',
                    options: probeTypeOptions,
                    placeholder: '请选择',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [{ fieldName: 'enableProbe', value: true }],
                    },
                },
                {
                    type: 'field',
                    name: 'portOffset',
                    label: '端口偏移量',
                    component: 'Input',
                    placeholder: '请输入',
                    initialValue: '0',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [{ fieldName: 'enableProbe', value: true }],
                    },
                },
            ],
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [{ fieldName: 'enableProbe', value: true }],
            },
        },
        {
            type: 'field',
            name: 'probeURI',
            label: 'URI',
            component: 'Input',
            placeholder: '请输入，如/status.html',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [{ fieldName: 'enableProbe', value: true }],
            },
        },
        {
            type: 'field',
            name: 'probeCommand',
            label: '探针命令',
            component: 'Input',
            placeholder: '请输入命令，选填',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [{ fieldName: 'enableProbe', value: true }],
            },
        },

        // 启动探针独立配置
        {
            type: 'field',
            name: ['startupProbe', 'enable'],
            label: '启动探针独立配置',
            component: 'Switch',
            initialValue: false,
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [{ fieldName: 'enableProbe', value: true }],
            },
        },
        {
            type: 'row',
            fields: [
                {
                    type: 'field',
                    name: ['startupProbe', 'type'],
                    label: '协议',
                    component: 'Select',
                    options: probeTypeOptions,
                    placeholder: '请选择',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [
                            { fieldName: 'enableProbe', value: true },
                            { fieldName: ['startupProbe', 'enable'], value: true },
                        ],
                    },
                },
                {
                    type: 'field',
                    name: ['startupProbe', 'portOffset'],
                    label: '端口偏移量',
                    component: 'Input',
                    placeholder: '请输入',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [
                            { fieldName: 'enableProbe', value: true },
                            { fieldName: ['startupProbe', 'enable'], value: true },
                        ],
                    },
                },
            ],
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['startupProbe', 'enable'], value: true },
                ],
            },
        },
        {
            type: 'field',
            name: ['startupProbe', 'uri'],
            label: 'URI',
            component: 'Input',
            placeholder: '请输入，如/status.html',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['startupProbe', 'enable'], value: true },
                ],
            },
        },
        {
            type: 'field',
            name: ['startupProbe', 'command'],
            label: '探针命令',
            component: 'Input',
            placeholder: '请输入命令，选填',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['startupProbe', 'enable'], value: true },
                ],
            },
        },

        // 就绪探针独立配置
        {
            type: 'field',
            name: ['readinessProbe', 'enable'],
            label: '就绪探针独立配置',
            component: 'Switch',
            initialValue: false,
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [{ fieldName: 'enableProbe', value: true }],
            },
        },
        {
            type: 'row',
            fields: [
                {
                    type: 'field',
                    name: ['readinessProbe', 'type'],
                    label: '协议',
                    component: 'Select',
                    options: probeTypeOptions,
                    placeholder: '请选择',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [
                            { fieldName: 'enableProbe', value: true },
                            { fieldName: ['readinessProbe', 'enable'], value: true },
                        ],
                    },
                },
                {
                    type: 'field',
                    name: ['readinessProbe', 'portOffset'],
                    label: '端口偏移量',
                    component: 'Input',
                    placeholder: '请输入',
                    visible: {
                        fieldName: 'expanded',
                        value: true,
                        and: [
                            { fieldName: 'enableProbe', value: true },
                            { fieldName: ['readinessProbe', 'enable'], value: true },
                        ],
                    },
                },
            ],
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['readinessProbe', 'enable'], value: true },
                ],
            },
        },
        {
            type: 'field',
            name: ['readinessProbe', 'uri'],
            label: 'URI',
            component: 'Input',
            placeholder: '请输入，如/status.html',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['readinessProbe', 'enable'], value: true },
                ],
            },
        },
        {
            type: 'field',
            name: ['readinessProbe', 'command'],
            label: '探针命令',
            component: 'Input',
            placeholder: '请输入命令，选填',
            visible: {
                fieldName: 'expanded',
                value: true,
                and: [
                    { fieldName: 'enableProbe', value: true },
                    { fieldName: ['readinessProbe', 'enable'], value: true },
                ],
            },
        },
    ],
};

// 默认的启动配置项
const createDefaultValue = () => ({
    expanded: true,
    startTimeout: 0,
    workDir: './',
    killGroup: false,
    keyModule: true,
    enableProbe: true,
    startupProbe: {
        enable: false,
    },
    readinessProbe: {
        enable: false,
    },
    portOffset: '0',
});

/**
 * 启动配置 Tab Schema
 */
export const startupSchema: TabSchema = {
    key: 'startup',
    label: '启动配置',
    fields: [
        {
            type: 'array',
            name: 'commandList',
            label: '启动配置列表',
            itemSchema: startupItemSchema,
            initialValue: [createDefaultValue()],
            sortable: true,
            confirmDelete: '确定删除吗？',
            expandedField: 'expanded',
            addButtonText: '添加启动配置',
            aiMeta: { role: 'arrayField', param: 'commandList', desc: '启动配置列表' },
        },
    ],
};

// 导出类型
export interface StartupItem {
    expanded: boolean;
    startCommand: string;
    stopCommand?: string;
    killGroup: boolean;
    keyModule: boolean;
    startType?: 'supervisor' | 'background' | 'foreground';
    startTimeout: number;
    workDir: string;
    enableProbe: boolean;
    probeType?: 'TCP' | 'HTTP' | 'NONE';
    portOffset: string;
    probeURI?: string;
    probeCommand?: string;
    startupProbe?: {
        enable: boolean;
        type?: 'TCP' | 'HTTP' | 'NONE';
        portOffset?: string;
        uri?: string;
        command?: string;
    };
    readinessProbe?: {
        enable: boolean;
        type?: 'TCP' | 'HTTP' | 'NONE';
        portOffset?: string;
        uri?: string;
        command?: string;
    };
}

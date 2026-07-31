/* eslint-disable max-lines */
/**
 * Schema 完整示例
 * 包含所有节点类型的综合示例
 */

import type {ArraySchema, FieldSchema, GroupSchema, ObjectSchema, RowSchema, SchemaNode, TabSchema} from './types';

// ── 选项定义 ────────────────────────────────────────────────

const booleanOptions = [
    { label: '是', value: true },
    { label: '否', value: false },
];

const protocolOptions = [
    { label: 'TCP', value: 'TCP' },
    { label: 'HTTP', value: 'HTTP' },
    { label: 'UDP', value: 'UDP' },
];

const logLevelOptions = [
    { label: 'DEBUG', value: 'debug' },
    { label: 'INFO', value: 'info' },
    { label: 'WARN', value: 'warn' },
    { label: 'ERROR', value: 'error' },
];

// ── 1. 普通字段示例 (FieldSchema) ───────────────────────────

const basicFieldExamples: FieldSchema[] = [
    // 文本输入
    {
        type: 'field',
        name: 'appName',
        label: '应用名称',
        component: 'Input',
        placeholder: '请输入应用名称',
        required: true,
        tooltip: '应用的唯一标识符',
        rules: [
            { max: 64, message: '名称不能超过64个字符' },
            { pattern: /^[a-z][a-z0-9-]*$/, message: '必须以小写字母开头，只能包含小写字母、数字和连字符' },
        ],
        aiMeta: {
            role: 'field',
            param: 'appName',
            desc: '应用名称字段',
        },
    },
    // 数字输入
    {
        type: 'field',
        name: 'replicas',
        label: '副本数',
        component: 'InputNumber',
        placeholder: '请输入副本数',
        initialValue: 1,
        required: true,
        componentProps: {
            min: 1,
            max: 100,
            step: 1,
        },
    },
    // 下拉选择
    {
        type: 'field',
        name: 'logLevel',
        label: '日志级别',
        component: 'Select',
        options: logLevelOptions,
        placeholder: '请选择日志级别',
        initialValue: 'info',
    },
    // 开关
    {
        type: 'field',
        name: 'enableMonitor',
        label: '启用监控',
        component: 'Switch',
        initialValue: true,
        tooltip: '开启后将收集应用监控指标',
    },
    // 滑块
    {
        type: 'field',
        name: 'cpuQuota',
        label: 'CPU 配额',
        component: 'Slider',
        initialValue: 50,
        componentProps: {
            min: 0,
            max: 100,
            marks: { 0: '0%', 50: '50%', 100: '100%' },
        },
    },
    // 单选组
    {
        type: 'field',
        name: 'enableSSL',
        label: '启用 SSL',
        component: 'Radio',
        options: booleanOptions,
        initialValue: false,
    },
    // 多行文本
    {
        type: 'field',
        name: 'description',
        label: '应用描述',
        component: 'TextArea',
        placeholder: '请输入应用描述',
        componentProps: {
            rows: 4,
            maxLength: 500,
            showCount: true,
        },
    },
];

// ── 2. 行布局示例 (RowSchema) ────────────────────────────────

const rowLayoutExamples: RowSchema[] = [
    // 两列等宽
    {
        type: 'row',
        fields: [
            {
                type: 'field',
                name: 'minReplicas',
                label: '最小副本',
                component: 'InputNumber',
                componentProps: { min: 1, max: 100 },
            },
            {
                type: 'field',
                name: 'maxReplicas',
                label: '最大副本',
                component: 'InputNumber',
                componentProps: { min: 1, max: 100 },
            },
        ],
    },
    // 两列不等宽
    {
        type: 'row',
        gutter: 24,
        spans: [8, 16],
        fields: [
            {
                type: 'field',
                name: 'protocol',
                label: '协议',
                component: 'Select',
                options: protocolOptions,
            },
            {
                type: 'field',
                name: 'endpoint',
                label: '端点地址',
                component: 'Input',
                placeholder: '如: /api/health',
            },
        ],
    },
    // 三列布局
    {
        type: 'row',
        fields: [
            {
                type: 'field',
                name: 'httpPort',
                label: 'HTTP 端口',
                component: 'InputNumber',
                componentProps: { min: 1, max: 65535 },
            },
            {
                type: 'field',
                name: 'grpcPort',
                label: 'gRPC 端口',
                component: 'InputNumber',
                componentProps: { min: 1, max: 65535 },
            },
            {
                type: 'field',
                name: 'debugPort',
                label: '调试端口',
                component: 'InputNumber',
                componentProps: { min: 1, max: 65535 },
            },
        ],
    },
    // 带可见性条件的行
    {
        type: 'row',
        fields: [
            {
                type: 'field',
                name: 'healthCheckPath',
                label: '健康检查路径',
                component: 'Input',
                placeholder: '/health',
            },
            {
                type: 'field',
                name: 'healthCheckInterval',
                label: '检查间隔(秒)',
                component: 'InputNumber',
                componentProps: { min: 1, max: 300 },
            },
        ],
        visible: { fieldName: 'enableMonitor', value: true },
    },
];

// ── 3. 对象嵌套示例 (ObjectSchema) ──────────────────────────

const objectExample: ObjectSchema = {
    type: 'object',
    name: 'resourceLimits',
    label: '资源限制',
    tooltip: '配置容器的 CPU 和内存限制',
    fields: [
        // 嵌套对象
        {
            type: 'object',
            name: 'requests',
            fields: [
                {
                    type: 'row',
                    fields: [
                        {
                            type: 'field',
                            name: 'cpu',
                            label: 'CPU 请求',
                            component: 'Input',
                            placeholder: '如: 100m',
                        },
                        {
                            type: 'field',
                            name: 'memory',
                            label: '内存请求',
                            component: 'Input',
                            placeholder: '如: 128Mi',
                        },
                    ],
                },
            ],
        },
        {
            type: 'object',
            name: 'limits',
            fields: [
                {
                    type: 'row',
                    fields: [
                        {
                            type: 'field',
                            name: 'cpu',
                            label: 'CPU 限制',
                            component: 'Input',
                            placeholder: '如: 500m',
                        },
                        {
                            type: 'field',
                            name: 'memory',
                            label: '内存限制',
                            component: 'Input',
                            placeholder: '如: 512Mi',
                        },
                    ],
                },
            ],
        },
    ],
};

// ── 4. 分组容器示例 (GroupSchema) ───────────────────────────

const groupExamples: GroupSchema[] = [
    // 普通分组
    {
        type: 'group',
        title: '基础配置',
        tooltip: '应用的基本配置信息',
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        type: 'field',
                        name: 'namespace',
                        label: '命名空间',
                        component: 'Input',
                        placeholder: 'default',
                    },
                    {
                        type: 'field',
                        name: 'environment',
                        label: '环境',
                        component: 'Select',
                        options: [
                            { label: '开发', value: 'dev' },
                            { label: '测试', value: 'test' },
                            { label: '预发', value: 'staging' },
                            { label: '生产', value: 'prod' },
                        ],
                    },
                ],
            },
        ],
    },
    // 可折叠分组
    {
        type: 'group',
        title: '高级配置',
        tooltip: '可选的高级配置项',
        collapsible: true,
        defaultCollapsed: true,
        fields: [
            {
                type: 'field',
                name: 'nodeSelector',
                label: '节点选择器',
                component: 'KeyValueList',
                placeholder: '添加节点标签',
            },
            {
                type: 'field',
                name: 'tolerations',
                label: '容忍度',
                component: 'KeyValueList',
            },
        ],
    },
    // 带可见性条件的分组
    {
        type: 'group',
        title: 'SSL 配置',
        collapsible: true,
        visible: { fieldName: 'enableSSL', value: true },
        fields: [
            {
                type: 'field',
                name: 'certPath',
                label: '证书路径',
                component: 'Input',
                placeholder: '/etc/ssl/cert.pem',
            },
            {
                type: 'field',
                name: 'keyPath',
                label: '私钥路径',
                component: 'Input',
                placeholder: '/etc/ssl/key.pem',
            },
        ],
    },
];

// ── 5. 数组字段示例 (ArraySchema) ───────────────────────────

// 5.1 简单数组（字符串列表）
const simpleArrayExample: ArraySchema = {
    type: 'array',
    name: 'tags',
    label: '标签',
    addButtonText: '添加标签',
    atLeastOne: false,
    itemSchema: {
        type: 'field',
        component: 'Input',
        placeholder: '输入标签',
    },
};

// 5.2 端口映射数组
const portArrayExample: ArraySchema = {
    type: 'array',
    name: 'ports',
    label: '端口映射',
    addButtonText: '添加端口',
    minItems: 1,
    maxItems: 10,
    itemSchema: {
        type: 'object',
        fields: [
            {
                type: 'row',
                fields: [
                    {
                        type: 'field',
                        name: 'name',
                        label: '名称',
                        component: 'Input',
                        placeholder: '端口名称',
                    },
                    {
                        type: 'field',
                        name: 'port',
                        label: '端口号',
                        component: 'InputNumber',
                        componentProps: { min: 1, max: 65535 },
                        required: true,
                    },
                ],
            },
            {
                type: 'row',
                fields: [
                    {
                        type: 'field',
                        name: 'protocol',
                        label: '协议',
                        component: 'Select',
                        options: protocolOptions,
                        initialValue: 'TCP',
                    },
                    {
                        type: 'field',
                        name: 'targetPort',
                        label: '目标端口',
                        component: 'InputNumber',
                        componentProps: { min: 1, max: 65535 },
                    },
                ],
            },
        ],
    },
};

// 5.3 支持排序和展开的复杂数组
const startupArrayExample: ArraySchema = {
    type: 'array',
    name: 'startupCommands',
    label: '启动命令列表',
    addButtonText: '添加启动命令',
    sortable: true,
    confirmDelete: '确定要删除此启动配置吗？',
    expandedField: 'expanded',
    itemSchema: {
        type: 'object',
        fields: [
            // 始终显示
            {
                type: 'field',
                name: 'name',
                label: '命令名称',
                component: 'Input',
                placeholder: '如: web-server',
                required: true,
            },
            {
                type: 'field',
                name: 'command',
                label: '启动命令',
                component: 'Input',
                placeholder: '如: ./start.sh',
                required: true,
            },
            // 展开后显示
            {
                type: 'field',
                name: 'args',
                label: '启动参数',
                component: 'Input',
                placeholder: '命令行参数',
                visible: { fieldName: 'expanded', value: true },
            },
            {
                type: 'row',
                fields: [
                    {
                        type: 'field',
                        name: 'workDir',
                        label: '工作目录',
                        component: 'Input',
                        placeholder: './',
                    },
                    {
                        type: 'field',
                        name: 'timeout',
                        label: '超时时间(秒)',
                        component: 'InputNumber',
                        componentProps: { min: 1 },
                    },
                ],
                visible: { fieldName: 'expanded', value: true },
            },
            // 条件显示
            {
                type: 'field',
                name: 'enableProbe',
                label: '启用探针',
                component: 'Switch',
                initialValue: false,
                visible: { fieldName: 'expanded', value: true },
            },
            {
                type: 'row',
                fields: [
                    {
                        type: 'field',
                        name: 'probePath',
                        label: '探针路径',
                        component: 'Input',
                        placeholder: '/health',
                    },
                    {
                        type: 'field',
                        name: 'probePort',
                        label: '探针端口',
                        component: 'InputNumber',
                        componentProps: { min: 1, max: 65535 },
                    },
                ],
                visible: {
                    fieldName: 'expanded',
                    value: true,
                    and: [{ fieldName: 'enableProbe', value: true }],
                },
            },
        ],
    },
    initialValue: [
        { name: '', command: '', expanded: true },
    ],
};

// 5.4 嵌套数组（数组中的对象包含数组）
const nestedArrayExample: ArraySchema = {
    type: 'array',
    name: 'containers',
    label: '容器配置',
    addButtonText: '添加容器',
    itemSchema: {
        type: 'object',
        fields: [
            {
                type: 'field',
                name: 'name',
                label: '容器名称',
                component: 'Input',
                required: true,
            },
            {
                type: 'field',
                name: 'image',
                label: '镜像地址',
                component: 'Input',
                placeholder: 'registry/image:tag',
                required: true,
            },
            // 嵌套数组：环境变量
            {
                type: 'array',
                name: 'envVars',
                label: '环境变量',
                addButtonText: '添加环境变量',
                itemSchema: {
                    type: 'object',
                    fields: [
                        {
                            type: 'row',
                            fields: [
                                {
                                    type: 'field',
                                    name: 'key',
                                    label: '变量名',
                                    component: 'Input',
                                    required: true,
                                },
                                {
                                    type: 'field',
                                    name: 'value',
                                    label: '变量值',
                                    component: 'Input',
                                },
                            ],
                        },
                        {
                            type: 'field',
                            name: 'secretRef',
                            label: '引用密钥',
                            component: 'Input',
                            placeholder: '可选，从 Secret 引用',
                        },
                    ],
                },
            },
        ],
    },
};

// ── 6. 可见性联动综合示例 ───────────────────────────────────

const visibilityExamples: SchemaNode[] = [
    // 控制字段
    {
        type: 'field',
        name: 'configType',
        label: '配置类型',
        component: 'Radio',
        options: [
            { label: '简单配置', value: 'simple' },
            { label: '高级配置', value: 'advanced' },
            { label: '自定义配置', value: 'custom' },
        ],
        initialValue: 'simple',
    },
    // 单条件显示
    {
        type: 'field',
        name: 'simpleValue',
        label: '简单值',
        component: 'Input',
        visible: { fieldName: 'configType', value: 'simple' },
    },
    // 多值匹配
    {
        type: 'field',
        name: 'advancedOptions',
        label: '高级选项',
        component: 'KeyValueList',
        visible: {
            fieldName: 'configType',
            oneOf: ['advanced', 'custom'],
        },
    },
    // 嵌套路径条件
    {
        type: 'object',
        name: 'customConfig',
        visible: { fieldName: 'configType', value: 'custom' },
        fields: [
            {
                type: 'field',
                name: 'enabled',
                label: '启用自定义',
                component: 'Switch',
                initialValue: true,
            },
            {
                type: 'field',
                name: 'customScript',
                label: '自定义脚本',
                component: 'TextArea',
                componentProps: { rows: 6 },
                visible: { fieldName: ['customConfig', 'enabled'], value: true },
            },
        ],
    },
];

// ── 7. 自定义组件示例 ────────────────────────────────────────

const customComponentExamples: FieldSchema[] = [
    // 端口列表
    {
        type: 'field',
        name: 'portList',
        label: '端口配置',
        component: 'PortList',
    },
    // 环境变量列表
    {
        type: 'field',
        name: 'envList',
        label: '环境变量',
        component: 'EnvList',
    },
    // 探针配置
    {
        type: 'field',
        name: 'probeConfig',
        label: '探针配置',
        component: 'ProbeConfig',
    },
    // 资源限制
    {
        type: 'field',
        name: 'resources',
        label: '资源配置',
        component: 'ResourceLimit',
    },
    // 键值对列表
    {
        type: 'field',
        name: 'labels',
        label: '标签',
        component: 'KeyValueList',
        placeholder: '添加标签',
    },
    // 容器列表
    {
        type: 'field',
        name: 'containers',
        label: '容器配置',
        component: 'ContainerList',
    },
    // 挂载卷列表
    {
        type: 'field',
        name: 'volumes',
        label: '存储卷',
        component: 'MountVolumeList',
    },
    // 配置引用
    {
        type: 'field',
        name: 'configRefs',
        label: '配置引用',
        component: 'ConfigReferenceList',
    },
];

// ── 8. 完整 Tab Schema 示例 ──────────────────────────────────

export const completeExampleSchema: TabSchema = {
    key: 'complete-example',
    label: '完整示例',
    fields: [
        // === 基础字段 ===
        {
            type: 'group',
            title: '基础字段示例',
            fields: [...basicFieldExamples],
        },

        // === 行布局 ===
        {
            type: 'group',
            title: '行布局示例',
            fields: [...rowLayoutExamples],
        },

        // === 对象嵌套 ===
        {
            type: 'group',
            title: '对象嵌套示例',
            fields: [objectExample],
        },

        // === 分组容器 ===
        ...groupExamples,

        // === 数组字段 ===
        {
            type: 'group',
            title: '数组字段示例',
            fields: [
                simpleArrayExample,
                portArrayExample,
            ],
        },

        // === 复杂数组（支持排序、展开）===
        {
            type: 'group',
            title: '复杂数组示例',
            fields: [startupArrayExample],
        },

        // === 嵌套数组 ===
        {
            type: 'group',
            title: '嵌套数组示例',
            collapsible: true,
            defaultCollapsed: true,
            fields: [nestedArrayExample],
        },

        // === 可见性联动 ===
        {
            type: 'group',
            title: '可见性联动示例',
            fields: [...visibilityExamples],
        },

        // === 自定义组件 ===
        {
            type: 'group',
            title: '自定义组件示例',
            collapsible: true,
            defaultCollapsed: true,
            fields: [...customComponentExamples],
        },
    ],
};

// ── 9. 多 Tab Schema 示例 ────────────────────────────────────

export const multiTabSchema = {
    tabs: [
        {
            key: 'basic',
            label: '基础配置',
            fields: [
                ...basicFieldExamples.slice(0, 3),
                ...rowLayoutExamples.slice(0, 1),
            ],
        },
        {
            key: 'advanced',
            label: '高级配置',
            fields: [
                objectExample,
                ...groupExamples.slice(1),
            ],
        },
        {
            key: 'arrays',
            label: '列表配置',
            fields: [
                startupArrayExample,
                nestedArrayExample,
            ],
        },
        {
            key: 'custom',
            label: '自定义组件',
            fields: [...customComponentExamples],
        },
    ],
};

// ── 类型导出 ────────────────────────────────────────────────

export interface CompleteFormData {
    // 基础字段
    appName: string;
    replicas: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMonitor: boolean;
    cpuQuota: number;
    enableSSL: boolean;
    description: string;

    // 行布局字段
    minReplicas: number;
    maxReplicas: number;
    protocol: string;
    endpoint: string;
    httpPort: number;
    grpcPort: number;
    debugPort: number;
    healthCheckPath: string;
    healthCheckInterval: number;

    // 资源限制
    resourceLimits: {
        requests: { cpu: string; memory: string; };
        limits: { cpu: string; memory: string; };
    };

    // 基础配置
    namespace: string;
    environment: 'dev' | 'test' | 'staging' | 'prod';
    nodeSelector: Record<string, string>;
    tolerations: Record<string, string>;

    // SSL 配置
    certPath: string;
    keyPath: string;

    // 数组字段
    tags: string[];
    ports: Array<{
        name: string;
        port: number;
        protocol: string;
        targetPort: number;
    }>;
    startupCommands: Array<{
        name: string;
        command: string;
        args?: string;
        workDir?: string;
        timeout?: number;
        enableProbe?: boolean;
        probePath?: string;
        probePort?: number;
        expanded?: boolean;
    }>;
    containers: Array<{
        name: string;
        image: string;
        envVars: Array<{
            key: string;
            value: string;
            secretRef?: string;
        }>;
    }>;

    // 可见性联动
    configType: 'simple' | 'advanced' | 'custom';
    simpleValue?: string;
    advancedOptions?: Record<string, string>;
    customConfig?: {
        enabled: boolean;
        customScript?: string;
    };
}

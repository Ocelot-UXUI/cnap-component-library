/* eslint-disable max-lines */
import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const workloadSchema: TabSchema = {
    key: 'workload',
    label: '变更与调度',
    fields: [
        // ── 基础配置（平铺）────────────────────────────────────
        {
            name: 'workloadType',
            label: '工作负载类型',
            component: 'Select',
            initialValue: 'Deployment',
            required: true,
            options: [
                { label: 'Deployment（无状态）', value: 'Deployment' },
                { label: 'StatefulSet（有状态）', value: 'StatefulSet' },
                { label: 'DaemonSet（守护进程）', value: 'DaemonSet' },
                { label: 'Job（一次性任务）', value: 'Job' },
                { label: 'CronJob（定时任务）', value: 'CronJob' },
            ],
            aiMeta: { role: 'field', param: 'workloadType', desc: 'Kubernetes 工作负载类型' },
        },
        {
            name: 'replicas',
            label: '副本数',
            component: 'InputNumber',
            initialValue: 1,
            visible: { fieldName: 'workloadType', oneOf: ['Deployment', 'StatefulSet'] },
            componentProps: { min: 1, max: 100, style: { width: '100%' } },
            validators: [{ name: 'positiveInteger' }],
            aiMeta: { role: 'field', param: 'replicas', desc: '期望副本数' },
        },
        {
            name: 'serviceAccountName',
            label: 'ServiceAccount',
            component: 'Input',
            placeholder: '留空使用 default',
            validators: [{ name: 'dnsLabel' }],
            tooltip: '指定 Pod 使用的 ServiceAccount，用于 RBAC 权限控制',
            aiMeta: { role: 'field', param: 'serviceAccountName', desc: 'Pod ServiceAccount 名称' },
        },

        // ── 更新策略（分组）────────────────────────────────────
        {
            type: 'group',
            title: '更新策略',
            tooltip: '控制 Deployment / StatefulSet 滚动更新的行为',
            visible: { fieldName: 'workloadType', oneOf: ['Deployment', 'StatefulSet'] },
            aiMeta: { role: 'fieldGroup', entity: 'updateStrategy', desc: '工作负载更新策略配置' },
            fields: [
                {
                    name: 'updateStrategy',
                    label: '更新策略',
                    component: 'Select',
                    initialValue: 'RollingUpdate',
                    options: [
                        { label: 'RollingUpdate（滚动更新）', value: 'RollingUpdate' },
                        { label: 'Recreate（重建）', value: 'Recreate' },
                    ],
                    aiMeta: { role: 'field', param: 'updateStrategy', desc: '工作负载更新策略' },
                },
                {
                    name: 'maxSurge',
                    label: '最大超出副本数',
                    component: 'InputNumber',
                    initialValue: 1,
                    visible: { fieldName: 'updateStrategy', value: 'RollingUpdate' },
                    componentProps: { min: 0, style: { width: '100%' } },
                    tooltip: '滚动更新时允许超出期望副本数的最大数量',
                    aiMeta: { role: 'field', param: 'maxSurge', desc: '滚动更新最大超出副本数' },
                },
                {
                    name: 'maxUnavailable',
                    label: '最大不可用副本数',
                    component: 'InputNumber',
                    initialValue: 0,
                    visible: { fieldName: 'updateStrategy', value: 'RollingUpdate' },
                    componentProps: { min: 0, style: { width: '100%' } },
                    tooltip: '滚动更新时允许不可用的最大副本数',
                    aiMeta: { role: 'field', param: 'maxUnavailable', desc: '滚动更新最大不可用副本数' },
                },
            ],
        },

        // ── CronJob / Job 配置（分组）──────────────────────────
        {
            type: 'group',
            title: 'Job / CronJob 配置',
            visible: { fieldName: 'workloadType', oneOf: ['Job', 'CronJob'] },
            aiMeta: { role: 'fieldGroup', entity: 'jobConfig', desc: 'Job/CronJob 专属配置' },
            fields: [
                {
                    name: 'cronSchedule',
                    label: 'Cron 表达式',
                    component: 'Input',
                    visible: { fieldName: 'workloadType', value: 'CronJob' },
                    required: true,
                    placeholder: '如 0 */6 * * *',
                    validators: [{ name: 'cronFormat' }],
                    tooltip: '标准 Cron 表达式，如 "0 */6 * * *" 表示每6小时执行一次',
                    aiMeta: { role: 'field', param: 'cronSchedule', desc: 'CronJob 调度表达式' },
                },
                {
                    name: 'restartPolicy',
                    label: '重启策略',
                    component: 'Select',
                    initialValue: 'OnFailure',
                    options: [
                        { label: 'OnFailure（失败时重启）', value: 'OnFailure' },
                        { label: 'Never（不重启）', value: 'Never' },
                    ],
                    aiMeta: { role: 'field', param: 'restartPolicy', desc: 'Job 重启策略' },
                },
            ],
        },

        // ── 节点调度（分组）────────────────────────────────────
        {
            type: 'group',
            title: '节点调度',
            tooltip: '控制 Pod 调度到哪些节点，nodeSelector 是精确匹配，亲和性支持更复杂的规则',
            collapsible: true,
            defaultCollapsed: false,
            aiMeta: { role: 'fieldGroup', entity: 'nodeSchedule', desc: '节点调度配置' },
            fields: [
                {
                    name: 'nodeSelector',
                    label: '节点选择器',
                    component: 'KeyValueList',
                    componentProps: {
                        keyPlaceholder: '节点标签 key，如 kubernetes.io/arch',
                        valuePlaceholder: '节点标签 value，如 amd64',
                        addLabel: '添加节点选择条件',
                    },
                    tooltip: '将 Pod 调度到满足所有标签条件的节点',
                    aiMeta: { role: 'field', param: 'nodeSelector', desc: '节点选择器标签' },
                },
                {
                    name: 'nodeAffinityType',
                    label: '节点亲和性类型',
                    component: 'Select',
                    initialValue: 'none',
                    options: [
                        { label: '不设置', value: 'none' },
                        { label: '硬亲和（必须满足）', value: 'required' },
                        { label: '软亲和（尽量满足）', value: 'preferred' },
                    ],
                    tooltip: 'required 表示必须满足，preferred 表示尽量满足',
                    aiMeta: { role: 'field', param: 'nodeAffinityType', desc: '节点亲和性类型' },
                },
                {
                    name: 'nodeAffinityKey',
                    label: '亲和性标签 Key',
                    component: 'Input',
                    visible: { fieldName: 'nodeAffinityType', oneOf: ['required', 'preferred'] },
                    placeholder: '如 topology.kubernetes.io/zone',
                    aiMeta: { role: 'field', param: 'nodeAffinityKey', desc: '节点亲和性标签 Key' },
                },
                {
                    name: 'nodeAffinityOperator',
                    label: '匹配操作符',
                    component: 'Select',
                    initialValue: 'In',
                    visible: { fieldName: 'nodeAffinityType', oneOf: ['required', 'preferred'] },
                    options: [
                        { label: 'In（包含）', value: 'In' },
                        { label: 'NotIn（不包含）', value: 'NotIn' },
                        { label: 'Exists（存在）', value: 'Exists' },
                        { label: 'DoesNotExist（不存在）', value: 'DoesNotExist' },
                    ],
                    aiMeta: { role: 'field', param: 'nodeAffinityOperator', desc: '节点亲和性匹配操作符' },
                },
                {
                    name: 'nodeAffinityValues',
                    label: '匹配值',
                    component: 'Select',
                    visible: {
                        fieldName: 'nodeAffinityOperator',
                        oneOf: ['In', 'NotIn'],
                        and: [{ fieldName: 'nodeAffinityType', oneOf: ['required', 'preferred'] }],
                    },
                    componentProps: { mode: 'tags', style: { width: '100%' } },
                    placeholder: '输入值后回车，支持多个',
                    aiMeta: { role: 'field', param: 'nodeAffinityValues', desc: '节点亲和性匹配值列表' },
                },
            ],
        },

        // ── Pod 反亲和（分组，可折叠）──────────────────────────
        {
            type: 'group',
            title: 'Pod 反亲和',
            tooltip: '避免同一应用的多个 Pod 调度到同一节点/可用区，提高可用性',
            collapsible: true,
            defaultCollapsed: true,
            aiMeta: { role: 'fieldGroup', entity: 'podAntiAffinity', desc: 'Pod 反亲和配置' },
            fields: [
                {
                    name: 'podAntiAffinityEnable',
                    label: '启用 Pod 反亲和',
                    component: 'Switch',
                    initialValue: false,
                    aiMeta: { role: 'field', param: 'podAntiAffinityEnable', desc: '是否启用 Pod 反亲和' },
                },
                {
                    name: 'podAntiAffinityType',
                    label: '反亲和类型',
                    component: 'Select',
                    initialValue: 'preferred',
                    visible: { fieldName: 'podAntiAffinityEnable', value: true },
                    options: [
                        { label: '软反亲和（尽量分散）', value: 'preferred' },
                        { label: '硬反亲和（强制分散）', value: 'required' },
                    ],
                    aiMeta: { role: 'field', param: 'podAntiAffinityType', desc: 'Pod 反亲和类型' },
                },
                {
                    name: 'podAntiAffinityTopologyKey',
                    label: '拓扑域 Key',
                    component: 'Select',
                    initialValue: 'kubernetes.io/hostname',
                    visible: { fieldName: 'podAntiAffinityEnable', value: true },
                    options: [
                        { label: '节点（hostname）', value: 'kubernetes.io/hostname' },
                        { label: '可用区（zone）', value: 'topology.kubernetes.io/zone' },
                        { label: '地域（region）', value: 'topology.kubernetes.io/region' },
                    ],
                    tooltip: '反亲和的拓扑粒度，hostname 表示不同节点，zone 表示不同可用区',
                    aiMeta: { role: 'field', param: 'podAntiAffinityTopologyKey', desc: 'Pod 反亲和拓扑域' },
                },
            ],
        },
    ],
};

export const workloadValidators: ValidatorRegistry = {
    // Cron 表达式格式校验（5段标准格式）
    cronFormat: (_params, _form) => ({
        validator: async (_rule, value: string | undefined) => {
            if (!value) {
                return;
            }
            const parts = value.trim().split(/\s+/);
            if (parts.length !== 5) {
                return Promise.reject(new Error('Cron 表达式需要5个字段：分 时 日 月 周'));
            }
        },
    }),
};

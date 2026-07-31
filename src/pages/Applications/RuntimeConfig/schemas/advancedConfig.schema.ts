import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const advancedConfigSchema: TabSchema = {
    key: 'advancedConfiguration',
    label: '高级配置',
    fields: [
        {
            name: 'terminationGracePeriodSeconds',
            label: '优雅终止时间(s)',
            component: 'InputNumber',
            initialValue: 30,
            componentProps: { min: 0, max: 3600, style: { width: '100%' } },
            tooltip: 'Pod 收到 SIGTERM 后等待的最长时间，超时后强制 SIGKILL',
            aiMeta: { role: 'field', param: 'terminationGracePeriodSeconds', desc: '优雅终止等待时间' },
        },
        {
            name: 'enableDebug',
            label: '启用调试模式',
            component: 'Switch',
            initialValue: false,
            tooltip: '开启后容器将以调试模式启动，可能影响性能',
            aiMeta: { role: 'field', param: 'enableDebug', desc: '是否启用调试模式' },
        },
        {
            name: 'maxPodPerNode',
            label: '每节点最大 Pod 数',
            component: 'InputNumber',
            initialValue: 0,
            componentProps: { min: 0, max: 100, style: { width: '100%' } },
            tooltip: '0 表示不限制，限制同一节点上该应用的 Pod 数量',
            aiMeta: { role: 'field', param: 'maxPodPerNode', desc: '每节点最大 Pod 数限制' },
        },
        {
            name: 'nodeArch',
            label: '节点架构',
            component: 'Select',
            initialValue: 'X86',
            options: [
                { label: 'X86', value: 'X86' },
                { label: 'ARM64', value: 'ARM64' },
            ],
            tooltip: '指定 Pod 调度到的节点 CPU 架构',
            aiMeta: { role: 'field', param: 'nodeArch', desc: '节点 CPU 架构' },
        },
        {
            name: 'preStopFlowSyncEnable',
            label: '启用 PreStop 流量同步',
            component: 'Switch',
            initialValue: false,
            tooltip: '在 PreStop 阶段等待流量排空，确保优雅下线',
            aiMeta: { role: 'field', param: 'preStopFlowSyncEnable', desc: '是否启用 PreStop 流量同步' },
        },
        {
            name: 'preStopWait',
            label: 'PreStop 等待时间(s)',
            component: 'InputNumber',
            initialValue: 10,
            visible: { fieldName: 'preStopFlowSyncEnable', value: true },
            componentProps: { min: 0, max: 300, style: { width: '100%' } },
            tooltip: 'PreStop 阶段等待流量排空的时间',
            aiMeta: { role: 'field', param: 'preStopWait', desc: 'PreStop 等待时间' },
        },
        {
            name: 'topologySpreadKey',
            label: '拓扑分布 Key',
            component: 'Input',
            placeholder: '如 topology.kubernetes.io/zone',
            tooltip: '用于 TopologySpreadConstraints 的拓扑键，控制 Pod 跨区域分布',
            aiMeta: { role: 'field', param: 'topologySpreadKey', desc: '拓扑分布约束 Key' },
        },
        {
            name: 'topologyMaxSkew',
            label: '最大偏差值',
            component: 'InputNumber',
            initialValue: 1,
            visible: { fieldName: 'topologySpreadKey' },
            componentProps: { min: 1, style: { width: '100%' } },
            tooltip: '允许的最大拓扑域间 Pod 数量差值',
            aiMeta: { role: 'field', param: 'topologyMaxSkew', desc: '拓扑分布最大偏差' },
        },
        {
            name: 'topologyWhenUnsatisfiable',
            label: '不满足时策略',
            component: 'Select',
            initialValue: 'DoNotSchedule',
            visible: { fieldName: 'topologySpreadKey' },
            options: [
                { label: 'DoNotSchedule（不调度）', value: 'DoNotSchedule' },
                { label: 'ScheduleAnyway（仍然调度）', value: 'ScheduleAnyway' },
            ],
            aiMeta: { role: 'field', param: 'topologyWhenUnsatisfiable', desc: '拓扑约束不满足时的策略' },
        },
    ],
};

export const advancedConfigValidators: ValidatorRegistry = {};

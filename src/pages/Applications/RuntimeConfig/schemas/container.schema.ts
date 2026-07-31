import type {TabSchema} from '../schema/types';

export const containerSchema: TabSchema = {
    key: 'container',
    label: '实例配置',
    fields: [
        // ── 顶层字段 ────────────────────────────────────────────
        {
            name: 'replica',
            label: '实例数量',
            component: 'InputNumber',
            initialValue: 1,
            required: true,
            validators: [{ name: 'positiveInteger' }],
            tooltip: '运行的 Pod 副本数，最小为 1',
            aiMeta: { role: 'field', param: 'replica', desc: '实例副本数' },
        },
        {
            name: 'debugEnable',
            label: '调试开关',
            component: 'Switch',
            initialValue: false,
            tooltip: '开启后可远程调试容器内进程',
            aiMeta: { role: 'field', param: 'debugEnable', desc: '是否开启调试模式' },
        },
        {
            name: 'debugTerminationGracePeriodSeconds',
            label: '远端应用结束超时(s)',
            component: 'InputNumber',
            initialValue: 30,
            visible: { fieldName: 'debugEnable', value: true },
            validators: [{ name: 'positiveInteger' }],
            tooltip: '调试模式下，远端应用优雅退出的超时时间（秒）',
            aiMeta: { role: 'field', param: 'debugTerminationGracePeriodSeconds', desc: '调试模式优雅退出超时' },
        },
        {
            name: 'securityEnable',
            label: '安全模式',
            component: 'Switch',
            initialValue: false,
            tooltip: '开启安全沙箱模式，增强容器隔离性',
            aiMeta: { role: 'field', param: 'securityEnable', desc: '是否开启安全模式' },
        },

        // ── 容器列表（ContainerList 内部自渲染所有容器字段）────────
        {
            name: 'containers',
            label: '容器列表',
            component: 'ContainerList',
            initialValue: [{
                name: 'main',
                resources: { cpu: '0.5vCPU', memory: '0.5Gi' },
                ports: [],
                envs: [],
                volume: [],
                configs: [],
                enableLivenessProbe: false,
                enableReadinessProbe: false,
                enableStartupProbe: false,
                preStopFlowSyncEnable: false,
            }],
            aiMeta: { role: 'field', param: 'containers', desc: '容器配置列表，支持多容器' },
        },

        // ── 优雅停机（容器外层，对应 CNAP1.0 baseKeyPath 级别）──
        {
            name: 'terminationGracePeriodSeconds',
            label: '优雅停机超时(s)',
            component: 'InputNumber',
            initialValue: 30,
            validators: [{ name: 'positiveInteger' }],
            tooltip: 'Pod 被删除时，容器优雅退出的最长等待时间（秒）',
            aiMeta: { role: 'field', param: 'terminationGracePeriodSeconds', desc: '优雅停机超时时间' },
        },
    ],
};

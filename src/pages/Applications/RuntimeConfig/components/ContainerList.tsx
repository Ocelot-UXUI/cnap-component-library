/* eslint-disable max-len */
/* eslint-disable max-lines */
import {DeleteOutlined, DownOutlined, PlusOutlined, RightOutlined} from '@ant-design/icons';
import {Button, Form, Input, InputNumber, Modal, Space, Switch, Tabs, Typography} from '@/design';
import React, {useState} from 'react';
import {baseValidatorRegistry} from '../schema/validatorRegistry';
import {SchemaRenderer} from '../SchemaRenderer';
import {commandAndArgsGroup} from '../schemas/containerFields.schema';
import {type ConfigReference, ConfigReferenceList} from './ConfigReferenceList';
import {type EnvEntry, EnvList} from './EnvList';
import {type EnvReferenceEntry, EnvReferenceList} from './EnvReferenceList';
import {MountVolumeList, type VolumeEntry} from './MountVolumeList';
import {type PortEntry, PortList} from './PortList';
import {ProbeConfig, type ProbeConfigValue} from './ProbeConfig';
import {ResourceLimit, type ResourceLimitValue} from './ResourceLimit';

const { Text } = Typography;

// ── 重新导出子类型，供外部使用 ──────────────────────────────────
export type {
    ConfigReference,
    EnvEntry,
    EnvReferenceEntry,
    PortEntry,
    ProbeConfigValue,
    ResourceLimitValue,
    VolumeEntry,
};

export interface ContainerItem {
    name: string;
    resources?: ResourceLimitValue;
    ports?: PortEntry[];
    command?: string[];
    args?: string[];
    enableLivenessProbe?: boolean;
    livenessProbe?: ProbeConfigValue;
    enableReadinessProbe?: boolean;
    readinessProbe?: ProbeConfigValue;
    enableStartupProbe?: boolean;
    startupProbe?: ProbeConfigValue;
    envs?: EnvEntry[];
    envForm?: EnvReferenceEntry[]; // 环境变量引用
    volume?: VolumeEntry[];
    configs?: ConfigReference[];
    preStopFlowSyncEnable?: boolean;
    preStopFlowSyncWait?: number;
    pidLimit?: number;
}

interface ContainerListProps {
    value?: ContainerItem[];
    onChange?: (value: ContainerItem[]) => void;
    // 是否显示 GPU 配置（对应 appTags.gpuSupport.enable）
    enableGpu?: boolean;
    // 容器索引（用于 SchemaRenderer 的路径）
    containerIndex?: number;
}

const DEFAULT_CONTAINER: ContainerItem = {
    name: 'main',
    resources: {
        cpu: '0.5vCPU',
        memory: '0.5Gi',
    },
    ports: [],
    envs: [],
    envForm: [],
    volume: [],
    configs: [],
    enableLivenessProbe: false,
    enableReadinessProbe: false,
    enableStartupProbe: false,
    preStopFlowSyncEnable: false,
};

// ── 分组标题组件 ────────────────────────────────────────────────
const GroupHeader: React.FC<{
    title: string;
    collapsible?: boolean;
    collapsed?: boolean;
    onToggle?: () => void;
}> = ({ title, collapsible, collapsed, onToggle }) => (
    <div
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            background: 'linear-gradient(90deg, rgba(49,127,245,0.10) 0%, rgba(160,97,240,0.04) 100%)',
            borderRadius: '4px 4px 0 0',
            borderLeft: '3px solid #317ff5',
            cursor: collapsible ? 'pointer' : 'default',
            userSelect: 'none',
            marginBottom: 0,
        }}
        onClick={collapsible ? onToggle : undefined}
    >
        {collapsible && (
            collapsed
                ? <RightOutlined style={{ fontSize: 11, color: '#317ff5' }} />
                : <DownOutlined style={{ fontSize: 11, color: '#317ff5' }} />
        )}
        <Text strong style={{ fontSize: 13 }}>{title}</Text>
    </div>
);

const GroupBody: React.FC<{ children: React.ReactNode; }> = ({ children }) => (
    <div
        style={{
            padding: '12px 16px 4px',
            background: 'rgba(49,127,245,0.02)',
            border: '1px solid rgba(49,127,245,0.15)',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            marginBottom: 16,
        }}
    >
        {children}
    </div>
);

// ── 单个容器的字段渲染 ──────────────────────────────────────────
const ContainerFields: React.FC<{
    container: ContainerItem;
    onChange: (patch: Partial<ContainerItem>) => void;
    enableGpu?: boolean;
    containerIndex: number;
}> = ({ container, onChange, enableGpu, containerIndex }) => {
    const [volumeCollapsed, setVolumeCollapsed] = useState(false);
    const [configCollapsed, setConfigCollapsed] = useState(false);
    const [flowCollapsed, setFlowCollapsed] = useState(false);
    const form = Form.useFormInstance();

    return (
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {/* 实例资源 */}
            <div>
                <GroupHeader title="实例资源" />
                <GroupBody>
                    <ResourceLimit
                        value={container.resources}
                        onChange={v => onChange({ resources: v })}
                        enableGpu={enableGpu}
                    />
                </GroupBody>
            </div>

            {/* 端口 */}
            <div>
                <GroupHeader title="端口" />
                <GroupBody>
                    <PortList
                        value={container.ports}
                        onChange={v => onChange({ ports: v })}
                    />
                </GroupBody>
            </div>

            {/* 启动命令和参数 - 使用 SchemaRenderer 渲染 */}
            <SchemaRenderer
                schema={commandAndArgsGroup}
                form={form}
                validatorRegistry={baseValidatorRegistry}
                parentPath={['containers', containerIndex]}
            />

            {/* 存活探针 */}
            <div>
                <GroupHeader title="存活探针" />
                <GroupBody>
                    <Form.Item label="启用" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={container.enableLivenessProbe}
                            onChange={v => onChange({ enableLivenessProbe: v })}
                            data-ai-param="enableLivenessProbe"
                        />
                    </Form.Item>
                    {container.enableLivenessProbe && (
                        <ProbeConfig
                            value={container.livenessProbe}
                            onChange={v => onChange({ livenessProbe: v })}
                        />
                    )}
                </GroupBody>
            </div>

            {/* 就绪探针 */}
            <div>
                <GroupHeader title="就绪探针" />
                <GroupBody>
                    <Form.Item label="启用" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={container.enableReadinessProbe}
                            onChange={v => onChange({ enableReadinessProbe: v })}
                            data-ai-param="enableReadinessProbe"
                        />
                    </Form.Item>
                    {container.enableReadinessProbe && (
                        <ProbeConfig
                            value={container.readinessProbe}
                            onChange={v => onChange({ readinessProbe: v })}
                            successThresholdDisabled
                        />
                    )}
                </GroupBody>
            </div>

            {/* 启动探针 */}
            <div>
                <GroupHeader title="启动探针" />
                <GroupBody>
                    <Form.Item label="启用" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={container.enableStartupProbe}
                            onChange={v => onChange({ enableStartupProbe: v })}
                            data-ai-param="enableStartupProbe"
                        />
                    </Form.Item>
                    {container.enableStartupProbe && (
                        <ProbeConfig
                            value={container.startupProbe}
                            onChange={v => onChange({ startupProbe: v })}
                        />
                    )}
                </GroupBody>
            </div>

            {/* 环境变量-指定值 */}
            <div>
                <GroupHeader title="环境变量-指定值" />
                <GroupBody>
                    <EnvList
                        value={container.envs}
                        onChange={v => onChange({ envs: v })}
                    />
                </GroupBody>
            </div>

            {/* 环境变量-引用值 */}
            <div>
                <GroupHeader title="环境变量-引用值" />
                <GroupBody>
                    <EnvReferenceList
                        value={container.envForm}
                        onChange={v => onChange({ envForm: v })}
                    />
                </GroupBody>
            </div>

            {/* 挂载卷 */}
            <div>
                <GroupHeader
                    title="挂载卷"
                    collapsible
                    collapsed={volumeCollapsed}
                    onToggle={() => setVolumeCollapsed(v => !v)}
                />
                {!volumeCollapsed && (
                    <GroupBody>
                        <MountVolumeList
                            value={container.volume}
                            onChange={v => onChange({ volume: v })}
                        />
                    </GroupBody>
                )}
            </div>

            {/* 配置文件 */}
            <div>
                <GroupHeader
                    title="配置文件"
                    collapsible
                    collapsed={configCollapsed}
                    onToggle={() => setConfigCollapsed(v => !v)}
                />
                {!configCollapsed && (
                    <GroupBody>
                        <ConfigReferenceList
                            value={container.configs}
                            onChange={v => onChange({ configs: v })}
                        />
                    </GroupBody>
                )}
            </div>

            {/* 流量检查 */}
            <div>
                <GroupHeader
                    title="流量检查"
                    collapsible
                    collapsed={flowCollapsed}
                    onToggle={() => setFlowCollapsed(v => !v)}
                />
                {!flowCollapsed && (
                    <GroupBody>
                        <Form.Item label="启用" style={{ marginBottom: 8 }}>
                            <Switch
                                checked={container.preStopFlowSyncEnable}
                                onChange={v => onChange({ preStopFlowSyncEnable: v })}
                                data-ai-param="preStopFlowSyncEnable"
                            />
                        </Form.Item>
                        {container.preStopFlowSyncEnable && (
                            <Form.Item label="等待时间(s)" style={{ marginBottom: 0 }}>
                                <InputNumber
                                    value={container.preStopFlowSyncWait}
                                    min={1}
                                    onChange={v => onChange({ preStopFlowSyncWait: v ?? undefined })}
                                    data-ai-param="preStopFlowSyncWait"
                                />
                            </Form.Item>
                        )}
                    </GroupBody>
                )}
            </div>

            {/* pid线程数 */}
            <div>
                <GroupHeader title="pid线程数" />
                <GroupBody>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <InputNumber
                            value={container.pidLimit}
                            min={0}
                            placeholder="0 表示不限制"
                            style={{ width: 150 }}
                            onChange={v => onChange({ pidLimit: v ?? undefined })}
                            data-ai-param="pidLimit"
                        />
                    </Form.Item>
                </GroupBody>
            </div>
        </Space>
    );
};

// ── 主组件 ──────────────────────────────────────────────────────
export const ContainerList: React.FC<ContainerListProps> = ({
    value = [DEFAULT_CONTAINER],
    onChange,
    enableGpu = false,
}) => {
    const [activeKey, setActiveKey] = useState('0');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState('');

    const updateContainer = (index: number, patch: Partial<ContainerItem>) => {
        onChange?.(value.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    };

    const handleAdd = () => {
        const trimmed = newName.trim();
        if (!trimmed) {
            setNameError('容器名称不能为空');
            return;
        }
        if (value.some(c => c.name === trimmed)) {
            setNameError('容器名称已存在');
            return;
        }
        const next = [...value, { ...DEFAULT_CONTAINER, name: trimmed }];
        onChange?.(next);
        setActiveKey(String(next.length - 1));
        setAddModalOpen(false);
        setNewName('');
        setNameError('');
    };

    const handleDelete = (index: number) => {
        if (value.length <= 1) {
            return;
        }
        const next = value.filter((_, i) => i !== index);
        onChange?.(next);
        setActiveKey(String(Math.min(Number(activeKey), next.length - 1)));
    };

    const tabItems = value.map((container, index) => ({
        key: String(index),
        label: (
            <Space size={4}>
                <span data-ai-entity={`container-${container.name}`}>{container.name}</span>
                {value.length > 1 && (
                    <DeleteOutlined
                        style={{ fontSize: 11, color: '#999' }}
                        onClick={e => {
                            e.stopPropagation();
                            handleDelete(index);
                        }}
                    />
                )}
            </Space>
        ),
        children: (
            <div style={{ paddingTop: 8 }} data-ai-role="containerPanel" data-ai-entity={container.name}>
                <ContainerFields
                    container={container}
                    onChange={patch => updateContainer(index, patch)}
                    enableGpu={enableGpu}
                    containerIndex={index}
                />
            </div>
        ),
    }));

    return (
        <div data-ai-role="containerList">
            <Tabs
                type="card"
                size="small"
                activeKey={activeKey}
                onChange={setActiveKey}
                items={tabItems}
                tabBarExtraContent={
                    <Button
                        type="dashed"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setNewName('');
                            setNameError('');
                            setAddModalOpen(true);
                        }}
                        data-ai-action="addContainer"
                    >
                        添加容器
                    </Button>
                }
            />
            <Modal
                title="添加容器"
                open={addModalOpen}
                onOk={handleAdd}
                onCancel={() => {
                    setAddModalOpen(false);
                    setNewName('');
                    setNameError('');
                }}
                okText="确认"
                cancelText="取消"
            >
                <div style={{ marginBottom: 8 }}>容器名称</div>
                <Input
                    value={newName}
                    onChange={e => {
                        setNewName(e.target.value);
                        setNameError('');
                    }}
                    placeholder="如 sidecar"
                    status={nameError ? 'error' : undefined}
                    onPressEnter={handleAdd}
                />
                {nameError && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{nameError}</div>}
            </Modal>
        </div>
    );
};

import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Input, InputNumber, Select, Space, Table} from '@/design';
import React from 'react';

export interface VolumeEntry {
    mountPath: string;
    type:
        | 'EMPTY_DIR'
        | 'HOST_PATH'
        | 'EKS_LOCAL_VOLUME'
        | 'EKS_LOG_VOLUME'
        | 'CONFIG_MAP'
        | 'PERSISTENT_VOLUME_CLAIM'
        | 'SECRET';
    name?: string;
    hostPath?: string;
    hostFileType?: string;
    configName?: string;
    size?: number;
    storageType?: string;
    medium?: string;
    readOnly?: boolean;
}

interface MountVolumeListProps {
    value?: VolumeEntry[];
    onChange?: (value: VolumeEntry[]) => void;
}

const VOLUME_TYPE_OPTIONS = [
    { label: 'EMPTY_DIR', value: 'EMPTY_DIR' },
    { label: 'HOST_PATH', value: 'HOST_PATH' },
    { label: '本地盘临时卷', value: 'EKS_LOCAL_VOLUME' },
    { label: '日志卷', value: 'EKS_LOG_VOLUME' },
    { label: 'CONFIG_MAP', value: 'CONFIG_MAP' },
    { label: '持久卷', value: 'PERSISTENT_VOLUME_CLAIM' },
    { label: 'SECRET', value: 'SECRET' },
];

const HOST_FILE_TYPE_OPTIONS = [
    { label: 'Directory', value: 'Directory' },
    { label: 'File', value: 'File' },
    { label: 'DirectoryOrCreate', value: 'DirectoryOrCreate' },
    { label: 'FileOrCreate', value: 'FileOrCreate' },
];

const createDefault = (): VolumeEntry => ({
    mountPath: '',
    type: 'EMPTY_DIR',
    medium: '',
});

const handleTypeChange = (
    index: number,
    type: VolumeEntry['type'],
    value: VolumeEntry[],
    onChange: (v: VolumeEntry[]) => void,
) => {
    const next = value.map((item, i) => {
        if (i !== index) {
            return item;
        }
        const base: VolumeEntry = {
            mountPath: item.mountPath,
            type,
        };
        if (type === 'EMPTY_DIR') {
            base.medium = '';
        }
        if (type === 'HOST_PATH') {
            base.hostFileType = 'Directory';
            base.readOnly = true;
        }
        if (type === 'SECRET') {
            base.name = 'security-data-platform-volume';
            base.configName = 'security-data-platform';
        }
        return base;
    });
    onChange(next);
};

// 根据卷类型渲染额外字段
const VolumeExtraFields: React.FC<{
    entry: VolumeEntry;
    index: number;
    value: VolumeEntry[];
    onChange: (v: VolumeEntry[]) => void;
}> = ({ entry, index, value, onChange }) => {
    const update = (patch: Partial<VolumeEntry>) => {
        onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    switch (entry.type) {
        case 'HOST_PATH':
            return (
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Input
                        value={entry.hostPath}
                        placeholder="宿主机路径"
                        onChange={e => update({ hostPath: e.target.value })}
                        size="small"
                    />
                    <Select
                        value={entry.hostFileType}
                        options={HOST_FILE_TYPE_OPTIONS}
                        onChange={v => update({ hostFileType: v })}
                        size="small"
                        style={{ width: '100%' }}
                    />
                </Space>
            );
        case 'CONFIG_MAP':
        case 'SECRET':
            return (
                <Input
                    value={entry.configName}
                    placeholder={entry.type === 'CONFIG_MAP' ? 'ConfigMap 名称' : 'Secret 名称'}
                    onChange={e => update({ configName: e.target.value })}
                    size="small"
                    disabled={entry.type === 'SECRET'}
                />
            );
        case 'EKS_LOCAL_VOLUME':
        case 'EKS_LOG_VOLUME':
        case 'PERSISTENT_VOLUME_CLAIM':
            return (
                <InputNumber
                    value={entry.size}
                    min={1}
                    placeholder="大小(GB)"
                    onChange={v => update({ size: v ?? undefined })}
                    size="small"
                    style={{ width: '100%' }}
                    addonAfter="GB"
                />
            );
        default:
            return null;
    }
};

export const MountVolumeList: React.FC<MountVolumeListProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        onChange?.([...value, createDefault()]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, patch: Partial<VolumeEntry>) => {
        onChange?.(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    };

    const columns = [
        {
            title: '挂载路径',
            key: 'mountPath',
            width: 180,
            render: (_: unknown, _record: VolumeEntry, index: number) => (
                <Input
                    value={value[index].mountPath}
                    placeholder="/data"
                    size="small"
                    onChange={e => handleChange(index, { mountPath: e.target.value })}
                    data-ai-param="mountPath"
                />
            ),
        },
        {
            title: '卷类型',
            key: 'type',
            width: 150,
            render: (_: unknown, _record: VolumeEntry, index: number) => (
                <Select
                    value={value[index].type}
                    options={VOLUME_TYPE_OPTIONS}
                    size="small"
                    style={{ width: '100%' }}
                    onChange={v => handleTypeChange(index, v, value, onChange ?? (() => {}))}
                    data-ai-param="volumeType"
                />
            ),
        },
        {
            title: '卷配置',
            key: 'config',
            render: (_: unknown, _record: VolumeEntry, index: number) => (
                <VolumeExtraFields
                    entry={value[index]}
                    index={index}
                    value={value}
                    onChange={onChange ?? (() => {})}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 60,
            render: (_: unknown, _record: VolumeEntry, index: number) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(index)}
                    data-ai-action="removeVolume"
                />
            ),
        },
    ];

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="mountVolumeList">
            <Table
                dataSource={value}
                columns={columns}
                rowKey={(_, index) => String(index ?? 0)}
                pagination={false}
                size="small"
            />
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                data-ai-action="addVolume"
            >
                添加挂载卷
            </Button>
        </Space>
    );
};

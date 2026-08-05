/* eslint-disable max-lines */
import {DeleteOutlined, PlusOutlined} from '@ant-design/icons';
import {Button, Input, InputNumber, Select, Space} from '@/design';
import React from 'react';

// ── 端口类型定义（对应 CNAP1.0）──────────────────────────────────
export type PortType = 'NAMED_STATIC' | 'NAMED_DYNAMIC' | 'RANGE';

export interface RangeNameEntry {
    name: string;
    port: number;
}

export interface PortEntry {
    type: PortType;
    protocol: 'TCP';
    // NAMED_STATIC / NAMED_DYNAMIC：端口名称（小写）
    // RANGE：端口段类型（TYPE_OFFICE / TYPE_NOT_OFFICE / TYPE_OFFLINE）
    name: string;
    portRange: {
        from?: number; // NAMED_STATIC / NAMED_DYNAMIC 起始端口
        to?: number; // NAMED_DYNAMIC 结束端口
        range?: number; // RANGE 端口个数
    };
    // RANGE 类型的端口名称映射
    rangeNamesFront?: RangeNameEntry[];
}

interface PortListProps {
    value?: PortEntry[];
    onChange?: (value: PortEntry[]) => void;
}

const PORT_TYPE_OPTIONS = [
    { label: '命名端口-静态', value: 'NAMED_STATIC' },
    { label: '命名端口-动态', value: 'NAMED_DYNAMIC' },
    { label: '端口段', value: 'RANGE' },
];

const RANGE_NAME_OPTIONS = [
    { label: '办公网(8000-8999)', value: 'TYPE_OFFICE' },
    { label: '非办公网(2001-7999,9000-30000)', value: 'TYPE_NOT_OFFICE' },
    { label: '离线(30001-65535)', value: 'TYPE_OFFLINE' },
];

const createDefault = (type: PortType): PortEntry => {
    if (type === 'RANGE') {
        return {
            type: 'RANGE',
            protocol: 'TCP',
            name: 'TYPE_OFFICE',
            portRange: { range: 1 },
            rangeNamesFront: [{ name: 'main', port: 0 }],
        };
    }
    return {
        type,
        protocol: 'TCP',
        name: '',
        portRange: { from: undefined },
    };
};

// ── 单条端口配置 ──────────────────────────────────────────────────
const PortItem: React.FC<{
    entry: PortEntry;
    onChange: (entry: PortEntry) => void;
    onRemove: () => void;
    canRemove: boolean;
}> = ({ entry, onChange, onRemove, canRemove }) => {
    const update = (patch: Partial<PortEntry>) => {
        onChange({ ...entry, ...patch });
    };
    const updatePortRange = (patch: Partial<PortEntry['portRange']>) => {
        update({ portRange: { ...entry.portRange, ...patch } });
    };

    // 端口名称映射更新
    const updateRangeNames = (names: RangeNameEntry[]) => {
        update({ rangeNamesFront: names });
    };

    const handleTypeChange = (type: PortType) => {
        onChange(createDefault(type));
    };

    return (
        <div style={{ marginBottom: 16, padding: 12, background: '#fafafa', borderRadius: 4 }}>
            {/* 第一行：类型、协议、名称/端口段、端口/个数 */}
            <Space size={16} wrap align="start">
                {/* 类型 */}
                <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>类型</div>
                    <Select
                        value={entry.type}
                        options={PORT_TYPE_OPTIONS}
                        size="small"
                        style={{ width: 140 }}
                        onChange={handleTypeChange}
                        data-ai-param="portType"
                    />
                </div>

                {/* 协议 */}
                <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>协议</div>
                    <Select
                        value={entry.protocol || 'TCP'}
                        options={[{ label: 'TCP', value: 'TCP' }]}
                        size="small"
                        style={{ width: 80 }}
                        disabled
                        data-ai-param="portProtocol"
                    />
                </div>

                {/* 名称 / 端口段 */}
                <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        {entry.type === 'RANGE' ? '端口段' : '名称'}
                    </div>
                    {entry.type === 'RANGE'
                        ? (
                            <Select
                                value={entry.name}
                                options={RANGE_NAME_OPTIONS}
                                size="small"
                                style={{ width: 200 }}
                                onChange={v => update({ name: v })}
                                data-ai-param="portRangeName"
                            />
                        )
                        : (
                            <Input
                                value={entry.name}
                                placeholder="端口名称，须小写"
                                size="small"
                                style={{ width: 160 }}
                                onChange={e => update({ name: e.target.value })}
                                data-ai-param="portName"
                            />
                        )}
                </div>

                {/* 端口 / 个数 */}
                <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                        {entry.type === 'RANGE' ? '个数' : '端口'}
                    </div>
                    {entry.type === 'RANGE'
                        ? (
                            <InputNumber
                                value={entry.portRange.range}
                                min={1}
                                precision={0}
                                placeholder="端口个数"
                                size="small"
                                style={{ width: 120 }}
                                onChange={v => updatePortRange({ range: v ?? 1 })}
                                data-ai-param="portRange"
                            />
                        )
                        : (
                            <Space>
                                <InputNumber
                                    value={entry.portRange.from}
                                    min={1}
                                    max={65535}
                                    precision={0}
                                    placeholder="端口"
                                    size="small"
                                    style={{ width: 100 }}
                                    onChange={v => updatePortRange({ from: v ?? undefined })}
                                    data-ai-param="portFrom"
                                />
                                {entry.type === 'NAMED_DYNAMIC' && (
                                    <>
                                        <span>-</span>
                                        <InputNumber
                                            value={entry.portRange.to}
                                            min={1}
                                            max={65535}
                                            precision={0}
                                            placeholder="端口"
                                            size="small"
                                            style={{ width: 100 }}
                                            onChange={v => updatePortRange({ to: v ?? undefined })}
                                            data-ai-param="portTo"
                                        />
                                    </>
                                )}
                            </Space>
                        )}
                </div>

                {/* 删除按钮 */}
                {canRemove && (
                    <div style={{ paddingTop: 20 }}>
                        <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={onRemove}
                            data-ai-action="removePort"
                        />
                    </div>
                )}
            </Space>

            {/* 第二行：端口名称映射（仅 RANGE 类型） */}
            {entry.type === 'RANGE' && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e8e8e8' }}>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>名称</div>
                    <Space direction="vertical" size={4}>
                        {(entry.rangeNamesFront ?? []).map((n, ni) => (
                            <Space key={ni} size={4}>
                                <Input
                                    value={n.name}
                                    placeholder="名称"
                                    size="small"
                                    style={{ width: 100 }}
                                    onChange={e =>
                                        updateRangeNames(
                                            (entry.rangeNamesFront ?? []).map((
                                                x,
                                                xi,
                                            ) => (xi === ni ? { ...x, name: e.target.value } : x)),
                                        )}
                                />
                                <InputNumber
                                    value={n.port}
                                    min={0}
                                    precision={0}
                                    size="small"
                                    style={{ width: 80 }}
                                    placeholder="偏移"
                                    onChange={v =>
                                        updateRangeNames(
                                            (entry.rangeNamesFront ?? []).map((
                                                x,
                                                xi,
                                            ) => (xi === ni ? { ...x, port: v ?? 0 } : x)),
                                        )}
                                />
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                        updateRangeNames(
                                            (entry.rangeNamesFront ?? []).filter((_, xi) => xi !== ni),
                                        )}
                                />
                            </Space>
                        ))}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() =>
                                updateRangeNames([
                                    ...(entry.rangeNamesFront ?? []),
                                    { name: '', port: 0 },
                                ])}
                        >
                            添加
                        </Button>
                    </Space>
                </div>
            )}
        </div>
    );
};

// ── 主组件 ──────────────────────────────────────────────────────
export const PortList: React.FC<PortListProps> = ({ value = [], onChange }) => {
    const handleAdd = () => {
        onChange?.([...value, createDefault('NAMED_STATIC')]);
    };

    const handleRemove = (index: number) => {
        onChange?.(value.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, entry: PortEntry) => {
        onChange?.(value.map((item, i) => (i === index ? entry : item)));
    };

    return (
        <div data-ai-role="portList">
            {value.map((entry, index) => (
                <PortItem
                    key={index}
                    entry={entry}
                    onChange={e => handleChange(index, e)}
                    onRemove={() => handleRemove(index)}
                    canRemove={value.length > 1}
                />
            ))}
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                data-ai-action="addPort"
            >
                添加端口
            </Button>
        </div>
    );
};

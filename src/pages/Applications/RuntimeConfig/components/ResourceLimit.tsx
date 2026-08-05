import {InputNumber, Select, Space, Switch, Typography} from '@/design';
import React from 'react';

const { Text } = Typography;

// CPU 单位类型
export type CpuUnit = 'vCPU' | 'NORMALIZED';

// CPU 单位选项
const CPU_UNIT_OPTIONS = [
    { label: 'vCPU', value: 'vCPU' },
    { label: '归一化核', value: 'NORMALIZED' },
];

// Limit 类型选项
const LIMIT_TYPE_OPTIONS = [
    { label: '自定义', value: 'CUSTOM' },
    { label: '按比例配置', value: 'SCALE' },
];

export interface ResourceLimitValue {
    // Request - CPU 是字符串格式，如 "0.5vCPU" 或 "15NORMALIZED"
    cpu: string;
    memory: string; // 格式如 "2Gi"
    ephemeralStorage?: string; // 格式如 "10Gi"
    // Limit（可选，开关控制）
    limitCPU?: string;
    limitMemory?: string;
    limitEphemeralStorage?: string;
    // Limit 模式：CUSTOM（自定义值）/ SCALE（按倍数）
    limitType?: 'CUSTOM' | 'SCALE';
    limitCpuScale?: number;
    limitMemoryScale?: number;
    limitEphemeralStorageScale?: number;
    // GPU（条件显示）
    gpuCount?: number;
    gpuExclusive?: boolean;
}

interface ResourceLimitProps {
    value?: ResourceLimitValue;
    onChange?: (value: ResourceLimitValue) => void;
    enableGpu?: boolean;
}

// 默认值
const DEFAULT_VALUE: ResourceLimitValue = {
    cpu: '0.5vCPU',
    memory: '0.5Gi',
};

// 从字符串提取数字和单位
const splitCpuUnit = (value?: unknown): [number | undefined, CpuUnit] => {
    // 处理非字符串或空值
    if (!value || typeof value !== 'string') return [undefined, 'vCPU'];
    if (value.endsWith('vCPU')) {
        const num = parseFloat(value.slice(0, -4));
        return [isNaN(num) ? undefined : num, 'vCPU'];
    }
    if (value.endsWith('NORMALIZED')) {
        const num = parseFloat(value.slice(0, -11));
        return [isNaN(num) ? undefined : num, 'NORMALIZED'];
    }
    return [undefined, 'vCPU'];
};

// 从字符串提取数字（内存/存储）
const splitNumberUnit = (value?: unknown): number | undefined => {
    if (!value || typeof value !== 'string') return undefined;
    const match = /^([\d.]+)Gi$/.exec(value);
    if (match) {
        const num = parseFloat(match[1]);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
};

// 数字转 CPU 字符串
const toCpuValue = (num: number | undefined, unit: CpuUnit): string | undefined => {
    if (num === undefined) return undefined;
    return `${num}${unit}`;
};

// 数字转内存/存储字符串
const toMemoryValue = (num: number | undefined): string | undefined => {
    if (num === undefined) return undefined;
    return `${num}Gi`;
};

// 单位转换：vCPU <-> NORMALIZED (1 vCPU = 15 NORMALIZED)
const convertCpuUnit = (num: number | undefined, fromUnit: CpuUnit, toUnit: CpuUnit): number | undefined => {
    if (num === undefined) return undefined;
    if (fromUnit === 'vCPU' && toUnit === 'NORMALIZED') {
        return Math.round(num * 15);
    }
    if (fromUnit === 'NORMALIZED' && toUnit === 'vCPU') {
        return Math.round((num / 15) * 100) / 100;
    }
    return num;
};

// 按倍数计算值
const multiplyValue = (baseValue: unknown, scale: number): string | undefined => {
    if (!baseValue || typeof baseValue !== 'string' || !scale) return undefined;
    // 匹配数字和单位
    const match = /^([\d.]+)(.+)$/.exec(baseValue);
    if (match) {
        const num = parseFloat(match[1]);
        const unit = match[2];
        const newNum = num * scale;
        return `${newNum.toFixed(2)}${unit}`;
    }
    return undefined;
};

// CPU 输入组件
const CpuInput: React.FC<{
    label: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => {
    const [num, unit] = splitCpuUnit(value);

    const handleNumChange = (newNum: number | null) => {
        if (newNum === null) {
            onChange(undefined);
        } else {
            onChange(toCpuValue(newNum, unit));
        }
    };

    const handleUnitChange = (newUnit: CpuUnit) => {
        const convertedNum = convertCpuUnit(num, unit, newUnit);
        onChange(toCpuValue(convertedNum, newUnit));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
            <Space.Compact>
                <InputNumber
                    value={num}
                    disabled={disabled}
                    onChange={handleNumChange}
                    placeholder={unit === 'vCPU' ? '如 0.5' : '如 15'}
                    precision={unit === 'vCPU' ? 2 : 0}
                    step={unit === 'vCPU' ? 0.5 : 15}
                    style={{ width: 100 }}
                />
                <Select<CpuUnit>
                    value={unit}
                    disabled={disabled}
                    onChange={handleUnitChange}
                    options={CPU_UNIT_OPTIONS}
                    style={{ width: 100 }}
                />
            </Space.Compact>
        </div>
    );
};

// 内存/存储输入组件
const MemoryInput: React.FC<{
    label: string;
    value?: string;
    onChange: (value: string | undefined) => void;
    min?: number;
    step?: number;
    disabled?: boolean;
}> = ({ label, value, onChange, min = 0.1, step = 1, disabled }) => {
    const num = splitNumberUnit(value);

    const handleChange = (newNum: number | null) => {
        onChange(toMemoryValue(newNum ?? undefined));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
            <InputNumber
                value={num}
                disabled={disabled}
                min={min}
                step={step}
                precision={2}
                addonAfter="Gi"
                placeholder="如 2"
                style={{ width: 150 }}
                onChange={handleChange}
            />
        </div>
    );
};

// SCALE 模式倍数输入组件
const ScaleInput: React.FC<{
    label: string;
    value?: number;
    onChange: (value: number | undefined) => void;
}> = ({ label, value, onChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
            <InputNumber
                value={value}
                min={1}
                precision={1}
                step={0.5}
                addonAfter="倍"
                placeholder="如 1.5"
                style={{ width: 120 }}
                onChange={v => onChange(v ?? undefined)}
            />
        </div>
    );
};

export const ResourceLimit: React.FC<ResourceLimitProps> = ({
    value = DEFAULT_VALUE,
    onChange,
    enableGpu = false,
}) => {
    const update = (patch: Partial<ResourceLimitValue>) => {
        onChange?.({ ...value, ...patch });
    };

    const limitEnabled = value.limitCPU !== undefined || value.limitMemory !== undefined;

    const handleLimitToggle = (checked: boolean) => {
        if (checked) {
            update({
                limitCPU: value.cpu,
                limitMemory: value.memory,
                limitEphemeralStorage: value.ephemeralStorage,
                limitType: 'CUSTOM',
                limitCpuScale: 1,
                limitMemoryScale: 1,
                limitEphemeralStorageScale: 1,
            });
        } else {
            update({
                limitCPU: undefined,
                limitMemory: undefined,
                limitEphemeralStorage: undefined,
                limitType: undefined,
                limitCpuScale: undefined,
                limitMemoryScale: undefined,
                limitEphemeralStorageScale: undefined,
            });
        }
    };

    const handleLimitTypeChange = (limitType: 'CUSTOM' | 'SCALE') => {
        if (limitType === 'CUSTOM') {
            update({
                limitType,
                limitCPU: value.cpu,
                limitMemory: value.memory,
                limitEphemeralStorage: value.ephemeralStorage,
                limitCpuScale: undefined,
                limitMemoryScale: undefined,
                limitEphemeralStorageScale: undefined,
            });
        } else {
            update({
                limitType,
                limitCPU: multiplyValue(value.cpu, 1),
                limitMemory: multiplyValue(value.memory, 1),
                limitEphemeralStorage: multiplyValue(value.ephemeralStorage, 1),
                limitCpuScale: 1,
                limitMemoryScale: 1,
                limitEphemeralStorageScale: 1,
            });
        }
    };

    // SCALE 模式下更新 limit 值
    const handleScaleChange = (
        scaleKey: 'limitCpuScale' | 'limitMemoryScale' | 'limitEphemeralStorageScale',
        limitKey: 'limitCPU' | 'limitMemory' | 'limitEphemeralStorage',
        baseKey: 'cpu' | 'memory' | 'ephemeralStorage',
        scale: number | undefined,
    ) => {
        if (scale === undefined) {
            update({ [scaleKey]: undefined, [limitKey]: undefined });
        } else {
            update({
                [scaleKey]: scale,
                [limitKey]: multiplyValue(value[baseKey], scale),
            });
        }
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }} data-ai-role="resourceLimit">
            {/* Request */}
            <Space wrap align="end">
                <Text type="secondary" style={{ fontSize: 12, width: 50, display: 'inline-block' }}>request</Text>
                <CpuInput
                    label="CPU"
                    value={value.cpu}
                    onChange={v => update({ cpu: v ?? '0.5vCPU', limitCPU: v })}
                />
                <MemoryInput
                    label="内存"
                    value={value.memory}
                    min={0.1}
                    step={1}
                    onChange={v => update({ memory: v ?? '0.5Gi' })}
                />
                <MemoryInput
                    label="存储资源"
                    value={value.ephemeralStorage}
                    min={1}
                    step={10}
                    onChange={v => update({ ephemeralStorage: v })}
                />
            </Space>

            {/* Limit 开关 */}
            <Space align="center">
                <Text type="secondary" style={{ fontSize: 12, width: 50, display: 'inline-block' }}>limit</Text>
                <Switch
                    checked={limitEnabled}
                    onChange={handleLimitToggle}
                    size="small"
                    data-ai-param="limitEnabled"
                />
                {limitEnabled && (
                    <Select
                        value={value.limitType}
                        options={LIMIT_TYPE_OPTIONS}
                        style={{ width: 120 }}
                        onChange={handleLimitTypeChange}
                        data-ai-param="limitType"
                    />
                )}
            </Space>

            {/* Limit CUSTOM */}
            {limitEnabled && value.limitType === 'CUSTOM' && (
                <Space wrap align="end" style={{ paddingLeft: 58 }}>
                    <CpuInput
                        label="CPU Limit"
                        value={value.limitCPU}
                        onChange={v => update({ limitCPU: v })}
                    />
                    <MemoryInput
                        label="内存 Limit"
                        value={value.limitMemory}
                        min={0.1}
                        step={1}
                        onChange={v => update({ limitMemory: v })}
                    />
                    <MemoryInput
                        label="存储 Limit"
                        value={value.limitEphemeralStorage}
                        min={1}
                        step={10}
                        onChange={v => update({ limitEphemeralStorage: v })}
                    />
                </Space>
            )}

            {/* Limit SCALE - 使用 InputNumber 输入倍数 */}
            {limitEnabled && value.limitType === 'SCALE' && (
                <Space wrap align="end" style={{ paddingLeft: 58 }}>
                    <ScaleInput
                        label="CPU"
                        value={value.limitCpuScale}
                        onChange={v => handleScaleChange('limitCpuScale', 'limitCPU', 'cpu', v)}
                    />
                    <ScaleInput
                        label="内存"
                        value={value.limitMemoryScale}
                        onChange={v => handleScaleChange('limitMemoryScale', 'limitMemory', 'memory', v)}
                    />
                    <ScaleInput
                        label="存储资源"
                        value={value.limitEphemeralStorageScale}
                        onChange={v =>
                            handleScaleChange(
                                'limitEphemeralStorageScale',
                                'limitEphemeralStorage',
                                'ephemeralStorage',
                                v,
                            )}
                    />
                </Space>
            )}

            {/* GPU */}
            {enableGpu && (
                <Space wrap align="end">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>GPU 卡数</Text>
                        <InputNumber
                            value={value.gpuCount}
                            min={1}
                            style={{ width: 120 }}
                            onChange={v => update({ gpuCount: v ?? undefined })}
                            data-ai-param="gpuCount"
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>独占模式</Text>
                        <Switch
                            checked={value.gpuExclusive ?? false}
                            onChange={v => update({ gpuExclusive: v })}
                            data-ai-param="gpuExclusive"
                        />
                    </div>
                </Space>
            )}
        </Space>
    );
};

/* eslint-disable max-depth */
/* eslint-disable complexity */
import type {EnvEntry} from '../components/EnvList';
import type {PortEntry} from '../components/PortList';
import type {ResourceLimitValue} from '../components/ResourceLimit';
import type {ValidatorRegistry} from '../schema/types';

// 从 CPU 字符串提取数字值（归一化核统一转换为 vCPU 进行比较）
const parseCpuValue = (value: string | undefined): number | undefined => {
    if (!value) {
        return undefined;
    }
    if (value.endsWith('vCPU')) {
        const num = parseFloat(value.slice(0, -4));
        return isNaN(num) ? undefined : num;
    }
    if (value.endsWith('NORMALIZED')) {
        const num = parseFloat(value.slice(0, -11));
        return isNaN(num) ? undefined : num / 15; // 归一化核转 vCPU
    }
    return undefined;
};

// 从内存/存储字符串提取数字值
const parseMemoryValue = (value: string | undefined): number | undefined => {
    if (!value) {
        return undefined;
    }
    const match = /^([\d.]+)Gi$/.exec(value);
    if (match) {
        const num = parseFloat(match[1]);
        return isNaN(num) ? undefined : num;
    }
    return undefined;
};

export const containerValidators: ValidatorRegistry = {
    // 校验端口列表：端口号不重复，名称不重复，范围合法
    portsValid: (_params, _form) => ({
        validator: async (_rule, value: PortEntry[] | undefined) => {
            if (!value || value.length === 0) {
                return;
            }

            const portNames = value.map(p => p.name).filter(Boolean);
            const hasDuplicateName = portNames.length !== new Set(portNames).size;
            if (hasDuplicateName) {
                return Promise.reject(new Error('存在重复的端口名称'));
            }

            for (const port of value) {
                // NAMED_STATIC / NAMED_DYNAMIC：校验 from 端口
                if (port.type === 'NAMED_STATIC' || port.type === 'NAMED_DYNAMIC') {
                    const from = port.portRange.from;
                    if (!from || from < 1 || from > 65535) {
                        return Promise.reject(new Error('端口号必须在 1-65535 范围内'));
                    }
                    if (port.type === 'NAMED_DYNAMIC') {
                        const to = port.portRange.to;
                        if (!to || to < 1 || to > 65535) {
                            return Promise.reject(new Error('动态端口结束端口号必须在 1-65535 范围内'));
                        }
                        if (from >= to) {
                            return Promise.reject(new Error('动态端口起始端口号必须小于结束端口号'));
                        }
                    }
                    if (port.name && !/^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/.test(port.name)) {
                        return Promise.reject(
                            new Error('端口名称只能包含小写字母、数字和连字符，必须以字母开头，以字母或数字结尾'),
                        );
                    }
                }
                // RANGE：校验端口个数
                if (port.type === 'RANGE') {
                    const range = port.portRange.range;
                    if (!range || range < 1) {
                        return Promise.reject(new Error('端口段个数必须为正整数'));
                    }
                }
            }
        },
    }),

    // 校验环境变量列表：变量名不为空、不重复、格式合法
    envsValid: (_params, _form) => ({
        validator: async (_rule, value: EnvEntry[] | undefined) => {
            if (!value || value.length === 0) {
                return;
            }

            const names = value.map(e => e.name);
            const hasDuplicate = names.length !== new Set(names).size;
            if (hasDuplicate) {
                return Promise.reject(new Error('存在重复的环境变量名'));
            }

            for (const env of value) {
                if (!env.name) {
                    return Promise.reject(new Error('环境变量名不能为空'));
                }
                if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(env.name)) {
                    return Promise.reject(
                        new Error(`环境变量名 "${env.name}" 格式不合法，只能包含字母、数字和下划线`),
                    );
                }
                if (!env.value) {
                    return Promise.reject(new Error(`环境变量 "${env.name}" 的值不能为空`));
                }
            }
        },
    }),

    // 校验资源限制：request 不能大于 limit
    resourcesValid: (_params, _form) => ({
        validator: async (_rule, value: ResourceLimitValue | undefined) => {
            if (!value) {
                return;
            }
            const cpuRequest = parseCpuValue(value.cpu);
            const cpuLimit = parseCpuValue(value.limitCPU);
            const memoryRequest = parseMemoryValue(value.memory);
            const memoryLimit = parseMemoryValue(value.limitMemory);
            const storageRequest = parseMemoryValue(value.ephemeralStorage);
            const storageLimit = parseMemoryValue(value.limitEphemeralStorage);

            if (cpuLimit !== undefined && cpuRequest !== undefined && cpuRequest > cpuLimit) {
                return Promise.reject(new Error('CPU Request 不能大于 CPU Limit'));
            }
            if (memoryLimit !== undefined && memoryRequest !== undefined && memoryRequest > memoryLimit) {
                return Promise.reject(new Error('内存 Request 不能大于内存 Limit'));
            }
            if (
                storageRequest !== undefined
                && storageLimit !== undefined
                && storageRequest > storageLimit
            ) {
                return Promise.reject(new Error('存储 Request 不能大于存储 Limit'));
            }
        },
    }),
};

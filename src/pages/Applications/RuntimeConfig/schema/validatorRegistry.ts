import type {ValidatorRegistry} from './types';

// 基础校验器注册表（通用规则）
// 每个模块可通过 mergeValidators 合并自己的校验器
export const baseValidatorRegistry: ValidatorRegistry = {
    // 必填（带自定义消息）
    required: params => ({
        required: true,
        message: (params.message as string) ?? '此项为必填项',
    }),

    // 正整数
    positiveInteger: (_params, _form) => ({
        validator: async (_rule, value) => {
            if (value === undefined || value === null || value === '') {
                return;
            }
            if (!Number.isInteger(value) || value <= 0) {
                return Promise.reject(new Error('请输入正整数'));
            }
        },
    }),

    // 端口范围 1-65535
    portRange: (_params, _form) => ({
        validator: async (_rule, value) => {
            if (value === undefined || value === null || value === '') {
                return;
            }
            const num = Number(value);
            if (!Number.isInteger(num) || num < 1 || num > 65535) {
                return Promise.reject(new Error('端口号范围为 1-65535'));
            }
        },
    }),

    // 正则匹配
    pattern: (params, _form) => ({
        pattern: new RegExp(params.regex as string),
        message: (params.message as string) ?? '格式不正确',
    }),

    // 最大长度
    maxLength: (params, _form) => ({
        max: params.max as number,
        message: `最多 ${params.max} 个字符`,
    }),

    // 最小值
    min: (params, _form) => ({
        type: 'number' as const,
        min: params.min as number,
        message: `不能小于 ${params.min}`,
    }),

    // 最大值
    max: (params, _form) => ({
        type: 'number' as const,
        max: params.max as number,
        message: `不能大于 ${params.max}`,
    }),

    // DNS 标签格式（小写字母、数字、连字符，字母开头，字母或数字结尾）
    dnsLabel: (_params, _form) => ({
        pattern: /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/,
        message: '只能包含小写字母、数字和连字符，必须以字母开头，以字母或数字结尾',
    }),

    // 环境变量名格式
    envVarName: (_params, _form) => ({
        pattern: /^[A-Za-z_][A-Za-z0-9_]*$/,
        message: '环境变量名只能包含字母、数字和下划线，且不能以数字开头',
    }),

    // CPU 格式（如 100m, 0.5, 2）
    cpuFormat: (_params, _form) => ({
        validator: async (_rule, value) => {
            if (!value) {
                return;
            }
            const milliCpu = /^\d+m$/;
            const coreCpu = /^\d+(\.\d+)?$/;
            if (!milliCpu.test(value) && !coreCpu.test(value)) {
                return Promise.reject(new Error('CPU 格式错误，示例：100m、0.5、2'));
            }
        },
    }),

    // 内存格式（如 128Mi, 1Gi, 512M）
    memoryFormat: (_params, _form) => ({
        validator: async (_rule, value) => {
            if (!value) {
                return;
            }
            if (!/^\d+(Mi|Gi|M|G|Ki|K)$/.test(value)) {
                return Promise.reject(new Error('内存格式错误，示例：128Mi、1Gi'));
            }
        },
    }),

    // 绝对路径（必须以 / 开头）
    absolutePath: (_params, _form) => ({
        validator: async (_rule, value: string | undefined) => {
            if (!value) {
                return;
            }
            if (!value.startsWith('/')) {
                return Promise.reject(new Error('路径必须是绝对路径，以 / 开头'));
            }
        },
    }),
};

/**
 * 合并多个 ValidatorRegistry，后者覆盖前者同名 key
 */
export function mergeValidators(...registries: ValidatorRegistry[]): ValidatorRegistry {
    return Object.assign({}, ...registries);
}

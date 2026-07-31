import type {ValidatorRegistry} from '../schema/types';

export const ingressValidators: ValidatorRegistry = {
    // 域名格式校验
    hostFormat: (_params, _form) => ({
        validator: async (_rule, value: string | undefined) => {
            if (!value) {
                return;
            }
            // 允许 hostname 或 IP 格式
            const hostnameRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
            if (!hostnameRegex.test(value) && !ipRegex.test(value)) {
                return Promise.reject(new Error('域名格式不正确，如 my-app.example.com'));
            }
        },
    }),

    // 路径格式校验（必须以 / 开头）
    pathFormat: (_params, _form) => ({
        validator: async (_rule, value: string | undefined) => {
            if (!value) {
                return;
            }
            if (!value.startsWith('/')) {
                return Promise.reject(new Error('路径必须以 / 开头'));
            }
        },
    }),

    // NodePort 范围校验
    nodePortRange: (_params, _form) => ({
        validator: async (_rule, value: number | undefined) => {
            if (value === undefined || value === null) {
                return;
            }
            if (value < 30000 || value > 32767) {
                return Promise.reject(new Error('NodePort 端口范围为 30000-32767'));
            }
        },
    }),
};

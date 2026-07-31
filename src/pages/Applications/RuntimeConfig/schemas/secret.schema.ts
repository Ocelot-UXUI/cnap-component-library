import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const secretSchema: TabSchema = {
    key: 'secret',
    label: 'Secret',
    fields: [
        {
            name: 'secretRefs',
            label: 'Secret 引用',
            component: 'KeyValueList',
            componentProps: {
                keyPlaceholder: 'Secret 名称',
                valuePlaceholder: '挂载路径（如 /etc/secret）',
                addLabel: '添加 Secret',
            },
            validators: [{ name: 'secretRefsValid' }],
            tooltip: '将 Secret 挂载到容器内指定路径，或作为环境变量注入',
            aiMeta: { role: 'field', param: 'secretRefs', desc: 'Secret 引用列表' },
        },
        {
            name: 'imagePullSecrets',
            label: '镜像拉取 Secret',
            component: 'Select',
            componentProps: { mode: 'tags', style: { width: '100%' } },
            placeholder: '输入 Secret 名称后回车',
            tooltip: '用于拉取私有镜像的 Secret 名称列表',
            aiMeta: { role: 'field', param: 'imagePullSecrets', desc: '镜像拉取 Secret 列表' },
        },
    ],
};

export const secretValidators: ValidatorRegistry = {
    secretRefsValid: (_params, _form) => ({
        validator: async (_rule, value: Array<{ key: string; value: string; }> | undefined) => {
            if (!value || value.length === 0) {
                return;
            }
            const names = value.map(item => item.key);
            if (names.length !== new Set(names).size) {
                return Promise.reject(new Error('存在重复的 Secret 名称'));
            }
            for (const item of value) {
                if (!item.key) {
                    return Promise.reject(new Error('Secret 名称不能为空'));
                }
                if (!/^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/.test(item.key)) {
                    return Promise.reject(new Error(`Secret 名称 "${item.key}" 格式不合法（小写字母、数字、连字符）`));
                }
            }
        },
    }),
};

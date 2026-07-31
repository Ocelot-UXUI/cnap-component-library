import type {TabSchema} from '../schema/types';
import type {ValidatorRegistry} from '../schema/types';

export const annotationSchema: TabSchema = {
    key: 'annotation',
    label: 'Annotation',
    fields: [
        {
            name: 'podAnnotation',
            label: 'Pod Annotation',
            component: 'KeyValueList',
            componentProps: {
                keyPlaceholder: 'annotation key',
                valuePlaceholder: 'annotation value',
                addLabel: '添加 Pod Annotation',
            },
            validators: [{ name: 'annotationValid' }],
            tooltip: '添加到 Pod 上的 Annotation，key 支持 prefix/name 格式',
            aiMeta: { role: 'field', param: 'podAnnotation', desc: 'Pod Annotation 列表' },
        },
        {
            name: 'workloadAnnotation',
            label: 'Workload Annotation',
            component: 'KeyValueList',
            componentProps: {
                keyPlaceholder: 'annotation key',
                valuePlaceholder: 'annotation value',
                addLabel: '添加 Workload Annotation',
            },
            validators: [{ name: 'annotationValid' }],
            tooltip: '添加到 Workload（Deployment/StatefulSet 等）上的 Annotation',
            aiMeta: { role: 'field', param: 'workloadAnnotation', desc: 'Workload Annotation 列表' },
        },
    ],
};

export const podLabelSchema: TabSchema = {
    key: 'podLabel',
    label: 'Label',
    fields: [
        {
            name: 'podLabel',
            label: 'Pod Label',
            component: 'KeyValueList',
            componentProps: {
                keyPlaceholder: 'label key',
                valuePlaceholder: 'label value',
                addLabel: '添加 Pod Label',
            },
            validators: [{ name: 'labelValid' }],
            tooltip: '添加到 Pod 上的自定义 Label，key 格式：[prefix/]name',
            aiMeta: { role: 'field', param: 'podLabel', desc: 'Pod Label 列表' },
        },
    ],
};

export const annotationValidators: ValidatorRegistry = {
    annotationValid: (_params, _form) => ({
        validator: async (_rule, value: Array<{ key: string; value: string; }> | undefined) => {
            if (!value || value.length === 0) {
                return;
            }
            const keys = value.map(item => item.key);
            if (keys.length !== new Set(keys).size) {
                return Promise.reject(new Error('存在重复的 Annotation key'));
            }
            for (const item of value) {
                if (!item.key) {
                    return Promise.reject(new Error('Annotation key 不能为空'));
                }
                // key 格式：可选 prefix/ + name，name 只能是字母数字 - _ .
                const keyRegex = /^([a-z0-9.-]+\/)?[a-zA-Z0-9._-]+$/;
                if (!keyRegex.test(item.key)) {
                    return Promise.reject(new Error(`Annotation key "${item.key}" 格式不合法`));
                }
            }
        },
    }),

    labelValid: (_params, _form) => ({
        validator: async (_rule, value: Array<{ key: string; value: string; }> | undefined) => {
            if (!value || value.length === 0) {
                return;
            }
            const keys = value.map(item => item.key);
            if (keys.length !== new Set(keys).size) {
                return Promise.reject(new Error('存在重复的 Label key'));
            }
            for (const item of value) {
                if (!item.key) {
                    return Promise.reject(new Error('Label key 不能为空'));
                }
                const keyRegex = /^([a-z0-9.-]+\/)?[a-zA-Z0-9._-]+$/;
                if (!keyRegex.test(item.key)) {
                    return Promise.reject(new Error(`Label key "${item.key}" 格式不合法`));
                }
                // label value 只能是字母数字 - _ .，且不超过63字符
                if (item.value && !/^[a-zA-Z0-9._-]{0,63}$/.test(item.value)) {
                    return Promise.reject(
                        new Error(`Label value "${item.value}" 格式不合法（最多63字符，只含字母数字 - _ .）`),
                    );
                }
            }
        },
    }),
};

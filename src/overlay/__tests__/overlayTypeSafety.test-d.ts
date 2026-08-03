/**
 * 类型级测试：锁定 openModal 的「按 key 参数约束」不回退。
 * 用 tsc（yarn lint-type）静态校验——若类型安全被破坏（漏字段 / 混入受控 props / 错 key
 * 不再报错），下方 @ts-expect-error 会失效并使 lint-type 失败。
 * 文件名不匹配 vitest 运行 glob（*.test.ts），故不参与运行时测试。
 */
import type {ModalInvocationProps, ModalKey} from '../types';

// 正例：pod-restart 的完整调用 props 应通过（open/onClose 由宿主注入，无需传）
export const validRestartProps: ModalInvocationProps<'pod-restart'> = {
    appEnvID: '',
    pods: [],
    operationName: '',
    onSuccess: () => undefined,
};

// @ts-expect-error 缺少必填字段（pods/operationName/onSuccess）应报错
export const missingFields: ModalInvocationProps<'pod-restart'> = { appEnvID: '' };

// onClose 属宿主受控 props，不应出现在调用 props 中
export const managedLeak: ModalInvocationProps<'pod-restart'> = {
    appEnvID: '',
    pods: [],
    operationName: '',
    onSuccess: () => undefined,
    // @ts-expect-error onClose 由宿主注入，混入调用 props 应报错
    onClose: () => undefined,
};

// @ts-expect-error 未注册的 key 不属于 ModalKey
export const badKey: ModalKey = 'not-registered';

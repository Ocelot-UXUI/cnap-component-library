import {vi} from 'vitest';

// jsdom 未实现 ResizeObserver，antd 组件（rc-resize-observer）挂载时会抛 unhandled error；
// 提供最小 stub，使渲染类测试在 jsdom 下可正常工作。
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}
(globalThis as Record<string, unknown>).ResizeObserver = ResizeObserverStub;

// navigationActor（src/contexts/navigationActor.ts）在模块顶层 createActor(...).start()，
// machine 启动即触发 loadCandidates → loadNavigationContextCandidates → 真实接口请求。
// 任何测试 import 组件链（如 podCells → ClusterNameLabel → NavigationContext）都会走到这里。
// 全局 mock 这两个依赖，让候选加载返回空数据，保证单测不发真实请求。
vi.mock('@/api/account', () => ({
    default: {
        getMany: vi.fn(async () => []),
        getApplicationsByAccount: vi.fn(async () => []),
    },
}));

vi.mock('@/api/applicationEnvironment', () => ({
    default: {
        getEnvironments: vi.fn(async () => []),
        getClusters: vi.fn(async () => []),
    },
}));

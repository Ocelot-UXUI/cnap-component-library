/**
 * Pod 状态映射（纯逻辑）：原始状态 → 中文名 / 徽章色调 / 是否正常。
 *
 * 色调（tone）为语义键，由 UI 层映射到 `semantic.state[tone]`，此处不直接依赖颜色常量。
 * 数据来源：docs/input/source-api-runtime-workloads.md（Pod 状态整理表）。
 */

export type StatusTone = 'success' | 'info' | 'warning' | 'error';

interface StatusMeta {
    label: string;
    tone: StatusTone;
    normal: boolean;
}

const STATUS_MAP: Record<string, StatusMeta> = {
    'Running Ready': { label: '运行中', tone: 'success', normal: true },
    'Completed': { label: '已完成', tone: 'success', normal: true },
    'Terminating': { label: '终止中', tone: 'info', normal: true },
    'Running InPlaceUpdateNotReady': { label: '原地升级中', tone: 'warning', normal: true },
    'Pending': { label: '等待调度', tone: 'info', normal: false },
    'ContainerCreating': { label: '容器创建中', tone: 'info', normal: false },
    'PodInitializing': { label: '初始化中', tone: 'info', normal: false },
    'Running NotReady': { label: '运行中未就绪', tone: 'warning', normal: false },
    'CrashLoopBackOff': { label: '反复崩溃', tone: 'error', normal: false },
    'CreateContainerError': { label: '容器创建失败', tone: 'error', normal: false },
    'ErrImagePull': { label: '镜像拉取错误', tone: 'error', normal: false },
    'ImagePullBackOff': { label: '镜像拉取失败', tone: 'error', normal: false },
    'InvalidImageName': { label: '镜像名称无效', tone: 'error', normal: false },
    'ImageInspectError': { label: '镜像检查失败', tone: 'error', normal: false },
    'OOMKilled': { label: '内存超限被终止', tone: 'error', normal: false },
    'Evicted': { label: '已驱逐', tone: 'error', normal: false },
    'UnexpectedAdmissionError': { label: '准入检查异常', tone: 'error', normal: false },
    'Error': { label: '执行错误', tone: 'error', normal: false },
    'Failed': { label: '执行失败', tone: 'error', normal: false },
};

/** Init:xxx 前缀的初始化态统一归蓝色、非正常 */
function initMeta(raw: string): StatusMeta | undefined {
    if (!raw.startsWith('Init:')) {
        return undefined;
    }
    const tone: StatusTone = /CrashLoopBackOff|Error|ImagePullBackOff/.test(raw) ? 'error' : 'info';
    return { label: `初始化中（${raw.slice(5)}）`, tone, normal: false };
}

function lookup(raw: string): StatusMeta | undefined {
    return STATUS_MAP[raw] ?? initMeta(raw);
}

/** 正常状态集合（快捷筛选"正常"映射） */
export const NORMAL_STATUSES: string[] = Object.entries(STATUS_MAP)
    .filter(([, meta]) => meta.normal)
    .map(([status]) => status);

/** 状态中文名；未匹配回退原始值 */
export function statusLabel(raw: string): string {
    return lookup(raw)?.label ?? raw;
}

/** 状态徽章色调；未匹配回退 error（未知态按异常呈现） */
export function statusTone(raw: string): StatusTone {
    return lookup(raw)?.tone ?? 'error';
}

/** 是否正常；未匹配按非正常处理（计入异常） */
export function isNormalStatus(raw: string): boolean {
    return lookup(raw)?.normal ?? false;
}

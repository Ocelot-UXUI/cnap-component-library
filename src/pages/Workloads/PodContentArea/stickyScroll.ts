/**
 * Workloads 假滚动（pin-scrub）纯逻辑。
 *
 * 模型：外部单一滚动容器（PaneScroll）滚动；PodContentArea 作为定高窗口 pin 在 header 下方，
 * 窗口内容按外部 scrollTop 换算的 progress 以 transform 搬运。此文件只做纯计算，便于单测。
 */

/** headerH 兜底：WorkloadsHeader 容器 36px + Sticky paddingBottom(spacing.l=16) ≈ 52 */
export const DEFAULT_HEADER_HEIGHT = 52;

/** 单个分组的几何量测（相对 Track 顶） */
export interface GroupGeometry {
    id: string;
    /** GroupBlock 顶相对 Track 顶的偏移 */
    top: number;
    /** GroupBlock 总高（GroupHeader + 表格 + 分页 + 间距） */
    height: number;
    /** GroupHeader 高 */
    headerHeight: number;
    /** thead 相对 GroupBlock 顶的偏移（≈ headerHeight + gap） */
    theadOffset: number;
    /** thead 高 */
    theadHeight: number;
}

/** 单个分组的吸顶变换结果 */
export interface GroupStickyState {
    id: string;
    /** GroupHeader 相对自然位置需施加的 translateY（>=0，向下） */
    headerTranslateY: number;
    /** thead 相对自然位置需施加的 translateY（>=0，向下） */
    theadTranslateY: number;
    /** 该组 GroupHeader 是否正停在窗口顶（吸顶态） */
    pinned: boolean;
}

export function clamp(value: number, min: number, max: number): number {
    if (max < min) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}

/** 定高窗口高度：视口 − headerH − (批量栏可见 ? 批量栏高 : 0)，须为批量栏让高 */
export function computeWindowHeight(
    viewportHeight: number,
    headerHeight: number,
    batchBarHeight: number,
    batchBarVisible: boolean,
): number {
    const reserved = headerHeight + (batchBarVisible ? batchBarHeight : 0);
    return Math.max(0, viewportHeight - reserved);
}

/**
 * 窗口 pin 起点（外层 scrollTop 阈值）。用 rect 实测，避免 offsetTop 越过滚动容器
 * 且不含 PaneScroll padding。stageTop/scrollElTop 均取 getBoundingClientRect().top。
 */
export function computePinStart(
    stageTop: number,
    scrollElTop: number,
    scrollTop: number,
    headerHeight: number,
): number {
    return stageTop - scrollElTop + scrollTop - headerHeight;
}

/** 可搬运行程 = max(0, 内容高 − 窗口高) */
export function computeScrubRange(contentHeight: number, windowHeight: number): number {
    return Math.max(0, contentHeight - windowHeight);
}

/** 当前进度 = clamp(scrollTop − pinStart, 0, scrubRange) */
export function computeProgress(scrollTop: number, pinStart: number, scrubRange: number): number {
    return clamp(scrollTop - pinStart, 0, scrubRange);
}

/** 单组吸顶变换：GroupHeader 与 thead 分别反向 translate 停留窗口顶，越界则随块体滑出（交接） */
export function computeGroupSticky(group: GroupGeometry, progress: number): GroupStickyState {
    const headerTravel = Math.max(0, group.height - group.headerHeight);
    const headerTranslateY = clamp(progress - group.top, 0, headerTravel);

    const theadTravel = Math.max(0, group.height - group.theadOffset - group.theadHeight);
    const theadTranslateY = clamp(
        progress - group.top - group.theadOffset + group.headerHeight,
        0,
        theadTravel,
    );

    const pinned = headerTranslateY > 0 && headerTranslateY < headerTravel;

    return { id: group.id, headerTranslateY, theadTranslateY, pinned };
}

export function computeGroupStickies(groups: GroupGeometry[], progress: number): GroupStickyState[] {
    return groups.map(group => computeGroupSticky(group, progress));
}

/** 当前 active 分组下标：progress 已越过其 top 的最后一个分组；都未越过则 -1 */
export function activeGroupIndex(groups: GroupGeometry[], progress: number): number {
    let index = -1;
    for (let i = 0; i < groups.length; i += 1) {
        if (groups[i].top <= progress) {
            index = i;
        } else {
            break;
        }
    }
    return index;
}

/** 分页器是否需固定在窗口底：active 分组的底（分页所在）尚在窗口下方时为 true */
export function paginationPinned(
    group: GroupGeometry,
    progress: number,
    windowHeight: number,
): boolean {
    const groupBottomInWindow = group.top + group.height - progress;
    return groupBottomInWindow > windowHeight;
}

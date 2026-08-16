import {createContext, useContext} from 'react';

import type {RefObject} from 'react';

/**
 * 假滚动进度控制器对外契约。转换/量测由 useStickyScroll 承载；
 * 消费者（PodGroupTable）据此决定分页器固定态并注册自身几何。
 */
export interface StickyScrollApi {
    /** 窗口是否已 pin 在 header 下方 */
    pinned: boolean;
    /** 定高窗口高度（px） */
    windowHeight: number;
    /** 当前 active 分组 id（progress 已越过其顶）；无则 null */
    activeGroupId: string | null;
    /** 分页器需固定在窗口底的分组 id（仅 active 分组）；无则 null */
    paginationPinnedId: string | null;
    /** 窗口底部分页器插槽 DOM（active 分组分页固定时 portal 到此） */
    paginationSlot: HTMLElement | null;
    /** 注册 / 注销一个 GroupBlock DOM，用于量测与施加吸顶变换 */
    registerGroup: (id: string, el: HTMLElement | null) => void;
    /** 请求重新量测（折叠 / 数据到达 / 换页 / 视图切换后调用） */
    remeasure: () => void;
}

const noop = () => {};

export const StickyScrollContext = createContext<StickyScrollApi>({
    pinned: false,
    windowHeight: 0,
    activeGroupId: null,
    paginationPinnedId: null,
    paginationSlot: null,
    registerGroup: noop,
    remeasure: noop,
});

export function useStickyScrollContext(): StickyScrollApi {
    return useContext(StickyScrollContext);
}

export interface UseStickyScrollOptions {
    /** 常驻的 WorkloadsHeader（原生 sticky）——实测 headerHeight */
    headerRef: RefObject<HTMLElement | null>;
    /** 屏幕底部批量操作栏——实测让高高度 */
    batchBarRef: RefObject<HTMLElement | null>;
    /** 批量操作栏是否可见（影响窗口高与进度） */
    batchBarVisible: boolean;
}

export interface UseStickyScrollResult {
    stageRef: RefObject<HTMLDivElement | null>;
    windowRef: RefObject<HTMLDivElement | null>;
    trackRef: RefObject<HTMLDivElement | null>;
    spacerRef: RefObject<HTMLDivElement | null>;
    setPaginationSlot: (el: HTMLElement | null) => void;
    api: StickyScrollApi;
}

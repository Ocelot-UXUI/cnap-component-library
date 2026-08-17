import {useCallback, useEffect, useLayoutEffect, useMemo, useRef} from 'react';

import {spacing} from '@/constants/spacing';

import {
    computePinStart,
    computeProgress,
    computeScrubRange,
    computeWindowHeight,
    DEFAULT_HEADER_HEIGHT,
} from '../PodContentArea/stickyScroll';
import {attachStickyListeners, resolveScrollParent} from './stickyScrollDom';

import type {StickyScrollApi, UseStickyScrollOptions, UseStickyScrollResult} from './context';

/** 双向同步写前差值阈值：差值小于该值不写，配合映射一致性防回环 */
const SCROLL_SYNC_EPSILON = 1;

/** 白卡底边与批量栏顶边之间的灰底呼吸间距 */
const BATCH_BAR_GAP = spacing.xs * 2;

/**
 * linked-scroll 同步控制器（spike 版）：内部窗口为真实滚动容器（滚动条隐藏），
 * 外层滚动经 pinStart 映射为内部 scrollTop；滚轮悬停窗口时内部原生滚动并回写外层。
 */
export function useStickyScroll(options: UseStickyScrollOptions): UseStickyScrollResult {
    const {headerRef, batchBarRef, batchBarVisible} = options;

    const stageRef = useRef<HTMLDivElement | null>(null);
    const windowRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const spacerRef = useRef<HTMLDivElement | null>(null);
    const metricsRef = useRef({pinStart: 0});
    const rafRef = useRef(0);

    const syncInnerFromOuter = useCallback(() => {
        const win = windowRef.current;
        const scrollEl = resolveScrollParent(stageRef.current);
        if (!win || !scrollEl) {
            return;
        }
        const maxScroll = win.scrollHeight - win.clientHeight;
        const target = computeProgress(scrollEl.scrollTop, metricsRef.current.pinStart, maxScroll);
        if (Math.abs(win.scrollTop - target) >= SCROLL_SYNC_EPSILON) {
            win.scrollTop = target;
        }
    }, []);

    const syncOuterFromInner = useCallback(() => {
        const win = windowRef.current;
        const scrollEl = resolveScrollParent(stageRef.current);
        if (!win || !scrollEl) {
            return;
        }
        const target = metricsRef.current.pinStart + win.scrollTop;
        if (Math.abs(scrollEl.scrollTop - target) >= SCROLL_SYNC_EPSILON) {
            scrollEl.scrollTop = target;
        }
    }, []);

    const measure = useCallback(() => {
        const stage = stageRef.current;
        const win = windowRef.current;
        const track = trackRef.current;
        const spacer = spacerRef.current;
        const scrollEl = resolveScrollParent(stage);
        if (!stage || !win || !track || !spacer || !scrollEl) {
            return;
        }
        const headerHeight = headerRef.current?.offsetHeight ?? DEFAULT_HEADER_HEIGHT;
        // 批量栏占位足迹 = 栏高 + Dock 悬浮 bottom 偏移；读 computedStyle 避免 token 双写，且不受 framer 入场动画 transform 影响
        const batchBarFootprint = batchBarVisible && batchBarRef.current
            ? batchBarRef.current.offsetHeight + (Number.parseFloat(getComputedStyle(batchBarRef.current).bottom) || 0)
            : 0;
        const windowHeight = computeWindowHeight(
            scrollEl.clientHeight,
            headerHeight,
            batchBarFootprint + BATCH_BAR_GAP,
            batchBarVisible,
        );
        const contentHeight = win.scrollHeight;
        win.style.top = `${headerHeight}px`;
        win.style.height = `${Math.min(windowHeight, contentHeight)}px`;

        const stageRect = stage.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();
        metricsRef.current = {
            pinStart: computePinStart(stageRect.top, scrollRect.top, scrollEl.scrollTop, headerHeight),
        };
        spacer.style.height = `${computeScrubRange(contentHeight, windowHeight)}px`;
        syncInnerFromOuter();
    }, [batchBarVisible, headerRef, batchBarRef, syncInnerFromOuter]);

    const remeasure = useCallback(() => {
        if (rafRef.current) {
            return;
        }
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            measure();
        });
    }, [measure]);

    useLayoutEffect(() => {
        measure();
        // framer-motion 的转发 ref 在其内部 layout effect 才赋值（晚于本组件的兄弟顺序），首次 measure 可能拿不到 dock；下一帧补测
        if (batchBarVisible && !batchBarRef.current) {
            requestAnimationFrame(measure);
        }
    }, [measure, batchBarVisible, batchBarRef]);

    useEffect(() => {
        const win = windowRef.current;
        const track = trackRef.current;
        const scrollEl = resolveScrollParent(stageRef.current);
        if (!win || !track || !scrollEl) {
            return;
        }
        const onOuterScroll = () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(syncInnerFromOuter);
        };
        const detach = attachStickyListeners(
            scrollEl,
            [track, scrollEl, headerRef.current, batchBarRef.current],
            onOuterScroll,
            remeasure,
        );
        win.addEventListener('scroll', syncOuterFromInner, {passive: true});
        return () => {
            detach();
            win.removeEventListener('scroll', syncOuterFromInner);
            cancelAnimationFrame(rafRef.current);
            rafRef.current = 0;
        };
    }, [syncInnerFromOuter, syncOuterFromInner, remeasure, headerRef, batchBarRef]);

    const api = useMemo<StickyScrollApi>(
        () => ({
            pinned: false,
            windowHeight: 0,
            activeGroupId: null,
            paginationPinnedId: null,
            paginationSlot: null,
            registerGroup: () => {},
            remeasure,
            getStickyContainer: () => windowRef.current,
        }),
        [remeasure],
    );

    return {stageRef, windowRef, trackRef, spacerRef, setPaginationSlot: () => {}, api};
}

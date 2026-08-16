import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

import {
    activeGroupIndex,
    computeProgress,
    computePinStart,
    computeScrubRange,
    computeWindowHeight,
    DEFAULT_HEADER_HEIGHT,
    paginationPinned,
} from '../PodContentArea/stickyScroll';
import {
    applyGroupTransforms,
    attachStickyListeners,
    EMPTY_METRICS,
    measureGroups,
    resetTransforms,
    resolveScrollParent,
} from './stickyScrollDom';
import type {Metrics} from './stickyScrollDom';

import type {StickyScrollApi, UseStickyScrollOptions, UseStickyScrollResult} from './context';

export function useStickyScroll(options: UseStickyScrollOptions): UseStickyScrollResult {
    const {headerRef, batchBarRef, batchBarVisible} = options;

    const stageRef = useRef<HTMLDivElement | null>(null);
    const windowRef = useRef<HTMLDivElement | null>(null);
    const trackRef = useRef<HTMLDivElement | null>(null);
    const spacerRef = useRef<HTMLDivElement | null>(null);
    const groupEls = useRef(new Map<string, HTMLElement>());

    const metricsRef = useRef<Metrics>(EMPTY_METRICS);
    const pinnedRef = useRef(false);
    const activeIdRef = useRef<string | null>(null);
    const pagerIdRef = useRef<string | null>(null);
    const windowHeightRef = useRef(0);
    const rafRef = useRef(0);

    const [pinned, setPinned] = useState(false);
    const [windowHeight, setWindowHeight] = useState(0);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [paginationPinnedId, setPaginationPinnedId] = useState<string | null>(null);
    const [paginationSlot, setPaginationSlot] = useState<HTMLElement | null>(null);

    const registerGroup = useCallback((id: string, el: HTMLElement | null) => {
        if (el) {
            groupEls.current.set(id, el);
        } else {
            groupEls.current.delete(id);
        }
    }, []);

    const applyTransforms = useCallback(() => {
        const track = trackRef.current;
        const scrollEl = resolveScrollParent(stageRef.current);
        if (!track || !scrollEl) {
            return;
        }
        const {pinStart, scrubRange, windowHeight: wh, geometries} = metricsRef.current;
        const progress = computeProgress(scrollEl.scrollTop, pinStart, scrubRange);
        track.style.transform = `translateY(${-progress}px)`;
        applyGroupTransforms(geometries, groupEls.current, progress);

        const nextPinned = progress > 0;
        if (nextPinned !== pinnedRef.current) {
            pinnedRef.current = nextPinned;
            setPinned(nextPinned);
        }
        const idx = activeGroupIndex(geometries, progress);
        const activeGeo = idx >= 0 ? geometries[idx] : undefined;
        const nextActive = activeGeo?.id ?? null;
        if (nextActive !== activeIdRef.current) {
            activeIdRef.current = nextActive;
            setActiveGroupId(nextActive);
        }
        const nextPager = activeGeo && paginationPinned(activeGeo, progress, wh) ? activeGeo.id : null;
        if (nextPager !== pagerIdRef.current) {
            pagerIdRef.current = nextPager;
            setPaginationPinnedId(nextPager);
        }
    }, []);

    const measure = useCallback(() => {
        const stage = stageRef.current;
        const track = trackRef.current;
        const win = windowRef.current;
        const spacer = spacerRef.current;
        const scrollEl = resolveScrollParent(stage);
        if (!stage || !track || !win || !spacer || !scrollEl) {
            return;
        }
        const headerHeight = headerRef.current?.offsetHeight ?? DEFAULT_HEADER_HEIGHT;
        const batchBarHeight = batchBarRef.current?.offsetHeight ?? 0;
        const wh = computeWindowHeight(scrollEl.clientHeight, headerHeight, batchBarHeight, batchBarVisible);
        win.style.top = `${headerHeight}px`;

        resetTransforms(track, groupEls.current.values());
        const contentHeight = track.scrollHeight;
        const geometries = measureGroups(track);

        const stageRect = stage.getBoundingClientRect();
        const scrollRect = scrollEl.getBoundingClientRect();
        const pinStart = computePinStart(stageRect.top, scrollRect.top, scrollEl.scrollTop, headerHeight);
        const scrubRange = computeScrubRange(contentHeight, wh);
        spacer.style.height = `${scrubRange}px`;

        metricsRef.current = {headerHeight, windowHeight: wh, pinStart, scrubRange, geometries};
        if (wh !== windowHeightRef.current) {
            windowHeightRef.current = wh;
            setWindowHeight(wh);
        }
        applyTransforms();
    }, [batchBarVisible, applyTransforms, headerRef, batchBarRef]);

    const remeasure = useCallback(() => {
        requestAnimationFrame(() => measure());
    }, [measure]);

    useLayoutEffect(() => {
        measure();
    }, [measure]);

    useEffect(() => {
        const scrollEl = resolveScrollParent(stageRef.current);
        const track = trackRef.current;
        if (!scrollEl || !track) {
            return;
        }
        const onScroll = () => {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(applyTransforms);
        };
        const detach = attachStickyListeners(
            scrollEl,
            [track, scrollEl, headerRef.current, batchBarRef.current],
            onScroll,
            measure,
        );
        return () => {
            detach();
            cancelAnimationFrame(rafRef.current);
        };
    }, [applyTransforms, measure, headerRef, batchBarRef]);

    const api = useMemo<StickyScrollApi>(
        () => ({
            pinned,
            windowHeight,
            activeGroupId,
            paginationPinnedId,
            paginationSlot,
            registerGroup,
            remeasure,
        }),
        [pinned, windowHeight, activeGroupId, paginationPinnedId, paginationSlot, registerGroup, remeasure],
    );

    return {stageRef, windowRef, trackRef, spacerRef, setPaginationSlot, api};
}


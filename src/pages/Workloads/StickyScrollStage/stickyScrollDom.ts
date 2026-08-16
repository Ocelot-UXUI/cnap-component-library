import {computeGroupSticky, DEFAULT_HEADER_HEIGHT} from '../PodContentArea/stickyScroll';
import type {GroupGeometry} from '../PodContentArea/stickyScroll';

const GROUP_HEADER_SELECTOR = '[data-group-header]';

/** 量测快照：由 useStickyScroll 维护，喂给 progress / transform 计算 */
export interface Metrics {
    headerHeight: number;
    windowHeight: number;
    pinStart: number;
    scrubRange: number;
    geometries: GroupGeometry[];
}

export const EMPTY_METRICS: Metrics = {
    headerHeight: DEFAULT_HEADER_HEIGHT,
    windowHeight: 0,
    pinStart: 0,
    scrubRange: 0,
    geometries: [],
};

/**
 * 就近可滚动祖先：`overflow-y:auto|scroll`（优先已溢出者）——即 PaneScroll。
 * 只认 auto|scroll 已排除 overflow:hidden 的 PinnedWindow / #pageContent，
 * 故不使用「首个 overflow≠visible」。挂载早期内容未撑满时回退到首个 auto|scroll 祖先。
 */
export function resolveScrollParent(el: HTMLElement | null): HTMLElement | null {
    let node = el?.parentElement ?? null;
    let firstScrollable: HTMLElement | null = null;
    while (node) {
        const {overflowY} = getComputedStyle(node);
        if (overflowY === 'auto' || overflowY === 'scroll') {
            if (!firstScrollable) {
                firstScrollable = node;
            }
            if (node.scrollHeight > node.clientHeight) {
                return node;
            }
        }
        node = node.parentElement;
    }
    return firstScrollable;
}

/** 量测各 GroupBlock 相对 Track 的几何（transform 复位后调用，用 rect 求相对偏移） */
export function measureGroups(track: HTMLElement): GroupGeometry[] {
    const trackTop = track.getBoundingClientRect().top;
    const blocks = Array.from(track.querySelectorAll<HTMLElement>('[data-group-block]'));
    return blocks.map(block => {
        const rect = block.getBoundingClientRect();
        const header = block.querySelector<HTMLElement>(GROUP_HEADER_SELECTOR);
        const thead = block.querySelector<HTMLElement>('thead');
        const headerHeight = header?.offsetHeight ?? 0;
        const theadOffset = thead ? thead.getBoundingClientRect().top - rect.top : headerHeight;
        return {
            id: block.dataset.groupId ?? '',
            top: rect.top - trackTop,
            height: block.offsetHeight,
            headerHeight,
            theadOffset,
            theadHeight: thead?.offsetHeight ?? 0,
        };
    });
}

/** 复位 track 与各组 header/thead 的 transform（量测前调用，避免 rect 被变换污染） */
export function resetTransforms(track: HTMLElement, blocks: Iterable<HTMLElement>): void {
    track.style.transform = 'translateY(0px)';
    for (const block of blocks) {
        const header = block.querySelector<HTMLElement>(GROUP_HEADER_SELECTOR);
        const thead = block.querySelector<HTMLElement>('thead');
        if (header) {
            header.style.transform = 'translateY(0px)';
        }
        if (thead) {
            thead.style.transform = 'translateY(0px)';
        }
    }
}

/** 按 progress 对各组施加吸顶变换：GroupHeader / thead 反向 translate 停留窗口顶 */
export function applyGroupTransforms(
    geometries: GroupGeometry[],
    groupEls: Map<string, HTMLElement>,
    progress: number,
): void {
    geometries.forEach(geo => {
        const block = groupEls.get(geo.id);
        if (!block) {
            return;
        }
        const sticky = computeGroupSticky(geo, progress);
        const header = block.querySelector<HTMLElement>(GROUP_HEADER_SELECTOR);
        const thead = block.querySelector<HTMLElement>('thead');
        if (header) {
            header.style.transform = `translateY(${sticky.headerTranslateY}px)`;
            header.style.zIndex = sticky.pinned ? '199' : '2';
        }
        if (thead) {
            thead.style.transform = `translateY(${sticky.theadTranslateY}px)`;
        }
    });
}

/**
 * 绑定 scroll / window resize / ResizeObserver（keep-alive 下随 effect 建立与清理），返回清理函数。
 * 只观察传入且存在的元素；scroll 走 passive。
 */
export function attachStickyListeners(
    scrollEl: HTMLElement,
    observed: Array<HTMLElement | null>,
    onScroll: () => void,
    onMeasure: () => void,
): () => void {
    scrollEl.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onMeasure);
    const observer = new ResizeObserver(onMeasure);
    observed.forEach(el => {
        if (el) {
            observer.observe(el);
        }
    });
    return () => {
        scrollEl.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onMeasure);
        observer.disconnect();
    };
}

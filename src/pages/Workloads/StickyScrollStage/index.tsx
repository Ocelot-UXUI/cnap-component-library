import {useCallback} from 'react';

import {StickyScrollContext} from './context';
import {PaginationSlot, PinnedWindow, Spacer, Stage, Track} from './StickyScrollStage.style';
import {useStickyScroll} from './useStickyScroll';

import type {ReactNode, RefObject} from 'react';

interface StickyScrollStageProps {
    /** 常驻的 WorkloadsHeader（原生 sticky）——用于实测 headerHeight */
    headerRef: RefObject<HTMLElement | null>;
    /** 屏幕底部批量操作栏——用于实测让高高度 */
    batchBarRef: RefObject<HTMLElement | null>;
    /** 批量操作栏是否可见（影响窗口高与进度） */
    batchBarVisible: boolean;
    /** PodContentArea 全部内容，渲染进 Track */
    children: ReactNode;
}

/**
 * 假滚动舞台：把 children（PodContentArea）钉成 header 下方的定高窗口，
 * 外部滚动经进度控制器换算为 Track transform；窗口底部提供分页器固定插槽。
 */
export function StickyScrollStage({headerRef, batchBarRef, batchBarVisible, children}: StickyScrollStageProps) {
    const {stageRef, windowRef, trackRef, spacerRef, setPaginationSlot, api} = useStickyScroll({
        headerRef,
        batchBarRef,
        batchBarVisible,
    });

    const slotRef = useCallback(
        (el: HTMLDivElement | null) => setPaginationSlot(el),
        [setPaginationSlot],
    );

    return (
        <StickyScrollContext.Provider value={api}>
            <Stage ref={stageRef}>
                <PinnedWindow ref={windowRef}>
                    <div style={{height: '100%', overflow: 'hidden'}}>
                        <Track ref={trackRef}>{children}</Track>
                    </div>
                    <PaginationSlot ref={slotRef} />
                </PinnedWindow>
                <Spacer ref={spacerRef} />
            </Stage>
        </StickyScrollContext.Provider>
    );
}

export {useStickyScrollContext} from './context';

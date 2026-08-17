import {StickyScrollContext} from './context';
import {PinnedWindow, Spacer, Stage, Track} from './StickyScrollStage.style';
import {useStickyScroll} from './useStickyScroll';

import type {ReactNode, RefObject} from 'react';

interface StickyScrollStageProps {
    /** 常驻的 WorkloadsHeader（原生 sticky）——用于实测 headerHeight */
    headerRef: RefObject<HTMLElement | null>;
    /** 屏幕底部批量操作栏——用于实测让高高度 */
    batchBarRef: RefObject<HTMLElement | null>;
    /** 批量操作栏是否可见（影响窗口高与进度） */
    batchBarVisible: boolean;
    /** PodContentArea 全部内容，渲染进窗口（内部真实滚动容器） */
    children: ReactNode;
}

/**
 * linked-scroll 舞台：children（PodContentArea）渲染进 sticky 于 header 下方的定高
 * 真实滚动容器（滚动条隐藏），外层滚动经同步控制器换算为内部 scrollTop；
 * GroupHeader / 表头 / 分页器在窗口内为原生 sticky。
 */
export function StickyScrollStage({headerRef, batchBarRef, batchBarVisible, children}: StickyScrollStageProps) {
    const {stageRef, windowRef, trackRef, spacerRef, api} = useStickyScroll({
        headerRef,
        batchBarRef,
        batchBarVisible,
    });

    return (
        <StickyScrollContext.Provider value={api}>
            <Stage ref={stageRef}>
                <PinnedWindow ref={windowRef}>
                    <Track ref={trackRef}>{children}</Track>
                </PinnedWindow>
                <Spacer ref={spacerRef} />
            </Stage>
        </StickyScrollContext.Provider>
    );
}

export {useStickyScrollContext} from './context';

import {useLocation, useRoutes} from 'react-router-dom';
import {useRef} from 'react';

import {FULL_BLEED_PATHS, WORKSPACE_ROUTES} from '@/routers/workspaceRoutes';

import {PaneScroll} from './WorkspacePane.style';

import type {WorkspaceKey} from '@/navigation/types';
import type {ReactElement} from 'react';

interface WorkspacePaneProps {
    workspaceKey: WorkspaceKey;
}

/**
 * 单个工作区的常驻内容面板。
 * 内部用 useRoutes 匹配当前 pathname；不匹配（工作区非激活）时渲染最近一次的缓存元素，
 * 使 React 对该子树做原位调和而非卸载，从而保留组件状态与滚动位置。
 */
export function WorkspacePane({workspaceKey}: WorkspacePaneProps): ReactElement {
    const location = useLocation();
    const matched = useRoutes(WORKSPACE_ROUTES[workspaceKey]);
    const lastMatchedRef = useRef<ReactElement | null>(null);

    if (matched) {
        lastMatchedRef.current = matched;
    }

    const isFullBleed = FULL_BLEED_PATHS.has(location.pathname);

    return (
        <PaneScroll $isFullBleed={isFullBleed}>
            {matched ?? lastMatchedRef.current}
        </PaneScroll>
    );
}

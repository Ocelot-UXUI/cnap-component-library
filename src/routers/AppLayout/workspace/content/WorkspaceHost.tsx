import {Activity} from 'react';
import {Navigate, useLocation} from 'react-router-dom';
import {useRef} from 'react';

import {applications} from '@/routes';
import {workspaces} from '@/navigation/registry';
import {resolveActiveWorkspace} from '@/navigation';

import {WorkspacePane} from './WorkspacePane';
import {PaneFrame} from './WorkspaceHost.style';

import type {WorkspaceKey} from '@/navigation/types';
import type {ReactElement} from 'react';

const paneTransition = {duration: 0.15, ease: [0.4, 0, 0.2, 1]} as const;

/**
 * 内容区宿主：为每个「已访问」工作区渲染一个常驻 Pane，并用 <Activity> 控制显隐。
 * 隐藏工作区保留 fiber 与状态、暂停 effects；未访问工作区不渲染（懒挂载）。
 */
export function WorkspaceHost(): ReactElement {
    const location = useLocation();
    const activeWorkspace = resolveActiveWorkspace(location.pathname);
    const visitedRef = useRef<Set<WorkspaceKey>>(new Set());

    if (!visitedRef.current.has(activeWorkspace)) {
        visitedRef.current.add(activeWorkspace);
    }

    if (location.pathname === '/') {
        return <Navigate to={applications.toPath()} replace />;
    }

    return (
        <>
            {workspaces
                .filter(workspace => visitedRef.current.has(workspace.key))
                .map(workspace => {
                    const isActive = workspace.key === activeWorkspace;
                    return (
                        <Activity key={workspace.key} mode={isActive ? 'visible' : 'hidden'}>
                            <PaneFrame
                                $active={isActive}
                                initial={false}
                                animate={{opacity: isActive ? 1 : 0}}
                                transition={paneTransition}
                            >
                                <WorkspacePane workspaceKey={workspace.key} />
                            </PaneFrame>
                        </Activity>
                    );
                })}
        </>
    );
}

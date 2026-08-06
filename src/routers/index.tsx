import {createBrowserRouter, Navigate} from 'react-router-dom';

import {APP_BASENAME, APP_IS_ONLINE_PRODUCTION} from '@/constants/app';

import {AppLayout} from './AppLayout';
import * as P from './lazyPages';
import {withSuspense} from './withSuspense';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        // 内容区由 AppLayout 内的 WorkspaceHost 全权渲染（每工作区常驻 Pane + Activity），
        // 此处仅需一条兜底分支让 AppLayout 对所有应用内路径保持匹配与挂载。
        children: [
            { path: '*', element: null },
        ],
    },
    {
        path: '/playground',
        element: APP_IS_ONLINE_PRODUCTION
            ? <Navigate to="/home" replace />
            : withSuspense(P.ComponentPlaygroundPage),
    },
    {
        path: '*',
        element: <Navigate to="/home" replace />,
    },
], { basename: APP_BASENAME });

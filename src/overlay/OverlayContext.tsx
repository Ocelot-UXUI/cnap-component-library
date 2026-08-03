import constate from 'constate';
import {useCallback, useEffect, useReducer} from 'react';
import {useLocation} from 'react-router-dom';

import {initialOverlayState, overlayReducer} from './overlayState';
import type {
    ActiveDrawer,
    ActiveModal,
    DrawerInvocationProps,
    DrawerKey,
    ModalInvocationProps,
    ModalKey,
} from './types';

function useOverlayValue() {
    const [state, dispatch] = useReducer(overlayReducer, initialOverlayState);
    const { pathname } = useLocation();

    const openModal = useCallback(<K extends ModalKey>(key: K, props: ModalInvocationProps<K>) => {
        dispatch({ type: 'openModal', entry: { key, props } });
    }, []);
    const closeModal = useCallback(() => dispatch({ type: 'closeModal' }), []);
    const openDrawer = useCallback(<K extends DrawerKey>(key: K, props: DrawerInvocationProps<K>) => {
        dispatch({ type: 'openDrawer', entry: { key, props } });
    }, []);
    const closeDrawer = useCallback(() => dispatch({ type: 'closeDrawer' }), []);

    // 全局单实例：路由切换时清理活动 overlay，避免跨页残留
    useEffect(() => {
        dispatch({ type: 'closeAll' });
    }, [pathname]);

    return {
        activeModal: state.modal as ActiveModal | null,
        activeDrawer: state.drawer as ActiveDrawer | null,
        openModal,
        closeModal,
        openDrawer,
        closeDrawer,
    };
}

/** 全局 overlay 命令式 API：openModal/closeModal/openDrawer/closeDrawer + 活动状态 */
export const [OverlayProvider, useOverlay] = constate(useOverlayValue);

/** overlay 状态与转换（纯逻辑，无 React / 无组件依赖，可独立单测）。 */

/** overlay 活动条目：key 标识注册项，props 为透传给组件的调用参数 */
export interface OverlayEntry {
    key: string;
    props: unknown;
}

/** 弹窗单槽 + 抽屉单槽两条独立轴 */
export interface OverlayState {
    modal: OverlayEntry | null;
    drawer: OverlayEntry | null;
}

export type OverlayAction =
    | { type: 'openModal'; entry: OverlayEntry; }
    | { type: 'closeModal'; }
    | { type: 'openDrawer'; entry: OverlayEntry; }
    | { type: 'closeDrawer'; }
    | { type: 'closeAll'; };

export const initialOverlayState: OverlayState = { modal: null, drawer: null };

/**
 * open* 覆盖式替换 → 实现同轴互斥（弹窗之间、抽屉之间）；
 * 弹窗轴与抽屉轴相互独立 → 二者可并存。
 * close* 在无活动项时返回原引用，避免无谓重渲染。
 */
export function overlayReducer(state: OverlayState, action: OverlayAction): OverlayState {
    switch (action.type) {
        case 'openModal':
            return { ...state, modal: action.entry };
        case 'closeModal':
            return state.modal === null ? state : { ...state, modal: null };
        case 'openDrawer':
            return { ...state, drawer: action.entry };
        case 'closeDrawer':
            return state.drawer === null ? state : { ...state, drawer: null };
        case 'closeAll':
            return state.modal === null && state.drawer === null ? state : initialOverlayState;
        default:
            return state;
    }
}

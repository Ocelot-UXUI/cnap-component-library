import {useOverlay} from './OverlayContext';
import {DRAWER_COMPONENTS, MODAL_COMPONENTS} from './registry';
import type {OverlayComponent} from './registry';

/**
 * 渲染单条活动 overlay：按 key 从注册表取组件，注入受控 open/onClose，透传调用 props。
 * props 在宿主边界为 unknown，此处擦除为 Record 供 JSX 展开；对外 API 仍类型安全。
 */
function renderOverlay<K extends string>(
    entry: { key: K; props: unknown; } | null,
    components: Record<K, OverlayComponent>,
    onClose: () => void,
) {
    if (entry === null) {
        return null;
    }
    const Component = components[entry.key] as OverlayComponent | undefined;
    if (Component === undefined) {
        return null;
    }
    return <Component {...(entry.props as Record<string, unknown>)} open onClose={onClose} />;
}

/**
 * 全局 overlay 宿主：挂载于 AppLayout，渲染当前活动的弹窗与抽屉。
 * 弹窗轴与抽屉轴各自单槽、相互独立，可同时各渲染一个。
 */
export function OverlayHost() {
    const { activeModal, activeDrawer, closeModal, closeDrawer } = useOverlay();
    return (
        <>
            {renderOverlay(activeModal, MODAL_COMPONENTS, closeModal)}
            {renderOverlay(activeDrawer, DRAWER_COMPONENTS, closeDrawer)}
        </>
    );
}

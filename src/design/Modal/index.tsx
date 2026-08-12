import {Modal as AntdModal} from 'antd';

import {MODAL_SIZE_BODY_CLASS, MODAL_SIZE_WIDTH} from './Modal.style';

import type {ModalProps as AntdModalProps} from 'antd';

export type ModalSize = 's' | 'm' | 'l';

export interface ModalProps extends AntdModalProps {
    /** 尺寸档位，默认 m；显式传 width 时以 width 为准 */
    size?: ModalSize;
}

/**
 * 标准弹窗：在 antd Modal 基础上提供视觉规范的 S / M / L 尺寸档，
 * 每档同时约束宽度与内容区的最小 / 最大高度，内容超出时内容区滚动。
 */
const InternalModal = ({size = 'm', width, className, ...rest}: ModalProps) => (
    <AntdModal
        {...rest}
        width={width ?? MODAL_SIZE_WIDTH[size]}
        className={className ? `${MODAL_SIZE_BODY_CLASS[size]} ${className}` : MODAL_SIZE_BODY_CLASS[size]}
    />
);

// 保留 antd Modal 的静态方法（confirm / info / useModal 等），使增强组件成为可替换的 drop-in
export const Modal = Object.assign(InternalModal, {
    confirm: AntdModal.confirm,
    info: AntdModal.info,
    success: AntdModal.success,
    error: AntdModal.error,
    warning: AntdModal.warning,
    useModal: AntdModal.useModal,
    destroyAll: AntdModal.destroyAll,
    config: AntdModal.config,
});

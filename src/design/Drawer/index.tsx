import {CloseOutlined} from '@ant-design/icons';
import {Button, Drawer as AntdDrawer} from 'antd';

import {HeaderExtra} from './Drawer.style';

import type {DrawerProps as AntdDrawerProps} from 'antd';
import type {ReactNode} from 'react';

export interface DrawerProps extends Omit<AntdDrawerProps, 'closable' | 'closeIcon'> {
    /** 关闭按钮左侧的额外操作区插槽 */
    extra?: ReactNode;
    /** 是否显示右上角关闭按钮，默认 true */
    showClose?: boolean;
}

/**
 * 标准抽屉：标题居左，关闭按钮居右，关闭按钮左侧为额外操作插槽（extra）。
 * 关闭 antd 原生左上角关闭按钮，改由 header 右侧的 extra 区统一承载。
 */
export const Drawer = ({ extra, showClose = true, onClose, children, ...rest }: DrawerProps) => (
    <AntdDrawer
        {...rest}
        onClose={onClose}
        closable={false}
        extra={
            extra || showClose ? (
                <HeaderExtra>
                    {extra}
                    {showClose && (
                        <Button
                            type="text"
                            aria-label="关闭"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                        />
                    )}
                </HeaderExtra>
            ) : undefined
        }
    >
        {children}
    </AntdDrawer>
);

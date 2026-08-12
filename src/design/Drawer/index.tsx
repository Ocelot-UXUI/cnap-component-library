import {CloseOutlined} from '@ant-design/icons';
import {Button, Drawer as AntdDrawer} from 'antd';

import {DRAWER_SIZE_WIDTH, HeaderExtra} from './Drawer.style';

import type {DrawerProps as AntdDrawerProps} from 'antd';
import type {ReactNode} from 'react';
import {semantic} from '@/constants/colors';

export type DrawerSize = 's' | 'm' | 'l';

export interface DrawerProps extends Omit<AntdDrawerProps, 'closable' | 'closeIcon' | 'size'> {
    /** 关闭按钮左侧的额外操作区插槽 */
    extra?: ReactNode;
    /** 是否显示右上角关闭按钮，默认 true */
    showClose?: boolean;
    /** 尺寸档位，s/m/l 对应 600/800/980，默认 m；显式传 width 时以 width 为准 */
    size?: DrawerSize;
}

/**
 * 标准抽屉：标题居左，关闭按钮居右，关闭按钮左侧为额外操作插槽（extra）。
 * 关闭 antd 原生左上角关闭按钮，改由 header 右侧的 extra 区统一承载。
 * 操作按钮应放入 footer，header 右侧仅承载 icon 类操作。
 */
export const Drawer = ({
    extra,
    showClose = true,
    size = 'm',
    width,
    onClose,
    children,
    ...rest
}: DrawerProps) => (
    <AntdDrawer
        {...rest}
        width={width ?? DRAWER_SIZE_WIDTH[size]}
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
                            style={{color: semantic.text.secondary}}
                        />
                    )}
                </HeaderExtra>
            ) : undefined
        }
    >
        {children}
    </AntdDrawer>
);

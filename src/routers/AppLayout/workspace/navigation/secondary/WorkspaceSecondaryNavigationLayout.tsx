import {CustomerServiceOutlined} from '@ant-design/icons';
import {cx} from '@emotion/css';
import {Tooltip} from '@/design';

import {
    secondaryControlClass,
    secondaryItemActiveClass,
    secondaryItemClass,
    SecondaryList,
    secondaryRailControlClass,
    secondaryRailItemClass,
    SecondarySidebar,
    SecondaryTitle,
} from './WorkspaceSecondaryNavigationLayout.styles';

import type {WorkspaceNavigationItem} from '../WorkspaceNavigationLayout.types';

interface WorkspaceSecondaryNavigationLayoutProps {
    activeKey: string;
    collapsed: boolean;
    items: WorkspaceNavigationItem[];
    title?: string;
    onCollapseChange: (collapsed: boolean) => void;
    onSelect: (key: string) => void;
}

export function WorkspaceSecondaryNavigationLayout({
    activeKey,
    collapsed,
    items,
    title,
    onCollapseChange,
    onSelect,
}: WorkspaceSecondaryNavigationLayoutProps) {
    if (!items.length) {
        return null;
    }

    return (
        <SecondarySidebar $collapsed={collapsed} aria-label="二级导航">
            <div>
                {!collapsed && <SecondaryTitle>{title}</SecondaryTitle>}
                <SecondaryList>
                    {items.map(item =>
                        collapsed
                            ? (
                                <Tooltip key={item.key} title={item.label} placement="right">
                                    <button
                                        type="button"
                                        className={cx(
                                            secondaryRailItemClass,
                                            item.key === activeKey && secondaryItemActiveClass,
                                        )}
                                        onClick={() => onSelect(item.key)}
                                    >
                                        {item.icon}
                                    </button>
                                </Tooltip>
                            )
                            : (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={cx(
                                        secondaryItemClass,
                                        item.key === activeKey && secondaryItemActiveClass,
                                    )}
                                    onClick={() => onSelect(item.key)}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            )
                    )}
                </SecondaryList>
            </div>
            <button
                type="button"
                className={collapsed ? secondaryRailControlClass : secondaryControlClass}
                onClick={() => onCollapseChange(!collapsed)}
                aria-label={collapsed ? '展开二级导航' : '收起二级导航'}
            >
                <CustomerServiceOutlined rotate={collapsed ? 180 : 0} />
            </button>
        </SecondarySidebar>
    );
}

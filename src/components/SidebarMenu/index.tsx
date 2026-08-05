import {css} from '@emotion/css';
import {theme} from '@/design';
import {AnimatePresence, motion} from 'framer-motion';
import type {ReactNode} from 'react';

export interface SidebarMenuItem {
    key: string;
    icon?: ReactNode;
    label: ReactNode;
}

export interface SidebarMenuGroup {
    title?: string;
    divider?: boolean;
    items: SidebarMenuItem[];
}

interface SidebarMenuProps {
    groups: SidebarMenuGroup[];
    selectedKey: string;
    collapsed: boolean;
    onSelect: (key: string) => void;
    'data-ai-entity'?: string;
    'data-ai-desc'?: string;
}

const containerClass = css`padding: 8px 0;`;

const itemWrapClass = css`
    position: relative;
    margin: 2px 8px;
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    &:not([data-active='true']):hover { background: rgba(0,0,0,0.04); }
`;

const itemContentClass = css`
    position: relative; z-index: 1;
    display: flex; align-items: center;
    height: 40px; padding: 0 12px;
    gap: 10px; font-size: 14px;
    overflow: hidden; white-space: nowrap;
`;

const iconClass = css`
    flex-shrink: 0; font-size: 16px; width: 16px;
    display: flex; align-items: center; justify-content: center;
`;

export const SidebarMenu = ({
    groups,
    selectedKey,
    collapsed,
    onSelect,
    'data-ai-entity': entity,
    'data-ai-desc': desc,
}: SidebarMenuProps) => {
    const { token } = theme.useToken();

    const sectionTitleClass = css`
        padding: 0 20px;
        margin: 4px 0 2px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: ${token.colorTextTertiary};
        overflow: hidden;
        white-space: nowrap;
    `;

    const dividerClass = css`
        margin: 6px 16px;
        border-top: 1px solid ${token.colorBorderSecondary};
    `;

    const dividerCollapsedClass = css`
        margin: 6px 4px;
        border-top: 1px solid ${token.colorBorderSecondary};
    `;

    return (
        <div className={containerClass} data-ai-entity={entity} data-ai-desc={desc}>
            {groups.map((group, gi) => (
                <div key={gi}>
                    {group.divider && <div className={collapsed ? dividerCollapsedClass : dividerClass} />}
                    {group.title && !collapsed && <div className={sectionTitleClass}>{group.title}</div>}
                    {group.items.map(item => {
                        const isActive = selectedKey === item.key;
                        return (
                            <motion.div
                                key={item.key}
                                className={itemWrapClass}
                                data-active={isActive}
                                onClick={() => onSelect(item.key)}
                                animate={{ color: isActive ? token.colorPrimary : token.colorText }}
                                transition={{ duration: 0.1 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-highlight"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: token.borderRadius,
                                            background: token.colorPrimaryBg,
                                        }}
                                        transition={{ type: 'spring', stiffness: 600, damping: 42 }}
                                    />
                                )}
                                <div
                                    className={itemContentClass}
                                    style={collapsed ? { padding: 0, justifyContent: 'center' } : undefined}
                                >
                                    <span className={iconClass}>{item.icon}</span>
                                    <AnimatePresence mode="wait">
                                        {!collapsed && (
                                            <motion.span
                                                key="label"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.1 }}
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

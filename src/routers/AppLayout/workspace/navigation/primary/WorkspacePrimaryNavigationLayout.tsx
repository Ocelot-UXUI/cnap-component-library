import {useState} from 'react';

import {
    BellOutlined,
    MoreOutlined,
    QuestionCircleOutlined,
    RetweetOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import {cx} from '@emotion/css';
import {Popover, Tooltip} from '@/design';

import {
    popoverClass,
    popoverItemsClass,
    popoverTitleClass,
    primaryActiveClass,
    PrimaryBusiness,
    primaryIconClass,
    primaryItemClass,
    primaryLabelClass,
    PrimarySidebar,
    PrimaryUtility,
} from './WorkspacePrimaryNavigationLayout.styles';

import type {RefObject} from 'react';
import type {WorkspaceNavigationItem} from '../WorkspaceNavigationLayout.types';

interface WorkspacePrimaryNavigationLayoutProps {
    activeKey: string;
    businessRef: RefObject<HTMLDivElement | null>;
    hiddenItems: WorkspaceNavigationItem[];
    primaryRef: RefObject<HTMLDivElement | null>;
    utilityRef: RefObject<HTMLDivElement | null>;
    visibleItems: WorkspaceNavigationItem[];
    onSelect: (key: string) => void;
}

export function WorkspacePrimaryNavigationLayout({
    activeKey,
    businessRef,
    hiddenItems,
    primaryRef,
    utilityRef,
    visibleItems,
    onSelect,
}: WorkspacePrimaryNavigationLayoutProps) {
    const [moreOpen, setMoreOpen] = useState(false);

    const handleSelect = (key: string) => {
        setMoreOpen(false);
        onSelect(key);
    };

    const renderPrimaryItem = (item: WorkspaceNavigationItem) => (
        <button
            key={item.key}
            type="button"
            className={cx(primaryItemClass, item.key === activeKey && primaryActiveClass)}
            onClick={() => handleSelect(item.key)}
        >
            <span className={primaryIconClass}>{item.icon}</span>
            <span className={primaryLabelClass}>{item.label}</span>
        </button>
    );

    const moreContent = (
        <div>
            <div className={popoverTitleClass}>更多功能</div>
            <div className={popoverItemsClass}>{hiddenItems.map(renderPrimaryItem)}</div>
        </div>
    );

    return (
        <PrimarySidebar ref={primaryRef} aria-label="一级导航">
            <PrimaryBusiness ref={businessRef}>
                {visibleItems.map(renderPrimaryItem)}
                {hiddenItems.length > 0 && (
                    <Popover
                        classNames={{ root: popoverClass }}
                        content={moreContent}
                        open={moreOpen}
                        onOpenChange={setMoreOpen}
                        placement="rightBottom"
                        trigger="hover"
                    >
                        <button type="button" className={primaryItemClass}>
                            <span className={primaryIconClass}>
                                <MoreOutlined />
                            </span>
                            <span className={primaryLabelClass}>更多</span>
                        </button>
                    </Popover>
                )}
            </PrimaryBusiness>
            <PrimaryUtility ref={utilityRef}>
                <Tooltip title="通知" placement="right">
                    <BellOutlined />
                </Tooltip>
                <Tooltip title="设置" placement="right">
                    <SettingOutlined />
                </Tooltip>
                <Tooltip title="切换" placement="right">
                    <RetweetOutlined />
                </Tooltip>
                <Tooltip title="帮助" placement="right">
                    <QuestionCircleOutlined />
                </Tooltip>
            </PrimaryUtility>
        </PrimarySidebar>
    );
}

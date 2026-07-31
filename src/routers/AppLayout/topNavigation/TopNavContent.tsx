import {
    AppstoreOutlined,
    BellOutlined,
    MoreOutlined,
    SearchOutlined,
} from '@ant-design/icons';

import icloudLogo from '@/assets/icloud-logo.svg';
import {ThemeSwitcher} from '@/components/ThemeSwitcher';
import {UserAvatar} from '@/components/UserAvatar';
import {APP_IS_DEV} from '@/constants/app';

import {BreadcrumbContextSelectors} from './breadcrumb/BreadcrumbContextSelectors';
import {
    iconButtonClass,
    logoClass,
    productSwitcherClass,
    searchBoxClass,
    shortcutClass,
    topNavContentClass,
    topNavLeftClass,
    topNavRightClass,
} from './TopNavContent.styles';

import type {ContextRequirements} from '@/navigation';

export interface TopNavContentProps {
    contextRequirements: ContextRequirements;
    showDevChrome?: boolean;
    username?: string;
}

export function TopNavContent({
    contextRequirements,
    showDevChrome = APP_IS_DEV,
    username,
}: TopNavContentProps) {
    return (
        <div className={topNavContentClass}>
            <div className={topNavLeftClass}>
                {showDevChrome && (
                    <span className={productSwitcherClass}>
                        <AppstoreOutlined />
                    </span>
                )}
                {showDevChrome && <img src={icloudLogo} alt="百度智能云" className={logoClass} />}
                <BreadcrumbContextSelectors requirements={contextRequirements} />
            </div>
            <div className={topNavRightClass}>
                {showDevChrome && (
                    <div className={searchBoxClass}>
                        <SearchOutlined />
                        <span>搜索或提问...</span>
                        <span className={shortcutClass}>⌘+K</span>
                    </div>
                )}
                {showDevChrome && (
                    <span className={iconButtonClass}>
                        <BellOutlined />
                    </span>
                )}
                {showDevChrome && username && <UserAvatar username={username} />}
                <ThemeSwitcher />
                {showDevChrome && (
                    <span className={iconButtonClass}>
                        <MoreOutlined />
                    </span>
                )}
            </div>
        </div>
    );
}

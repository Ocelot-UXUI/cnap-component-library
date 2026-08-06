import styled from '@emotion/styled';
import {ConfigProvider, Layout, theme} from 'antd';
import {useCallback, useState} from 'react';

import {semantic} from '@/constants/colors';
import {useTheme} from '@/contexts/ThemeContext';
import {OverlayHost, OverlayProvider} from '@/overlay';

import {antPrefixCls} from '@/constants/design';
import {FallbackTopNavLayout} from './topNavigation/FallbackTopNavLayout';
import {ICloudTopNavPortalLayout} from './topNavigation/ICloudTopNavPortalLayout';
import {TopNavContent} from './topNavigation/TopNavContent';
import {WorkspaceContentLayout} from './workspace/layout/WorkspaceContentLayout';
import {WorkspaceLayout} from './workspace/layout/WorkspaceLayout';
import {useAppLayoutNavigation} from './workspace/navigation/useAppLayoutNavigation';
import {WorkspaceNavigationLayout} from './workspace/navigation/WorkspaceNavigationLayout';

const AppLayoutRoot = styled(Layout)`
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    background: ${semantic.bg.page};
`;

/**
 * AppLayoutBody 必须在 <ConfigProvider theme={themeConfig}> 内部渲染，
 * `theme.useToken()` 才能读到当前主题的 token，否则会 fallback 到 antd 默认。
 */
function AppLayoutBody({ isLiquidGlass }: { isLiquidGlass: boolean; }) {
    const [secondaryCollapsed, setSecondaryCollapsed] = useState(false);
    const [hasICloudHeader, setHasICloudHeader] = useState(
        () => Boolean(window.__custom__?.headerElement),
    );
    const { token } = theme.useToken();
    const navigation = useAppLayoutNavigation();
    const workspaceBackground = token.colorBgLayout;

    const handlePortalActive = useCallback(
        (active: boolean) => {
            setHasICloudHeader(active);
        },
        [],
    );

    return (
        <AppLayoutRoot>
            <ICloudTopNavPortalLayout onPortalActive={handlePortalActive}>
                <TopNavContent
                    contextRequirements={navigation.contextRequirements}
                />
            </ICloudTopNavPortalLayout>

            {!hasICloudHeader && (
                <FallbackTopNavLayout>
                    <TopNavContent
                        contextRequirements={navigation.contextRequirements}
                    />
                </FallbackTopNavLayout>
            )}

            <WorkspaceLayout>
                <WorkspaceNavigationLayout
                    activePrimaryKey={navigation.activePrimaryKey}
                    activeSecondaryKey={navigation.selectedKey}
                    primaryItems={navigation.primaryItems}
                    secondaryItems={navigation.secondaryItems}
                    secondaryTitle={navigation.secondaryTitle}
                    secondaryCollapsed={secondaryCollapsed}
                    onPrimarySelect={navigation.onSelect}
                    onSecondarySelect={navigation.onSelect}
                    onSecondaryCollapseChange={setSecondaryCollapsed}
                />
                <WorkspaceContentLayout
                    background={workspaceBackground}
                    borderColor={token.colorBorderSecondary}
                    isLiquidGlass={isLiquidGlass}
                />
            </WorkspaceLayout>
        </AppLayoutRoot>
    );
}

export function AppLayout() {
    const { themeConfig, currentTheme } = useTheme();
    const isLiquidGlass = currentTheme === 'liquidGlass';

    return (
        <ConfigProvider theme={themeConfig} prefixCls={antPrefixCls}>
            <OverlayProvider>
                <AppLayoutBody isLiquidGlass={isLiquidGlass} />
                <OverlayHost />
            </OverlayProvider>
        </ConfigProvider>
    );
}

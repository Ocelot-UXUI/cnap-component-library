import {PageLayoutHeader} from '@/components/Layouts/PageLayout';
import {useSearchParams} from 'react-router-dom';

import {ConfigProvider} from '@/design';
import {
    LeftPanel,
    ListItem,
    PlaygroundBody,
    RightPanel,
} from './ComponentPlayground.style';
import {sections} from './sections';

import {useTheme} from '@/contexts/ThemeContext';
import {OverlayHost, OverlayProvider} from '@/overlay';

import {antPrefixCls} from '@/constants/design';

/** URL 参数名：当前浏览的组件 section key */
const SECTION_PARAM = 'section';

const hasSection = (key: string | null): key is string =>
    key !== null && sections.some((s) => s.key === key);

function ComponentPlayground() {
    const [searchParams, setSearchParams] = useSearchParams();
    const paramKey = searchParams.get(SECTION_PARAM);
    // activeKey 完全由 URL 派生：分享 / 重开 URL 可直达该组件，浏览器后退 / 前进也能同步
    const activeKey = hasSection(paramKey) ? paramKey : sections[0].key;
    const active = sections.find((s) => s.key === activeKey) ?? sections[0];
    const ActiveComponent = active.Component;

    const handleSelect = (key: string) => {
        // replace 更新 query，避免每次切换都压入一条历史记录
        setSearchParams(
            prev => {
                const next = new URLSearchParams(prev);
                next.set(SECTION_PARAM, key);
                return next;
            },
            {replace: true},
        );
    };

    return (
        <>
            <PageLayoutHeader title="组件视觉规范 Playground" />
            <PlaygroundBody>
                <LeftPanel>
                    {sections.map((s) => (
                        <ListItem
                            key={s.key}
                            $selected={s.key === activeKey}
                            onClick={() => handleSelect(s.key)}
                        >
                            {s.label}
                        </ListItem>
                    ))}
                </LeftPanel>
                <RightPanel>
                    <ActiveComponent />
                </RightPanel>
            </PlaygroundBody>
        </>
    );
}

function RootConfig() {
    const { themeConfig } = useTheme();

    return (
        <ConfigProvider theme={themeConfig} prefixCls={antPrefixCls}>
            <OverlayProvider>
                <ComponentPlayground />
                <OverlayHost />
            </OverlayProvider>
        </ConfigProvider>
    );
}

export default RootConfig;

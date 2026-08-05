import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {useState} from 'react';

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

function ComponentPlayground() {
    const [activeKey, setActiveKey] = useState(sections[0].key);
    const active = sections.find((s) => s.key === activeKey) ?? sections[0];
    const ActiveComponent = active.Component;

    return (
        <>
            <PageLayoutHeader title="组件视觉规范 Playground" />
            <PlaygroundBody>
                <LeftPanel>
                    {sections.map((s) => (
                        <ListItem
                            key={s.key}
                            $selected={s.key === activeKey}
                            onClick={() => setActiveKey(s.key)}
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

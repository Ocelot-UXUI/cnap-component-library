import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {useState} from 'react';

import {
    LeftPanel,
    ListItem,
    PlaygroundBody,
    RightPanel,
} from './ComponentPlayground.style';
import {sections} from './sections';

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

export default ComponentPlayground;

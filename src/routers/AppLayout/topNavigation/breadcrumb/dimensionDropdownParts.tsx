import {SearchOutlined} from '@ant-design/icons';
import {Empty} from 'antd';

import {
    DropdownPanel,
    FooterButton,
    FooterDivider,
    FooterRow,
    OptionsList,
    searchInputClass,
    SearchRow,
    TabButton,
    TabsRow,
} from './dimensionPanel.styles';

import type {ReactNode} from 'react';

interface DimensionSearchBoxProps {
    keyword: string;
    placeholder: string;
    onChange: (value: string) => void;
}

export function DimensionSearchBox({ keyword, placeholder, onChange }: DimensionSearchBoxProps) {
    return (
        <SearchRow>
            <SearchOutlined />
            <input
                className={searchInputClass}
                value={keyword}
                placeholder={placeholder}
                onChange={event => onChange(event.target.value)}
            />
        </SearchRow>
    );
}

interface DimensionTabsProps {
    tabs: ReadonlyArray<{ key: string; label: string; }>;
    activeKey: string;
    onChange: (key: string) => void;
}

export function DimensionTabs({ tabs, activeKey, onChange }: DimensionTabsProps) {
    return (
        <TabsRow>
            {tabs.map(tab => (
                <TabButton
                    key={tab.key}
                    type="button"
                    active={tab.key === activeKey}
                    onClick={() => onChange(tab.key)}
                >
                    {tab.label}
                </TabButton>
            ))}
        </TabsRow>
    );
}

interface DimensionOptionListProps {
    isEmpty: boolean;
    children: ReactNode;
}

export function DimensionOptionList({ isEmpty, children }: DimensionOptionListProps) {
    return (
        <OptionsList>
            {isEmpty ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : children}
        </OptionsList>
    );
}

interface DimensionFooterProps {
    actions: string[];
    icon: ReactNode;
    onAction?: (action: string) => void;
}

export function DimensionFooter({ actions, icon, onAction }: DimensionFooterProps) {
    return (
        <>
            <FooterDivider />
            <FooterRow>
                {actions.map(action => (
                    <FooterButton
                        key={action}
                        type="button"
                        aria-label={`${action}占位`}
                        onClick={() => onAction?.(action)}
                    >
                        {icon}
                        {action}
                    </FooterButton>
                ))}
            </FooterRow>
        </>
    );
}

export {DropdownPanel};

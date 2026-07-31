import {PlusOutlined} from '@ant-design/icons';
import {useState} from 'react';

import {
    DimensionFooter,
    DimensionOptionList,
    DimensionSearchBox,
    DimensionTabs,
    DropdownPanel,
} from './dimensionDropdownParts';
import {EnvOptionRow} from './dimensionOptionRows';
import {useDimensionSearch} from './useDimensionSearch';

import type {BreadcrumbSelectorOption} from './types';

const tabs = [
    { key: 'all', label: '全部环境' },
    { key: 'recent', label: '最近访问' },
    { key: 'production', label: '生产环境' },
    { key: 'test', label: '测试环境' },
] as const;

const footerActions = ['新建环境'];

interface EnvironmentDropdownProps {
    optionGroups: Record<string, BreadcrumbSelectorOption[]>;
    value?: string;
    onSelect: (id: string) => void;
}

export function EnvironmentDropdown({ optionGroups, value, onSelect }: EnvironmentDropdownProps) {
    const [activeTab, setActiveTab] = useState('all');
    const options = optionGroups[activeTab] ?? [];
    const { filteredOptions, keyword, setKeyword } = useDimensionSearch(options);

    return (
        <DropdownPanel onMouseDown={event => event.preventDefault()}>
            <DimensionSearchBox keyword={keyword} placeholder="请输入环境名称" onChange={setKeyword} />
            <DimensionTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
            <DimensionOptionList isEmpty={filteredOptions.length === 0}>
                {filteredOptions.map(option => (
                    <EnvOptionRow
                        key={option.id}
                        option={option}
                        selected={option.id === value}
                        onSelect={onSelect}
                    />
                ))}
            </DimensionOptionList>
            <DimensionFooter
                actions={footerActions}
                icon={<PlusOutlined />}
                onAction={action => console.log(`[EnvironmentDropdown] ${action}`)}
            />
        </DropdownPanel>
    );
}

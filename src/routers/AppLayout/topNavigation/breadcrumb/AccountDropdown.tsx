import {PlusOutlined} from '@ant-design/icons';
import {useState} from 'react';

import {
    DimensionFooter,
    DimensionOptionList,
    DimensionSearchBox,
    DimensionTabs,
    DropdownPanel,
} from './dimensionDropdownParts';
import {AvatarOptionRow} from './dimensionOptionRows';
import {useDimensionSearch} from './useDimensionSearch';

import type {BreadcrumbSelectorOption} from './types';

const tabs = [
    { key: 'all', label: '全部可用账户' },
    { key: 'favorites', label: '我收藏的账户' },
    { key: 'recent', label: '最近访问' },
] as const;

const footerActions = ['新建账户', '申请账户权限'];

interface AccountDropdownProps {
    optionGroups: Record<string, BreadcrumbSelectorOption[]>;
    value?: string;
    onSelect: (id: string) => void;
}

export function AccountDropdown({ optionGroups, value, onSelect }: AccountDropdownProps) {
    const [activeTab, setActiveTab] = useState('all');
    const options = optionGroups[activeTab] ?? [];
    const { filteredOptions, keyword, setKeyword } = useDimensionSearch(options, true);

    return (
        <DropdownPanel onMouseDown={event => event.preventDefault()}>
            <DimensionSearchBox keyword={keyword} placeholder="请输入账户名称" onChange={setKeyword} />
            <DimensionTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
            <DimensionOptionList isEmpty={filteredOptions.length === 0}>
                {filteredOptions.map(option => (
                    <AvatarOptionRow
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
                onAction={action => console.log(`[AccountDropdown] ${action}`)}
            />
        </DropdownPanel>
    );
}

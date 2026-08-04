import {Input, Select} from 'antd';

import {Search} from '@/assets/icons';
import {FilterForm, FilterRow, SearchPrefix} from './PodContentArea.style';
import type {QuickFilterCounts, QuickFilterKey} from './quickFilter';
import {QuickFilters} from './QuickFilters';
import type {PodFilterState} from './types';

interface StatusOption {
    value: string;
    label: string;
}

interface PodFilterBarProps {
    filter: PodFilterState;
    statusOptions: StatusOption[];
    quickCounts: QuickFilterCounts;
    onStatusChange: (status: string[]) => void;
    onBlockedChange: (blocked: boolean | undefined) => void;
    onKeywordChange: (keyword: string) => void;
    onQuickSelect: (key: QuickFilterKey) => void;
}

const BLOCKED_OPTIONS = [
    { value: 'true', label: '已屏蔽' },
    { value: 'false', label: '未屏蔽' },
];

export const PodFilterBar = ({
    filter,
    statusOptions,
    quickCounts,
    onStatusChange,
    onBlockedChange,
    onKeywordChange,
    onQuickSelect,
}: PodFilterBarProps) => {
    return (
        <FilterRow>
            <FilterForm>
                <Select
                    mode="multiple"
                    allowClear
                    placeholder="Pod 状态"
                    style={{ width: 200 }}
                    maxTagCount="responsive"
                    value={filter.status}
                    options={statusOptions}
                    onChange={onStatusChange}
                />
                <Select
                    allowClear
                    placeholder="屏蔽与解除屏蔽"
                    style={{ width: 140 }}
                    value={filter.blocked === undefined ? undefined : String(filter.blocked)}
                    options={BLOCKED_OPTIONS}
                    onChange={value => onBlockedChange(value === undefined ? undefined : value === 'true')}
                />
                <Input
                    prefix={
                        <SearchPrefix>
                            <Search />
                        </SearchPrefix>
                    }
                    allowClear
                    placeholder="搜索 Pod 名称 / IP"
                    style={{ width: 256 }}
                    defaultValue={filter.keyword}
                    onChange={(event) => onKeywordChange(event.target.value)}
                />
            </FilterForm>
            <QuickFilters active={filter.quick} counts={quickCounts} onSelect={onQuickSelect} />
        </FilterRow>
    );
};

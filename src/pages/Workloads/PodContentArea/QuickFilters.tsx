import {QuickChip, QuickFilterGroup, QuickFilterLabel, QuickFilterWrap} from './PodContentArea.style';
import type {QuickFilterCounts, QuickFilterKey} from './quickFilter';

interface QuickFiltersProps {
    active: QuickFilterKey | null;
    counts: QuickFilterCounts;
    onSelect: (key: QuickFilterKey) => void;
}

const ITEMS: { key: QuickFilterKey; label: string; }[] = [
    { key: 'all', label: '全部' },
    { key: 'normal', label: '正常' },
    { key: 'abnormal', label: '异常' },
    { key: 'blocked', label: '已屏蔽' },
];

export const QuickFilters = ({ active, counts, onSelect }: QuickFiltersProps) => {
    return (
        <QuickFilterWrap>
            <QuickFilterLabel>快捷筛选</QuickFilterLabel>
            <QuickFilterGroup>
                {ITEMS.map(item => (
                    <QuickChip
                        key={item.key}
                        type="button"
                        selected={active === item.key}
                        onClick={() => onSelect(item.key)}
                    >
                        {item.label}（{counts[item.key]}）
                    </QuickChip>
                ))}
            </QuickFilterGroup>
        </QuickFilterWrap>
    );
};

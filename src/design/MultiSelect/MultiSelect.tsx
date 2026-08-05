import {useMemo, useState} from 'react';
import {Checkbox, Select} from 'antd';
import styled from '@emotion/styled';
import {spacing} from '@/constants/spacing';

import type {SelectProps} from 'antd';
import type {ReactNode} from 'react';

const OptionRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

// Checkbox 仅用于视觉呈现，选中态由整行点击驱动，故屏蔽其自身的指针事件避免二次拦截。
const VisualCheckbox = styled(Checkbox)`
    pointer-events: none;
`;

type SelectValue = SelectProps['value'];

export type MultiSelectProps = Omit<SelectProps, 'mode'> & {
    /** 多选模式，默认 multiple；tags 模式同样适用 */
    mode?: 'multiple' | 'tags';
};

const toValueSet = (value: SelectValue): Set<unknown> => {
    if (!Array.isArray(value)) {
        return new Set();
    }
    return new Set(
        value.map(item =>
            item && typeof item === 'object' && 'value' in item
                ? (item as {value: unknown}).value
                : item,
        ),
    );
};

/**
 * 多选 Select：在标准 antd Select 的基础上，为下拉框中的每一项渲染前增加一个 Checkbox。
 * 主题色 / Token 由 ConfigProvider 统一注入，此处不做二次覆盖。
 */
export const MultiSelect = ({
    mode = 'multiple',
    value,
    defaultValue,
    onChange,
    optionRender,
    menuItemSelectedIcon,
    ...restProps
}: MultiSelectProps) => {
    const [innerValue, setInnerValue] = useState<SelectValue>(defaultValue);
    const mergedValue = value !== undefined ? value : innerValue;
    const selectedSet = useMemo(() => toValueSet(mergedValue), [mergedValue]);

    const handleChange: NonNullable<SelectProps['onChange']> = (nextValue, option) => {
        if (value === undefined) {
            setInnerValue(nextValue);
        }
        onChange?.(nextValue, option);
    };

    const renderOption: NonNullable<SelectProps['optionRender']> = (oriOption, info) => {
        const checked = selectedSet.has(oriOption.value);
        const content: ReactNode = optionRender
            ? optionRender(oriOption, info)
            : oriOption.label;
        return (
            <OptionRow>
                <VisualCheckbox checked={checked} />
                <span>{content}</span>
            </OptionRow>
        );
    };

    return (
        <Select
            {...restProps}
            mode={mode}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            optionRender={renderOption}
            // 移除 antd 默认右侧对勾，选中态改由左侧 Checkbox + 行背景表达
            menuItemSelectedIcon={menuItemSelectedIcon ?? null}
        />
    );
};

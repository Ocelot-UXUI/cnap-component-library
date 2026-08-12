import {useMemo, useState} from 'react';
import {DownOutlined} from '@ant-design/icons';
import {Checkbox, Select as AntdSelect} from 'antd';
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

const isMultipleMode = (mode: SelectProps['mode']): boolean =>
    mode === 'multiple' || mode === 'tags';

/**
 * Select：对 antd Select 的透明封装。
 * - 未设置 mode（或非 multiple / tags）时，行为与 antd Select 完全一致。
 * - mode 为 multiple / tags 时，为下拉项前置一个 Checkbox 呈现多选态。
 * - 多选态默认显式给出 suffixIcon（箭头）：antd 在可搜索的下拉展开时会把右侧箭头替换为搜索
 *   图标，显式传入 suffixIcon 可绕过该分支，保证右侧恒为箭头。
 * 主题色 / Token 由 ConfigProvider 统一注入，此处不做二次覆盖。
 */
const InternalSelect = (props: SelectProps) => {
    const {value, defaultValue, onChange, optionRender, menuItemSelectedIcon, suffixIcon, ...restProps} = props;
    const [innerValue, setInnerValue] = useState<SelectValue>(defaultValue);
    const mergedValue = value !== undefined ? value : innerValue;
    const selectedSet = useMemo(() => toValueSet(mergedValue), [mergedValue]);

    // 非多选模式：不注入任何多选专属逻辑，表现与 antd Select 完全一致。
    if (!isMultipleMode(props.mode)) {
        return <AntdSelect {...props} />;
    }


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
        <AntdSelect
            {...restProps}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            optionRender={renderOption}
            suffixIcon={suffixIcon ?? <DownOutlined />}
            // 移除 antd 默认右侧对勾，选中态改由左侧 Checkbox + 行背景表达
            menuItemSelectedIcon={menuItemSelectedIcon ?? null}
        />
    );
};

// 运行时使用增强实现，类型对齐 antd Select（保留泛型调用签名与 Option / OptGroup 静态成员），
// 使其成为完全可替换的 drop-in。
export const Select = InternalSelect as unknown as typeof AntdSelect;

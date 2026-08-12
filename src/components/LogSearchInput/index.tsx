import {useEffect, useState} from 'react';
import {CloseOutlined, EyeInvisibleOutlined, EyeOutlined} from '@ant-design/icons';
import {ArrowDown, ArrowUp, Search} from '@/assets/icons';
import {CountText, Divider, IconButton, MatchCount, StyledInput, SuffixWrapper} from './LogSearchInput.styles';
import type {ChangeEvent, MouseEvent} from 'react';
import type {LogSearchInputProps} from './types';

// 阻止点击后缀按钮时输入框失焦
const keepFocus = (event: MouseEvent) => event.preventDefault();

export function LogSearchInput({
    value,
    defaultValue = '',
    onChange,
    placeholder = '请输入',
    current,
    total = 0,
    onCurrentChange,
    visible,
    defaultVisible = true,
    onVisibleChange,
    onClear,
    className,
}: LogSearchInputProps) {
    const [innerValue, setInnerValue] = useState(defaultValue);
    const [innerVisible, setInnerVisible] = useState(defaultVisible);
    // 非受控 current：默认 total 为 0 时为 0，否则为 1
    const [innerCurrent, setInnerCurrent] = useState(() => (total > 0 ? 1 : 0));

    const isValueControlled = value !== undefined;
    const text = isValueControlled ? value : innerValue;

    const isVisibleControlled = visible !== undefined;
    const eyeOpen = isVisibleControlled ? visible : innerVisible;

    // total 变化时，非受控 current 回到默认位（避免出现超出范围的匹配位）
    useEffect(() => {
        setInnerCurrent(total > 0 ? 1 : 0);
    }, [total]);

    const isCurrentControlled = current !== undefined;
    const currentMatch = isCurrentControlled ? current : innerCurrent;

    const canPrev = currentMatch > 1;
    const canNext = currentMatch < total;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value;
        if (!isValueControlled) {
            setInnerValue(next);
        }
        onChange?.(next);
    };

    const handleCurrentChange = (next: number) => {
        if (!isCurrentControlled) {
            setInnerCurrent(next);
        }
        onCurrentChange?.(next);
    };

    const handleClear = () => {
        if (!isValueControlled) {
            setInnerValue('');
        }
        onChange?.('');
        onClear?.();
    };

    const toggleVisible = () => {
        const next = !eyeOpen;
        if (!isVisibleControlled) {
            setInnerVisible(next);
        }
        onVisibleChange?.(next);
    };

    const suffix = text
        ? (
            <SuffixWrapper>
                <MatchCount>
                    <CountText>{`${currentMatch}/${total}`}</CountText>
                    <IconButton
                        type="button"
                        aria-label="上一个匹配项"
                        disabled={!canPrev}
                        onMouseDown={keepFocus}
                        onClick={() => handleCurrentChange(currentMatch - 1)}
                    >
                        <ArrowUp />
                    </IconButton>
                    <IconButton
                        type="button"
                        aria-label="下一个匹配项"
                        disabled={!canNext}
                        onMouseDown={keepFocus}
                        onClick={() => handleCurrentChange(currentMatch + 1)}
                    >
                        <ArrowDown />
                    </IconButton>
                </MatchCount>
                <Divider />
                {onVisibleChange && (
                    <IconButton
                        type="button"
                        aria-label={eyeOpen ? '隐藏' : '显示'}
                        onMouseDown={keepFocus}
                        onClick={toggleVisible}
                    >
                        {eyeOpen ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </IconButton>
                )}
                <IconButton type="button" aria-label="清空" onMouseDown={keepFocus} onClick={handleClear}>
                    <CloseOutlined />
                </IconButton>
            </SuffixWrapper>
        )
        : null;

    return (
        <StyledInput
            className={className}
            value={text}
            placeholder={placeholder}
            onChange={handleChange}
            prefix={<Search />}
            suffix={suffix}
        />
    );
}

import styled from '@emotion/styled';
import {Input} from '@/design/Input';
import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const StyledInput = styled(Input)`
    width: 100%;

    /* 项目图标源为 32x32 viewBox，需按字号收敛为 1em 方形 */
    .ant-5-input-prefix svg {
        width: 1em;
        height: 1em;
        color: ${semantic.text.placeholder};
    }
`;

export const SuffixWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

export const MatchCount = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs}px;
`;

export const CountText = styled.span`
    font-family: ${typography.fontFamily.text};
    font-size: ${typography.body.regular.fontSize}px;
    line-height: ${typography.body.regular.lineHeight};
    font-weight: ${typography.body.regular.fontWeight};
    color: ${semantic.text.placeholder};
    white-space: nowrap;
`;

export const IconButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: ${semantic.text.tertiary};
    font-size: ${typography.body.small.fontSize}px;
    line-height: 0;
    cursor: pointer;
    transition: color 0.2s;

    svg {
        width: 1em;
        height: 1em;
    }

    &:hover {
        color: ${semantic.text.primary};
    }

    &:disabled {
        color: ${semantic.text.disabled};
        cursor: not-allowed;
    }
`;

export const Divider = styled.span`
    width: 1px;
    min-height: 14px;
    background: ${semantic.border.divider};
`;

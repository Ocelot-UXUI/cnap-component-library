import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const AreaContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.l}px;
    flex: 1;
    // padding: ${spacing.xl2}px;
    background-color: #fff;
    border-radius: ${radius.xl}px;
    max-height: calc(100% - 52px);
`;

export const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
`;

export const HeaderTitle = styled.span`
    ${typography.heading.h3}
    color: ${semantic.text.primary};
`;

export const HeaderActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.l}px;
`;

export const FilterRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.l}px;
    flex-wrap: wrap;
`;

export const FilterForm = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
`;

export const SearchPrefix = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${semantic.text.placeholder};

    svg {
        width: 1em;
        height: 1em;
    }
`;

export const QuickFilterWrap = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

export const QuickFilterLabel = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.tertiary};
`;

export const QuickFilterGroup = styled.div`
    display: flex;
`;

export const QuickChip = styled.button<{ selected: boolean; }>`
    min-width: 82px;
    height: 32px;
    padding: 0 ${spacing.m}px;
    background: ${semantic.bg.default};
    border: 1px solid ${props => (props.selected ? semantic.border.cardHover : semantic.border.card)};
    color: ${props => (props.selected ? semantic.text.primary : semantic.text.tertiary)};
    ${props => (props.selected ? typography.body.medium : typography.body.regular)}
    cursor: pointer;

    &:not(:first-of-type) {
        margin-left: -1px;
    }

    &:first-of-type {
        border-top-left-radius: ${radius.md}px;
        border-bottom-left-radius: ${radius.md}px;
    }

    &:last-of-type {
        border-top-right-radius: ${radius.md}px;
        border-bottom-right-radius: ${radius.md}px;
    }

    &:hover {
        color: ${semantic.text.secondary};
        border-color: ${semantic.border.cardHover};
        z-index: 1;
    }
`;

export const GroupSection = styled.div`
    display: flex;
    flex-direction: column;
`;

export const GroupBlock = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${spacing.s}px;
    margin-bottom: ${spacing.xl2}px;

    /* 假滚动下 thead 由 JS 反向 translate 吸顶，需盖住其下 body 行 */
    & thead {
        position: relative;
        // 设置为16是因为需要盖住fixed的表格首位两列的表头渲染
        z-index: 16;
        will-change: transform;
    }
`;

/** GroupHeader 吸顶承载层：data-group-header 供进度控制器实测/施加 transform */
export const GroupHeaderPin = styled.div`
    position: relative;
    will-change: transform;
    background: ${semantic.bg.default};
`;

/** 组内分页行：固定 min-height 保证分页固定/回流切换时组高不跳变 */
export const PagerRow = styled.div`
    display: flex;
    justify-content: flex-end;
    min-height: 32px;
`;

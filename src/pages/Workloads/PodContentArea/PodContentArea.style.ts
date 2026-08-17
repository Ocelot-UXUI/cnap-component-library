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
    /* 首个分组呼吸位条带的覆盖空间：抵消 GroupHeaderPin 负 margin 的上探 */
    padding-top: ${spacing.xl2}px;
`;

export const GroupBlock = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    // 增加这个间距会使滚动后在缝隙中显示出滚上来的表格内容，之后再调整
    // gap: ${spacing.s}px;
    margin-bottom: ${spacing.xl2}px;
`;

/** GroupHeader 吸顶层：原生 sticky 钉在窗口顶。padding-top + 等量负 margin-top 构成吸顶呼吸位——不透明盒从窗口顶开始、视觉内容下移 xl2，自然流布局净零（组间距不膨胀）；表头 offsetHeader 须计入呼吸位并留重叠量防透缝 */
export const GroupHeaderPin = styled.div`
    position: sticky;
    top: 0;
    z-index: 15;
    margin-top: -${spacing.xl2}px;
    padding-top: ${spacing.xl2}px;
    background: ${semantic.bg.default};
`;

/** 组内分页行：原生 sticky 于窗口底（组底在窗口下方时固定、入窗后回流），不脱离文档流无需占位 hack */
export const PagerRow = styled.div`
    position: sticky;
    bottom: 0;
    z-index: 5;
    display: flex;
    justify-content: flex-end;
    min-height: 32px;
    padding: ${spacing.xs}px 0;
    background: ${semantic.bg.default};
    border-top: 1px solid ${semantic.border.divider};
`;

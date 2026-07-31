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
    overflow: auto;
    padding: ${spacing.xl2}px;
    background-color: #fff;
    border-radius: ${radius.xl}px;
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
    color: ${props => (props.selected ? semantic.text.secondary : semantic.text.tertiary)};
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
    display: flex;
    flex-direction: column;
    gap: ${spacing.s}px;
    margin-bottom: ${spacing.xl2}px;
`;

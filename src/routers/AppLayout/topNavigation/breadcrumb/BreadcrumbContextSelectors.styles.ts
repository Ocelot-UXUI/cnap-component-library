import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const BreadcrumbRoot = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
    width: 100%;
    margin-right: 60px;
    color: ${semantic.text.primary};
    ${typography.body.regular};
    white-space: nowrap;
`;

export const BreadcrumbHome = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
`;

export const BreadcrumbDivider = styled.span`
    width: 1px;
    height: 12px;
    margin: 0 ${spacing.m}px;
    background: ${semantic.border.card};
    flex: 0 0 auto;
`;

export const DimensionList = styled.div`
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1 1 auto;
`;

export const SegmentSeparator = styled.span`
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 0 0 0 ${spacing.m}px;
    color: ${semantic.text.placeholder};
    ${typography.body.regular};
    flex: 0 0 auto;
`;

export const SelectorTrigger = styled.button<{ maxWidth?: number; }>`
    max-width: ${({ maxWidth }) => maxWidth ? `${maxWidth}px` : 'none'};
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: ${spacing.xs}px;
    border: 0;
    padding: 0 4px;
    background: transparent;
    color: ${semantic.text.primary};
    ${typography.body.regular};
    cursor: pointer;
`;

export const SelectorTriggerLabel = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const SelectorTriggerIcon = styled.span<{ open: boolean; }>`
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${semantic.text.tertiary};
    font-size: 12px;
    transition: transform 0.2s ease;
    transform: rotate(${({ open }) => open ? '180deg' : '0deg'});

    .anticon {
        font-size: 12px;
    }
`;

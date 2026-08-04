import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const PlaygroundBody = styled.div`
    display: flex;
    gap: ${spacing.xl2}px;
    align-items: flex-start;
`;

export const LeftPanel = styled.nav`
    flex: 0 0 220px;
    border-right: 1px solid ${semantic.border.divider};
    padding-right: ${spacing.s}px;
    max-height: calc(100vh - 160px);
    overflow-y: auto;
`;

export const ListItem = styled.button<{ $selected: boolean; }>`
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: ${({ $selected }) => ($selected ? semantic.state.component.selectActive : 'transparent')};
    color: ${({ $selected }) => ($selected ? semantic.text.primary : semantic.text.secondary)};
    font-size: ${typography.body.regular.fontSize}px;
    line-height: ${typography.body.regular.lineHeight};
    padding: ${spacing.s}px ${spacing.m}px;
    border-radius: ${radius.md}px;
    cursor: pointer;
    transition: background 0.15s ease;

    &:hover {
        background: ${semantic.state.component.selectHover};
        color: ${semantic.text.primary};
    }
`;

export const RightPanel = styled.section`
    flex: 1;
    min-width: 0;
    padding: ${spacing.l}px ${spacing.xl2}px;
    background: ${semantic.bg.default};
    border: 1px solid ${semantic.border.divider};
    border-radius: ${radius.lg}px;
    min-height: 400px;
`;

export const SectionTitle = styled.h3`
    font-size: ${typography.heading.h4.fontSize}px;
    font-weight: ${typography.heading.h4.fontWeight};
    color: ${semantic.text.primary};
    margin: 0 0 ${spacing.l}px;
`;

export const StateGroup = styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${spacing.m}px ${spacing.l}px;
`;

export const SubGroupTitle = styled.h4`
    font-size: ${typography.body.medium.fontSize}px;
    font-weight: ${typography.body.medium.fontWeight};
    color: ${semantic.text.secondary};
    margin: ${spacing.l}px 0 ${spacing.s}px;
`;

export const HintText = styled.p`
    color: ${semantic.text.tertiary};
    font-size: ${typography.caption.regular.fontSize}px;
    margin: ${spacing.s}px 0 0;
`;

export const StateLabel = styled.span`
    font-size: ${typography.caption.regular.fontSize}px;
    color: ${semantic.text.tertiary};
    min-width: 64px;
`;

export const PlaceholderText = styled.p`
    color: ${semantic.text.tertiary};
    font-size: ${typography.body.regular.fontSize}px;
`;

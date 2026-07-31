import {css} from '@emotion/css';
import styled from '@emotion/styled';

import {sidebar} from '@/constants/colors';
import {SECONDARY_SIDEBAR_COLLAPSED_WIDTH, SECONDARY_SIDEBAR_WIDTH} from '@/constants/layout';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

interface SecondarySidebarProps {
    $collapsed: boolean;
}

const expandedPaddingRight = 13;
const expandedPaddingLeft = 11;
const secondaryItemWidth = 176;
const secondaryRailItemWidth = 52;
const secondaryItemHeight = 38;

const getSecondarySidebarStyles = ({ $collapsed }: SecondarySidebarProps): string => {
    const width = $collapsed ? SECONDARY_SIDEBAR_COLLAPSED_WIDTH : SECONDARY_SIDEBAR_WIDTH;
    const padding = $collapsed
        ? `${spacing.xl2}px ${spacing.xs}px ${spacing.xl}px`
        : `${spacing.xl2}px ${expandedPaddingRight}px ${spacing.xl}px ${expandedPaddingLeft}px`;

    return `
        width: ${width}px;
        flex: 0 0 ${width}px;
        align-items: ${$collapsed ? 'center' : 'flex-start'};
        padding: ${padding};
    `;
};

export const SecondarySidebar = styled.aside<SecondarySidebarProps>`
    ${getSecondarySidebarStyles}
    height: 100%;
    z-index: 800;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: ${sidebar.level2.bg};
    box-shadow: ${shadow.s};
    box-sizing: border-box;
    transition: width 0.15s ease, flex-basis 0.15s ease;
`;

export const SecondaryTitle = styled.div`
    width: ${secondaryItemWidth}px;
    padding: 0 ${spacing.l}px;
    color: ${sidebar.text.primary};
    font-family: ${typography.heading.h4.fontFamily};
    font-size: ${typography.heading.h4.fontSize}px;
    font-weight: ${typography.heading.h4.fontWeight};
    line-height: ${typography.heading.h4.lineHeight};
    margin-bottom: ${spacing.xl2}px;
    box-sizing: border-box;
`;

export const SecondaryList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs}px;
`;

export const secondaryItemClass = css`
    width: ${secondaryItemWidth}px;
    height: ${secondaryItemHeight}px;
    border: 0;
    border-radius: ${radius.lg}px;
    padding: 0 ${spacing.l}px;
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
    background: transparent;
    color: ${sidebar.text.secondary};
    cursor: pointer;
    font-family: ${typography.body.regular.fontFamily};
    font-size: ${typography.body.regular.fontSize}px;
    font-weight: ${typography.body.regular.fontWeight};
    line-height: ${typography.body.regular.lineHeight};
    text-align: left;

    &:hover {
        background: ${sidebar.level2.hoverBg};
        color: ${sidebar.text.primary};
    }
`;

export const secondaryItemActiveClass = css`
    background: ${sidebar.level2.selectedBg};
    color: ${sidebar.text.primary};
    font-weight: 500;

    &:hover {
        background: ${sidebar.level2.selectedBg};
        color: ${sidebar.text.primary};
    }
`;

export const secondaryRailItemClass = css`
    width: ${secondaryRailItemWidth}px;
    height: ${secondaryItemHeight}px;
    border: 0;
    border-radius: ${radius.lg}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${sidebar.text.secondary};
    cursor: pointer;
    font: inherit;
    font-size: 16px;

    &:hover {
        background: ${sidebar.level2.hoverBg};
    }
`;

export const secondaryControlClass = css`
    width: ${secondaryItemWidth}px;
    height: ${spacing.l}px;
    border: 0;
    padding: 0 ${spacing.l}px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    background: transparent;
    color: ${sidebar.text.tertiary};
    cursor: pointer;
    font: inherit;
`;

export const secondaryRailControlClass = css`
    width: ${secondaryRailItemWidth}px;
    height: ${spacing.xl4}px;
    border: 0;
    border-radius: ${radius.lg}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    color: ${sidebar.text.tertiary};
    cursor: pointer;
    font: inherit;

    &:hover {
        background: ${sidebar.level2.hoverBg};
    }
`;

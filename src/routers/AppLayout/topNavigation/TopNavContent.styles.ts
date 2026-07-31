import {css} from '@emotion/css';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

const productSwitcherSize = spacing.xl4;
const iconButtonSize = spacing.xl;
const logoHeight = spacing.xl2;
const searchBoxWidth = 200;
const shortcutHeight = spacing.xl;
const dividerWidth = 1;
const dividerHeight = spacing.m;

export const topNavContentClass = css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    gap: ${spacing.xl2}px;
`;

export const topNavLeftClass = css`
    display: flex;
    align-items: center;
    min-width: 0;
`;

export const productSwitcherClass = css`
    width: ${productSwitcherSize}px;
    height: ${productSwitcherSize}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${semantic.state.component.borderDefault};
    border-radius: ${radius.lg}px;
    color: ${semantic.icon.secondary};
    margin-right: ${spacing.l}px;
`;

export const logoClass = css`
    height: ${logoHeight}px;
    margin-right: ${spacing.xl6}px;
`;

export const breadcrumbClass = css`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
    color: ${semantic.text.primary};
    font-family: ${typography.body.regular.fontFamily};
    font-size: ${typography.body.regular.fontSize}px;
    font-weight: ${typography.body.regular.fontWeight};
    line-height: ${typography.body.regular.lineHeight};
    white-space: nowrap;
`;

export const breadcrumbItemClass = css`
    display: inline-flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

export const dividerClass = css`
    width: ${dividerWidth}px;
    height: ${dividerHeight}px;
    background: ${semantic.border.card};
`;

export const selectorFrameClass = css`
    display: flex;
    align-items: center;
    min-width: 0;
`;

export const topNavRightClass = css`
    display: flex;
    align-items: center;
    gap: ${spacing.l}px;
`;

export const searchBoxClass = css`
    width: ${searchBoxWidth}px;
    height: ${productSwitcherSize}px;
    display: inline-flex;
    align-items: center;
    gap: ${spacing.s}px;
    padding: 0 ${spacing.m}px;
    border: 1px solid ${semantic.state.component.borderDefault};
    border-radius: ${radius.md}px;
    background: ${semantic.bg.default};
    color: ${semantic.text.placeholder};
    font-family: ${typography.body.regular.fontFamily};
    font-size: ${typography.body.regular.fontSize}px;
    font-weight: ${typography.body.regular.fontWeight};
    line-height: ${typography.body.regular.lineHeight};
`;

export const shortcutClass = css`
    margin-left: auto;
    padding: 0 ${spacing.xs}px;
    height: ${shortcutHeight}px;
    border-radius: ${radius.sm}px;
    background: ${semantic.state.component.disabledBg};
    color: ${semantic.text.tertiary};
    font-family: ${typography.body.small.fontFamily};
    font-size: ${typography.body.small.fontSize}px;
    font-weight: ${typography.body.small.fontWeight};
    line-height: ${typography.body.small.lineHeight};
`;

export const iconButtonClass = css`
    width: ${iconButtonSize}px;
    height: ${iconButtonSize}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: ${semantic.icon.primary};
`;

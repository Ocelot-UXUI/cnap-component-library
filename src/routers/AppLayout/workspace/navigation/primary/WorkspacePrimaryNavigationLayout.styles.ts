import {css} from '@emotion/css';
import styled from '@emotion/styled';

import {sidebar} from '@/constants/colors';
import {PRIMARY_SIDEBAR_WIDTH} from '@/constants/layout';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

const primaryItemSize = 52;
const primaryUtilityWidth = spacing.xl4;
const primaryIconSize = spacing.xl;
const primaryIconFontSize = 18;
const primaryItemLabelGap = 1;
const primaryDividerHeight = 1;
const popoverWidth = 196;

export const PrimarySidebar = styled.nav`
    width: ${PRIMARY_SIDEBAR_WIDTH}px;
    height: 100%;
    flex: 0 0 ${PRIMARY_SIDEBAR_WIDTH}px;
    z-index: 900;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: ${spacing.xl}px ${spacing.xs}px;
    background: ${sidebar.level1.bg};
    box-sizing: border-box;
`;

export const PrimaryBusiness = styled.div`
    width: ${primaryItemSize}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.s}px;
`;

export const PrimaryUtility = styled.div`
    width: ${primaryUtilityWidth}px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.xl2}px;
    color: ${sidebar.level1.icon};

    &::before {
        content: '';
        width: ${primaryUtilityWidth}px;
        height: ${primaryDividerHeight}px;
        background: ${sidebar.level1.icon};
        opacity: 0.12;
    }

    & > .anticon {
        opacity: 0.72;
    }
`;

export const primaryItemClass = css`
    width: ${primaryItemSize}px;
    height: ${primaryItemSize}px;
    border: 0;
    border-radius: ${radius.lg}px;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${primaryItemLabelGap}px;
    background: transparent;
    color: ${sidebar.level1.icon};
    cursor: pointer;
    font: inherit;
    transition: background 0.15s ease, color 0.15s ease;

    &:hover {
        background: ${sidebar.level1.hoverBg};
    }
`;

export const primaryActiveClass = css`
    background: ${sidebar.level1.selectedBg};
    color: ${sidebar.level1.bg};

    &:hover {
        background: ${sidebar.level1.selectedBg};
    }
`;

export const primaryIconClass = css`
    width: ${primaryIconSize}px;
    height: ${primaryIconSize}px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: ${primaryIconFontSize}px;
`;

export const primaryLabelClass = css`
    font-family: ${typography.body.small.fontFamily};
    font-size: ${typography.body.small.fontSize}px;
    font-weight: ${typography.body.small.fontWeight};
    line-height: ${typography.body.small.lineHeight};
    white-space: nowrap;
`;

export const popoverClass = css`
    .ant-5-popover-inner {
        width: ${popoverWidth}px;
        padding: ${spacing.m}px ${spacing.s}px;
        border-radius: ${radius.xl}px;
        background: ${sidebar.level1.bg};
    }

    .ant-5-popover-arrow::before {
        background: ${sidebar.level1.bg};
    }
`;

export const popoverTitleClass = css`
    color: ${sidebar.text.tertiary};
    font-family: ${typography.caption.tiny.fontFamily};
    font-size: ${typography.caption.tiny.fontSize}px;
    font-weight: ${typography.caption.tiny.fontWeight};
    line-height: ${typography.caption.tiny.lineHeight};
    margin-bottom: ${spacing.s}px;
`;

export const popoverItemsClass = css`
    display: flex;
    gap: ${spacing.s}px;
`;

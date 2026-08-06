import {css} from '@emotion/css';
import styled from '@emotion/styled';
import {Button} from '@/design';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const ActionButton = styled(Button)`
    ${typography.body.medium}
    height: 32px;
    gap: 6px;
    padding: 0 ${spacing.l}px;
    border-color: ${semantic.state.component.borderDefault};
    border-radius: ${radius.xl4}px;
    color: ${semantic.text.primary};

    .anticon,
    > span:not(.ant-btn-icon) {
        line-height: 22px;
    }

    .ant-btn-icon {
        display: inline-flex;
        width: 16px;
        height: 16px;
        align-items: center;
        justify-content: center;
    }
`;

export const menuOverlayClass = css`
    &.ant-5-dropdown {
        min-width: 160px !important;
    }

    .ant-5-dropdown-menu {
        width: 160px;
        padding: ${spacing.xs}px;
        border: 1px solid ${semantic.border.card};
        border-radius: ${radius.lg}px;
        box-shadow: ${shadow.m};
    }

    .ant-5-dropdown-menu-item {
        min-height: 32px;
        padding: ${spacing.xs}px ${spacing.s}px;
        border-radius: ${radius.md}px;
        ${typography.body.regular}
    }

    .ant-5-dropdown-menu-item-icon {
        display: inline-flex;
        width: 14px;
        height: 14px;
        align-items: center;
        justify-content: center;
        margin-inline-end: 6px;
    }

    .ant-5-dropdown-menu-item-divider {
        margin: ${spacing.xs / 2}px ${spacing.s}px;
        background: ${semantic.border.divider};
    }
`;

import styled from '@emotion/styled';
import {Segmented} from '@/design';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';

import type {ViewMode} from './types';

export const ActionIcon = styled.span`
    position: relative;
    display: inline-flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    color: ${semantic.text.secondary};
`;

export const HeaderDivider = styled.span`
    width: 1px;
    height: 12px;
    flex: 0 0 auto;
    background: ${semantic.border.divider};
`;

export const ModeSwitch = styled(Segmented<ViewMode>)`
    display: inline-flex;
    box-sizing: border-box;
    width: 62px;
    height: 32px;
    align-items: center;
    padding: 0 ${spacing.xs / 2}px;
    border: 1px solid ${semantic.border.divider};
    border-radius: ${radius.xl4}px;
    background: ${semantic.bg.page};

    .ant-5-segmented-group {
        height: 28px;
        align-items: center;
    }

    .ant-5-segmented-item {
        min-width: 28px;
        height: 28px;
        border-radius: ${radius.xl3}px;
    }

    .ant-5-segmented-item-label {
        display: flex;
        height: 28px;
        min-height: 28px;
        align-items: center;
        justify-content: center;
        padding: 0;
        line-height: 1;
    }

    .ant-5-segmented-thumb {
        height: 28px;
        border-radius: ${radius.xl3}px;
        box-shadow: none;
    }
`;

export const ViewIcon = styled.span`
    display: flex;
    width: 14px;
    height: 14px;
    align-items: center;
    justify-content: center;

    img {
        width: 14px;
        height: 14px;
    }
`;

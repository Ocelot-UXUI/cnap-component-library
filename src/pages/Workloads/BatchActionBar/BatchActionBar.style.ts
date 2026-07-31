import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const BatchBarWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 48px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 ${spacing.l}px;
    border-radius: ${radius.xl}px;
    background-color: ${semantic.button.primary.bg};
`;

export const CountText = styled.span`
    ${typography.body.medium}
    color: ${semantic.text.inverse};
    white-space: nowrap;
`;

export const Actions = styled.div`
    display: flex;
    height: 20px;
    align-items: center;
    gap: ${spacing.xl3}px;
    margin-left: auto;
`;

export const ActionButton = styled.button<{ danger?: boolean; }>`
    display: inline-flex;
    height: 20px;
    align-items: center;
    gap: ${({ danger }) => danger ? '6px' : '4px'};
    padding: 0;
    border: 0;
    background: transparent;
    ${typography.body.regular}
    color: ${({ danger }) => danger ? semantic.state.error.hover : semantic.text.disabled};
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
        color: ${semantic.text.disabled};
        cursor: not-allowed;
    }
`;

export const VDivider = styled.span`
    width: 1px;
    height: 14px;
    flex: 0 0 auto;
    background: ${semantic.text.tertiary};
`;

export const CloseButton = styled.button`
    display: inline-flex;
    width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${semantic.text.inverse};
    cursor: pointer;
`;

export const SvgIcon = styled.span`
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    color: inherit;

    svg {
        width: 16px;
        height: 16px;
    }
`;

export const FullIcon = styled.img`
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    object-fit: contain;
`;

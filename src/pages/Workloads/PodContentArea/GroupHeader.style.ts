import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const GroupHeaderBar = styled.div`
    display: flex;
    width: 100%;
    height: 48px;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 ${spacing.l}px 0 ${spacing.m}px;
    border-radius: ${radius.xl}px;
    background: ${semantic.bg.page};
`;

export const GroupHeaderLeft = styled.div`
    display: flex;
    min-width: 0;
    align-items: center;
    gap: ${spacing.m}px;
    white-space: nowrap;
`;

export const ToggleButton = styled.button<{ expanded: boolean; }>`
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${semantic.text.secondary};
    cursor: pointer;

    svg {
        width: 8px;
        height: 4px;
        transform: rotate(${({ expanded }) => expanded ? '0deg' : '-90deg'});
    }
`;

export const GroupName = styled.button`
    ${typography.body.medium}
    overflow: hidden;
    max-width: 180px;
    padding: 0;
    border: 0;
    background: transparent;
    color: ${semantic.text.primary};
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
`;

export const KindTag = styled.span`
    ${typography.caption.regular}
    display: inline-flex;
    min-width: 57px;
    height: 18px;
    align-items: center;
    justify-content: center;
    padding: 0 ${spacing.s}px;
    border-radius: ${radius.xl}px;
    background: ${semantic.border.divider};
    color: ${semantic.text.secondary};
`;

export const Divider = styled.span`
    width: 1px;
    height: 12px;
    flex: 0 0 auto;
    background: ${semantic.border.divider};
`;

export const VersionText = styled.span`
    ${typography.body.regular}
    display: inline-block;
    overflow: hidden;
    max-width: 180px;
    color: ${semantic.text.tertiary};
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const GroupHeaderRight = styled.div`
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: ${spacing.l}px;
    white-space: nowrap;
`;

export const StatusGroup = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.l}px;
`;

export const StatusItem = styled.span`
    ${typography.body.regular}
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: ${semantic.text.secondary};
`;

export const StatusCount = styled.span<{ status: 'success' | 'error' | 'warning'; }>`
    ${typography.body.smallMedium}
    display: inline-flex;
    width: 22px;
    height: 22px;
    align-items: center;
    justify-content: center;
    border-radius: ${radius.lg}px;
    background: ${({ status }) => semantic.state[status].light};
    color: ${({ status }) => semantic.state[status].default};
`;

export const CountText = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.secondary};
`;

import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const TitleBarRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
`;

export const TitleName = styled.span`
    ${typography.heading.h3}
    color: ${semantic.text.primary};
`;

export const TitleActions = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    margin-left: auto;
`;

export const OwnershipRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
    ${typography.caption.regular}
    margin: ${spacing.m}px 0;

    b {
        color: ${semantic.text.placeholder};
        font-weight: 400;
        margin-right: ${spacing.xs}px;
    }

    span {
        color: ${semantic.text.secondary};
    }
`;

export const InfoCard = styled.div`
    background: ${semantic.bg.page};
    border-radius: ${radius.xl}px;
    padding: ${spacing.l}px ${spacing.xl}px;
    margin-bottom: ${spacing.l}px;
`;

export const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${spacing.m}px ${spacing.l}px;
`;

export const InfoItem = styled.div`
    ${typography.body.regular}

    label {
        color: ${semantic.text.tertiary};
        margin-right: ${spacing.s}px;
    }

    span {
        color: ${semantic.text.secondary};
    }
`;

export const SectionBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
    ${typography.body.medium}
    color: ${semantic.text.primary};
    margin: ${spacing.l}px 0 ${spacing.s}px;

    &::before {
        content: '';
        width: 3px;
        height: 14px;
        border-radius: ${radius.sm}px;
        background: ${semantic.state.brand.default};
    }

    em {
        ${typography.body.regular}
        color: ${semantic.text.tertiary};
        font-style: normal;
    }

    & > .ant-5-btn:last-child {
        margin-left: auto;
    }
`;

export const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.m}px;
    margin-bottom: ${spacing.m}px;
`;

export const ToolbarLeft = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
`;

export const ToolbarRight = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;
`;

export const ConsolePlaceholder = styled.div`
    background: ${semantic.button.primary.bg};
    border-radius: ${radius.lg}px;
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
    ${typography.body.regular}
    color: ${semantic.text.tertiary};
`;

import styled from '@emotion/styled';

import {palette, semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const SubTitle = styled.p`
    ${typography.caption.regular}
    color: ${semantic.text.tertiary};
    margin: 0 0 ${spacing.l}px;
`;

export const NoticeBar = styled.div`
    ${typography.body.regular}
    background: ${semantic.state.warning.light};
    color: ${semantic.text.secondary};
    border-radius: ${radius.lg}px;
    padding: ${spacing.s}px ${spacing.m}px;
    margin-bottom: ${spacing.xl2}px;

    p {
        margin: 0;
    }
`;

export const SelectorBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
    margin-bottom: ${spacing.xl2}px;
`;

export const SectionTitle = styled.div`
    ${typography.body.medium}
    display: flex;
    align-items: center;
    color: ${semantic.text.primary};
    margin-bottom: ${spacing.l}px;

    &::before {
        content: '';
        width: 3px;
        align-self: stretch;
        min-height: 14px;
        margin-right: ${spacing.s}px;
        border-radius: ${radius.sm}px;
        background: ${palette.brand[4]};
    }
`;

export const SectionHint = styled.span`
    color: ${semantic.text.placeholder};
`;

export const TimeoutRow = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: ${spacing.xl2}px;

    .timeout-label {
        ${typography.body.regular}
        color: ${semantic.text.tertiary};
        margin-right: ${spacing.xl2}px;
    }

    .timeout-unit {
        ${typography.body.regular}
        color: ${semantic.text.primary};
        margin-left: ${spacing.s}px;
    }
`;

export const FooterBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

export const FooterHint = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.placeholder};
`;

import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const SubTitle = styled.p`
    ${typography.caption.regular}
    color: ${semantic.text.tertiary};
    margin: 0 0 ${spacing.m}px;
`;

export const NoticeBar = styled.div`
    ${typography.caption.regular}
    background: ${semantic.state.warning.light};
    color: ${semantic.text.secondary};
    border-radius: ${radius.lg}px;
    padding: ${spacing.s}px ${spacing.m}px;
    margin-bottom: ${spacing.l}px;

    p {
        margin: 0;
    }
`;

export const SectionTitle = styled.div`
    ${typography.body.medium}
    color: ${semantic.text.primary};
    margin: ${spacing.m}px 0 ${spacing.s}px;
`;

export const TimeoutField = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.xs}px;
    margin-bottom: ${spacing.l}px;

    span {
        ${typography.body.regular}
        color: ${semantic.text.secondary};
    }
`;

export const FooterBar = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`;

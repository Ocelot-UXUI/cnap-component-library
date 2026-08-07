import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const HeadBar = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.m}px;
    margin-bottom: ${spacing.xs}px;
`;

export const SubTitle = styled.p`
    ${typography.caption.regular}
    color: ${semantic.text.tertiary};
    margin: 0 0 ${spacing.l}px;
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

export const CellRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.s}px;

    & + & {
        margin-top: ${spacing.s}px;
    }
`;

export const CellLabel = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.secondary};
    width: 30px;
`;

export const FieldError = styled.p`
    ${typography.caption.regular}
    color: ${semantic.state.error.default};
    margin: ${spacing.xs2}px 0 0;
    padding-left: 24px;
`;

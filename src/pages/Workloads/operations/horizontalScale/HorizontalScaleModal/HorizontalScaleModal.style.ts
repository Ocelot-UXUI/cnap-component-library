import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const SubTitle = styled.p`
    ${typography.caption.regular}
    color: ${semantic.text.tertiary};
    margin: 0 0 ${spacing.l}px;
`;

export const SelectorBar = styled.div`
    display: flex;
    gap: ${spacing.m}px;
    margin-bottom: ${spacing.l}px;
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

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

    p {
        margin: 0;
    }
`;

export const SectionTitle = styled.div`
    ${typography.body.medium}
    display: flex;
    align-items: center;
    color: ${semantic.text.primary};
    margin: ${spacing.xl2}px 0 ${spacing.s}px;

    &::before {
        content: '';
        width: 3px;
        min-height: 14px;
        margin-right: ${spacing.s}px;
        border-radius: 2px;
        /* Figma section 强调条 Brand-04；品牌绿装饰条，非 antd 派生交互面 */
        background: ${palette.brand[4]};
    }
`;

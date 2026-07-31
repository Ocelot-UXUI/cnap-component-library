import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const TitleBar = styled.div`
    display: flex;
    align-items: center;
`;

export const TitleDivider = styled.span`
    width: 1px;
    height: 14px;
    margin: 0 ${spacing.l}px;
    background: ${semantic.border.divider};
`;

export const TitleEnv = styled.span`
    ${typography.body.regular}
    color: ${semantic.text.secondary};
`;

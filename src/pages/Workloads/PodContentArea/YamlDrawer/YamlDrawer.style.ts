import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const SearchRow = styled.div`
    margin-bottom: ${spacing.m}px;
`;

export const ViewerFrame = styled.div`
    border: 1px solid ${semantic.border.divider};
    border-radius: ${radius.lg}px;
    overflow: hidden;
`;

export const StatusBox = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    ${typography.body.regular}
    color: ${semantic.text.tertiary};
`;

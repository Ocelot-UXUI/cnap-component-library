import styled from '@emotion/styled';

import {spacing} from '@/constants/spacing';

export const VersionList = styled.div`
    display: flex;
    min-width: 240px;
    flex-direction: column;
    gap: ${spacing.s}px;
`;

export const VersionRow = styled.div`
    display: flex;
    justify-content: space-between;
    gap: ${spacing.xl2}px;
`;

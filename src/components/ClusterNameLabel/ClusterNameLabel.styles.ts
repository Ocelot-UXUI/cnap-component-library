import styled from '@emotion/styled';

import {spacing} from '@/constants/spacing';

export const ClusterNameLabelRoot = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${spacing.xs}px;

    .cluster-connector-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
    }
`;

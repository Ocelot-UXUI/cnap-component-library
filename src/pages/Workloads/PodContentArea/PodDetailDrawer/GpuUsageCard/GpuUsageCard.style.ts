import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

export const GpuCard = styled.div<{ vendorImage: string; }>`
    position: relative;
    display: flex;
    box-sizing: border-box;
    align-items: center;
    width: 73px;
    height: 44px;
    padding: ${spacing.s}px;
    overflow: hidden;
    border: 1px solid ${semantic.border.divider};
    border-radius: ${radius.lg}px;
    background-image: url(${({ vendorImage }) => vendorImage});
    background-size: cover;
`;

export const GpuContent = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 55px;
    min-height: 36px;
    gap: ${spacing.xs}px;
`;

export const GpuDetails = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

export const GpuModel = styled.span`
    overflow: hidden;
    ${typography.caption.medium}
    color: ${semantic.text.secondary};
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const GpuProfile = styled(GpuModel)`
    color: ${semantic.text.tertiary};
`;

export const GpuCount = styled.span`
    flex-shrink: 0;
    ${typography.body.medium}
    color: ${semantic.text.tertiary};
`;

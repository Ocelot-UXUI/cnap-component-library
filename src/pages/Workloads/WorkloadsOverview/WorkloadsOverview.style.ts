import styled from '@emotion/styled';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';

const compactGap = spacing.s - spacing.xs / 2;
const valueUnitGap = spacing.xs / 2;

export const OverviewContainer = styled.div`
    display: flex;
    gap: ${spacing.l}px;
    margin-bottom: ${spacing.xl2}px;
    z-index: 0;
`;

export const OverviewCard = styled.div`
    height: 100px;
    box-sizing: border-box;
    border-radius: ${radius.xl}px;
    background-color: ${semantic.bg.default};
    box-shadow: ${shadow.s};
`;

export const SmallCard = styled(OverviewCard)`
    position: relative;
    flex: 0 0 300px;
    overflow: hidden;
`;

export const CardArtwork = styled.img`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
`;

export const SmallCardContent = styled.div`
    position: relative;
    z-index: 1;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 0 ${spacing.xl4}px;
`;

export const WideCard = styled(OverviewCard)`
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
`;

export const CardLabel = styled.div`
    ${typography.body.regular}
    color: ${semantic.text.secondary};
    margin-bottom: ${compactGap}px;
`;

export const CardValue = styled.div`
    ${typography.heading.h3}
    color: ${semantic.text.primary};
    display: flex;
    align-items: center;
    gap: ${compactGap}px;
`;

export const CardArrow = styled.img`
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
`;

export const ResourceAmount = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${valueUnitGap}px;
`;

export const CardUnit = styled.span`
    ${typography.body.medium}
    color: ${semantic.text.primary};
`;

export const SuccessValue = styled(CardValue)`
    color: ${semantic.state.success.default};
`;

export const ResourceItem = styled.div`
    display: flex;
    flex: 1 1 0;
    min-width: 0;
    justify-content: center;
`;

export const ResourceContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

export const ResourceValue = styled(CardValue)`
    gap: ${compactGap}px;
`;

export const ResourceIcon = styled.img`
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    object-fit: contain;
`;

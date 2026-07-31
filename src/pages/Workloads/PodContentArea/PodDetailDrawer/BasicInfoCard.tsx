import {useState} from 'react';

import styled from '@emotion/styled';
import {Button} from 'antd';

import ChevronUp from '@/assets/chevron-up.svg?react';
import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {Pod} from '@/interface/entities/pod';
import {formatAge} from '../duration';
import {InfoCard, InfoGrid, InfoItem} from './PodDetailDrawer.style';

const ExpandedInfoCard = styled(InfoCard)`
    position: relative;
`;

const BasicInfoGrid = styled(InfoGrid)`
    row-gap: ${spacing.l}px;
`;

const IpInfoItem = styled(InfoItem)`
    span {
        ${typography.code.regular}
    }
`;

const RestartValue = styled.span<{ $color: string; }>`
    color: ${({ $color }) => $color} !important;
`;

const ToggleButton = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.xs}px;
    width: 48px;
    min-width: 48px;
    height: 18px;
    padding: 0 ${spacing.xs}px;
    color: ${semantic.text.secondary};
    background: ${semantic.bg.default};
    border-color: ${semantic.border.card};
    border-radius: ${radius.xl3}px;
    box-shadow: ${shadow.xs};
    ${typography.caption.tiny}
`;

const ToggleIcon = styled(ChevronUp)<{ $flipped?: boolean; }>`
    width: 12px;
    height: 12px;
    transform: ${({ $flipped }) => $flipped ? 'rotate(180deg)' : 'none'};
`;

const ExpandedToggleButton = styled(ToggleButton)`
    position: absolute;
    bottom: -9px;
    left: 50%;
    transform: translateX(-50%);
`;

const CollapsedInfoCard = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: ${spacing.l}px;
`;

interface BasicInfoCardProps {
    pod: Pod;
}

function restartColor(restarts: number): string {
    if (restarts >= 6) {
        return semantic.state.error.default;
    }
    if (restarts >= 3) {
        return semantic.state.warning.default;
    }
    return semantic.text.primary;
}

export const BasicInfoCard = ({ pod }: BasicInfoCardProps) => {
    const [collapsed, setCollapsed] = useState(false);
    const restarts = pod.restarts ?? 0;

    const toggleCollapsed = () => setCollapsed(value => !value);

    if (collapsed) {
        return (
            <CollapsedInfoCard>
                <ToggleButton icon={<ToggleIcon $flipped />} onClick={toggleCollapsed}>
                    展开
                </ToggleButton>
            </CollapsedInfoCard>
        );
    }

    return (
        <ExpandedInfoCard>
            <BasicInfoGrid>
                <IpInfoItem>
                    <label>Pod IP</label>
                    <span>{pod.podIp ?? '-'}</span>
                </IpInfoItem>
                <IpInfoItem>
                    <label>节点 IP</label>
                    <span>{pod.hostIp ?? '-'}</span>
                </IpInfoItem>
                <InfoItem>
                    <label>版本</label>
                    <span>{pod.version ?? '-'}</span>
                </InfoItem>
                <InfoItem>
                    <label>重启次数</label>
                    <RestartValue $color={restartColor(restarts)}>{restarts}</RestartValue>
                </InfoItem>
                <InfoItem>
                    <label>存活时间</label>
                    <span>{formatAge(pod.creationTimestamp)}</span>
                </InfoItem>
                <InfoItem>
                    <label>暴露</label>
                    <span>-</span>
                </InfoItem>
            </BasicInfoGrid>
            <ExpandedToggleButton icon={<ToggleIcon />} onClick={toggleCollapsed}>
                收起
            </ExpandedToggleButton>
        </ExpandedInfoCard>
    );
};

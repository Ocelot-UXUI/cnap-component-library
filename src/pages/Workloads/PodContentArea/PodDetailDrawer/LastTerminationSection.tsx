import dayjs from 'dayjs';

import type {Container} from '@/interface/entities/pod';
import {InfoGrid, InfoItem} from './PodDetailDrawer.style';
import {SectionBar} from './SectionBar';

const hasLastTermination = (container: Container): boolean =>
    Boolean(
        container.lastTermination?.reason
            || container.lastTermination?.startedAt
            || container.lastTermination?.finishedAt,
    );

const formatTerminationTime = (iso?: string): string => {
    if (!iso) {
        return '-';
    }
    const time = dayjs(iso);
    return time.isValid() ? time.format('YYYY.MM.DD HH:mm:ss') : '-';
};

interface LastTerminationSectionProps {
    container: Container;
}

export const LastTerminationSection = ({ container }: LastTerminationSectionProps) => {
    if (!hasLastTermination(container)) {
        return null;
    }
    const termination = container.lastTermination;
    return (
        <>
            <SectionBar title="上一次终止" />
            <InfoGrid style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <InfoItem>
                    <label>原因</label>
                    <span>{termination?.reason || '-'}</span>
                </InfoItem>
                <InfoItem>
                    <label>退出码</label>
                    <span>{termination?.exitCode ?? '-'}</span>
                </InfoItem>
                <InfoItem>
                    <label>开始时间</label>
                    <span>{formatTerminationTime(termination?.startedAt)}</span>
                </InfoItem>
                <InfoItem>
                    <label>结束时间</label>
                    <span>{formatTerminationTime(termination?.finishedAt)}</span>
                </InfoItem>
            </InfoGrid>
        </>
    );
};

import {Tag} from '@/design';

import {semantic} from '@/constants/colors';

import {statusLabel, statusTone} from '../podStatus';
import {TitleBarRow, TitleName} from './PodDetailDrawer.style';

import type {Pod} from '@/interface/entities/pod';
import type {StatusTone} from '../podStatus';

const toneColor: Record<StatusTone, string> = {
    success: semantic.state.success.default,
    info: semantic.state.info.default,
    warning: semantic.state.warning.default,
    error: semantic.state.error.default,
};

interface PodDetailTitleProps {
    podName: string;
    pod: Pod | undefined;
}

/** Pod 详情标题：Pod 名 + 状态标签，供 Drawer 与独立页面共用 */
export const PodDetailTitle = ({ podName, pod }: PodDetailTitleProps) => (
    <TitleBarRow>
        <TitleName>{podName}</TitleName>
        {pod && <Tag color={toneColor[statusTone(pod.status)]}>{statusLabel(pod.status)}</Tag>}
    </TitleBarRow>
);

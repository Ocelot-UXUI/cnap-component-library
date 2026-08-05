import styled from '@emotion/styled';
import {Tabs} from '@/design';

import {spacing} from '@/constants/spacing';
import type {Container} from '@/interface/entities/pod';

import {ContainerDetail} from './ContainerDetail';
import {ContainerEvents} from './ContainerEvents';
import {ContainerLogs} from './ContainerLogs';
import {ContainerTerminal} from './ContainerTerminal';

const ContainerContentTabs = styled(Tabs)`
    &.ant-5-tabs-top > .ant-5-tabs-nav,
    &.ant-5-tabs-top > .ant-5-tabs-content-holder {
        padding-inline: ${spacing.l}px;
    }
    &.ant-5-tabs-top > .ant-5-tabs-body-holder {
        padding-inline: 16px;
    }
`;

interface ContainerSubTabsProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    container: Container;
    creationTimestamp?: string;
    podIp?: string;
}

export const ContainerSubTabs = ({
    appEnvID,
    clusterId,
    podName,
    container,
    creationTimestamp,
    podIp,
}: ContainerSubTabsProps) => (
    <ContainerContentTabs
        defaultActiveKey="detail"
        items={[
            {
                key: 'detail',
                label: '详细信息',
                children: <ContainerDetail container={container} creationTimestamp={creationTimestamp} podIp={podIp} />,
            },
            {
                key: 'logs',
                label: '日志',
                children: (
                    <ContainerLogs
                        appEnvID={appEnvID}
                        clusterId={clusterId}
                        podName={podName}
                        containerName={container.name}
                    />
                ),
            },
            { key: 'terminal', label: '终端', children: (
                <ContainerTerminal
                    appEnvID={appEnvID}
                    clusterId={clusterId}
                    podName={podName}
                    containerName={container.name}
                />
            ) },
            {
                key: 'events',
                label: '事件',
                children: (
                    <ContainerEvents
                        appEnvID={appEnvID}
                        clusterId={clusterId}
                        podName={podName}
                        container={container.name}
                    />
                ),
            },
        ]}
    />
);

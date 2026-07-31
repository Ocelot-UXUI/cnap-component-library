import styled from '@emotion/styled';
import {Badge, Empty, Tabs} from 'antd';
import {useMemo, useState} from 'react';

import {semantic} from '@/constants/colors';
import {radius} from '@/constants/radius';
import {spacing} from '@/constants/spacing';
import {typography} from '@/constants/typography';
import type {Pod} from '@/interface/entities/pod';

import {containerBadge, orderedContainers} from './containerOrder';
import {ContainerSubTabs} from './ContainerSubTabs';

const ContainerTabs = styled(Tabs)`
    padding: ${spacing.xs}px;
    background: ${semantic.bg.page};
    border-radius: ${radius.xl}px;

    &.ant-5-tabs-top > .ant-5-tabs-nav {
        margin: 0;
    }

    &.ant-5-tabs-top > .ant-5-tabs-nav::before,
    &.ant-5-tabs-top > .ant-5-tabs-nav .ant-5-tabs-ink-bar {
        display: none;
    }

    &.ant-5-tabs-top > .ant-5-tabs-nav .ant-5-tabs-nav-list {
        gap: ${spacing.xs}px;
    }

    &.ant-5-tabs-top > .ant-5-tabs-nav .ant-5-tabs-tab {
        height: 40px;
        margin: 0;
        padding: ${spacing.s}px ${spacing.l}px;
        border-radius: ${radius.xl}px ${radius.xl}px 0 0;
        color: ${semantic.text.tertiary};
    }

    &.ant-5-tabs-top > .ant-5-tabs-nav .ant-5-tabs-tab-active {
        padding-inline: ${spacing.m}px;
        background: ${semantic.bg.default};
    }

    &.ant-5-tabs-top > .ant-5-tabs-content-holder {
        background: ${semantic.bg.default};
    }
`;

const ContainerTabLabel = styled.span`
    display: inline-flex;
    align-items: center;
    ${typography.body.medium}

    .ant-5-badge-status-text {
        color: inherit;
    }
`;

const ContainerType = styled.span`
    margin-left: ${spacing.s}px;
    padding: 0 ${spacing.s}px;
    border-radius: ${radius.xl}px;
    background: ${semantic.border.card};
    color: ${semantic.text.tertiary};
    ${typography.caption.tiny}

    .ant-5-tabs-tab-active & {
        background: ${semantic.border.divider};
        color: ${semantic.text.secondary};
    }
`;

interface ContainerAreaProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    pod: Pod;
}

export const ContainerArea = ({ appEnvID, clusterId, podName, pod }: ContainerAreaProps) => {
    const containers = useMemo(() => orderedContainers(pod.containers, pod.initContainers), [pod]);
    const [activeName, setActiveName] = useState(containers[0]?.name);

    if (containers.length === 0) {
        return <Empty description="该 Pod 无容器" />;
    }

    const active = containers.find(item => item.name === activeName) ?? containers[0];

    return (
        <ContainerTabs
            activeKey={active.name}
            onChange={setActiveName}
            items={containers.map(container => {
                const badge = containerBadge(container.type);
                return {
                    key: container.name,
                    label: (
                        <ContainerTabLabel>
                            <Badge status={badge.primary ? 'success' : 'default'} text={container.name} />
                            <ContainerType>{badge.label}</ContainerType>
                        </ContainerTabLabel>
                    ),
                    children: (
                        <ContainerSubTabs
                            appEnvID={appEnvID}
                            clusterId={clusterId}
                            podName={podName}
                            container={container}
                            creationTimestamp={pod.creationTimestamp}
                            podIp={pod.podIp}
                        />
                    ),
                };
            })}
        />
    );
};

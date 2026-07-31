import {Alert, Button, Drawer, Spin, Tag} from 'antd';
import {useEffect, useState} from 'react';

import runtimeResourceApi from '@/api/runtimeResource';
import Standalone from '@/assets/standalone.svg?react';
import {semantic} from '@/constants/colors';
import type {Container, ContainerUsage, Pod, PodDetailUsage} from '@/interface/entities/pod';
import {statusLabel, statusTone} from '../podStatus';
import {BasicInfoCard} from './BasicInfoCard';
import {ContainerArea} from './ContainerArea';
import {OwnershipRow, TitleBarRow, TitleName} from './PodDetailDrawer.style';

function mergeContainerUsages(containers: Container[] | undefined, usages: ContainerUsage[] | null | undefined) {
    const usageByName = new Map<string, ContainerUsage['resourceUsages']>();
    const duplicates = new Set<string>();
    (usages ?? []).forEach(usage => {
        if (usageByName.has(usage.name)) {
            duplicates.add(usage.name);
        } else {
            usageByName.set(usage.name, usage.resourceUsages);
        }
    });
    duplicates.forEach(name => usageByName.delete(name));
    return containers?.map(container => ({ ...container, resourceUsages: usageByName.get(container.name) }));
}

export function mergePodDetailUsage(pod: Pod, usage?: PodDetailUsage): Pod {
    return {
        ...pod,
        resourceUsages: usage?.resourceUsages,
        containers: mergeContainerUsages(pod.containers, usage?.containers),
        initContainers: mergeContainerUsages(pod.initContainers, usage?.initContainers),
    };
}

const toneColor = {
    success: semantic.state.success.default,
    info: semantic.state.info.default,
    warning: semantic.state.warning.default,
    error: semantic.state.error.default,
};

interface PodDetailDrawerProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    open: boolean;
    onClose: () => void;
}

export const PodDetailDrawer = ({ appEnvID, clusterId, podName, open, onClose }: PodDetailDrawerProps) => {
    const [pod, setPod] = useState<Pod | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        if (!open) {
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(false);
        const detailParams = { appEnvID, clusterId, podName };
        Promise.all([
            runtimeResourceApi.getPodDetail(detailParams),
            runtimeResourceApi.getPodDetailUsage(detailParams).catch(() => undefined),
        ])
            .then(([result, usage]) => !cancelled && setPod(mergePodDetailUsage(result, usage)))
            .catch(() => !cancelled && setError(true))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [open, appEnvID, clusterId, podName, nonce]);

    const title = (
        <TitleBarRow>
            <TitleName>{podName}</TitleName>
            {pod && <Tag color={toneColor[statusTone(pod.status)]}>{statusLabel(pod.status)}</Tag>}
        </TitleBarRow>
    );

    return (
        <Drawer
            open={open}
            width={980}
            title={title}
            onClose={onClose}
            extra={<Button type="text" icon={<Standalone width="1em" height="1em" />} />}
            styles={{ body: { paddingTop: 12 } }}
        >
            {loading && <Spin />}
            {error && (
                <Alert
                    type="error"
                    message="加载失败"
                    action={<a onClick={() => setNonce(value => value + 1)}>重试</a>}
                />
            )}
            {!loading && !error && pod && (
                <>
                    <OwnershipRow>
                        <span>
                            <b>应用:</b>
                            {pod.applicationName ?? '-'}
                        </span>
                        <span>
                            <b>集群:</b>
                            {pod.clusterName ?? pod.clusterId}
                        </span>
                        <span>
                            <b>工作负载:</b>
                            {pod.workloadName ?? '-'}
                        </span>
                    </OwnershipRow>
                    <BasicInfoCard pod={pod} />
                    <ContainerArea appEnvID={appEnvID} clusterId={clusterId} podName={podName} pod={pod} />
                </>
            )}
        </Drawer>
    );
};

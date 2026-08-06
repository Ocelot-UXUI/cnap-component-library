import {EllipsisOutlined, ThunderboltOutlined} from '@ant-design/icons';
import {Button, Dropdown, Flex, Tooltip, Typography} from '@/design';

import {ClusterNameLabel} from '@/components/ClusterNameLabel';
import {semantic} from '@/constants/colors';
import type {ContainerPort, Pod, PodOperation} from '@/interface/entities/pod';
import {formatAbsoluteTime, formatAge} from './duration';
import {getPodOperationIcon} from './PodOperationIcons';
import {statusLabel, statusTone} from './podStatus';
import {StatusTag, TruncateStart} from './podCells.style';
import {spacing} from '@/constants/spacing';

export function renderStatus(pod: Pod, detailed: boolean) {
    const tone = statusTone(pod.status);
    return (
        <div>
            <Tooltip title={pod.status}>
                <StatusTag $tone={tone}>{statusLabel(pod.status)}</StatusTag>
            </Tooltip>
            {detailed && (
                <div style={{ color: semantic.text.tertiary }}>
                    {pod.readyContainers ?? 0}/{pod.totalContainers ?? 0}
                </div>
            )}
        </div>
    );
}

const VERSION_MAX_LENGTH = 12;

export function truncateVersion(version: string): string {
    return version.length > VERSION_MAX_LENGTH ? `${version.slice(0, 5)}...${version.slice(-4)}` : version;
}

function renderVersion(version: string) {
    const truncated = truncateVersion(version);
    const node = <span style={{ marginLeft: 8, verticalAlign: 'top' }}>v{truncated}</span>;
    return truncated === version ? node : <Tooltip title={`v${version}`}>{node}</Tooltip>;
}

export function renderName(pod: Pod, detailed: boolean) {
    return (
        <div style={{maxWidth: '220px'}}>
            <Typography.Text copyable={{ text: pod.name }}>
                <Tooltip title={pod.name}>
                    <TruncateStart>{pod.name}</TruncateStart>
                </Tooltip>
            </Typography.Text>
            {detailed && (
                <div style={{ color: semantic.text.tertiary }}>
                    <ClusterNameLabel clusterName={pod.clusterName ?? pod.clusterId} clusterId={pod.clusterId} />
                    {pod.version && renderVersion(pod.version)}
                </div>
            )}
        </div>
    );
}

export function renderIp(pod: Pod, detailed: boolean) {
    return (
        <div>
            <Typography.Text copyable={{ text: pod.podIp ?? '' }}>{pod.podIp ?? '-'}</Typography.Text>
            {detailed && <div style={{ color: semantic.text.tertiary }}>{pod.hostIp ?? '-'}</div>}
        </div>
    );
}

function formatPort(port: ContainerPort): string {
    return port.name ? `${port.name}:${port.port}` : String(port.port);
}

export function renderPorts(pod: Pod, detailed: boolean) {
    const ports = (pod.containers ?? []).flatMap(container => container.ports ?? []);
    if (ports.length === 0) {
        return '-';
    }

    const visibleCount = detailed ? 2 : 1;
    const visiblePorts = ports.slice(0, visibleCount);
    const hiddenPorts = ports.slice(visibleCount);
    const content = (
        <span>
            {visiblePorts.map((port, index) => (
                <span key={`${port.name}-${port.port}-${index}`} style={{ display: 'block' }}>
                    {formatPort(port)}
                    {index === visiblePorts.length - 1 && hiddenPorts.length > 0 && (
                        <span style={{ color: semantic.text.placeholder }}>+{hiddenPorts.length}</span>
                    )}
                </span>
            ))}
        </span>
    );

    const hiddenContent = hiddenPorts.map((port, index) => (
        <div key={`${port.name}-${port.port}-${index}`}>{formatPort(port)}</div>
    ));

    return hiddenPorts.length > 0 ? <Tooltip title={hiddenContent}>{content}</Tooltip> : content;
}

export function renderRestarts(pod: Pod) {
    const restarts = pod.restarts ?? 0;
    const color = restarts >= 6
        ? semantic.state.error.default
        : restarts >= 3
        ? semantic.state.warning.default
        : semantic.text.primary;
    return (
        <Tooltip title={pod.lastStartedAt ? `上次启动：${formatAbsoluteTime(pod.lastStartedAt)}` : undefined}>
            <span style={{ color }}>{restarts}</span>
        </Tooltip>
    );
}

export function renderAge(pod: Pod) {
    const age = formatAge(pod.creationTimestamp);
    if (!pod.creationTimestamp) {
        return age;
    }
    return <Tooltip title={formatAbsoluteTime(pod.creationTimestamp)}><span>{age}</span></Tooltip>;
}

export function renderOperations(pod: Pod, onOperation: (pod: Pod, operation: PodOperation) => void) {
    const ops: PodOperation[] = (pod.operations ?? []).filter(op => !op.disabled);
    const outer = ops.length > 3 ? ops.slice(0, 2) : ops.slice(0, 3);
    const rest = ops.slice(outer.length);
    return (
        <Flex gap={spacing.s}>
            {outer.map(op => (
                <Tooltip key={op.name} title={op.displayName}>
                    <Button
                        type="text"
                        icon={getPodOperationIcon(op, <ThunderboltOutlined />)}
                        onClick={() => onOperation(pod, op)}
                    />
                </Tooltip>
            ))}
            {rest.length > 0 && (
                <Dropdown
                    menu={{
                        items: rest.map(op => ({ key: op.name, label: op.displayName })),
                        onClick: ({ key }: { key: string; }) => {
                            const op = rest.find(item => item.name === key);
                            if (op) {
                                onOperation(pod, op);
                            }
                        },
                    }}
                >
                    <Button type="text" aria-label="更多操作" icon={<EllipsisOutlined />} />
                </Dropdown>
            )}
        </Flex>
    );
}

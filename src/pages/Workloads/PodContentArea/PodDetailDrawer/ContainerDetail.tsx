import {Tag, Tooltip, Typography} from 'antd';

import {semantic} from '@/constants/colors';
import type {Container} from '@/interface/entities/pod';
import {formatAbsoluteTime, formatAge} from '../duration';
import {statusLabel, statusTone} from '../podStatus';
import {EnvTable, MountsTable, PortsTable} from './detailTables';
import {LastTerminationSection} from './LastTerminationSection';
import {InfoGrid, InfoItem} from './PodDetailDrawer.style';
import {ResourceUsageView} from './ResourceUsageView';
import {SectionBar} from './SectionBar';

const toneColor = {
    success: semantic.state.success.default,
    info: semantic.state.info.default,
    warning: semantic.state.warning.default,
    error: semantic.state.error.default,
};

interface ContainerDetailProps {
    container: Container;
    creationTimestamp?: string;
    podIp?: string;
}

const hasCopyablePorts = (podIp: string | undefined, container: Container): boolean =>
    Boolean(podIp && container.ports?.length);

// eslint-disable-next-line complexity
export const ContainerDetail = ({ container, creationTimestamp, podIp }: ContainerDetailProps) => {
    return (
        <div>
            <SectionBar title="基本信息" />
            <InfoGrid>
                <InfoItem>
                    <label>状态</label>
                    <Tag color={toneColor[statusTone(container.status)]}>{statusLabel(container.status)}</Tag>
                </InfoItem>
                <InfoItem>
                    <label>重启次数</label>
                    <span>{container.restarts}</span>
                </InfoItem>
                <InfoItem>
                    <label>存活时间</label>
                    {creationTimestamp
                        ? (
                            <Tooltip title={formatAbsoluteTime(creationTimestamp)}>
                                <span>{formatAge(creationTimestamp)}</span>
                            </Tooltip>
                        )
                        : <span>{formatAge(creationTimestamp)}</span>}
                </InfoItem>
                <InfoItem>
                    <label>类型</label>
                    <span>{container.type}</span>
                </InfoItem>
            </InfoGrid>
            <InfoGrid style={{ gridTemplateColumns: '1fr', marginTop: 12 }}>
                <InfoItem>
                    <label>镜像</label>
                    <span>{container.image || '-'}</span>
                </InfoItem>
                <InfoItem>
                    <label>启动命令</label>
                    <span>{container.cmdline || '-'}</span>
                </InfoItem>
                <ResourceUsageView container={container} />
            </InfoGrid>

            <SectionBar title={<>端口 <em>{container.ports?.length ?? 0}</em></>}>
                {hasCopyablePorts(podIp, container) && (
                    <Typography.Text
                        copyable={{
                            text: (container.ports ?? []).map(port => `${podIp}:${port.port}`).join('\n'),
                        }}
                    >
                        复制全部 IP:PORT
                    </Typography.Text>
                )}
            </SectionBar>
            <PortsTable podIp={podIp} ports={container.ports ?? []} />

            <SectionBar title={<>挂载 <em>{container.volumeMounts?.length ?? 0}</em></>} />
            <MountsTable mounts={container.volumeMounts ?? []} />

            <SectionBar title={<>环境变量 <em>{container.env?.length ?? 0}</em></>} />
            <EnvTable env={container.env ?? []} />

            <LastTerminationSection container={container} />
        </div>
    );
};

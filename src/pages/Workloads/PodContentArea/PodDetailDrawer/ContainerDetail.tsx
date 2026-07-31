import {CopyOutlined} from '@ant-design/icons';
import {Button, Tag} from 'antd';

import {semantic} from '@/constants/colors';
import type {Container} from '@/interface/entities/pod';
import {formatAge} from '../duration';
import {statusLabel, statusTone} from '../podStatus';
import {copyPortAddresses, EnvTable, MountsTable, PortsTable} from './detailTables';
import {LastTerminationSection} from './LastTerminationSection';
import {InfoGrid, InfoItem, SectionBar} from './PodDetailDrawer.style';
import {ResourceUsageView} from './ResourceUsageView';

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

export const ContainerDetail = ({ container, creationTimestamp, podIp }: ContainerDetailProps) => {
    return (
        <div>
            <SectionBar>基本信息</SectionBar>
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
                    <span>{formatAge(creationTimestamp)}</span>
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

            <SectionBar>
                端口 <em>{container.ports?.length ?? 0}</em>
                <Button
                    disabled={!hasCopyablePorts(podIp, container)}
                    icon={<CopyOutlined />}
                    size="small"
                    type="text"
                    onClick={() => copyPortAddresses(podIp, container.ports ?? [])}
                >
                    复制全部 IP:PORT
                </Button>
            </SectionBar>
            <PortsTable podIp={podIp} ports={container.ports ?? []} />

            <SectionBar>
                挂载 <em>{container.volumeMounts?.length ?? 0}</em>
            </SectionBar>
            <MountsTable mounts={container.volumeMounts ?? []} />

            <SectionBar>
                环境变量 <em>{container.env?.length ?? 0}</em>
            </SectionBar>
            <EnvTable env={container.env ?? []} />

            <LastTerminationSection container={container} />
        </div>
    );
};

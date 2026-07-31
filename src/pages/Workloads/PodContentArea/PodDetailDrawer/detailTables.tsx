import {CopyOutlined} from '@ant-design/icons';
import {Button, message, Table, Tooltip} from 'antd';
import type {TableColumnsType} from 'antd';

import {semantic} from '@/constants/colors';
import type {ContainerPort, EnvVar, VolumeMount} from '@/interface/entities/pod';

const placeholder = <span style={{ color: semantic.text.placeholder }}>-</span>;

export const copyPortAddresses = async (podIp: string | undefined, ports: ContainerPort[]): Promise<void> => {
    if (!podIp || ports.length === 0) {
        return;
    }

    const addresses = ports.map(({ port }) => `${podIp}:${port}`).join('\n');
    try {
        await navigator.clipboard.writeText(addresses);
        message.success('已复制到剪贴板');
    } catch {
        message.error('复制失败');
    }
};

interface PortsTableProps {
    podIp?: string;
    ports: ContainerPort[];
}

export const PortsTable = ({ podIp, ports }: PortsTableProps) => {
    const columns: TableColumnsType<ContainerPort> = [
        { title: '端口类型', dataIndex: 'protocol', key: 'protocol', render: value => value || placeholder },
        { title: '端口名称', dataIndex: 'name', key: 'name', render: value => value || placeholder },
        { title: '端口号', dataIndex: 'port', key: 'port' },
        {
            title: '操作',
            key: 'action',
            width: 100,
            render: (_, port) => (
                <Tooltip title={podIp ? '复制 IP:PORT' : '暂无 Pod IP'}>
                    <span>
                        <Button
                            aria-label="复制 IP:PORT"
                            disabled={!podIp}
                            icon={<CopyOutlined />}
                            size="small"
                            type="text"
                            onClick={() => copyPortAddresses(podIp, [port])}
                        />
                    </span>
                </Tooltip>
            ),
        },
    ];
    return (
        <Table<ContainerPort>
            rowKey={(_, index) => String(index)}
            columns={columns}
            dataSource={ports}
            pagination={false}
        />
    );
};

export const MountsTable = ({ mounts }: { mounts: VolumeMount[]; }) => {
    const columns: TableColumnsType<VolumeMount> = [
        { title: '类型', dataIndex: 'type', key: 'type', render: value => value || placeholder },
        { title: '挂载路径', dataIndex: 'mountPath', key: 'mountPath', render: value => value || placeholder },
        { title: '来源', key: 'source', render: (_, row) => row.configMap?.name || row.name || placeholder },
        { title: '操作', key: 'readOnly', render: (_, row) => (row.readOnly ? '只读' : '读写') },
    ];
    return (
        <Table<VolumeMount>
            rowKey={(_, index) => String(index)}
            columns={columns}
            dataSource={mounts}
            pagination={false}
        />
    );
};

export const EnvTable = ({ env }: { env: EnvVar[]; }) => {
    const columns: TableColumnsType<EnvVar> = [
        { title: '名称', dataIndex: 'name', key: 'name' },
        { title: '值', dataIndex: 'value', key: 'value', render: value => value || placeholder },
        { title: '来源', key: 'source', render: () => placeholder },
    ];
    return (
        <Table<EnvVar>
            rowKey={(_, index) => String(index)}
            columns={columns}
            dataSource={env}
            pagination={false}
        />
    );
};

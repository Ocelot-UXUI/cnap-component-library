import {CopyOutlined} from '@ant-design/icons';
import {Table, Tooltip, Typography} from '@/design';
import type {TableColumnsType} from '@/design';

import {semantic} from '@/constants/colors';
import type {ContainerPort, EnvVar, VolumeMount} from '@/interface/entities/pod';

const placeholder = <span style={{ color: semantic.text.placeholder }}>-</span>;

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
            render: (_, port) =>
                podIp
                    ? (
                        <Typography.Text
                            copyable={{
                                text: `${podIp}:${port.port}`,
                                tooltips: ['复制 IP:PORT', '已复制'],
                            }}
                        />
                    )
                    : (
                        <Tooltip title="暂无 Pod IP">
                            <CopyOutlined style={{ color: semantic.text.disabled }} />
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

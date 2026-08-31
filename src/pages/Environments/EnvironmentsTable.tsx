/* eslint-disable max-lines */
/**
 * 环境表格组件
 */
import {Dropdown, Table} from '@/design';
import {Environment} from '@/types/environment';
import {useTranslation} from '@/utils/i18n';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    CloudServerOutlined,
    DeleteOutlined,
    EyeOutlined,
    LockOutlined,
    MoreOutlined,
    SettingOutlined,
    UnlockOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {Tag, Tooltip} from '@/design';
import type {ColumnsType} from '@/design';
import {
    actionIconClass,
    clusterTagClass,
    envDescClass,
    envNameClass,
    envTypeTagClass,
    expiresIconClass,
    expiresWarningClass,
    permanentTextClass,
    statusErrorClass,
    statusHealthyClass,
    statusWarningClass,
} from './styles';

interface EnvironmentsTableProps {
    environments: Environment[];
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'healthy':
            return <CheckCircleOutlined className={statusHealthyClass} />;
        case 'warning':
            return <WarningOutlined className={statusWarningClass} />;
        case 'error':
            return <CloseCircleOutlined className={statusErrorClass} />;
        default:
            return null;
    }
};

export const EnvironmentsTable = ({ environments }: EnvironmentsTableProps) => {
    const { t } = useTranslation();

    const menuItems = [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: <span data-ai-action="viewEnvironment">查看详情</span>,
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <span data-ai-action="settingsEnvironment">环境设置</span>,
        },
        { type: 'divider' as const },
        {
            key: 'delete',
            icon: <DeleteOutlined />,
            label: <span data-ai-action="deleteEnvironment">删除</span>,
            danger: true,
        },
    ];

    const columns: ColumnsType<Environment> = [
        {
            title: '环境名称',
            dataIndex: 'displayName',
            key: 'displayName',
            width: 200,
            render: (text, record) => (
                <div>
                    <div className={envNameClass}>{text}</div>
                    <div className={envDescClass}>{record.name}</div>
                </div>
            ),
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: type => (
                <Tag className={envTypeTagClass(type)}>
                    {t(`pages.environments.${type}`)}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: status => (
                <Tooltip title={status === 'healthy' ? '健康' : status === 'warning' ? '警告' : '错误'}>
                    {getStatusIcon(status)}
                </Tooltip>
            ),
        },
        {
            title: '应用数',
            dataIndex: 'applications',
            key: 'applications',
            width: 80,
            align: 'center',
        },
        {
            title: '集群',
            dataIndex: 'clusters',
            key: 'clusters',
            width: 200,
            render: (clusters: string[]) => (
                <div>
                    {clusters.map(cluster => (
                        <Tag key={cluster} icon={<CloudServerOutlined />} className={clusterTagClass}>
                            {cluster}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: '所有者',
            dataIndex: 'owner',
            key: 'owner',
            width: 120,
        },
        {
            title: '保护状态',
            dataIndex: 'protected',
            key: 'protected',
            width: 100,
            render: protected_ => (protected_
                ? <Tag icon={<LockOutlined />} color="blue">受保护</Tag>
                : <Tag icon={<UnlockOutlined />}>未保护</Tag>),
        },
        {
            title: '过期时间',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            width: 120,
            render: expiresAt => (expiresAt
                ? (
                    <span className={expiresWarningClass}>
                        <ClockCircleOutlined className={expiresIconClass} />
                        {expiresAt}
                    </span>
                )
                : <span className={permanentTextClass}>永久</span>),
        },
        {
            title: '最后部署',
            dataIndex: 'lastDeployment',
            key: 'lastDeployment',
            width: 120,
        },
        {
            title: '操作',
            key: 'actions',
            width: 60,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{ items: menuItems }}
                    placement="bottomRight"
                    data-ai-action="openEnvironmentMenu"
                    data-ai-entity={`environment:${record.id}`}
                >
                    <MoreOutlined className={actionIconClass} />
                </Dropdown>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={environments}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1200 }}
            data-ai-entity="environment"
            data-ai-desc="环境列表表格"
        />
    );
};

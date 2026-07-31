/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable max-lines */
import {RocketOutlined} from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Select,
    Space,
    Switch,
    Table,
    Tag,
} from 'antd';
import type {TableColumnsType} from 'antd';
import {useState} from 'react';
import {useParams} from 'react-router-dom';

interface Deployment {
    id: string;
    status: 'success' | 'failed' | 'running' | 'pending';
    version: string;
    description: string;
    cluster: string;
    changeType: 'deploy' | 'rollback' | 'scale' | 'update';
    startTime: string;
}

const mockDeployments: Deployment[] = [
    {
        id: 'DEP-001',
        status: 'success',
        version: 'v1.2.3',
        description: '修复用户登录bug',
        cluster: '生产集群-A',
        changeType: 'deploy',
        startTime: '2026-03-11 10:30:00',
    },
    {
        id: 'DEP-002',
        status: 'running',
        version: 'v1.2.4',
        description: '新增订单功能模块',
        cluster: '生产集群-B',
        changeType: 'deploy',
        startTime: '2026-03-11 14:20:00',
    },
    {
        id: 'DEP-003',
        status: 'failed',
        version: 'v1.2.2',
        description: '回滚到稳定版本',
        cluster: '生产集群-A',
        changeType: 'rollback',
        startTime: '2026-03-10 18:45:00',
    },
    {
        id: 'DEP-004',
        status: 'pending',
        version: 'v1.3.0',
        description: '重构支付服务',
        cluster: '测试集群',
        changeType: 'update',
        startTime: '2026-03-11 16:00:00',
    },
];

const getStatusConfig = (status: Deployment['status']) => {
    switch (status) {
        case 'success':
            return { color: 'green', text: '成功' };
        case 'failed':
            return { color: 'red', text: '失败' };
        case 'running':
            return { color: 'blue', text: '运行中' };
        case 'pending':
            return { color: 'orange', text: '待部署' };
        default:
            return { color: 'default', text: '未知' };
    }
};

const getChangeTypeConfig = (type: Deployment['changeType']) => {
    switch (type) {
        case 'deploy':
            return { color: 'blue', text: '部署' };
        case 'rollback':
            return { color: 'orange', text: '回滚' };
        case 'scale':
            return { color: 'purple', text: '扩缩容' };
        case 'update':
            return { color: 'cyan', text: '更新' };
        default:
            return { color: 'default', text: '未知' };
    }
};

export default function DeploymentsPage() {
    const { appId } = useParams<{ appId: string; }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    // 根据 appId 获取应用名称（实际应该从 API 获取）
    const getAppName = (id: string) => {
        const appNames: Record<string, string> = {
            '1': '用户服务',
            '2': '订单服务',
            '3': '前端应用',
        };
        return appNames[id] || `应用 ${id}`;
    };

    const columns: TableColumnsType<Deployment> = [
        {
            title: '部署ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: Deployment['status']) => {
                const config = getStatusConfig(status);
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '包版本',
            dataIndex: 'version',
            key: 'version',
            width: 120,
        },
        {
            title: '上线描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '集群',
            dataIndex: 'cluster',
            key: 'cluster',
            width: 150,
        },
        {
            title: '变更类型',
            dataIndex: 'changeType',
            key: 'changeType',
            width: 100,
            render: (type: Deployment['changeType']) => {
                const config = getChangeTypeConfig(type);
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 180,
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: unknown, record: Deployment) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        data-ai-action="viewDeploymentDetails"
                        data-ai-entity={`deployment:${record.id}`}
                    >
                        详情
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        data-ai-action="viewDeploymentLogs"
                        data-ai-entity={`deployment:${record.id}`}
                    >
                        日志
                    </Button>
                </Space>
            ),
        },
    ];

    const handleDeploy = () => {
        setIsModalOpen(true);
    };

    const handleModalOk = () => {
        form.validateFields()
            .then(values => {
                console.log('部署表单数据:', values);
                setIsModalOpen(false);
                form.resetFields();
            })
            .catch(info => {
                console.log('表单验证失败:', info);
            });
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    return (
        <>
            <Alert
                description={`当前应用: ${getAppName(appId || '')}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Card
                title="部署记录"
                extra={
                    <Button
                        type="primary"
                        icon={<RocketOutlined />}
                        onClick={handleDeploy}
                        data-ai-action="deployApplication"
                        data-ai-entity="application"
                    >
                        部署应用
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={mockDeployments}
                    rowKey="id"
                    scroll={{ x: 1200 }}
                    pagination={{
                        total: mockDeployments.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: total => `共 ${total} 条`,
                    }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <RocketOutlined />
                        <span>应用部署</span>
                    </Space>
                }
                open={isModalOpen}
                onCancel={handleModalCancel}
                width={800}
                footer={
                    <Space>
                        <Button onClick={handleModalCancel}>取消</Button>
                        <Button
                            type="primary"
                            onClick={handleModalOk}
                            data-ai-action="submitDeploy"
                            data-ai-entity="deployment"
                        >
                            开始部署
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    autoComplete="off"
                    data-ai-role="form"
                    data-ai-entity="deployment"
                >
                    <Divider style={{ margin: '24px 0', fontWeight: 600 }}>基本信息</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="appName"
                                label="应用名称"
                                rules={[{ required: true, message: '请选择应用' }]}
                            >
                                <Select
                                    placeholder="请选择应用"
                                    data-ai-param="appName"
                                    options={[
                                        { value: 'user-service', label: '用户服务' },
                                        { value: 'order-service', label: '订单服务' },
                                        { value: 'payment-service', label: '支付服务' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="version"
                                label="版本号"
                                rules={[{ required: true, message: '请输入版本号' }]}
                            >
                                <Input placeholder="如: v1.2.3" data-ai-param="version" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="上线描述"
                        rules={[{ required: true, message: '请输入上线描述' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="请简要描述本次上线的内容..."
                            maxLength={200}
                            showCount
                            data-ai-param="description"
                        />
                    </Form.Item>

                    <Divider style={{ margin: '24px 0', fontWeight: 600 }}>部署配置</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="cluster"
                                label="目标集群"
                                rules={[{ required: true, message: '请选择集群' }]}
                            >
                                <Select
                                    placeholder="请选择集群"
                                    data-ai-param="cluster"
                                    options={[
                                        { value: 'prod-a', label: '生产集群-A' },
                                        { value: 'prod-b', label: '生产集群-B' },
                                        { value: 'test', label: '测试集群' },
                                        { value: 'dev', label: '开发集群' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="changeType"
                                label="变更类型"
                                rules={[{ required: true, message: '请选择变更类型' }]}
                            >
                                <Select
                                    placeholder="请选择变更类型"
                                    data-ai-param="changeType"
                                    options={[
                                        { value: 'deploy', label: '部署' },
                                        { value: 'update', label: '更新' },
                                        { value: 'rollback', label: '回滚' },
                                        { value: 'scale', label: '扩缩容' },
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="replicas"
                                label="实例数量"
                                rules={[{ required: true, message: '请输入实例数量' }]}
                                initialValue={3}
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="请输入实例数量"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="startTime"
                                label="开始时间"
                            >
                                <DatePicker
                                    showTime
                                    style={{ width: '100%' }}
                                    placeholder="留空则立即开始"
                                    format="YYYY-MM-DD HH:mm:ss"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="strategy"
                        label="部署策略"
                        rules={[{ required: true, message: '请选择部署策略' }]}
                        initialValue="rolling"
                    >
                        <Radio.Group>
                            <Radio value="rolling">滚动更新</Radio>
                            <Radio value="blue-green">蓝绿部署</Radio>
                            <Radio value="canary">金丝雀发布</Radio>
                        </Radio.Group>
                    </Form.Item>

                    <Divider style={{ margin: '24px 0', fontWeight: 600 }}>高级配置</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="healthCheck"
                                label="健康检查"
                                valuePropName="checked"
                                initialValue
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" data-ai-param="healthCheck" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="autoRollback"
                                label="失败自动回滚"
                                valuePropName="checked"
                                initialValue
                            >
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" data-ai-param="autoRollback" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="cpuLimit"
                                label="CPU限制"
                                initialValue={2}
                            >
                                <Space.Compact style={{ width: '100%' }}>
                                    <InputNumber
                                        min={0.1}
                                        max={16}
                                        step={0.5}
                                        style={{ width: '100%' }}
                                    />
                                    <Button disabled>核</Button>
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="memoryLimit"
                                label="内存限制"
                                initialValue={4}
                            >
                                <Space.Compact style={{ width: '100%' }}>
                                    <InputNumber
                                        min={0.5}
                                        max={64}
                                        step={0.5}
                                        style={{ width: '100%' }}
                                    />
                                    <Button disabled>GB</Button>
                                </Space.Compact>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="envVars"
                        label="环境变量"
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="格式：KEY=VALUE，每行一个"
                        />
                    </Form.Item>

                    <Form.Item
                        name="notifyUsers"
                        label="通知人员"
                    >
                        <Select
                            mode="multiple"
                            placeholder="请选择通知人员"
                            options={[
                                { label: '张三', value: 'zhangsan' },
                                { label: '李四', value: 'lisi' },
                                { label: '王五', value: 'wangwu' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

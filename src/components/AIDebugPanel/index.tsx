/* eslint-disable max-lines */
/**
 * AI 执行器调试面板
 * 用于测试命令列表执行效果
 */
import {useAIExecutor} from '@/executor';
import type {TaskPlan} from '@/types/aiExecutor';
import {PlayCircleOutlined, StopOutlined} from '@ant-design/icons';
import {Button, Card, Input, message, Space, Tag, Typography} from 'antd';
import {useState} from 'react';

const { TextArea } = Input;
const { Text } = Typography;

// 预设的测试命令
const PRESET_PLANS: Record<string, TaskPlan> = {
    '跳转到环境管理': {
        id: 'test-1',
        description: '跳转到环境管理页面',
        steps: [
            { type: 'navigate', route: '/environments', description: '跳转到环境管理' },
        ],
    },
    '创建环境': {
        id: 'test-2',
        description: '跳转到环境管理并打开创建环境弹窗',
        steps: [
            { type: 'navigate', route: '/environments', description: '跳转到环境管理' },
            { type: 'wait', duration: 500, description: '等待页面加载' },
            {
                type: 'action',
                action: 'openCreateEnvironmentModal',
                entity: 'environment',
                description: '点击创建环境按钮',
            },
        ],
    },
    '创建环境并填写表单': {
        id: 'test-3',
        description: '跳转到环境管理，打开弹窗并填写表单',
        steps: [
            { type: 'navigate', route: '/environments', description: '跳转到环境管理' },
            { type: 'wait', duration: 500, description: '等待页面加载' },
            {
                type: 'action',
                action: 'openCreateEnvironmentModal',
                entity: 'environment',
                description: '点击创建环境按钮',
            },
            { type: 'wait', duration: 300, description: '等待弹窗打开' },
            { type: 'input', param: 'envName', value: 'prod-east', description: '输入环境标识' },
            { type: 'input', param: 'envDisplayName', value: '生产环境-东区', description: '输入显示名称' },
        ],
    },
    '多页面操作': {
        id: 'test-4',
        description: '依次访问多个页面',
        steps: [
            { type: 'navigate', route: '/applications', description: '跳转到应用列表' },
            { type: 'wait', duration: 1000 },
            { type: 'navigate', route: '/clusters', description: '跳转到集群管理' },
            { type: 'wait', duration: 1000 },
            { type: 'navigate', route: '/environments', description: '跳转到环境管理' },
            { type: 'wait', duration: 1000 },
            { type: 'navigate', route: '/settings', description: '跳转到设置页面' },
        ],
    },
};

export const AIDebugPanel = () => {
    const { state, execute, abort } = useAIExecutor();
    const [customPlan, setCustomPlan] = useState(JSON.stringify(PRESET_PLANS['跳转到环境管理'], null, 2));

    const handleExecute = async (plan: TaskPlan) => {
        try {
            message.info(`开始执行: ${plan.description}`);
            await execute(plan);
            message.success('执行完成!');
        } catch (err) {
            message.error(`执行失败: ${err}`);
        }
    };

    const handleCustomExecute = () => {
        try {
            const plan = JSON.parse(customPlan) as TaskPlan;
            handleExecute(plan);
        } catch {
            message.error('JSON 格式错误');
        }
    };

    return (
        <Card
            title="AI 执行器调试面板"
            extra={
                <Space>
                    <Text>状态:</Text>
                    <Tag
                        color={state.status === 'running'
                            ? 'processing'
                            : state.status === 'completed'
                            ? 'success'
                            : state.status === 'error'
                            ? 'error'
                            : 'default'}
                    >
                        {state.status}
                    </Tag>
                    {state.status === 'running' && (
                        <Button icon={<StopOutlined />} danger onClick={abort}>
                            停止
                        </Button>
                    )}
                </Space>
            }
            style={{ margin: 16 }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                    <Text strong>预设命令:</Text>
                    <div style={{ marginTop: 8 }}>
                        <Space wrap>
                            {Object.entries(PRESET_PLANS).map(([name, plan]) => (
                                <Button
                                    key={name}
                                    icon={<PlayCircleOutlined />}
                                    onClick={() => handleExecute(plan)}
                                    disabled={state.status === 'running'}
                                >
                                    {name}
                                </Button>
                            ))}
                        </Space>
                    </div>
                </div>

                <div>
                    <Text strong>自定义命令 (JSON):</Text>
                    <TextArea
                        value={customPlan}
                        onChange={e => setCustomPlan(e.target.value)}
                        rows={12}
                        style={{ marginTop: 8, fontFamily: 'monospace' }}
                    />
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleCustomExecute}
                        disabled={state.status === 'running'}
                        style={{ marginTop: 8 }}
                    >
                        执行自定义命令
                    </Button>
                </div>

                {state.currentPlan && (
                    <div>
                        <Text strong>当前执行:</Text>
                        <div style={{ marginTop: 8 }}>
                            <Text>任务: {state.currentPlan.description}</Text>
                            <br />
                            <Text>
                                进度: {state.currentStepIndex} / {state.currentPlan.steps.length}
                            </Text>
                        </div>
                    </div>
                )}
            </Space>
        </Card>
    );
};

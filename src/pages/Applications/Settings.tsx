import {Button, Divider, Form, Input, Select, Space} from 'antd';
import {useParams} from 'react-router-dom';

export default function ApplicationSettings() {
    const { appId } = useParams<{ appId: string; }>();
    const [form] = Form.useForm();

    const handleSubmit = (values: unknown) => {
        // eslint-disable-next-line no-console
        console.log('保存设置:', appId, values);
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            data-ai-role="form"
            data-ai-entity="application"
            initialValues={{
                name: '用户服务',
                description: '负责用户认证和授权的核心服务',
                owner: 'zhangsan',
                team: 'backend',
            }}
        >
            <Divider style={{ margin: '24px 0', fontWeight: 600 }}>基本设置</Divider>

            <Form.Item
                name="name"
                label="应用名称"
                rules={[{ required: true, message: '请输入应用名称' }]}
            >
                <Input placeholder="请输入应用名称" data-ai-param="appName" />
            </Form.Item>

            <Form.Item
                name="description"
                label="应用描述"
            >
                <Input.TextArea
                    rows={3}
                    placeholder="请输入应用描述"
                    data-ai-param="appDescription"
                />
            </Form.Item>

            <Form.Item
                name="owner"
                label="负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
            >
                <Select
                    placeholder="请选择负责人"
                    data-ai-param="owner"
                    options={[
                        { value: 'zhangsan', label: '张三' },
                        { value: 'lisi', label: '李四' },
                        { value: 'wangwu', label: '王五' },
                    ]}
                />
            </Form.Item>

            <Form.Item
                name="team"
                label="所属团队"
            >
                <Select
                    placeholder="请选择所属团队"
                    data-ai-param="team"
                    options={[
                        { value: 'backend', label: '后端开发组' },
                        { value: 'frontend', label: '前端开发组' },
                        { value: 'devops', label: 'DevOps团队' },
                    ]}
                />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        data-ai-action="submitSettings"
                        data-ai-entity="application"
                    >
                        保存设置
                    </Button>
                    <Button>取消</Button>
                </Space>
            </Form.Item>
        </Form>
    );
}

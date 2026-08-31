import {css} from '@emotion/css';
import {Button, Card, Form, Input, message, Modal, Space, Table, Typography} from '@/design';
import {useState} from 'react';

const containerClass = css`
    max-width: 1000px;
    margin: 0 auto;
`;

const sectionClass = css`
    margin-bottom: 24px;
`;

const titleClass = css`
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #1a1a1a;
`;

// 示例表格数据
const tableData = [
    { key: '1', name: '张三', age: 28, email: 'zhangsan@example.com' },
    { key: '2', name: '李四', age: 32, email: 'lisi@example.com' },
    { key: '3', name: '王五', age: 25, email: 'wangwu@example.com' },
];

const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '年龄', dataIndex: 'age', key: 'age' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    {
        title: '操作',
        key: 'action',
        render: () => (
            <Space>
                <Button type="link" size="small">编辑</Button>
                <Button type="link" size="small" danger>删除</Button>
            </Space>
        ),
    },
];

function ExamplePage() {
    const [form] = Form.useForm();
    const [modalOpen, setModalOpen] = useState(false);

    const handleSubmit = (values: Record<string, string>) => {
        message.success(`提交成功：${JSON.stringify(values)}`);
    };

    const showModal = () => setModalOpen(true);
    const hideModal = () => setModalOpen(false);

    return (
        <div className={containerClass}>
            <section className={sectionClass}>
                <Typography.Title level={3} className={titleClass}>按钮示例</Typography.Title>
                <Card>
                    <Space wrap>
                        <Button type="primary">主要按钮</Button>
                        <Button>默认按钮</Button>
                        <Button type="dashed">虚线按钮</Button>
                        <Button type="text">文本按钮</Button>
                        <Button type="link">链接按钮</Button>
                        <Button danger>危险按钮</Button>
                        <Button type="primary" onClick={showModal}>打开弹窗</Button>
                    </Space>
                </Card>
            </section>

            <section className={sectionClass}>
                <Typography.Title level={3} className={titleClass}>表单示例</Typography.Title>
                <Card>
                    <Form form={form} layout="inline" onFinish={handleSubmit}>
                        <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                            <Input placeholder="用户名" />
                        </Form.Item>
                        <Form.Item name="email" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
                            <Input placeholder="邮箱" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">提交</Button>
                        </Form.Item>
                    </Form>
                </Card>
            </section>

            <section className={sectionClass}>
                <Typography.Title level={3} className={titleClass}>表格示例</Typography.Title>
                <Card>
                    <Table columns={columns} dataSource={tableData} pagination={false} />
                </Card>
            </section>

            <Modal title="示例弹窗" open={modalOpen} onOk={hideModal} onCancel={hideModal}>
                <p>这是一个示例弹窗内容。</p>
            </Modal>
        </div>
    );
}

export default ExamplePage;

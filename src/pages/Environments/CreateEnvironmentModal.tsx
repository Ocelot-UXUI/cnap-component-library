/* eslint-disable no-console */
/**
 * 创建环境 Modal
 */
import {Form, Input, Select} from '@/components/ai';
import {Input as AntInput, message, Modal} from 'antd';

interface CreateEnvironmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface FormValues {
    name: string;
    displayName: string;
    type: string;
    level: string;
    description?: string;
}

export const CreateEnvironmentModal = ({ open, onClose, onSuccess }: CreateEnvironmentModalProps) => {
    const [form] = Form.useForm<FormValues>();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            console.log('[CreateEnvironment] 提交数据:', values);

            // TODO: 调用 API 创建环境
            // await environmentAPI.create(values);

            message.success(`环境 "${values.displayName}" 创建成功`);
            form.resetFields();
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('表单验证失败:', err);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="创建环境"
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            okText="创建"
            cancelText="取消"
            width={520}
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
                <Form.Item
                    name="name"
                    label="环境标识"
                    rules={[
                        { required: true, message: '请输入环境标识' },
                        { pattern: /^[a-z][a-z0-9-]*$/, message: '只能包含小写字母、数字和连字符，且以字母开头' },
                    ]}
                >
                    <Input
                        placeholder="如: prod-east, staging-01"
                        data-ai-param="envName"
                        data-ai-desc="环境唯一标识"
                    />
                </Form.Item>

                <Form.Item
                    name="displayName"
                    label="显示名称"
                    rules={[{ required: true, message: '请输入显示名称' }]}
                >
                    <Input
                        placeholder="如: 生产环境-东区"
                        data-ai-param="envDisplayName"
                        data-ai-desc="环境显示名称"
                    />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="环境类型"
                    rules={[{ required: true, message: '请选择环境类型' }]}
                >
                    <Select
                        placeholder="选择环境类型"
                        data-ai-param="envType"
                        data-ai-desc="环境类型"
                    >
                        <Select.Option value="prod">生产 (Production)</Select.Option>
                        <Select.Option value="staging">预发 (Staging)</Select.Option>
                        <Select.Option value="testing">测试 (Testing)</Select.Option>
                        <Select.Option value="dev">开发 (Development)</Select.Option>
                        <Select.Option value="sandbox">沙盒 (Sandbox)</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="level"
                    label="环境级别"
                    rules={[{ required: true, message: '请选择环境级别' }]}
                >
                    <Select
                        placeholder="选择环境级别"
                        data-ai-param="envLevel"
                        data-ai-desc="环境级别"
                    >
                        <Select.Option value="production">正式环境</Select.Option>
                        <Select.Option value="testing">测试环境</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="description"
                    label="描述"
                >
                    <AntInput.TextArea
                        rows={3}
                        placeholder="环境描述（可选）"
                        data-ai-param="envDescription"
                        data-ai-desc="环境描述信息"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

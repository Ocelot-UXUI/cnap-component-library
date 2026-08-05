/**
 * 个人信息设置 Tab
 */
import {Button, Form, Input, Select, Switch} from '@/components/ai';
import {GlobalOutlined, UserOutlined} from '@ant-design/icons';
import {Avatar, Card, Divider} from '@/design';
import {
    avatarContainerClass,
    flexEndClass,
    gridLayoutClass,
    marginBottom24Class,
    sectionTitleClass,
    settingDescClass,
    settingItemClass,
    settingLabelClass,
    settingTitleClass,
    singleGridLayoutClass,
    uploadHintClass,
} from './styles';

export const ProfileTab = () => {
    const [form] = Form.useForm();

    return (
        <Card>
            <Form
                form={form}
                layout="vertical"
                data-ai-entity="userProfile"
                data-ai-desc="用户个人资料表单"
                initialValues={{
                    firstName: 'John',
                    lastName: 'Developer',
                    email: 'john@example.com',
                    role: 'admin',
                    timezone: 'utc',
                    terminalFont: true,
                }}
            >
                <div className={marginBottom24Class}>
                    <div className={avatarContainerClass}>
                        <Avatar size={80} icon={<UserOutlined />} />
                        <div>
                            <Button
                                type="default"
                                size="small"
                                data-ai-action="uploadAvatar"
                                data-ai-entity="user"
                            >
                                上传头像
                            </Button>
                            <div className={uploadHintClass}>
                                JPG, PNG 或 GIF。最大 2MB
                            </div>
                        </div>
                    </div>
                    <Divider />
                    <div className={gridLayoutClass}>
                        <Form.Item label="名" name="firstName">
                            <Input data-ai-param="firstName" data-ai-entity="user" />
                        </Form.Item>
                        <Form.Item label="姓" name="lastName">
                            <Input data-ai-param="lastName" data-ai-entity="user" />
                        </Form.Item>
                        <Form.Item label="邮箱" name="email">
                            <Input type="email" data-ai-param="email" data-ai-entity="user" />
                        </Form.Item>
                        <Form.Item label="角色" name="role">
                            <Select data-ai-param="role" data-ai-entity="user">
                                <Select.Option value="admin">管理员</Select.Option>
                                <Select.Option value="developer">开发者</Select.Option>
                                <Select.Option value="viewer">查看者</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <Divider />
                    <div className={sectionTitleClass}>偏好设置</div>
                    <div className={singleGridLayoutClass}>
                        <Form.Item label="时区" name="timezone">
                            <Select
                                suffixIcon={<GlobalOutlined />}
                                data-ai-param="timezone"
                                data-ai-entity="userPreference"
                            >
                                <Select.Option value="utc">UTC</Select.Option>
                                <Select.Option value="est">东部时间 (EST)</Select.Option>
                                <Select.Option value="pst">太平洋时间 (PST)</Select.Option>
                                <Select.Option value="cet">中欧时间 (CET)</Select.Option>
                                <Select.Option value="cst">中国标准时间 (CST)</Select.Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className={settingItemClass}>
                        <div className={settingLabelClass}>
                            <div className={settingTitleClass}>终端字体</div>
                            <div className={settingDescClass}>在日志和终端中使用等宽字体</div>
                        </div>
                        <Form.Item name="terminalFont" valuePropName="checked" noStyle>
                            <Switch
                                data-ai-action="toggleTerminalFont"
                                data-ai-entity="userPreference"
                            />
                        </Form.Item>
                    </div>
                    <Divider />
                    <div className={flexEndClass}>
                        <Button
                            type="primary"
                            data-ai-action="saveProfile"
                            data-ai-entity="user"
                            data-ai-desc="保存个人资料更改"
                        >
                            保存更改
                        </Button>
                    </div>
                </div>
            </Form>
        </Card>
    );
};

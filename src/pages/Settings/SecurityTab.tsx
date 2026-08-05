/**
 * 安全设置 Tab
 */
import {Button, Input} from '@/components/ai';
import {DesktopOutlined, LockOutlined, SafetyOutlined} from '@ant-design/icons';
import {Badge, Card, Divider, Form} from '@/design';
import {
    fontWeight500Class,
    gridLayoutClass,
    marginBottom24Class,
    paddingLeft24Class,
    sectionTitleClass,
    sessionCardClass,
    sessionFlexClass,
    sessionHeaderClass,
    sessionLocationClass,
    settingDescClass,
    settingItemClass,
    settingLabelClass,
    settingTitleClass,
} from './styles';

const activeSessions = [
    { device: 'Chrome on MacOS', location: 'San Francisco, US', current: true },
    { device: 'Firefox on Windows', location: 'New York, US', current: false },
];

export const SecurityTab = () => {
    return (
        <Card>
            <div className={marginBottom24Class}>
                <div className={sectionTitleClass}>
                    <LockOutlined />
                    密码
                </div>
                <div className={paddingLeft24Class}>
                    <div className={gridLayoutClass}>
                        <Form.Item label="当前密码">
                            <Input.Password
                                data-ai-param="currentPassword"
                                data-ai-entity="security"
                            />
                        </Form.Item>
                        <div />
                        <Form.Item label="新密码">
                            <Input.Password
                                data-ai-param="newPassword"
                                data-ai-entity="security"
                            />
                        </Form.Item>
                        <Form.Item label="确认密码">
                            <Input.Password
                                data-ai-param="confirmPassword"
                                data-ai-entity="security"
                            />
                        </Form.Item>
                    </div>
                    <Button
                        type="default"
                        data-ai-action="updatePassword"
                        data-ai-entity="security"
                    >
                        更新密码
                    </Button>
                </div>
                <Divider />
                <div className={sectionTitleClass}>
                    <SafetyOutlined />
                    两步验证
                </div>
                <div className={settingItemClass}>
                    <div className={settingLabelClass}>
                        <div className={settingTitleClass}>启用 2FA</div>
                        <div className={settingDescClass}>为您的账户添加额外的安全层</div>
                    </div>
                    <Button
                        type="default"
                        data-ai-action="configure2FA"
                        data-ai-entity="security"
                    >
                        配置
                    </Button>
                </div>
                <Divider />
                <div className={sectionTitleClass}>活跃会话</div>
                <div className={paddingLeft24Class}>
                    {activeSessions.map(session => (
                        <Card key={session.device} className={sessionCardClass} size="small">
                            <div className={sessionFlexClass}>
                                <div>
                                    <div className={sessionHeaderClass}>
                                        <DesktopOutlined />
                                        <span className={fontWeight500Class}>{session.device}</span>
                                        {session.current && <Badge status="success" text="当前" />}
                                    </div>
                                    <div className={sessionLocationClass}>
                                        {session.location}
                                    </div>
                                </div>
                                {!session.current && (
                                    <Button
                                        type="link"
                                        danger
                                        size="small"
                                        data-ai-action="revokeSession"
                                        data-ai-entity="session"
                                    >
                                        撤销
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </Card>
    );
};

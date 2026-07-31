/**
 * 通知设置 Tab
 */
import {MailOutlined, MobileOutlined} from '@ant-design/icons';
import {Button, Card, Divider, Switch} from 'antd';
import {
    flexEndClass,
    marginBottom24Class,
    paddingLeft24Class,
    sectionTitleClass,
    settingDescClass,
    settingItemClass,
    settingLabelClass,
    settingTitleClass,
} from './styles';

const emailNotifications = [
    { label: '部署完成', description: '部署完成时接收通知', defaultChecked: false },
    { label: '部署失败', description: '部署失败时接收告警', defaultChecked: true },
    { label: 'Pod 健康告警', description: 'Pod 不健康时接收通知', defaultChecked: true },
    { label: '周报', description: '平台活动的每周报告', defaultChecked: false },
];

const pushNotifications = [
    { label: '严重告警', description: '严重问题的即时通知', defaultChecked: true },
    { label: '流水线状态', description: 'CI/CD 流水线进度更新', defaultChecked: false },
    { label: '团队提及', description: '有人@你时通知', defaultChecked: true },
];

export const NotificationsTab = () => {
    return (
        <Card>
            <div className={marginBottom24Class}>
                <div className={sectionTitleClass}>
                    <MailOutlined />
                    邮件通知
                </div>
                <div className={paddingLeft24Class}>
                    {emailNotifications.map(item => (
                        <div key={item.label} className={settingItemClass}>
                            <div className={settingLabelClass}>
                                <div className={settingTitleClass}>{item.label}</div>
                                <div className={settingDescClass}>{item.description}</div>
                            </div>
                            <Switch defaultChecked={item.defaultChecked} />
                        </div>
                    ))}
                </div>
                <Divider />
                <div className={sectionTitleClass}>
                    <MobileOutlined />
                    推送通知
                </div>
                <div className={paddingLeft24Class}>
                    {pushNotifications.map(item => (
                        <div key={item.label} className={settingItemClass}>
                            <div className={settingLabelClass}>
                                <div className={settingTitleClass}>{item.label}</div>
                                <div className={settingDescClass}>{item.description}</div>
                            </div>
                            <Switch defaultChecked={item.defaultChecked} />
                        </div>
                    ))}
                </div>
                <Divider />
                <div className={flexEndClass}>
                    <Button type="primary">保存偏好设置</Button>
                </div>
            </div>
        </Card>
    );
};

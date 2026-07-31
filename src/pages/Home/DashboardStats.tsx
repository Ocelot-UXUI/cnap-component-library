import {
    AlertOutlined,
    ClockCircleOutlined,
    RocketOutlined,
    StarOutlined,
} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Card, Col, Row, Statistic, theme} from 'antd';
import {userStats} from './data';

const iconWrapClass = css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    font-size: 18px;
    margin-right: 4px;
`;

export const DashboardStats = () => {
    const { token } = theme.useToken();

    const stats = [
        {
            title: '我的收藏',
            value: userStats.totalFavorites,
            icon: <StarOutlined />,
            color: token.colorPrimary,
            bg: token.colorPrimaryBg,
        },
        {
            title: '今日部署',
            value: userStats.deploymentsToday,
            icon: <RocketOutlined />,
            color: token.colorSuccess,
            bg: token.colorSuccessBg,
        },
        {
            title: '活跃告警',
            value: userStats.activeAlerts,
            icon: <AlertOutlined />,
            color: token.colorError,
            bg: token.colorErrorBg,
        },
        {
            title: '需要关注',
            value: userStats.appsNeedingAttention,
            icon: <ClockCircleOutlined />,
            color: token.colorWarning,
            bg: token.colorWarningBg,
        },
    ];

    return (
        <Row gutter={[16, 16]}>
            {stats.map(stat => (
                <Col xs={24} sm={12} lg={6} key={stat.title}>
                    <Card data-ai-role="card" data-ai-entity="dashboard" data-ai-desc={stat.title}>
                        <Statistic
                            title={stat.title}
                            value={stat.value}
                            prefix={
                                <span
                                    className={iconWrapClass}
                                    style={{ color: stat.color, background: stat.bg }}
                                >
                                    {stat.icon}
                                </span>
                            }
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

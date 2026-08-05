/* eslint-disable max-len */
import {css} from '@emotion/react';
import {Col, Descriptions, Row, Space, Statistic, Tag} from '@/design';
import {useParams} from 'react-router-dom';

const containerStyles = css`
    width: 100%;
`;

export default function ApplicationOverview() {
    const { appId } = useParams<{ appId: string; }>();

    return (
        <Space vertical size="large" css={containerStyles}>
            <Row gutter={[16, 16]}>
                <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={6}
                    data-ai-role="card"
                    data-ai-entity="application"
                    data-ai-desc="运行实例"
                >
                    <Statistic title="运行实例" value={3} suffix="个" />
                </Col>
                <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={6}
                    data-ai-role="card"
                    data-ai-entity="application"
                    data-ai-desc="CPU使用率"
                >
                    <Statistic title="CPU使用率" value={45.3} suffix="%" />
                </Col>
                <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={6}
                    data-ai-role="card"
                    data-ai-entity="application"
                    data-ai-desc="内存使用"
                >
                    <Statistic title="内存使用" value={2.8} suffix="GB" />
                </Col>
                <Col
                    xs={12}
                    sm={12}
                    md={6}
                    lg={6}
                    xl={6}
                    data-ai-role="card"
                    data-ai-entity="application"
                    data-ai-desc="今日请求"
                >
                    <Statistic title="今日请求" value={12893} />
                </Col>
            </Row>

            <Descriptions
                title="应用信息"
                bordered
                column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
            >
                <Descriptions.Item label="应用ID">{appId}</Descriptions.Item>
                <Descriptions.Item label="状态">
                    <Tag color="green">运行中</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="当前版本">v1.2.3</Descriptions.Item>
                <Descriptions.Item label="部署环境">生产环境</Descriptions.Item>
                <Descriptions.Item label="创建时间">2026-01-15 10:30:00</Descriptions.Item>
                <Descriptions.Item label="更新时间">2026-03-10 15:30:00</Descriptions.Item>
                <Descriptions.Item label="负责人">张三</Descriptions.Item>
                <Descriptions.Item label="所属团队">后端开发组</Descriptions.Item>
            </Descriptions>
        </Space>
    );
}

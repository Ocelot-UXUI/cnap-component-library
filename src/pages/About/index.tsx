import {css} from '@emotion/css';
import {Card, Descriptions, Typography} from '@/design';

const { Title, Paragraph } = Typography;

const containerClass = css`
    max-width: 800px;
    margin: 0 auto;
`;

function AboutPage() {
    return (
        <div className={containerClass}>
            <Typography>
                <Title level={2}>关于项目</Title>
                <Paragraph>
                    这是一个前端脚手架模板，旨在提供一个干净、规范的项目起点， 帮助开发者快速启动新项目。
                </Paragraph>
            </Typography>

            <Card title="技术栈" style={{ marginTop: 24 }}>
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="框架">React 18</Descriptions.Item>
                    <Descriptions.Item label="构建工具">Vite</Descriptions.Item>
                    <Descriptions.Item label="类型系统">TypeScript</Descriptions.Item>
                    <Descriptions.Item label="UI 组件库">Ant Design 5</Descriptions.Item>
                    <Descriptions.Item label="样式方案">Emotion CSS-in-JS</Descriptions.Item>
                    <Descriptions.Item label="路由">React Router 6</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="目录结构" style={{ marginTop: 24 }}>
                <pre style={{ margin: 0, fontSize: 14 }}>
{`src/
├── components/     # 公共组件
├── constants/      # 常量定义
├── design/         # 设计组件
├── pages/          # 页面组件
├── routers/        # 路由配置
├── styles/         # 全局样式
├── types/          # 类型定义
└── utils/          # 工具函数`}
                </pre>
            </Card>
        </div>
    );
}

export default AboutPage;

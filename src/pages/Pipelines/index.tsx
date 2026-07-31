import {Button} from '@/components/ai';
import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {BranchesOutlined} from '@ant-design/icons';
import {Empty} from 'antd';

export default function PipelinesPage() {
    return (
        <div>
            <PageLayoutHeader
                title="流水线"
                extra={<Button type="primary" icon={<BranchesOutlined />}>创建流水线</Button>}
            />
            <Empty
                image={<BranchesOutlined style={{ fontSize: 48, color: '#52c41a' }} />}
                description="暂无 CI/CD 流水线，创建流水线来自动化您的部署流程"
            />
        </div>
    );
}

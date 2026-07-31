import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {HistoryOutlined} from '@ant-design/icons';
import {Empty} from 'antd';

export default function RecentPage() {
    return (
        <div>
            <PageLayoutHeader title="最近访问" />
            <Empty
                image={<HistoryOutlined style={{ fontSize: 48, color: '#1677ff' }} />}
                description="暂无最近访问记录"
            />
        </div>
    );
}

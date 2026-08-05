import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {StarOutlined} from '@ant-design/icons';
import {Empty} from '@/design';

export default function FavoritesPage() {
    return (
        <div>
            <PageLayoutHeader title="收藏" />
            <Empty
                image={<StarOutlined style={{ fontSize: 48, color: '#faad14' }} />}
                description="暂无收藏内容，在应用或账号上点击星标即可收藏"
            />
        </div>
    );
}

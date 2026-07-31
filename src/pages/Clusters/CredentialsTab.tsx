/**
 * 凭证管理 Tab 组件
 */
import {Card, Empty} from 'antd';

export const CredentialsTab = () => {
    return (
        <Card data-ai-role="card" data-ai-desc="凭证管理功能开发中">
            <Empty
                description="凭证管理功能开发中..."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
        </Card>
    );
};

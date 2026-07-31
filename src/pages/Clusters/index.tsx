/**
 * 集群管理页面
 */
import {Button, Tabs} from '@/components/ai';
import {useTranslation} from '@/utils/i18n';
import {ClusterOutlined, KeyOutlined, PlusOutlined} from '@ant-design/icons';
import {ClustersTab} from './ClustersTab';
import {CredentialsTab} from './CredentialsTab';
import {cloudProviders, mockClusters} from './mockData';
import {pageDescClass, pageHeaderClass, pageHeaderFlexClass, pageTitleClass} from './styles';

const ClustersPage = () => {
    const { t } = useTranslation();

    const tabItems = [
        {
            key: 'clusters',
            label: (
                <span>
                    <ClusterOutlined />
                    集群列表
                </span>
            ),
            children: <ClustersTab clusters={mockClusters} providers={cloudProviders} />,
        },
        {
            key: 'credentials',
            label: (
                <span>
                    <KeyOutlined />
                    凭证管理
                </span>
            ),
            children: <CredentialsTab />,
        },
    ];

    return (
        <div>
            <div className={`${pageHeaderClass} ${pageHeaderFlexClass}`}>
                <div>
                    <h1 className={pageTitleClass}>{t('pages.clusters.title')}</h1>
                    <p className={pageDescClass}>{t('pages.clusters.description')}</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    data-ai-action="addCluster"
                    data-ai-entity="cluster"
                >
                    添加集群
                </Button>
            </div>

            <Tabs
                defaultActiveKey="clusters"
                items={tabItems}
                destroyOnHidden
                data-ai-entity="clusters"
                data-ai-desc="集群管理选项卡"
            />
        </div>
    );
};

export default ClustersPage;

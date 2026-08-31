/**
 * 集群列表 Tab 组件
 */
import {MotionItem, MotionList} from '@/components/Motion';
import {CloudProvider, Cluster} from '@/types/cluster';
import {CloudOutlined, SearchOutlined} from '@ant-design/icons';
import {Badge, Col, Input, Row, Select} from '@/design';
import {useMemo, useState} from 'react';
import {ClusterCard} from './ClusterCard';
import {StatsCards} from './StatsCards';
import {
    emptyStateClass,
    filterContainerClass,
    marginBottom24Class,
    providerSectionClass,
    providerTitleClass,
    searchInputClass,
    selectWidthClass,
} from './styles';

interface ClustersTabProps {
    clusters: Cluster[];
    providers: Array<{ value: string; label: string; }>;
}

const getProviderLabel = (provider: string, providers: Array<{ value: string; label: string; }>): string => {
    return providers.find(p => p.value === provider)?.label || provider;
};

export const ClustersTab = ({ clusters, providers }: ClustersTabProps) => {
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState<string>('all');

    const filteredClusters = useMemo(
        () => {
            return clusters.filter(cluster => {
                const matchesSearch = cluster.name.toLowerCase().includes(search.toLowerCase());
                const matchesProvider = providerFilter === 'all' || cluster.provider === providerFilter;
                return matchesSearch && matchesProvider;
            });
        },
        [clusters, search, providerFilter],
    );

    const groupedClusters = useMemo(
        () => {
            const grouped: Record<CloudProvider, Cluster[]> = {} as Record<CloudProvider, Cluster[]>;
            filteredClusters.forEach(cluster => {
                if (!grouped[cluster.provider]) {
                    grouped[cluster.provider] = [];
                }
                grouped[cluster.provider].push(cluster);
            });
            return grouped;
        },
        [filteredClusters],
    );

    return (
        <div>
            <div className={marginBottom24Class}>
                <StatsCards clusters={clusters} providerCount={providers.length} />
            </div>

            <div className={filterContainerClass}>
                <Select
                    value={providerFilter}
                    onChange={setProviderFilter}
                    className={selectWidthClass}
                    data-ai-param="providerFilter"
                    data-ai-entity="cluster"
                    data-ai-desc="按云提供商筛选"
                >
                    <Select.Option value="all">所有提供商</Select.Option>
                    {providers.map(p => (
                        <Select.Option key={p.value} value={p.value}>
                            {p.label}
                        </Select.Option>
                    ))}
                </Select>
                <Input
                    allowClear
                    placeholder="搜索集群名称"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={searchInputClass}
                    data-ai-param="clusterSearch"
                    data-ai-entity="cluster"
                    data-ai-desc="搜索集群名称"
                />
            </div>

            <MotionList>
                {Object.entries(groupedClusters).map(([provider, providerClusters]) => (
                    <MotionItem key={provider}>
                        <div className={providerSectionClass}>
                            <div className={providerTitleClass}>
                                <CloudOutlined />
                                <span>{getProviderLabel(provider, providers)}</span>
                                <Badge
                                    count={providerClusters.length}
                                    showZero
                                />
                            </div>
                            <Row gutter={[16, 16]}>
                                {providerClusters.map(cluster => (
                                    <Col key={cluster.id} xs={24} sm={12} lg={8}>
                                        <ClusterCard cluster={cluster} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </MotionItem>
                ))}
            </MotionList>

            {filteredClusters.length === 0 && (
                <div className={emptyStateClass}>
                    暂无集群数据
                </div>
            )}
        </div>
    );
};

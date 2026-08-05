/* eslint-disable no-console */
/**
 * 环境管理页面
 */
import {Button, Input, Select} from '@/components/ai';
import {MotionItem, MotionList} from '@/components/Motion';
import {useTranslation} from '@/utils/i18n';
import {PlusOutlined, SearchOutlined} from '@ant-design/icons';
import {Space} from '@/design';
import {useMemo, useState} from 'react';
import {CreateEnvironmentModal} from './CreateEnvironmentModal';
import {EnvironmentSection} from './EnvironmentSection';
import {mockEnvironments} from './mockData';
import {
    emptyStateClass,
    filterContainerClass,
    pageDescClass,
    pageHeaderClass,
    pageHeaderFlexClass,
    pageTitleClass,
    searchInputWidthClass,
    selectWidthClass,
} from './styles';

const EnvironmentsPage = () => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [createModalOpen, setCreateModalOpen] = useState(false);

    const filteredEnvironments = useMemo(
        () => {
            return mockEnvironments.filter(env => {
                const matchesSearch = env.name.toLowerCase().includes(search.toLowerCase())
                    || env.displayName.toLowerCase().includes(search.toLowerCase());
                const matchesType = typeFilter === 'all' || env.type === typeFilter;
                return matchesSearch && matchesType;
            });
        },
        [search, typeFilter],
    );

    const productionEnvs = filteredEnvironments.filter(env => env.level === 'production');
    const testingEnvs = filteredEnvironments.filter(env => env.level === 'testing');

    return (
        <div>
            <div className={`${pageHeaderClass} ${pageHeaderFlexClass}`}>
                <div>
                    <h1 className={pageTitleClass}>{t('pages.environments.title')}</h1>
                    <p className={pageDescClass}>{t('pages.environments.description')}</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                    data-ai-action="openCreateEnvironmentModal"
                    data-ai-entity="environment"
                >
                    {t('pages.environments.createEnvironment')}
                </Button>
            </div>

            <div className={filterContainerClass}>
                <Space size="middle">
                    <Input
                        placeholder="搜索环境..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={searchInputWidthClass}
                        data-ai-param="searchKeyword"
                        data-ai-entity="environment"
                        data-ai-desc="搜索环境关键词"
                    />
                    <Select
                        value={typeFilter}
                        onChange={setTypeFilter}
                        className={selectWidthClass}
                        data-ai-param="typeFilter"
                        data-ai-entity="environment"
                        data-ai-desc="环境类型筛选"
                    >
                        <Select.Option value="all">所有类型</Select.Option>
                        <Select.Option value="prod">生产</Select.Option>
                        <Select.Option value="staging">预发</Select.Option>
                        <Select.Option value="sandbox">沙盒</Select.Option>
                        <Select.Option value="testing">测试</Select.Option>
                        <Select.Option value="dev">开发</Select.Option>
                    </Select>
                </Space>
            </div>

            <MotionList>
                {productionEnvs.length > 0 && (
                    <MotionItem>
                        <EnvironmentSection
                            level="production"
                            title={t('pages.environments.production')}
                            description="为真实用户提供服务的环境"
                            environments={productionEnvs}
                        />
                    </MotionItem>
                )}
                {testingEnvs.length > 0 && (
                    <MotionItem>
                        <EnvironmentSection
                            level="testing"
                            title={t('pages.environments.testing')}
                            description="开发和测试环境"
                            environments={testingEnvs}
                        />
                    </MotionItem>
                )}
            </MotionList>

            {filteredEnvironments.length === 0 && (
                <div className={emptyStateClass}>
                    暂无环境数据
                </div>
            )}

            <CreateEnvironmentModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    // TODO: 刷新环境列表
                    console.log('环境创建成功，刷新列表');
                }}
            />
        </div>
    );
};

export default EnvironmentsPage;

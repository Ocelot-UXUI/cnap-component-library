/* eslint-disable max-lines */
import accountApi from '@/api/account';
import {Button, Switch} from '@/components/ai';
import {useNavigationSnapshot} from '@/contexts/NavigationContext';
import type {Application} from '@/contexts/navigationContextData';
import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {applicationDeployments, applicationSettings} from '@/routes';
import {AppstoreOutlined, PlusOutlined, UnorderedListOutlined} from '@ant-design/icons';
import {css, cx} from '@emotion/css';
import {Alert, Empty, Space, Spin, theme} from 'antd';
import {LayoutGroup, motion} from 'framer-motion';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

const cardGridClass = css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const listViewClass = css`display: flex; flex-direction: column; gap: 6px;`;
const viewSwitchClass = css`@media (max-width: 768px) { display: none; }`;
const centerStateClass = css`padding: 40px 0; text-align: center;`;
const springTransition = { type: 'spring' as const, stiffness: 280, damping: 30 };

const glassBase = css`
    background: linear-gradient(135deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.14) 100%);
    backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
    -webkit-backdrop-filter: blur(24px) saturate(180%) brightness(1.05);
    border: 1px solid rgba(255,255,255,0.50);
    box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.90),
        inset 0 -1px 0 rgba(0,0,0,0.04),
        0 2px 12px rgba(0,0,0,0.06),
        0 1px 3px rgba(0,0,0,0.04);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    &:hover {
        box-shadow:
            inset 0 1px 0 rgba(255,255,255,1),
            inset 0 -1px 0 rgba(0,0,0,0.04),
            0 8px 28px rgba(0,0,0,0.10),
            0 2px 6px rgba(0,0,0,0.06);
        transform: translateY(-1px);
    }
`;

export default function ApplicationsPage() {
    const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
    const { accountId } = useNavigationSnapshot();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    useEffect(() => {
        let canceled = false;
        if (!accountId) {
            setApplications([]);
            return;
        }
        setLoading(true);
        setLoadError(null);
        accountApi.getApplicationsByAccount({ accountID: accountId, keyword: '' }).then(response => {
            if (!canceled) {
                setApplications(response);
                setLoading(false);
            }
        }).catch(err => {
            if (!canceled) {
                setLoadError(err);
                setLoading(false);
            }
        });
        return () => {
            canceled = true;
        };
    }, [accountId]);

    const listRowClass = cx(
        glassBase,
        css`
        display: flex; align-items: center;
        padding: 12px 16px; width: 100%;
        border-radius: ${token.borderRadius}px;
    `,
    );
    const cardClass = cx(glassBase, css`padding: 16px; border-radius: 12px; height: 100%;`);
    const listColName = css`flex: 1; font-weight: 500; color: ${token.colorText};`;
    const listColActions = css`display: flex; gap: 4px;`;
    const cardTitleClass = css`font-weight: 600; font-size: 15px; margin-bottom: 12px; color: ${token.colorText};`;
    const cardActionsClass = css`
        display: flex; gap: 4px; margin-top: 12px;
        padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.07);
    `;

    const handleDeploy = (appId: string) => navigate(applicationDeployments.toPath({ appId: appId }));
    const handleSettings = (appId: string) => navigate(applicationSettings.toPath({ appId: appId }));

    const renderActions = (app: Application) => (
        <div className={listColActions}>
            <Button
                type="link"
                size="small"
                onClick={() => handleDeploy(app.id)}
                data-ai-action="deployApplication"
                data-ai-entity={`application:${app.id}`}
            >
                部署
            </Button>
            <Button
                type="link"
                size="small"
                onClick={() => handleSettings(app.id)}
                data-ai-action="configApplication"
                data-ai-entity={`application:${app.id}`}
            >
                配置
            </Button>
        </div>
    );

    const headerExtra = (
        <Space wrap>
            <Button
                icon={<PlusOutlined />}
                type="primary"
                data-ai-action="createApplication"
                data-ai-entity="application"
            >
                新建应用
            </Button>
            <Switch
                checkedChildren={<AppstoreOutlined />}
                unCheckedChildren={<UnorderedListOutlined />}
                checked={viewMode === 'card'}
                onChange={checked => setViewMode(checked ? 'card' : 'table')}
                className={viewSwitchClass}
                data-ai-action="toggleViewMode"
                data-ai-entity="applications"
            />
        </Space>
    );

    return (
        <div>
            <PageLayoutHeader title="应用管理" extra={headerExtra} />
            <Spin spinning={loading}>
                {loadError
                    ? <Alert type="error" message={loadError.message} className={centerStateClass} />
                    : applications.length === 0
                    ? <Empty className={centerStateClass} description={accountId ? '暂无应用' : '请选择资源账户'} />
                    : (
                        <LayoutGroup>
                            {viewMode === 'table'
                                ? (
                                    <div className={listViewClass}>
                                        {applications.map(app => (
                                            <motion.div
                                                key={app.id}
                                                layoutId={`app-item-${app.id}`}
                                                layout
                                                transition={springTransition}
                                            >
                                                <div className={listRowClass}>
                                                    <div className={listColName}>{app.name}</div>
                                                    {renderActions(app)}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )
                                : (
                                    <div className={cardGridClass}>
                                        {applications.map(app => (
                                            <motion.div
                                                key={app.id}
                                                layoutId={`app-item-${app.id}`}
                                                layout
                                                transition={springTransition}
                                            >
                                                <div className={cardClass}>
                                                    <div className={cardTitleClass}>{app.name}</div>
                                                    <div className={cardActionsClass}>{renderActions(app)}</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                        </LayoutGroup>
                    )}
            </Spin>
        </div>
    );
}

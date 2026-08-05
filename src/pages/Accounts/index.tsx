import {Button} from '@/components/ai';
import BorderGlow from '@/components/BorderGlow/BorderGlow';
import {MotionEmpty, MotionItem, MotionList} from '@/components/Motion';
import {hexToHslStr} from '@/utils/color';
import {PlusOutlined, SearchOutlined, UserOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import {Col, Input, Row, Space, Tag, theme} from '@/design';
import {useState} from 'react';

interface Account {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'locked';
}

const mockAccounts: Account[] = [
    { id: '1', name: '管理员账户', description: '系统管理员账户，拥有所有权限', status: 'active' },
    { id: '2', name: '开发者账户', description: '开发环境专用账户，用于应用开发和测试', status: 'active' },
    { id: '3', name: '测试账户', description: '测试环境账户，用于功能测试和验证', status: 'inactive' },
    { id: '4', name: '访客账户', description: '临时访客账户，权限受限', status: 'locked' },
    { id: '5', name: '运维账户', description: '运维人员专用账户，负责系统监控和维护', status: 'active' },
    { id: '6', name: '审计账户', description: '审计专用账户，用于日志审计和合规检查', status: 'active' },
];

const pageHeaderClass = css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
`;

const cardInnerClass = css`
    padding: 20px;
`;

const cardTitleClass = css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 10px;
`;

const cardDescClass = css`
    font-size: 13px;
    color: rgba(0, 0, 0, 0.55);
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 42px;
    margin-bottom: 12px;
`;

export default function AccountsPage() {
    const { token } = theme.useToken();
    const [searchText, setSearchText] = useState('');

    const filteredAccounts = mockAccounts.filter(a =>
        a.name.toLowerCase().includes(searchText.toLowerCase())
        || a.description.toLowerCase().includes(searchText.toLowerCase())
    );

    const getStatusTag = (status: Account['status']) => {
        if (status === 'active') return { tagColor: 'green', text: '正常' };
        if (status === 'locked') return { tagColor: 'red', text: '已锁定' };
        return { tagColor: 'default', text: '未激活' };
    };

    return (
        <div>
            <div className={pageHeaderClass}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px' }}>账户管理</h1>
                    <p style={{ color: 'rgba(0,0,0,0.45)', margin: 0 }}>管理系统账户和访问权限</p>
                </div>
                <Button icon={<PlusOutlined />} type="primary" data-ai-action="createAccount" data-ai-entity="account">
                    新建账户
                </Button>
            </div>

            <Space style={{ marginBottom: 24 }}>
                <Input
                    placeholder="搜索账户名称或描述"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    allowClear
                    size="large"
                    style={{ maxWidth: 400 }}
                    data-ai-param="accountSearch"
                    data-ai-entity="account"
                    data-ai-desc="搜索账户名称或描述"
                />
            </Space>

            <MotionList>
                <Row gutter={[16, 24]}>
                    {filteredAccounts.map(account => {
                        const { tagColor, text } = getStatusTag(account.status);
                        return (
                            <Col xs={24} sm={12} lg={8} key={account.id}>
                                <MotionItem>
                                    <BorderGlow
                                        backgroundColor="#f8f9fc"
                                        glowColor={hexToHslStr(token.colorPrimary)}
                                        colors={[token.colorPrimary, token.colorInfo, token.colorSuccess]}
                                        borderRadius={12}
                                        glowRadius={32}
                                        lightMode={true}
                                    >
                                        <div
                                            className={cardInnerClass}
                                            data-ai-action="viewAccount"
                                            data-ai-entity={`account:${account.id}`}
                                        >
                                            <div className={cardTitleClass}>
                                                <UserOutlined />
                                                {account.name}
                                            </div>
                                            <div className={cardDescClass}>{account.description}</div>
                                            <Tag color={tagColor}>{text}</Tag>
                                        </div>
                                    </BorderGlow>
                                </MotionItem>
                            </Col>
                        );
                    })}
                </Row>
            </MotionList>

            {filteredAccounts.length === 0 && (
                <MotionEmpty>
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        暂无匹配的账户
                    </div>
                </MotionEmpty>
            )}
        </div>
    );
}

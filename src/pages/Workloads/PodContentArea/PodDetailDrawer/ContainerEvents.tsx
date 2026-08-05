import {Alert, Button, Flex, Input, Select, Table, Tag, Typography} from '@/design';
import type {TableColumnsType} from '@/design';
import {useEffect, useState} from 'react';

import runtimeResourceApi from '@/api/runtimeResource';
import {semantic} from '@/constants/colors';
import type {PodEvent, PodEventType} from '@/interface/entities/podEvent';
import {Toolbar, ToolbarLeft} from './PodDetailDrawer.style';
import {eventTone, matchEvent} from './podEventView';
import {formatISOTime} from '@/utils/date';

const toneColor = {
    success: semantic.state.success.default,
    info: semantic.state.info.default,
    warning: semantic.state.warning.default,
    error: semantic.state.error.default,
};

interface ContainerEventsProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    container: string;
}

export const ContainerEvents = ({ appEnvID, clusterId, podName, container }: ContainerEventsProps) => {
    const [type, setType] = useState<PodEventType | undefined>(undefined);
    const [keyword, setKeyword] = useState('');
    const [tokens, setTokens] = useState<string[]>(['']);
    const [pageIndex, setPageIndex] = useState(0);
    const [items, setItems] = useState<PodEvent[]>([]);
    const [nextToken, setNextToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setTokens(['']);
        setPageIndex(0);
    }, [type, clusterId, podName, container]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);
        runtimeResourceApi
            .getPodEvents({ appEnvID, clusterId, podName, container, type, pageToken: tokens[pageIndex] || undefined })
            .then(result => {
                if (!cancelled) {
                    setItems(result.items);
                    setNextToken(result.nextPageToken);
                }
            })
            .catch(() => !cancelled && setError(true))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [appEnvID, clusterId, podName, container, type, tokens, pageIndex]);

    const columns: TableColumnsType<PodEvent> = [
        {
            title: '级别',
            key: 'type',
            width: 80,
            render: (_, e) => <Tag color={toneColor[eventTone(e.type)]}>{e.type}</Tag>,
        },
        { title: '原因', dataIndex: 'reason', key: 'reason', width: 120 },
        {
            title: '对象',
            key: 'object',
            width: 260,
            render: (_, e) => (
                <Flex vertical>
                    <Typography.Text type="secondary">{e.objectKind}</Typography.Text>
                    <Typography.Text>{e.objectName}</Typography.Text>
                </Flex>
            ),
        },
        {
            title: '时间',
            key: 'time',
            width: 120,
            render: (_, e) => `${formatISOTime(e.firstSeen)}~${formatISOTime(e.lastSeen)}${e.count > 1 ? ` x${e.count}` : ''}`,
        },
        { title: '消息', dataIndex: 'message', key: 'message', render: (_, e) => (
            <Typography.Paragraph ellipsis={{ tooltip: e.message, rows: 2 }}>
                {e.message}
            </Typography.Paragraph>
        ) },
    ];

    const visible = items.filter(event => matchEvent(event, keyword));

    return (
        <div>
            <Toolbar>
                <ToolbarLeft>
                    <Select
                        style={{ width: 120 }}
                        placeholder="全部级别"
                        allowClear
                        value={type}
                        onChange={value => setType(value)}
                        options={[{ value: 'Normal', label: 'Normal' }, { value: 'Warning', label: 'Warning' }]}
                    />
                    <Input.Search
                        style={{ width: 256 }}
                        placeholder="搜索原因/消息/对象"
                        onSearch={setKeyword}
                        allowClear
                    />
                </ToolbarLeft>
            </Toolbar>
            {error
                ? <Alert type="error" message="事件加载失败" />
                : (
                    <Table<PodEvent>
                        rowKey="name"
                        columns={columns}
                        dataSource={visible}
                        loading={loading}
                        size="small"
                        pagination={false}
                    />
                )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                <Button size="small" disabled={pageIndex === 0} onClick={() => setPageIndex(index => index - 1)}>
                    上一页
                </Button>
                <span>第 {pageIndex + 1} 页</span>
                <Button
                    size="small"
                    disabled={!nextToken}
                    onClick={() => {
                        setTokens(prev => [...prev.slice(0, pageIndex + 1), nextToken]);
                        setPageIndex(index => index + 1);
                    }}
                >
                    下一页
                </Button>
            </div>
        </div>
    );
};

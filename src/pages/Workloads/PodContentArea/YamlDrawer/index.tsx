import {Alert, Input, Spin} from 'antd';
import {useEffect, useState} from 'react';

import rawResourceApi from '@/api/rawResource';
import {Drawer} from '@/design/Drawer';
import {parseResourceType} from './resourceType';
import {SearchRow, StatusBox, ViewerFrame} from './YamlDrawer.style';
import {YamlViewer} from './YamlViewer';

export type YamlDrawerEntry = 'workload' | 'pod';

const ENTRY_TITLE: Record<YamlDrawerEntry, string> = {
    workload: '工作负载 YAML',
    pod: 'Pod YAML',
};

export interface YamlDrawerProps {
    open: boolean;
    onClose: () => void;
    entry: YamlDrawerEntry;
    appEnvID: string;
    clusterId: string;
    resourceType: string;
    resourceName: string;
}

function fetchYaml(props: YamlDrawerProps): Promise<unknown> {
    const { entry, appEnvID, clusterId, resourceType, resourceName } = props;
    if (entry === 'pod') {
        return rawResourceApi.getCoreResource({
            appEnvID,
            clusterId,
            resource: 'pods',
            name: resourceName,
            format: 'yaml',
        });
    }
    const parsed = parseResourceType(resourceType);
    if (!parsed) {
        return Promise.reject(new Error('INVALID_RESOURCE_TYPE'));
    }
    return rawResourceApi.getGroupVersionResource({
        appEnvID,
        clusterId,
        group: parsed.group,
        version: parsed.version,
        resource: parsed.resource,
        name: resourceName,
        format: 'yaml',
    });
}

export const YamlDrawer = (props: YamlDrawerProps) => {
    const { open, onClose, entry } = props;
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<'load' | 'parse' | null>(null);
    const [nonce, setNonce] = useState(0);

    useEffect(() => {
        if (!open) {
            return;
        }
        setKeyword('');
        if (props.entry === 'workload' && !parseResourceType(props.resourceType)) {
            setError('parse');
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetchYaml(props)
            .then(result => !cancelled && setContent(typeof result === 'string' ? result : ''))
            .catch(() => !cancelled && setError('load'))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, entry, props.appEnvID, props.clusterId, props.resourceType, props.resourceName, nonce]);

    const renderBody = () => {
        if (error === 'parse') {
            return <StatusBox>无法解析资源类型</StatusBox>;
        }
        if (loading) {
            return (
                <StatusBox>
                    <Spin />
                </StatusBox>
            );
        }
        if (error === 'load') {
            return (
                <Alert
                    type="error"
                    message="加载失败"
                    action={<a onClick={() => setNonce(value => value + 1)}>重试</a>}
                />
            );
        }
        if (!content) {
            return <StatusBox>YAML 内容为空</StatusBox>;
        }
        return (
            <>
                <SearchRow>
                    <Input
                        allowClear
                        value={keyword}
                        placeholder="搜索 yaml 内容"
                        onChange={event => setKeyword(event.target.value)}
                    />
                </SearchRow>
                <ViewerFrame>
                    <YamlViewer value={content} keyword={keyword} />
                </ViewerFrame>
            </>
        );
    };

    return (
        <Drawer
            open={open}
            width={980}
            title={ENTRY_TITLE[entry]}
            onClose={onClose}
            footer={null}
            styles={{ body: { paddingTop: 12 } }}
        >
            {renderBody()}
        </Drawer>
    );
};

import {useEffect, useRef, useState} from 'react';

import {streamContainerLogs} from '@/api/runtimeLogStream';

import {toLogLine, trimLogLines} from './logLine';

import type {LogLine} from './logLine';

interface UseContainerLogStreamParams {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
    /** 'stdout' | 'file' */
    source: string;
    /** source=file 时已提交的文件路径 */
    filePath: string;
    /** 是否跟随（follow）流式增量 */
    following: boolean;
}

const TAIL_LINES = 500;

/**
 * 管理容器日志流的生命周期：following 时以单条 follow 流拉取（首包历史尾部 + 后续增量），
 * 暂停时中止流并保留已渲染内容；切换容器/来源/文件路径或重连时清空重载。
 */
export const useContainerLogStream = (params: UseContainerLogStreamParams) => {
    const { appEnvID, clusterId, podName, containerName, source, filePath, following } = params;
    const [lines, setLines] = useState<LogLine[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const idRef = useRef(0);

    const fileReady = source !== 'file' || filePath.trim().length > 0;
    const active = following && fileReady;

    useEffect(() => {
        if (!active) {
            return;
        }
        setLines([]);
        setError(null);
        idRef.current = 0;
        const controller = streamContainerLogs(
            {
                appEnvID,
                clusterId,
                podName,
                containerName,
                source: source === 'file' ? 'file' : undefined,
                filePath: source === 'file' ? filePath.trim() : undefined,
                tailLines: TAIL_LINES,
                follow: true,
            },
            {
                onLine: raw => setLines(prev => trimLogLines([...prev, toLogLine(raw, idRef.current++)])),
                onError: () => setError('日志连接已中断，请点击重连'),
            },
        );
        return () => controller.abort();
    }, [appEnvID, clusterId, podName, containerName, source, filePath, active, reloadToken]);

    const reconnect = () => setReloadToken(token => token + 1);

    return { lines, error, reconnect, fileReady };
};

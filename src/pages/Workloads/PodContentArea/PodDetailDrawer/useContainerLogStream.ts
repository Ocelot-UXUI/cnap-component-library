import {useEffect, useRef, useState} from 'react';

import {streamContainerLogs} from '@/api/runtimeLogStream';

import {pruneCache, toLogLine, trimLogLines} from './logLine';

import type {CachedLogLine, LogLine} from './logLine';

interface UseContainerLogStreamParams {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
    /** 'stdout' | 'file' */
    source: string;
    /** source=file 时已提交的文件路径 */
    filePath: string;
    /** 是否跟随（follow）流式增量渲染 */
    following: boolean;
}

const TAIL_LINES = 500;

/**
 * 管理容器日志流的生命周期：连接不随 following 关闭。following 时增量直接渲染；
 * 暂停时不断流、把增量按到达时间写入缓存（3min 时间窗），开启后 append 缓存续接。
 * 切换容器/来源/文件路径或重连时清空重载。
 */
export const useContainerLogStream = (params: UseContainerLogStreamParams) => {
    const {appEnvID, clusterId, podName, containerName, source, filePath, following} = params;
    const [lines, setLines] = useState<LogLine[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);
    const idRef = useRef(0);
    const followingRef = useRef(following);
    const cacheRef = useRef<CachedLogLine[]>([]);

    const fileReady = source !== 'file' || filePath.trim().length > 0;
    // 连接生命周期与 following 解耦：只要 fileReady 就保持连接，following 仅决定渲染 vs 缓存
    const active = fileReady;

    // following 由暂停切到开启时，flush 缓存并 append 续接
    useEffect(() => {
        const wasFollowing = followingRef.current;
        followingRef.current = following;
        if (wasFollowing || !following) {
            return;
        }
        const pruned = pruneCache(cacheRef.current, Date.now());
        cacheRef.current = [];
        if (pruned.length) {
            setLines(prev => trimLogLines([...prev, ...pruned.map(item => item.line)]));
        }
    }, [following]);

    useEffect(() => {
        if (!active) {
            return;
        }
        setLines([]);
        setError(null);
        cacheRef.current = [];
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
                onLine: raw => {
                    const line = toLogLine(raw, idRef.current++);
                    if (followingRef.current) {
                        setLines(prev => trimLogLines([...prev, line]));
                        return;
                    }
                    const now = Date.now();
                    cacheRef.current = pruneCache([...cacheRef.current, {line, at: now}], now);
                },
                onError: () => setError('日志连接已中断，请点击重连'),
            },
        );
        return () => controller.abort();
    }, [appEnvID, clusterId, podName, containerName, source, filePath, active, reloadToken]);

    const reconnect = () => setReloadToken(token => token + 1);

    return {lines, error, reconnect, fileReady};
};

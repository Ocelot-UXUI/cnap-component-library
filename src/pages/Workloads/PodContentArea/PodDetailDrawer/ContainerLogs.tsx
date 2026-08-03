import {Alert, Button} from 'antd';
import {useEffect, useMemo, useState} from 'react';

import {LogsPanel} from './ContainerLogs.style';
import {ContainerLogsToolbar} from './ContainerLogsToolbar';
import {LogConsole} from './LogConsole';
import {filterLogLines} from './logLine';
import {useContainerLogStream} from './useContainerLogStream';

import type {LogLevelFilter} from './logLine';

interface ContainerLogsProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
}

const resolveEmptyText = (
    source: string,
    fileReady: boolean,
    lineCount: number,
    following: boolean,
): string => {
    if (source === 'file' && !fileReady) {
        return '请输入文件路径后查看日志';
    }
    if (lineCount === 0) {
        return following ? '暂无日志' : '日志已暂停';
    }
    return '无匹配日志';
};

export const ContainerLogs = ({ appEnvID, clusterId, podName, containerName }: ContainerLogsProps) => {
    const [source, setSource] = useState('stdout');
    const [filePathInput, setFilePathInput] = useState('');
    const [filePath, setFilePath] = useState('');
    const [following, setFollowing] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [level, setLevel] = useState<LogLevelFilter>('ALL');
    const [markerAfterId, setMarkerAfterId] = useState<number | null>(null);
    const [fullscreen, setFullscreen] = useState(false);

    const { lines, error, reconnect, fileReady } = useContainerLogStream({
        appEnvID,
        clusterId,
        podName,
        containerName,
        source,
        filePath,
        following,
    });

    const visibleLines = useMemo(() => filterLogLines(lines, keyword, level), [lines, keyword, level]);

    // 来源/文件路径/跟随态变化会清空重载日志，标记线需一并复位，避免落在错误行
    useEffect(() => setMarkerAfterId(null), [source, filePath, following]);

    const handleSourceChange = (value: string) => {
        setSource(value);
        if (value === 'stdout') {
            setFilePath('');
            setFilePathInput('');
        }
    };

    const handleMark = () => setMarkerAfterId(lines.length ? lines[lines.length - 1].id : null);

    return (
        <LogsPanel fullscreen={fullscreen}>
            <ContainerLogsToolbar
                source={source}
                onSourceChange={handleSourceChange}
                filePathInput={filePathInput}
                onFilePathInputChange={setFilePathInput}
                onFilePathCommit={setFilePath}
                level={level}
                onLevelChange={setLevel}
                onKeywordChange={setKeyword}
                following={following}
                onToggleFollow={() => setFollowing(value => !value)}
                onMark={handleMark}
                fullscreen={fullscreen}
                onToggleFullscreen={() => setFullscreen(value => !value)}
            />
            {error && (
                <Alert
                    type="error"
                    showIcon
                    message={error}
                    action={<Button size="small" onClick={reconnect}>重连</Button>}
                />
            )}
            <LogConsole
                lines={visibleLines}
                keyword={keyword}
                markerAfterId={markerAfterId}
                autoScroll={following}
                emptyText={resolveEmptyText(source, fileReady, lines.length, following)}
            />
        </LogsPanel>
    );
};

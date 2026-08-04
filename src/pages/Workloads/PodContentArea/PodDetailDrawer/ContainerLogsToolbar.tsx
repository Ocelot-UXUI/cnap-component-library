import {FlagOutlined, PlayCircleOutlined} from '@ant-design/icons';
import {Button, Input, Segmented, Select, Tooltip} from 'antd';

import {Pause, Standalone, ZoomIn, ZoomOut} from '@/assets/icons';
import {Toolbar, ToolbarLeft, ToolbarRight} from './PodDetailDrawer.style';

import type {LogLevelFilter} from './logLine';

const SOURCE_OPTIONS = [
    { label: '标准输出', value: 'stdout' },
    { label: '文件输出', value: 'file' },
];

const LEVEL_OPTIONS: Array<{ label: string; value: LogLevelFilter; }> = [
    { label: '全部级别', value: 'ALL' },
    { label: 'INFO', value: 'INFO' },
    { label: 'WARN', value: 'WARN' },
    { label: 'ERROR', value: 'ERROR' },
    { label: 'DEBUG', value: 'DEBUG' },
];

interface ContainerLogsToolbarProps {
    source: string;
    onSourceChange: (value: string) => void;
    filePathInput: string;
    onFilePathInputChange: (value: string) => void;
    onFilePathCommit: (value: string) => void;
    level: LogLevelFilter;
    onLevelChange: (value: LogLevelFilter) => void;
    onKeywordChange: (value: string) => void;
    following: boolean;
    onToggleFollow: () => void;
    onMark: () => void;
    fullscreen: boolean;
    onToggleFullscreen: () => void;
}

export const ContainerLogsToolbar = ({
    source,
    onSourceChange,
    filePathInput,
    onFilePathInputChange,
    onFilePathCommit,
    level,
    onLevelChange,
    onKeywordChange,
    following,
    onToggleFollow,
    onMark,
    fullscreen,
    onToggleFullscreen,
}: ContainerLogsToolbarProps) => (
    <Toolbar>
        <ToolbarLeft>
            <Segmented size="small" value={source} onChange={onSourceChange} options={SOURCE_OPTIONS} />
            {source === 'file' && (
                <Input.Search
                    style={{ width: 220 }}
                    placeholder="输入容器内文件路径"
                    enterButton="确定"
                    value={filePathInput}
                    onChange={event => onFilePathInputChange(event.target.value)}
                    onSearch={value => onFilePathCommit(value.trim())}
                />
            )}
            <Select style={{ width: 120 }} value={level} onChange={onLevelChange} options={LEVEL_OPTIONS} />
            <Input.Search
                style={{ width: 240 }}
                placeholder="搜索日志"
                allowClear
                onChange={event => onKeywordChange(event.target.value)}
            />
        </ToolbarLeft>
        <ToolbarRight>
            <Tooltip title={following ? '暂停自动刷新' : '开启自动刷新'}>
                <Button
                    size="small"
                    danger={following}
                    icon={following
                        ? <Pause width="1em" height="1em" />
                        : <PlayCircleOutlined />}
                    onClick={onToggleFollow}
                />
            </Tooltip>
            <Tooltip title="标记最新日志">
                <Button size="small" icon={<FlagOutlined />} onClick={onMark} />
            </Tooltip>
            <Tooltip title="在窗口查看">
                <Button size="small" icon={<Standalone width="1em" height="1em" />} />
            </Tooltip>
            <Tooltip title={fullscreen ? '退出全屏' : '全屏'}>
                <Button
                    size="small"
                    icon={fullscreen
                        ? <ZoomOut width="1em" height="1em" />
                        : <ZoomIn width="1em" height="1em" />}
                    onClick={onToggleFullscreen}
                />
            </Tooltip>
        </ToolbarRight>
    </Toolbar>
);

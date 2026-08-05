import Icon, {ClearOutlined} from '@ant-design/icons';
import {Alert, Button, message, Select, Tooltip} from '@/design';
import {useState} from 'react';

import {Standalone, ZoomIn, ZoomOut} from '@/assets/icons';
import {semantic} from '@/constants/colors';

import {Toolbar, ToolbarLeft, ToolbarRight} from '../PodDetailDrawer.style';
import {TerminalPanel, TerminalSurface} from './ContainerTerminal.style';
import {useContainerTerminal} from './useContainerTerminal';

import '@xterm/xterm/css/xterm.css';

interface ContainerTerminalProps {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
}

const SHELL_OPTIONS = [
    { value: '/bin/bash', label: '/bin/bash' },
    { value: '/bin/sh', label: '/bin/sh' },
];

export const ContainerTerminal = (props: ContainerTerminalProps) => {
    const [shell, setShell] = useState('/bin/bash');
    const [fullscreen, setFullscreen] = useState(false);
    const { surfaceRef, status, errorMessage, connect, disconnect, clear, syncSize } = useContainerTerminal(props);

    const connected = status === 'connected';
    const connecting = status === 'connecting';

    const handleToggleConnect = () => (connected ? disconnect() : connect(shell));

    const handleClear = () => {
        clear();
        message.success('已清空');
    };

    const handleToggleFullscreen = () => {
        setFullscreen(value => !value);
        // 布局切换后重新适配终端行列
        window.setTimeout(syncSize, 0);
    };

    return (
        <TerminalPanel fullscreen={fullscreen}>
            <Toolbar>
                <ToolbarLeft>
                    <span style={{ color: semantic.text.tertiary }}>Shell</span>
                    <Select
                        style={{ width: 160 }}
                        value={shell}
                        onChange={setShell}
                        options={SHELL_OPTIONS}
                        disabled={connected || connecting}
                    />
                    <Button danger={connected} loading={connecting} onClick={handleToggleConnect}>
                        {connected ? '断开' : '连接'}
                    </Button>
                </ToolbarLeft>
                <ToolbarRight>
                    <Tooltip title={connected ? '清屏' : '当前未连接命令解释器，无法清空'}>
                        <span>
                            <Button
                                size="small"
                                icon={<ClearOutlined />}
                                disabled={!connected}
                                onClick={handleClear}
                            />
                        </span>
                    </Tooltip>
                    <Tooltip title="在窗口打开">
                        <Button size="small" icon={<Icon component={Standalone} />} />
                    </Tooltip>
                    <Tooltip title={fullscreen ? '退出全屏' : '全屏查看'}>
                        <Button
                            size="small"
                            icon={fullscreen
                                ? <Icon component={ZoomOut} />
                                : <Icon component={ZoomIn} />}
                            onClick={handleToggleFullscreen}
                        />
                    </Tooltip>
                </ToolbarRight>
            </Toolbar>
            {status === 'error' && errorMessage && <Alert type="error" showIcon message={errorMessage} />}
            <TerminalSurface ref={surfaceRef} />
        </TerminalPanel>
    );
};

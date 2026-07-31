import {ClearOutlined} from '@ant-design/icons';
import {Button, Select, Tooltip} from 'antd';
import {useState} from 'react';

import Standalone from '@/assets/standalone.svg?react';
import ZoomIn from '@/assets/zoom-in.svg?react';
import ZoomOut from '@/assets/zoom-out.svg?react';
import {semantic} from '@/constants/colors';
import {ConsolePlaceholder, Toolbar, ToolbarLeft, ToolbarRight} from './PodDetailDrawer.style';

export const ContainerTerminal = () => {
    const [connected, setConnected] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <div>
            <Toolbar>
                <ToolbarLeft>
                    <span style={{ color: semantic.text.tertiary }}>Shell</span>
                    <Select
                        style={{ width: 160 }}
                        defaultValue="current"
                        options={[{ value: 'current', label: 'current' }, { value: 'bash', label: 'bash' }, {
                            value: 'sh',
                            label: 'sh',
                        }]}
                    />
                    <Button onClick={() => setConnected(value => !value)}>{connected ? '断开' : '连接'}</Button>
                </ToolbarLeft>
                <ToolbarRight>
                    <Tooltip title="清屏">
                        <Button size="small" icon={<ClearOutlined />} disabled={!connected} />
                    </Tooltip>
                    <Tooltip title="在窗口打开">
                        <Button size="small" icon={<Standalone width="1em" height="1em" />} />
                    </Tooltip>
                    <Tooltip title={fullscreen ? '退出全屏' : '全屏查看'}>
                        <Button
                            size="small"
                            icon={fullscreen
                                ? <ZoomOut width="1em" height="1em" />
                                : <ZoomIn width="1em" height="1em" />}
                            onClick={() => setFullscreen(value => !value)}
                        />
                    </Tooltip>
                </ToolbarRight>
            </Toolbar>
            <ConsolePlaceholder>
                {connected ? '终端已连接（内容区占位）' : '终端内容区占位（未连接）'}
            </ConsolePlaceholder>
        </div>
    );
};

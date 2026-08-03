import {tryConfirmSessionLost} from '@/auth/login';
import qs from 'qs';
import {getCommonOptionsForAppspace} from './services/primary/commonOptions';

const TERMINAL_WS_BASE_PATH = '/api/cnap/ws/v1';

/** v5.channel.k8s.io 协议 channel ID */
const CHANNEL = {
    STDIN: 0x00,
    STDOUT: 0x01,
    STDERR: 0x02,
    ERROR: 0x03,
    RESIZE: 0x04,
} as const;

export interface ContainerTerminalParams {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
    /** shell 路径，默认 /bin/sh */
    command?: string;
}

export interface ContainerTerminalHandlers {
    onData: (data: string) => void;
    onDone?: () => void;
    onError?: (error: unknown) => void;
}

export interface ContainerTerminalController {
    /** 发送用户输入到 stdin */
    sendInput: (data: string) => void;
    /** 调整终端尺寸 */
    resize: (rows: number, cols: number) => void;
    /** 关闭连接 */
    close: () => void;
}

/** WebSocket 无法设置自定义 header，将认证头转为 query 参数 */
const buildAuthQuery = (): Record<string, string> => {
    const {headers} = getCommonOptionsForAppspace();
    const params: Record<string, string> = {};
    if (headers['x-region']) {
        params['x-region'] = headers['x-region'];
    }
    if (headers.baggage) {
        params.baggage = headers.baggage;
    }
    if (headers['x-account-id']) {
        params['x-account-id'] = headers['x-account-id'];
    }
    return params;
};

/** 拼装容器终端 WebSocket 路径 */
export const buildContainerTerminalWsPath = (params: ContainerTerminalParams): string => {
    const {appEnvID, clusterId, podName, containerName, command} = params;
    const path = `/application-environments/${encodeURIComponent(appEnvID)}`
        + `/runtime/clusters/${encodeURIComponent(clusterId)}`
        + `/pods/${encodeURIComponent(podName)}`
        + `/containers/${encodeURIComponent(containerName)}/terminal`;
    const query: Record<string, string> = {...buildAuthQuery()};
    if (command) {
        query.command = command;
    }
    const search = qs.stringify(query, {arrayFormat: 'comma', skipNulls: true, allowDots: true});
    return TERMINAL_WS_BASE_PATH + path + (search ? `?${search}` : '');
};

/** 拼装完整的容器终端 WebSocket URL */
export const buildContainerTerminalWsUrl = (params: ContainerTerminalParams): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${buildContainerTerminalWsPath(params)}`;
};

/** 建立 v5.channel.k8s.io WebSocket 终端连接 */
export const connectContainerTerminal = (
    params: ContainerTerminalParams,
    handlers: ContainerTerminalHandlers,
): ContainerTerminalController => {
    const socket = new WebSocket(buildContainerTerminalWsUrl(params), ['v5.channel.k8s.io']);
    socket.binaryType = 'arraybuffer';
    let clientClosed = false;

    socket.onmessage = (event) => {
        if (typeof event.data === 'string') {
            handlers.onData(event.data);
            return;
        }
        const view = new DataView(event.data as ArrayBuffer);
        if (view.byteLength < 1) {
            return;
        }
        const channel = view.getUint8(0);
        const payload = new TextDecoder().decode(new Uint8Array(event.data as ArrayBuffer, 1));
        if (channel === CHANNEL.STDOUT || channel === CHANNEL.STDERR) {
            handlers.onData(payload);
        } else if (channel === CHANNEL.ERROR) {
            handlers.onError?.(new Error(payload));
        }
    };

    socket.onclose = (event) => {
        if (clientClosed || event.code === 1000 || event.code === 1005) {
            handlers.onDone?.();
            return;
        }
        tryConfirmSessionLost(null, {status: event.code, data: undefined, headers: {}});
        handlers.onError?.(new Error(`终端连接已关闭: ${event.code} ${event.reason}`));
    };

    socket.onerror = () => {
        if (!clientClosed) {
            handlers.onError?.(new Error('终端 WebSocket 连接失败'));
        }
    };

    return {
        sendInput: (data: string) => {
            if (socket.readyState !== WebSocket.OPEN) {
                return;
            }
            const encoded = new TextEncoder().encode(data);
            const frame = new Uint8Array(encoded.length + 1);
            frame[0] = CHANNEL.STDIN;
            frame.set(encoded, 1);
            socket.send(frame);
        },
        resize: (rows: number, cols: number) => {
            if (socket.readyState !== WebSocket.OPEN) {
                return;
            }
            const payload = JSON.stringify({Height: rows, Width: cols});
            const encoded = new TextEncoder().encode(payload);
            const frame = new Uint8Array(encoded.length + 1);
            frame[0] = CHANNEL.RESIZE;
            frame.set(encoded, 1);
            socket.send(frame);
        },
        close: () => {
            clientClosed = true;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close(1000, 'client close');
            }
        },
    };
};

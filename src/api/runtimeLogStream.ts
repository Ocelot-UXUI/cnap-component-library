import {tryConfirmSessionLost} from '@/auth/login';
import qs from 'qs';
import {getCommonOptionsForAppspace} from './services/primary/commonOptions';

const LOG_WS_BASE_PATH = '/api/cnap/ws/v1';

export interface ContainerLogStreamParams {
    /** 应用环境关系 ID */
    appEnvID: string;
    /** 集群 ID */
    clusterId: string;
    /** Pod 名 */
    podName: string;
    /** 容器名 */
    containerName: string;
    /** 日志来源，不传=容器标准输出，file=容器内文件 */
    source?: string;
    /** 返回最后 N 行 */
    tailLines?: number;
    /** source=file 时的容器内文件路径 */
    filePath?: string;
    /** 是否持续获取新增日志（流式跟随） */
    follow?: boolean;
}

export interface ContainerLogStreamHandlers {
    onLine: (line: string) => void;
    onDone?: () => void;
    onError?: (error: unknown) => void;
}

export interface ContainerLogStreamController {
    abort: () => void;
}

/** 纯逻辑：按 `\n` 从连续 chunk 中装配完整行，跨 chunk 的半行留在缓冲中。 */
export const createLineAssembler = () => {
    let buffer = '';
    return {
        push(chunk: string): string[] {
            buffer += chunk;
            const parts = buffer.split('\n');
            buffer = parts.pop() ?? '';
            return parts;
        },
        flush(): string[] {
            if (!buffer) {
                return [];
            }
            const rest = buffer;
            buffer = '';
            return [rest];
        },
    };
};

/** WebSocket 无法设置自定义 header，将 commonOptions 中的认证头转为 query 参数 */
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

/** 纯逻辑：拼装容器日志 WebSocket 路径（含 query），不含 protocol/host */
export const buildContainerLogWsPath = (params: ContainerLogStreamParams): string => {
    const {appEnvID, clusterId, podName, containerName, ...query} = params;
    const path = `/application-environments/${encodeURIComponent(appEnvID)}`
        + `/runtime/clusters/${encodeURIComponent(clusterId)}`
        + `/pods/${encodeURIComponent(podName)}`
        + `/containers/${encodeURIComponent(containerName)}/logs`;
    const search = qs.stringify(
        {...query, ...buildAuthQuery()},
        {arrayFormat: 'comma', skipNulls: true, allowDots: true},
    );
    return LOG_WS_BASE_PATH + path + (search ? `?${search}` : '');
};

/** 拼装完整的容器日志 WebSocket URL */
export const buildContainerLogWsUrl = (params: ContainerLogStreamParams): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${buildContainerLogWsPath(params)}`;
};

/** 以 WebSocket 消费容器日志流，逐行回调；返回控制器，abort() 中止流。 */
export const streamContainerLogs = (
    params: ContainerLogStreamParams,
    handlers: ContainerLogStreamHandlers,
): ContainerLogStreamController => {
    const socket = new WebSocket(buildContainerLogWsUrl(params));
    const assembler = createLineAssembler();
    let clientClosed = false;

    socket.onmessage = (event) => {
        const text = typeof event.data === 'string' ? event.data : '';
        for (const line of assembler.push(text)) {
            handlers.onLine(line);
        }
    };

    socket.onclose = (event) => {
        for (const line of assembler.flush()) {
            handlers.onLine(line);
        }
        if (clientClosed || event.code === 1000 || event.code === 1005) {
            handlers.onDone?.();
            return;
        }
        tryConfirmSessionLost(null, {status: event.code, data: undefined, headers: {}});
        handlers.onError?.(new Error(`日志连接已关闭: ${event.code} ${event.reason}`));
    };

    socket.onerror = () => {
        if (!clientClosed) {
            handlers.onError?.(new Error('日志 WebSocket 连接失败'));
        }
    };

    return {
        abort: () => {
            clientClosed = true;
            if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
                socket.close(1000, 'client abort');
            }
        },
    };
};

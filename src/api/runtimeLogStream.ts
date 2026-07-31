import {tryConfirmSessionLost} from '@/auth/login';
import qs from 'qs';
import {getCommonOptionsForAppspace} from './services/primary/commonOptions';

/** 与 services/primary 主工厂保持一致的 baseURL 前缀 */
const LOG_BASE_URL = '/api/cnap/rest/v1';

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

/** 纯逻辑：拼装容器日志请求 URL，query 序列化与主工厂 paramsSerializer 对齐 */
export const buildContainerLogUrl = (params: ContainerLogStreamParams): string => {
    const { appEnvID, clusterId, podName, containerName, ...query } = params;
    const path = `/application-environments/${encodeURIComponent(appEnvID)}`
        + `/runtime/clusters/${encodeURIComponent(clusterId)}`
        + `/pods/${encodeURIComponent(podName)}`
        + `/containers/${encodeURIComponent(containerName)}/logs`;
    const search = qs.stringify(query, { arrayFormat: 'comma', skipNulls: true, allowDots: true });
    return LOG_BASE_URL + path + (search ? `?${search}` : '');
};

const safeParseBody = async (response: Response): Promise<unknown> => {
    try {
        return await response.json();
    } catch {
        return undefined;
    }
};

const pumpStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onLine: (line: string) => void,
): Promise<void> => {
    const decoder = new TextDecoder();
    const assembler = createLineAssembler();
    for (;;) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        for (const line of assembler.push(decoder.decode(value, { stream: true }))) {
            onLine(line);
        }
    }
    // flush 解码器，避免末尾跨 chunk 的多字节字符被丢弃
    for (const line of [...assembler.push(decoder.decode()), ...assembler.flush()]) {
        onLine(line);
    }
};

const consumeLogStream = async (
    params: ContainerLogStreamParams,
    handlers: ContainerLogStreamHandlers,
    signal: AbortSignal,
): Promise<void> => {
    const { headers, withCredentials } = getCommonOptionsForAppspace();
    try {
        const response = await fetch(buildContainerLogUrl(params), {
            method: 'GET',
            headers,
            credentials: withCredentials ? 'include' : 'same-origin',
            signal,
        });

        if (!response.ok || !response.body) {
            const data = await safeParseBody(response);
            // 补齐主工厂 onReject 的 session 失效处理（原生 fetch 不经过该链路）
            tryConfirmSessionLost(null, { status: response.status, data, headers: {} });
            throw new Error(`容器日志请求失败: ${response.status} ${response.statusText}`);
        }

        await pumpStream(response.body.getReader(), handlers.onLine);
        handlers.onDone?.();
    } catch (error) {
        // 主动中止（abort）不视为错误
        if (signal.aborted) {
            return;
        }
        handlers.onError?.(error);
    }
};

/** 以原生 fetch + ReadableStream 消费容器日志流，逐行回调；返回控制器，abort() 中止流。 */
export const streamContainerLogs = (
    params: ContainerLogStreamParams,
    handlers: ContainerLogStreamHandlers,
): ContainerLogStreamController => {
    const controller = new AbortController();
    void consumeLogStream(params, handlers, controller.signal);
    return { abort: () => controller.abort() };
};

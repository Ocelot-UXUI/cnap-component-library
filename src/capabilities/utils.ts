/**
 * 异步等待工具函数
 */

interface PollOptions {
    /** 最大等待时间 ms */
    timeout?: number;
    /** 轮询间隔 ms */
    interval?: number;
    /** 超时错误信息 */
    timeoutMessage?: string;
}

/**
 * 轮询等待条件满足
 */
export const pollUntil = async <T>(
    fn: () => Promise<T>,
    predicate: (result: T) => boolean,
    options: PollOptions = {},
): Promise<T> => {
    const {
        timeout = 30000,
        interval = 1000,
        timeoutMessage = '等待超时',
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const result = await fn();
            if (predicate(result)) {
                return result;
            }
        } catch {
            // 忽略轮询过程中的错误，继续等待
        }

        await sleep(interval);
    }

    throw new Error(timeoutMessage);
};

/**
 * 等待指定时间
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 等待元素出现
 */
export const waitForElement = async (
    selector: string,
    options: PollOptions = {},
): Promise<Element> => {
    const result = await pollUntil(
        async () => document.querySelector(selector),
        el => el !== null,
        {
            ...options,
            timeoutMessage: `等待元素超时: ${selector}`,
        },
    );
    return result!;
};

/**
 * 等待元素消失
 */
export const waitForElementRemoved = async (
    selector: string,
    options: PollOptions = {},
): Promise<void> => {
    await pollUntil(
        async () => document.querySelector(selector),
        el => el === null,
        {
            ...options,
            timeoutMessage: `等待元素消失超时: ${selector}`,
        },
    );
};

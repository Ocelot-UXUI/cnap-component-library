import copy from 'copy-to-clipboard';

interface CopyTextOptions {
    format?: 'text/plain' | 'text/html';
}

// 统一走 copy-to-clipboard：v4 优先 navigator.clipboard，失败回退 execCommand，返回 Promise<boolean>。
export const copyText = (text: string, options?: CopyTextOptions): Promise<boolean> => {
    return copy(text, options);
};

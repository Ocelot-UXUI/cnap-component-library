import {APP_IS_DEV} from '@/constants/app';
import {Input, Modal} from '@/design';
import {createElement} from 'react';
import type {ChangeEvent} from 'react';

const ref = {
    confirming: false,
    devCookie: '',
};

const handleCookieChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    ref.devCookie = e.target.value;
};

const handleRedirect = () => {
    if (APP_IS_DEV) {
        ref.devCookie.split('; ').forEach(i => {
            document.cookie = `${i}; path=/`;
        });
    }
    window.location.reload();
};

const buildDevContent = () =>
    createElement(
        'div',
        null,
        createElement('p', { style: { margin: '0 0 8px' } }, '当前会话已经超时，请复制沙盒 cookie 填入'),
        createElement(Input.TextArea, {
            placeholder: '粘贴 cookie，例如：UUAP_P_TOKEN=PT-xxx; UUAP_S_TOKEN=ST-yyy',
            rows: 4,
            onChange: handleCookieChange,
        }),
    );

export const confirmSessionLost = (): void => {
    if (ref.confirming) {
        return;
    }
    ref.confirming = true;
    window.onerror = null;
    Modal.confirm({
        title: '会话超时',
        content: APP_IS_DEV ? buildDevContent() : '当前会话已经超时，请刷新页面后重试',
        onOk: handleRedirect,
    });
};

interface ResponseLike {
    status: number;
    data: unknown;
    headers?: Record<string, string>;
}

export const tryConfirmSessionLost = (
    request: unknown,
    response: ResponseLike | null,
): void => {
    // UUAP 302 redirect 直接取消了请求，request.status === 0
    if (request && (request as XMLHttpRequest).status === 0) {
        confirmSessionLost();
        return;
    }

    if (!response) {
        return;
    }

    console.error(`请求报错，x-bce-request-id: ${response.headers?.['x-bce-request-id'] ?? ''}`);

    const data = response.data as Record<string, unknown> | undefined;
    const messageGlobal = (data?.message as Record<string, string> | undefined)?.global;

    if (
        (response.status === 500 || response.status === 401)
        && data?.code === 302
        && messageGlobal === 'uuap认证失败，请重新登陆。'
    ) {
        confirmSessionLost();
    }
};

export const getLoginCallbackUrl = (encode = false): string => {
    const params = new URLSearchParams(window.location.search);
    const href = window.location.origin + window.location.pathname + '?' + params.toString();
    return encode ? encodeURIComponent(href) : href;
};

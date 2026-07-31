import {confirmSessionLost} from '@/auth/login';
import {APP_IS_DEV} from '@/constants/app';
import {createContext, useContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';

interface UserContextValue {
    username: string;
}

const UserContext = createContext<UserContextValue>({ username: '' });

interface LoginInfoResponse {
    code?: number;
    redirectUrl?: string;
    username?: string;
    user?: { username?: string; };
    account?: { id?: number; username?: string; };
}

interface FetchLoginResult {
    username: string;
    redirectUrl?: string;
}

const fetchLoginInfo = (): Promise<FetchLoginResult> =>
    fetch('/api/home/v2/login-info')
        .then(r => r.json())
        .then((data: LoginInfoResponse) => {
            if (data?.code === 40001 && data?.redirectUrl) {
                return { username: '', redirectUrl: data.redirectUrl };
            }
            return {
                username: data?.user?.username ?? data?.username ?? data?.account?.username ?? '',
            };
        })
        .catch(() => ({ username: '' }));

// 防止 UUAP 重定向死循环：每次页面加载最多执行一次 UUAP 跳转
const UUAP_REDIRECT_KEY = 'uuap_redirect_done';

// API 返回的 redirectUrl 中，originalUrl 指向 API 自身。
// 将 originalUrl 替换为当前应用页面地址，确保 UUAP 登录后跳回应用而非 API 端点。
const buildLoginRedirectUrl = (apiRedirectUrl: string): string => {
    try {
        const url = new URL(apiRedirectUrl);
        const service = url.searchParams.get('service');
        if (!service) {
            return apiRedirectUrl;
        }
        const serviceUrl = new URL(service);
        serviceUrl.searchParams.set('originalUrl', window.location.href);
        url.searchParams.set('service', serviceUrl.toString());
        return url.toString();
    } catch {
        return apiRedirectUrl;
    }
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [username, setUsername] = useState<string>(
        () => window.__icloud__?.username ?? '',
    );

    useEffect(
        () => {
            if (window.__icloud__?.username) {
                return;
            }
            fetchLoginInfo().then(({ username: name, redirectUrl }) => {
                if (name) {
                    setUsername(name);
                    sessionStorage.removeItem(UUAP_REDIRECT_KEY);
                } else if (redirectUrl && !APP_IS_DEV) {
                    // 防死循环：只允许跳转一次，跳回来仍失败则停止
                    if (sessionStorage.getItem(UUAP_REDIRECT_KEY)) {
                        return;
                    }
                    sessionStorage.setItem(UUAP_REDIRECT_KEY, '1');
                    window.location.href = buildLoginRedirectUrl(redirectUrl);
                } else if (APP_IS_DEV) {
                    confirmSessionLost();
                }
            });
        },
        [],
    );

    return (
        <UserContext.Provider value={{ username }}>
            {children}
        </UserContext.Provider>
    );
};

export const useCurrentUsername = (): string => useContext(UserContext).username;

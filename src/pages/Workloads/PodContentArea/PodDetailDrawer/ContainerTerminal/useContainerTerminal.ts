import {useCallback, useEffect, useRef, useState} from 'react';
import {FitAddon} from '@xterm/addon-fit';
import {Terminal} from '@xterm/xterm';

import {connectContainerTerminal} from '@/api/runtimeTerminal';
import {semantic} from '@/constants/colors';

import type {ContainerTerminalController} from '@/api/runtimeTerminal';

export type TerminalStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface TerminalTarget {
    appEnvID: string;
    clusterId: string;
    podName: string;
    containerName: string;
}

const TERMINAL_FONT = 'Menlo, Monaco, Consolas, "Courier New", monospace';

/**
 * 管理 xterm 实例与 v5.channel.k8s.io WebSocket 会话的生命周期：
 * 挂载即创建终端并注册 stdin 转发；connect 建会话、onOpen 后置连通并首次 resize；
 * 尺寸变化经 addon-fit 同步；断开保留最后画面；切换容器/卸载关闭会话防泄漏。
 */
export const useContainerTerminal = (target: TerminalTarget) => {
    const surfaceRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);
    const fitRef = useRef<FitAddon | null>(null);
    const ctrlRef = useRef<ContainerTerminalController | null>(null);
    const targetRef = useRef(target);
    targetRef.current = target;
    const [status, setStatus] = useState<TerminalStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const syncSize = useCallback(() => {
        const term = termRef.current;
        fitRef.current?.fit();
        if (term && ctrlRef.current) {
            ctrlRef.current.resize(term.rows, term.cols);
        }
    }, []);

    useEffect(() => {
        if (!surfaceRef.current) {
            return;
        }
        const term = new Terminal({
            convertEol: true,
            cursorBlink: true,
            fontFamily: TERMINAL_FONT,
            fontSize: 12,
            theme: {background: semantic.logConsole.bg, foreground: semantic.logConsole.text},
        });
        const fit = new FitAddon();
        term.loadAddon(fit);
        term.open(surfaceRef.current);
        fit.fit();
        term.onData(data => ctrlRef.current?.sendInput(data));
        termRef.current = term;
        fitRef.current = fit;
        const observer = new ResizeObserver(() => syncSize());
        observer.observe(surfaceRef.current);
        return () => {
            observer.disconnect();
            ctrlRef.current?.close();
            ctrlRef.current = null;
            term.dispose();
            termRef.current = null;
            fitRef.current = null;
        };
    }, [syncSize]);

    const disconnect = useCallback(() => {
        ctrlRef.current?.close();
        ctrlRef.current = null;
        setStatus('idle');
    }, []);

    const connect = useCallback((command: string) => {
        const term = termRef.current;
        if (!term || ctrlRef.current) {
            return;
        }
        setStatus('connecting');
        setErrorMessage(null);
        term.focus();
        ctrlRef.current = connectContainerTerminal(
            {...targetRef.current, command},
            {
                onOpen: () => {
                    setStatus('connected');
                    syncSize();
                },
                onData: data => term.write(data),
                onError: error => {
                    ctrlRef.current = null;
                    setStatus('error');
                    setErrorMessage(error instanceof Error ? error.message : '终端连接失败');
                },
                onDone: () => {
                    ctrlRef.current = null;
                    setStatus(prev => (prev === 'error' ? prev : 'idle'));
                },
            },
        );
    }, [syncSize]);

    const clear = useCallback(() => termRef.current?.clear(), []);

    // 切换容器时断开旧会话并清屏，避免串话
    useEffect(() => {
        disconnect();
        termRef.current?.clear();
    }, [target.appEnvID, target.clusterId, target.podName, target.containerName, disconnect]);

    return {surfaceRef, status, errorMessage, connect, disconnect, clear, syncSize};
};

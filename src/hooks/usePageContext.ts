/**
 * usePageContext - 扫描当前页面语义元素，生成 AI 可用的页面上下文快照
 */
import {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router-dom';

export interface PageElement {
    role?: string;
    action?: string;
    entity?: string;
    param?: string;
    desc?: string;
    tagName: string;
    visible: boolean;
    disabled: boolean;
}

export interface PageContext {
    route: string;
    pageTitle: string;
    elements: PageElement[];
    summary: string;
}

const SCAN_SELECTOR = '[data-ai-role],[data-ai-action],[data-ai-param]';

function isVisible(el: HTMLElement): boolean {
    return el.offsetParent !== null && getComputedStyle(el).display !== 'none';
}

function scanPageElements(): PageElement[] {
    const nodes = document.querySelectorAll<HTMLElement>(SCAN_SELECTOR);
    return Array.from(nodes)
        .filter(isVisible)
        .map(el => ({
            role: el.dataset.aiRole,
            action: el.dataset.aiAction,
            entity: el.dataset.aiEntity,
            param: el.dataset.aiParam,
            desc: el.dataset.aiDesc,
            tagName: el.tagName.toLowerCase(),
            visible: true,
            disabled: (el as HTMLButtonElement).disabled ?? false,
        }));
}

function buildSummary(route: string, elements: PageElement[]): string {
    const actions = elements
        .filter(e => e.action && !e.disabled)
        .map(e => e.desc || e.action);
    const params = elements
        .filter(e => e.param)
        .map(e => e.desc || e.param);

    const parts: string[] = [`当前路由: ${route}`];
    if (actions.length > 0) {
        parts.push(`可操作: ${[...new Set(actions)].join('、')}`);
    }
    if (params.length > 0) {
        parts.push(`可输入参数: ${[...new Set(params)].join('、')}`);
    }
    return parts.join('。');
}

export function usePageContext(): { pageContext: PageContext; refreshContext: () => void; } {
    const location = useLocation();
    const observerRef = useRef<MutationObserver | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buildContext = useCallback((): PageContext => {
        const elements = scanPageElements();
        const route = location.pathname;
        const pageTitle = document.title || document.querySelector('h1')?.textContent || route;
        return { route, pageTitle, elements, summary: buildSummary(route, elements) };
    }, [location.pathname]);

    const [pageContext, setPageContext] = useState<PageContext>(() => buildContext());

    const refreshContext = useCallback(() => {
        setPageContext(buildContext());
    }, [buildContext]);

    // 路由变化时刷新
    useEffect(() => {
        // 延迟 300ms 等页面渲染完成
        const t = setTimeout(refreshContext, 300);
        return () => clearTimeout(t);
    }, [location.pathname, refreshContext]);

    // MutationObserver 监听 DOM 变化（防抖 300ms）
    useEffect(() => {
        observerRef.current = new MutationObserver(() => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(refreshContext, 300);
        });
        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-ai-action', 'data-ai-param', 'data-ai-role'],
        });
        return () => {
            observerRef.current?.disconnect();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [refreshContext]);

    return { pageContext, refreshContext };
}

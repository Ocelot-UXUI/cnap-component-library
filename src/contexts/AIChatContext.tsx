/**
 * AI 对话状态管理 Context
 */
import type {DisplayMessage} from '@/api/ai/types';
import {useAIChatLogic} from '@/hooks/useAIChatLogic';
import {createContext, useContext} from 'react';

interface AIChatState {
    messages: DisplayMessage[];
    isStreaming: boolean;
}

interface AIChatContextValue extends AIChatState {
    send: (input: string) => Promise<void>;
    regenerate: () => Promise<void>;
    stop: () => void;
    clear: () => void;
}

export const AIChatContext = createContext<AIChatContextValue | null>(null);

interface AIChatProviderProps {
    children: React.ReactNode;
}

export const AIChatProvider = ({ children }: AIChatProviderProps) => {
    const chatLogic = useAIChatLogic();

    return (
        <AIChatContext.Provider value={chatLogic}>
            {children}
        </AIChatContext.Provider>
    );
};

export const useAIChat = (): AIChatContextValue => {
    const ctx = useContext(AIChatContext);
    if (!ctx) {
        throw new Error('useAIChat must be used within AIChatProvider');
    }
    return ctx;
};

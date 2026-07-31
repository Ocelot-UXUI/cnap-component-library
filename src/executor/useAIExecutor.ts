/**
 * AI 执行器 Hook
 */
import {useContext} from 'react';
import {AIExecutorContext} from './AIExecutorProvider';

export const useAIExecutor = () => {
    const context = useContext(AIExecutorContext);

    if (!context) {
        throw new Error('useAIExecutor must be used within AIExecutorProvider');
    }

    return context;
};

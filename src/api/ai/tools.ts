import {agentCapabilities} from '@/agentCapabilities';
import type {AiTool} from './types';

export const AI_TOOLS: AiTool[] = agentCapabilities.map(capability => ({
    type: 'function',
    function: {
        name: capability.id,
        description: capability.description,
        parameters: capability.inputSchema as AiTool['function']['parameters'],
    },
}));

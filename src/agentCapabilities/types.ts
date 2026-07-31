import type {ContextRequirements} from '@/navigation';
import type {AgentToolResult} from '@/types/agentTool';

export interface AgentCapabilityContextSnapshot {
    currentContext: Record<string, string | undefined>;
    invalidContext: string[];
}

export interface AgentCapability {
    id: string;
    description: string;
    inputSchema: Record<string, unknown>;
    requiredContext: ContextRequirements;
    reads: string[];
    writes: string[];
    enabledWhen: (snapshot: AgentCapabilityContextSnapshot) => boolean;
    execute: (input: Record<string, unknown>) => AgentToolResult;
}

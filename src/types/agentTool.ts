export type AgentToolPhase = 'resolve_target' | 'validate_input' | 'validate_context' | 'execute';

export interface AgentToolError {
    code: string;
    details?: Record<string, unknown>;
}

export interface AgentToolResult {
    ok: boolean;
    tool: string;
    code?: string;
    phase?: AgentToolPhase;
    input: Record<string, unknown>;
    data?: Record<string, unknown>;
    error?: AgentToolError;
}

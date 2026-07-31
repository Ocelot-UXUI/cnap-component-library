import {getAgentNavigationTargets} from './derive';

export function formatAgentNavigationContext(): string {
    const lines = getAgentNavigationTargets().map(target => {
        const contextKeys = Object.keys(target.contextRequirements);
        const contextPart = contextKeys.length > 0 ? `，上下文: ${contextKeys.join(', ')}` : '';
        const paramPart = target.params.length > 0 ? `，参数: {${target.params.join('}, {')}}` : '';
        return `- ${target.key}: ${target.agentDescription}${paramPart}${contextPart}`;
    });
    return `## 可用导航目标\n${lines.join('\n')}`;
}

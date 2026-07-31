import {executeNavigate} from '@/executor/navigationTool';
import {getAgentNavigationTargets} from '@/navigation';
import {
    contextInputSchemas,
    listAvailableAccounts,
    listAvailableApplications,
    listAvailableEnvironments,
    selectAccount,
    selectApplication,
    selectEnvironment,
} from './contextCapabilities';
import type {AgentCapability, AgentCapabilityContextSnapshot} from './types';

const alwaysEnabled = () => true;
const hasAccount = (snapshot: AgentCapabilityContextSnapshot) => Boolean(snapshot.currentContext.accountId);
const hasApplication = (snapshot: AgentCapabilityContextSnapshot) =>
    Boolean(snapshot.currentContext.accountId && snapshot.currentContext.applicationId);

const navigateInputSchema = {
    type: 'object',
    properties: {
        routeKey: {
            type: 'string',
            description: 'Stable navigation target key.',
            enum: getAgentNavigationTargets().map(target => target.key),
        },
        routeParams: {
            type: 'object',
            description: 'Route parameters required by the selected target.',
            additionalProperties: { type: 'string' },
        },
    },
    required: ['routeKey'],
};

export const agentCapabilities: AgentCapability[] = [
    {
        id: 'navigate',
        description: 'Navigate to a registered CNAP page by route key and structured params.',
        inputSchema: navigateInputSchema,
        requiredContext: {},
        reads: ['navigationTargets', 'navigationContext'],
        writes: ['routerLocation'],
        enabledWhen: alwaysEnabled,
        execute: executeNavigate,
    },
    {
        id: 'selectAccount',
        description: 'Select the active account context.',
        inputSchema: contextInputSchemas.selectAccount,
        requiredContext: {},
        reads: ['accounts'],
        writes: ['navigationContext.accountId'],
        enabledWhen: alwaysEnabled,
        execute: selectAccount,
    },
    {
        id: 'selectApplication',
        description: 'Select the active application context under the current account.',
        inputSchema: contextInputSchemas.selectApplication,
        requiredContext: { accountId: true },
        reads: ['applications', 'navigationContext'],
        writes: ['navigationContext.applicationId', 'navigationContext.environmentId'],
        enabledWhen: hasAccount,
        execute: selectApplication,
    },
    {
        id: 'selectEnvironment',
        description: 'Select the active environment context under the current account and application.',
        inputSchema: contextInputSchemas.selectEnvironment,
        requiredContext: { accountId: true, applicationId: true },
        reads: ['environments', 'navigationContext'],
        writes: ['navigationContext.environmentId'],
        enabledWhen: hasApplication,
        execute: selectEnvironment,
    },
    {
        id: 'listAvailableAccounts',
        description: 'List selectable account candidates and current context facts.',
        inputSchema: contextInputSchemas.list,
        requiredContext: {},
        reads: ['accounts', 'navigationContext'],
        writes: [],
        enabledWhen: alwaysEnabled,
        execute: listAvailableAccounts,
    },
    {
        id: 'listAvailableApplications',
        description: 'List application candidates available under the current account context.',
        inputSchema: contextInputSchemas.list,
        requiredContext: { accountId: true },
        reads: ['applications', 'navigationContext'],
        writes: [],
        enabledWhen: hasAccount,
        execute: listAvailableApplications,
    },
    {
        id: 'listAvailableEnvironments',
        description: 'List environment candidates available under the current account and application context.',
        inputSchema: contextInputSchemas.list,
        requiredContext: { accountId: true, applicationId: true },
        reads: ['environments', 'navigationContext'],
        writes: [],
        enabledWhen: hasApplication,
        execute: listAvailableEnvironments,
    },
];

export function getAgentCapability(id: string): AgentCapability | undefined {
    return agentCapabilities.find(capability => capability.id === id);
}

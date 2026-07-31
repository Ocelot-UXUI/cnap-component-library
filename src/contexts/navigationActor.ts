import {createActor} from 'xstate';

import {emptyNavigationContextCandidates} from './navigationContextCandidates';
import {readStoredContext} from './navigationContextData';
import {navigationMachine} from './navigationContextMachine';

import type {NavigationContextState} from './navigationContextData';

const initialStoredContext = readStoredContext();

export const navigationActor = createActor(navigationMachine, {
    input: {
        initialContext: initialStoredContext.current,
        initialCandidates: emptyNavigationContextCandidates,
        initialStoredContext,
    },
}).start();

export const navigationActions = {
    setAccountId: (accountId?: string) => navigationActor.send({ type: 'selectAccount', accountId }),
    setApplicationId: (applicationId?: string) => navigationActor.send({ type: 'selectApplication', applicationId }),
    setEnvironmentId: (environmentId?: string) => navigationActor.send({ type: 'selectEnvironment', environmentId }),
    setClusterId: (clusterId?: string) => navigationActor.send({ type: 'selectCluster', clusterId }),
    reloadClusters: () => navigationActor.send({ type: 'reloadClusters' }),
    syncRouteContext: (context: NavigationContextState) => navigationActor.send({ type: 'syncRouteContext', context }),
    rememberWorkspaceContext: (workspaceKey: string) =>
        navigationActor.send({ type: 'rememberWorkspace', workspaceKey }),
    restoreWorkspaceContext: (workspaceKey: string) => navigationActor.send({ type: 'restoreWorkspace', workspaceKey }),
};

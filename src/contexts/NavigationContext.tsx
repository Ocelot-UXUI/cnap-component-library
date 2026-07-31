import {useSelector} from '@xstate/react';

import {navigationActor} from './navigationActor';
import {selectAppEnvID, selectNavigationSnapshot} from './navigationContextMachine';

import type {ReactNode} from 'react';
import type {NavigationContextSnapshot} from './navigationContextMachine';
import type {OptionGroupSnapshot} from './navigationOptionGroupTypes';
import {selectOptionGroupSnapshot} from './navigationOptionGroupTypes';

export {navigationActions, navigationActor} from './navigationActor';

export function NavigationProvider({ children }: { children: ReactNode; }) {
    return <>{children}</>;
}

export function useNavigationSnapshot(): NavigationContextSnapshot {
    return useSelector(navigationActor, selectNavigationSnapshot);
}

/** 当前上下文的 appEnvID（未选中有效环境时为 undefined） */
export function useAppEnvID(): string | undefined {
    return useSelector(navigationActor, state => selectAppEnvID(selectNavigationSnapshot(state)));
}

export function useNavigationOptionGroups(): OptionGroupSnapshot | undefined {
    const optionGroupRef = useSelector(navigationActor, state => state.context.optionGroupRef);
    return useSelector(
        optionGroupRef,
        snapshot => (snapshot ? selectOptionGroupSnapshot(snapshot.context) : undefined),
    );
}

import {describe, expect, it} from 'vitest';
import {
    getEffectiveContextRequirements,
    getNavigationNode,
    getSidebarGroups,
    getWorkspaceMenuGroup,
    resolveActiveNode,
    resolveActiveWorkspace,
    resolveContextReachability,
} from '../derive';

describe('navigation derive helpers', () => {
    it('resolves active workspace and node from static routes', () => {
        expect(resolveActiveWorkspace('/applications')).toBe('applications');
        expect(resolveActiveNode('/clusters').key).toBe('resources.clusters');
    });

    it('resolves dynamic child route to the deepest matching node', () => {
        expect(resolveActiveNode('/applications/42/runtime-config').key).toBe('applications.runtimeConfig');
    });

    it('uses child context requirements for application detail routes', () => {
        const childNode = getNavigationNode('applications.runtimeConfig');
        expect(getEffectiveContextRequirements(childNode)).toEqual({ accountId: true, applicationId: true });
    });

    it('keeps second-level context requirements for list routes', () => {
        const listNode = getNavigationNode('applications.list');
        expect(getEffectiveContextRequirements(listNode)).toEqual({ accountId: true });
    });

    it('marks current node unreachable when required context is missing', () => {
        const resolution = resolveContextReachability('/pipelines', { accountId: 'a1' });
        expect(resolution.node.key).toBe('changes.pipelines');
        expect(resolution.reachable).toBe(false);
    });

    it('keeps current node reachable when required context exists', () => {
        const resolution = resolveContextReachability('/pipelines', {
            accountId: 'a1',
            applicationId: 'app1',
            environmentId: 'env1',
        });
        expect(resolution.node.key).toBe('changes.pipelines');
        expect(resolution.reachable).toBe(true);
    });

    it('generates internal menu paths without basename', () => {
        expect(getWorkspaceMenuGroup().items[0].url).not.toContain('/devops/cnap');
        // applications.list（应用列表）未开发且不进侧边栏，applications 工作区侧边栏首项为工作负载
        expect(getSidebarGroups('applications')[0].items[0].url).toBe('/workloads');
    });
});

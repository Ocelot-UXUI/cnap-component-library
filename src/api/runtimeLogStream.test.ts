import {beforeEach, describe, expect, it, vi} from 'vitest';
import {buildContainerLogWsPath, createLineAssembler} from './runtimeLogStream';

vi.mock('./services/primary/commonOptions', () => ({
    getCommonOptionsForAppspace: () => ({headers: {}, withCredentials: false}),
}));

describe('createLineAssembler', () => {
    it('splits complete lines and retains a trailing partial line', () => {
        const assembler = createLineAssembler();
        expect(assembler.push('line-1\nline-2\npart')).toEqual(['line-1', 'line-2']);
        expect(assembler.push('ial-3\nline-4')).toEqual(['partial-3']);
        expect(assembler.flush()).toEqual(['line-4']);
    });

    it('joins a line split across chunk boundaries', () => {
        const assembler = createLineAssembler();
        expect(assembler.push('he')).toEqual([]);
        expect(assembler.push('llo')).toEqual([]);
        expect(assembler.push(' world\n')).toEqual(['hello world']);
        expect(assembler.flush()).toEqual([]);
    });

    it('flush returns empty when buffer is empty', () => {
        const assembler = createLineAssembler();
        expect(assembler.push('done\n')).toEqual(['done']);
        expect(assembler.flush()).toEqual([]);
    });
});

describe('buildContainerLogWsPath', () => {
    const base = {
        appEnvID: 'env-1',
        clusterId: 'cluster-a',
        podName: 'pod-x',
        containerName: 'main',
    };

    beforeEach(() => {
        localStorage.clear();
    });

    it('builds a stdout follow path without source', () => {
        expect(buildContainerLogWsPath({...base, follow: true, tailLines: 200})).toBe(
            '/api/cnap/ws/v1/application-environments/env-1/runtime/clusters/cluster-a'
            + '/pods/pod-x/containers/main/logs?follow=true&tailLines=200',
        );
    });

    it('builds a file source path with filePath', () => {
        const path = buildContainerLogWsPath({...base, source: 'file', filePath: '/var/log/app.log', follow: true});
        expect(path).toContain('source=file');
        expect(path).toContain('filePath=%2Fvar%2Flog%2Fapp.log');
    });

    it('omits path segment params from the query string', () => {
        expect(buildContainerLogWsPath(base)).toBe(
            '/api/cnap/ws/v1/application-environments/env-1/runtime/clusters/cluster-a'
            + '/pods/pod-x/containers/main/logs',
        );
    });
});

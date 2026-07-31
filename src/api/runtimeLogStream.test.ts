import {describe, expect, it} from 'vitest';
import {buildContainerLogUrl, createLineAssembler} from './runtimeLogStream';

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

describe('buildContainerLogUrl', () => {
    const base = {
        appEnvID: 'env-1',
        clusterId: 'cluster-a',
        podName: 'pod-x',
        containerName: 'main',
    };

    it('builds a stdout follow URL without source', () => {
        expect(buildContainerLogUrl({ ...base, follow: true, tailLines: 200 })).toBe(
            '/api/cnap/rest/v1/application-environments/env-1/runtime/clusters/cluster-a'
                + '/pods/pod-x/containers/main/logs?follow=true&tailLines=200',
        );
    });

    it('builds a file source URL with filePath', () => {
        const url = buildContainerLogUrl({ ...base, source: 'file', filePath: '/var/log/app.log', follow: true });
        expect(url).toContain('source=file');
        expect(url).toContain('filePath=%2Fvar%2Flog%2Fapp.log');
    });

    it('omits path segment params from the query string', () => {
        const url = buildContainerLogUrl(base);
        expect(url).toBe(
            '/api/cnap/rest/v1/application-environments/env-1/runtime/clusters/cluster-a'
                + '/pods/pod-x/containers/main/logs',
        );
    });
});

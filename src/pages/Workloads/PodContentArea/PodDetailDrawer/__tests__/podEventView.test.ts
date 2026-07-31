import {describe, expect, it} from 'vitest';

import type {PodEvent} from '@/interface/entities/podEvent';
import {eventTone, matchEvent, relativeTime} from '../podEventView';

function event(overrides: Partial<PodEvent>): PodEvent {
    return {
        clusterId: 'c1',
        namespace: 'ns',
        name: 'e',
        firstSeen: '',
        lastSeen: '',
        type: 'Normal',
        reason: '',
        message: '',
        count: 1,
        objectApiVersion: 'v1',
        objectKind: 'Pod',
        objectName: '',
        objectNamespace: 'ns',
        sourceComponent: '',
        sourceHost: '',
        ...overrides,
    };
}

describe('podEventView', () => {
    it('maps event type to tone', () => {
        expect(eventTone('Normal')).toBe('info');
        expect(eventTone('Warning')).toBe('warning');
        expect(eventTone('Other')).toBe('error');
    });

    it('formats relative time', () => {
        const now = '2026-07-25T12:00:00Z';
        expect(relativeTime('2026-07-22T12:00:00Z', now)).toBe('3d前');
        expect(relativeTime('2026-07-25T04:20:00Z', now)).toBe('7h40m前');
        expect(relativeTime('2026-07-25T11:55:00Z', now)).toBe('5m前');
        expect(relativeTime(undefined, now)).toBe('-');
    });

    it('matches keyword against reason/message/objectName', () => {
        const e = event({ reason: 'Pulled', message: 'image ok', objectName: 'pod-a' });
        expect(matchEvent(e, '')).toBe(true);
        expect(matchEvent(e, 'pull')).toBe(true);
        expect(matchEvent(e, 'IMAGE')).toBe(true);
        expect(matchEvent(e, 'pod-a')).toBe(true);
        expect(matchEvent(e, 'zzz')).toBe(false);
    });
});

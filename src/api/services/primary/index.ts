import {tryConfirmSessionLost} from '@/auth/login';
import {createFactory} from 'axios-interface';
import type {Enhance, OnReject, OnResolve, Options} from 'axios-interface';
import {getCommonOptionsForAppspace} from './commonOptions';
import {paramsSerializer} from './paramsSerializer';

const onResolve: OnResolve = response => response.data;

const onReject: OnReject = error => {
    const response = error.response
        ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers as unknown as Record<string, string>,
        }
        : null;
    tryConfirmSessionLost(error.request ?? null, response);
    throw error;
};

const enhance: Enhance = (request, interfaceOptions) => {
    const wrapped = ((params, callOptions) => {
        if (import.meta.env.DEV) {
            const merged: Options = { ...interfaceOptions, ...callOptions };
            if ('mock' in merged) {
                const mockValue = typeof merged.mock === 'function'
                    ? merged.mock(params)
                    : merged.mock;
                return Promise.resolve(mockValue);
            }
        }
        return request(params, callOptions);
    }) as typeof request;
    return wrapped;
};

const options: Options = {
    baseURL: '/api/cnap/rest/v1',
    ...getCommonOptionsForAppspace(),
    paramsSerializer,
    onResolve,
    onReject,
    enhance,
};

export const { createInterface, request } = createFactory(options);

import type {AxiosRequestConfig} from 'axios';
import qs from 'qs';

export const paramsSerializer: AxiosRequestConfig['paramsSerializer'] = {
    serialize: params =>
        qs.stringify(params, {
            arrayFormat: 'comma',
            skipNulls: true,
            allowDots: true,
        }),
};

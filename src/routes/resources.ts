import {route} from './create';

export const accounts = route('/accounts');
export const environments = route('/environments');
export const clusters = route('/clusters');
export const clusterDetail = route('/clusters/{clusterId}', '集群详情');
export const environmentDetail = route('/environments/{envId}', '环境详情');

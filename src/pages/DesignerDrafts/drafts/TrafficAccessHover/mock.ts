export type AccessType = 'ALB' | 'NodePort' | 'ClusterIP';

export interface TrafficAccess {
    id: string;
    name: string;
    type: AccessType;
    accessName: string;
    workloads: string[];
}

export const trafficAccessList: TrafficAccess[] = [
    {
        id: 'order-api-alb',
        name: 'order-api.k8s.bysz-1',
        type: 'ALB',
        accessName: 'order-api',
        workloads: ['北京.bjyz-1', '南京.bjyz-1'],
    },
    {
        id: 'order-api-node-port',
        name: 'order-api.k8s.bysz-2',
        type: 'NodePort',
        accessName: 'order-api',
        workloads: ['南京.bjyz-1'],
    },
    {
        id: 'order-worker-node-port',
        name: 'order-worker.k8s.bysz-1',
        type: 'NodePort',
        accessName: 'order-worker',
        workloads: ['北京.bjyz-1'],
    },
    {
        id: 'order-api-cluster-ip',
        name: 'order-api.k8s.bysz-3',
        type: 'ClusterIP',
        accessName: 'order-api',
        workloads: ['北京.bjyz-1', '南京.bjyz-1'],
    },
    {
        id: 'order-worker-cluster-ip',
        name: 'order-worker.k8s.bysz-2',
        type: 'ClusterIP',
        accessName: 'order-worker',
        workloads: ['北京.bjyz-1'],
    },
    {
        id: 'order-web-node-port',
        name: 'order-web.k8s.bysz-1',
        type: 'NodePort',
        accessName: 'order-web',
        workloads: ['南京.bjyz-1'],
    },
];

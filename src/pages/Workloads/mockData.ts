export interface OverviewData {
    deployment: {
        status: string;
        statusType: 'success';
    };
    config: {
        version: string;
    };
    resources: {
        cpu: { value: number; unit: string; };
        memory: { value: number; unit: string; };
        gpu: { value: number; unit: string; };
    };
}

export const overviewData: OverviewData = {
    deployment: {
        status: '部署完成',
        statusType: 'success',
    },
    config: {
        version: 'v24',
    },
    resources: {
        cpu: { value: 338, unit: 'c' },
        memory: { value: 887, unit: 'Gi' },
        gpu: { value: 18, unit: '卡' },
    },
};

import genericGpuIcon from '@/assets/images/pod-resource-usage-gpu.png';
import huaweiGpuIcon from '@/assets/images/pod-resource-usage-huawei.png';
import kunlunxinGpuIcon from '@/assets/images/pod-resource-usage-kunlunxin.png';
import nvidiaGpuIcon from '@/assets/images/pod-resource-usage-nvidia.png';

import {GpuCard, GpuContent, GpuCount, GpuDetails, GpuModel, GpuProfile} from './GpuUsageCard.style';

import type {GpuResource} from '@/interface/entities/workload';

interface GpuUsageCardProps {
    gpu: GpuResource;
}

const vendorImages: Record<string, string> = {
    NVIDIA: nvidiaGpuIcon,
    HUAWEI: huaweiGpuIcon,
    KUNLUNXIN: kunlunxinGpuIcon,
};

export const GpuUsageCard = ({ gpu }: GpuUsageCardProps) => (
    <GpuCard vendorImage={vendorImages[gpu.vendor] ?? genericGpuIcon}>
        <GpuContent>
            <GpuDetails>
                <GpuModel title={gpu.model}>{gpu.model}</GpuModel>
                {gpu.profile && <GpuProfile title={gpu.profile}>{gpu.profile}</GpuProfile>}
            </GpuDetails>
            <GpuCount>x{gpu.count}</GpuCount>
        </GpuContent>
    </GpuCard>
);

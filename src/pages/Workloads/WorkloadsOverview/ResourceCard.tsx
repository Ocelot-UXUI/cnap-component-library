import cpuIcon from '@/assets/images/workloads-overview-cpu.png';
import gpuIcon from '@/assets/images/workloads-overview-gpu.png';
import memoryIcon from '@/assets/images/workloads-overview-memory.png';

import {useWorkloadsRuntime} from '../useWorkloadsRuntime';
import {
    CardLabel,
    CardUnit,
    ResourceAmount,
    ResourceContent,
    ResourceIcon,
    ResourceItem,
    ResourceValue,
    WideCard,
} from './WorkloadsOverview.style';

import type {ResourceRequirements} from '@/interface/entities/runtimeSummary';

interface ResourceEntry {
    value: string;
    unit: string;
}

const EMPTY: ResourceEntry = { value: '--', unit: '' };

function parseResource(raw: string): ResourceEntry {
    const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match) {
        return { value: raw, unit: '' };
    }
    return { value: match[1], unit: match[2] };
}

function toEntry(requirements: ResourceRequirements | undefined, key: keyof ResourceRequirements): ResourceEntry {
    return requirements ? parseResource(requirements[key]) : EMPTY;
}

export const ResourceCard = () => {
    const { summary } = useWorkloadsRuntime();
    const requirements = summary?.resourceRequirements;
    const cpu = toEntry(requirements, 'cpu');
    const memory = toEntry(requirements, 'memory');
    const gpu = toEntry(requirements, 'gpu');

    return (
        <WideCard>
            <ResourceItem>
                <ResourceContent>
                    <CardLabel>CPU总量</CardLabel>
                    <ResourceValue>
                        <ResourceIcon src={cpuIcon} alt="" aria-hidden="true" />
                        <ResourceAmount>
                            {cpu.value}
                            <CardUnit>{cpu.unit}</CardUnit>
                        </ResourceAmount>
                    </ResourceValue>
                </ResourceContent>
            </ResourceItem>
            <ResourceItem>
                <ResourceContent>
                    <CardLabel>内存总量</CardLabel>
                    <ResourceValue>
                        <ResourceIcon src={memoryIcon} alt="" aria-hidden="true" />
                        <ResourceAmount>
                            {memory.value}
                            <CardUnit>{memory.unit}</CardUnit>
                        </ResourceAmount>
                    </ResourceValue>
                </ResourceContent>
            </ResourceItem>
            <ResourceItem>
                <ResourceContent>
                    <CardLabel>GPU总量</CardLabel>
                    <ResourceValue>
                        <ResourceIcon src={gpuIcon} alt="" aria-hidden="true" />
                        <ResourceAmount>
                            {gpu.value}
                            <CardUnit>{gpu.unit}</CardUnit>
                        </ResourceAmount>
                    </ResourceValue>
                </ResourceContent>
            </ResourceItem>
        </WideCard>
    );
};

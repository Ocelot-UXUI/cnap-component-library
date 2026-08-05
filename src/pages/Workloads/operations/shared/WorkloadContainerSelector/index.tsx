import {Form, Select} from '@/design';

import type {WorkloadGroup} from '@/interface/entities/workload';
import type {ContainerOption} from '../loader';

interface WorkloadContainerSelectorProps {
    groups: WorkloadGroup[];
    groupId?: string;
    containerNames: ContainerOption[];
    container?: string;
    onSelectGroup: (groupId: string) => void;
    onSelectContainer: (container: string) => void;
}

/** 工作负载操作弹窗共享的「工作负载 + 容器」选择表单项（纵向扩缩 / 横向扩缩 / 重启共用） */
export const WorkloadContainerSelector = ({
    groups,
    groupId,
    containerNames,
    container,
    onSelectGroup,
    onSelectContainer,
}: WorkloadContainerSelectorProps) => (
    <Form layout="vertical">
        <Form.Item label="工作负载" required>
            <Select
                placeholder="请选择工作负载"
                value={groupId}
                options={groups.map(group => ({ value: group.id, label: group.name }))}
                onChange={onSelectGroup}
            />
        </Form.Item>
        <Form.Item label="容器" required>
            <Select
                placeholder="请选择容器"
                value={container}
                options={containerNames.map(item => ({ value: item.name, label: item.name }))}
                onChange={onSelectContainer}
            />
        </Form.Item>
    </Form>
);

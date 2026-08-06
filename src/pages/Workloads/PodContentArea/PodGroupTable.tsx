import {Alert, Empty, Flex, Pagination, Table} from '@/design';
import type {TablePaginationConfig} from '@/design';
import type {SorterResult, TableCurrentDataSource} from '@/design';

import type {Pod, PodOperation} from '@/interface/entities/pod';
import type {RuntimeOperation} from '@/interface/entities/runtimeOperation';
import type {WorkloadGroup} from '@/interface/entities/workload';
import {GroupHeader} from './GroupHeader';
import {buildPodColumns, groupHasGpu, toSortParam} from './podColumns';
import {GroupBlock} from './PodContentArea.style';
import {podKey} from './selection';
import type {PodFilterState, ViewMode} from './types';
import {useGroupPods} from './useGroupPods';
import {Sticky} from '@/components/Sticky';

interface PodGroupTableProps {
    group: WorkloadGroup;
    appEnvID: string;
    clusterId?: string;
    filter: PodFilterState;
    mode: ViewMode;
    expanded: boolean;
    operations: RuntimeOperation[];
    selectedKeys: string[];
    onToggle: () => void;
    onSelectionChange: (groupId: string, keys: string[], rows: Pod[]) => void;
    onOpenDetail: (pod: Pod) => void;
    onYamlView: () => void;
    onPodYamlView: (pod: Pod) => void;
    onPodOperation: (pod: Pod, operation: PodOperation) => void;
    onWorkloadOperation: (groupId: string, operation: RuntimeOperation) => void;
}

export const PodGroupTable = ({
    group,
    appEnvID,
    clusterId,
    filter,
    mode,
    expanded,
    operations,
    selectedKeys,
    onToggle,
    onSelectionChange,
    onOpenDetail,
    onYamlView,
    onPodYamlView,
    onPodOperation,
    onWorkloadOperation,
}: PodGroupTableProps) => {
    const { data, loading, error, query, setPage, setSort, reload } = useGroupPods(
        appEnvID,
        clusterId,
        group.id,
        filter,
        expanded,
    );

    const pods = data?.items ?? [];
    const columns = buildPodColumns(mode, groupHasGpu(pods), onOpenDetail, onPodYamlView, onPodOperation);

    const handleChange = (
        _pagination: TablePaginationConfig,
        _filters: unknown,
        sorter: SorterResult<Pod> | SorterResult<Pod>[],
        extra: TableCurrentDataSource<Pod>,
    ) => {
        if (extra.action === 'sort') {
            const single = Array.isArray(sorter) ? sorter[0] : sorter;
            setSort(toSortParam(single?.columnKey as string | undefined, single?.order));
        }
    };

    return (
        <GroupBlock>
            <Sticky top="56px">
                <GroupHeader
                    group={group}
                    expanded={expanded}
                    summary={data?.summary}
                    operations={operations}
                    clusterSelected={!!clusterId}
                    onToggle={onToggle}
                    onYamlView={onYamlView}
                    onWorkloadOperation={operation => onWorkloadOperation(group.id, operation)}
                />
            </Sticky>
            
            {expanded && (
                error
                    ? <Alert type="error" message="加载失败" action={<a onClick={reload}>重试</a>} />
                    : (
                        <>
                            <Table<Pod>
                                rowKey={podKey}
                                columns={columns}
                                dataSource={pods}
                                loading={loading}
                                size="small"
                                scroll={{ x: 'max-content' }}
                                locale={{ emptyText: <Empty description="该组暂无 Pod" /> }}
                                rowSelection={{
                                    selectedRowKeys: selectedKeys,
                                    preserveSelectedRowKeys: true,
                                    onChange: (keys, rows) => onSelectionChange(group.id, keys as string[], rows),
                                    selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
                                }}
                                pagination={false}
                                onChange={handleChange}
                            />
                            <Sticky bottom='0px'>
                                <Flex justify="flex-end" >
                                    <Pagination
                                        current={query.page}
                                        pageSize={query.pageSize}
                                        total={data?.total ?? 0}
                                        showSizeChanger
                                        pageSizeOptions={[10, 20, 50]}
                                        onChange={(page, pageSize) => setPage(page, pageSize)}
                                        size='small'
                                    />
                                </Flex>
                            </Sticky>
                            
                        </>
                    )
            )}
        </GroupBlock>
    );
};

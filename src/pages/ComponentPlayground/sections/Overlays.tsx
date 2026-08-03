import {Button, Drawer, message, Modal, Space, Table} from 'antd';
import {Key, useState} from 'react';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

function DrawerSection() {
    const [open, setOpen] = useState(false);
    return (
        <SectionShell title="Drawer 抽屉">
            <StateLabel>触发</StateLabel>
            <Button type="primary" onClick={() => setOpen(true)}>打开抽屉</Button>
            <Drawer title="示例抽屉" open={open} onClose={() => setOpen(false)} width={480}>
                <p>抽屉内容：核验阴影 + 滑入动画。</p>
            </Drawer>
        </SectionShell>
    );
}

function ModalSection() {
    const [open, setOpen] = useState(false);
    return (
        <SectionShell title="Modal 弹窗">
            <StateLabel>触发</StateLabel>
            <Button type="primary" onClick={() => setOpen(true)}>打开弹窗</Button>
            <Modal title="示例弹窗" open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)}>
                <p>弹窗内容：核验圆角 + 弹入动画 + 遮罩。</p>
            </Modal>
        </SectionShell>
    );
}

function MessageSection() {
    return (
        <SectionShell title="Message 全局提示">
            <StateLabel>success</StateLabel>
            <Button onClick={() => message.success('操作成功')}>success</Button>
            <StateLabel>error</StateLabel>
            <Button onClick={() => message.error('操作失败')}>error</Button>
            <StateLabel>warning</StateLabel>
            <Button onClick={() => message.warning('警告提示')}>warning</Button>
            <StateLabel>info</StateLabel>
            <Button onClick={() => message.info('信息提示')}>info</Button>
        </SectionShell>
    );
}

const tableData = [
    {key: '1', name: '容器A', status: '运行中', replicas: '1/1'},
    {key: '2', name: '容器B', status: '异常', replicas: '0/1'},
    {key: '3', name: '容器C', status: '运行中', replicas: '2/2'},
];

const columns = [
    {title: '名称', dataIndex: 'name', key: 'name'},
    {title: '状态', dataIndex: 'status', key: 'status'},
    {title: '副本', dataIndex: 'replicas', key: 'replicas'},
];

function TableSection() {
    const [selected, setSelected] = useState<Key[]>([]);
    return (
        <SectionShell title="Table 表格">
            <Table
                rowSelection={{selectedRowKeys: selected, onChange: setSelected}}
                columns={columns}
                dataSource={tableData}
                pagination={{pageSize: 2}}
            />
            <Space>
                <span>多选行核验：行选中浅绿背景</span>
            </Space>
        </SectionShell>
    );
}

export {DrawerSection, ModalSection, MessageSection, TableSection};

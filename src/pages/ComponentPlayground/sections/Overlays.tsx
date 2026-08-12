import {Button, Modal, Space, Table} from '@/design';
import {Key, useState} from 'react';

import {Drawer} from '@/design/Drawer';

import type {DrawerSize, ModalSize} from '@/design';

import {StateLabel} from '../ComponentPlayground.style';
import {SectionShell} from './SectionShell';

function DrawerSection() {
    const [size, setSize] = useState<DrawerSize>('m');
    const [open, setOpen] = useState(false);
    return (
        <SectionShell title="Drawer 抽屉">
            <StateLabel>尺寸档：S 600 / M 800 / L 980</StateLabel>
            <Space>
                <Button type="primary" onClick={() => { setSize('s'); setOpen(true); }}>打开 S</Button>
                <Button type="primary" onClick={() => { setSize('m'); setOpen(true); }}>打开 M</Button>
                <Button type="primary" onClick={() => { setSize('l'); setOpen(true); }}>打开 L</Button>
            </Space>
            <Drawer
                mask={false}
                title={`示例抽屉（${size.toUpperCase()}）`}
                open={open}
                onClose={() => setOpen(false)}
                size={size}
            >
                <p>标题居左，关闭按钮居右，关闭按钮左侧为额外操作插槽。</p>
            </Drawer>
        </SectionShell>
    );
}

function ModalSection() {
    const [size, setSize] = useState<ModalSize>('m');
    const [open, setOpen] = useState(false);
    return (
        <SectionShell title="Modal 弹窗">
            <StateLabel>尺寸档：S 600 / M 800 / L 1024</StateLabel>
            <Space>
                <Button type="primary" onClick={() => { setSize('s'); setOpen(true); }}>打开 S</Button>
                <Button type="primary" onClick={() => { setSize('m'); setOpen(true); }}>打开 M</Button>
                <Button type="primary" onClick={() => { setSize('l'); setOpen(true); }}>打开 L</Button>
            </Space>
            <Modal title={`示例弹窗（${size.toUpperCase()}）`} open={open} onOk={() => setOpen(false)} onCancel={() => setOpen(false)} size={size}>
                <p>弹窗内容：核验圆角 + 弹入动画 + 遮罩。</p>
            </Modal>
        </SectionShell>
    );
}

const tableData = [
    { key: '1', name: '容器A', status: '运行中', replicas: '1/1' },
    { key: '2', name: '容器B', status: '异常', replicas: '0/1' },
    { key: '3', name: '容器C', status: '运行中', replicas: '2/2' },
];

const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '副本', dataIndex: 'replicas', key: 'replicas' },
];

function TableSection() {
    const [selected, setSelected] = useState<Key[]>([]);
    return (
        <SectionShell title="Table 表格">
            <Table
                rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
                columns={columns}
                dataSource={tableData}
                pagination={{ pageSize: 2 }}
            />
            <Space>
                <span>多选行核验：行选中浅绿背景</span>
            </Space>
        </SectionShell>
    );
}

export {DrawerSection, ModalSection, TableSection};

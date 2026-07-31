import {CaretDownOutlined} from '@ant-design/icons';
import {Dropdown} from 'antd';
import {useState} from 'react';

import {
    SelectorTrigger,
    SelectorTriggerIcon,
    SelectorTriggerLabel,
} from './BreadcrumbContextSelectors.styles';

import type {ReactNode} from 'react';

interface DimensionSelectorProps {
    label: string;
    maxWidth?: number;
    renderPanel: (close: () => void) => ReactNode;
}

export function DimensionSelector({ label, maxWidth, renderPanel }: DimensionSelectorProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dropdown
            open={open}
            onOpenChange={setOpen}
            trigger={['click']}
            placement="bottomLeft"
            popupRender={() => renderPanel(() => setOpen(false))}
        >
            <SelectorTrigger type="button" maxWidth={maxWidth}>
                <SelectorTriggerLabel>{label}</SelectorTriggerLabel>
                <SelectorTriggerIcon open={open}>
                    <CaretDownOutlined />
                </SelectorTriggerIcon>
            </SelectorTrigger>
        </Dropdown>
    );
}

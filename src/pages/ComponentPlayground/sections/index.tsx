import {ComponentType} from 'react';

import {PlaceholderText} from '../ComponentPlayground.style';
import {
    BreadcrumbSection,
    EmptySection,
    PaginationSection,
    TagSection,
    TooltipSection,
} from './Display';
import {
    DrawerSection,
    MessageSection,
    ModalSection,
    TableSection,
} from './Overlays';
import {SectionShell} from './SectionShell';
import {
    ButtonSection,
    CheckboxSection,
    RadioSection,
    SwitchSection,
} from './Buttons';
import {
    NumberInputSection,
    SelectSection,
    TextInputSection,
} from './Inputs';

const PlaceholderSection = () => (
    <SectionShell title="待实现">
        <PlaceholderText>该组件尚未实现，待明确后补齐。</PlaceholderText>
    </SectionShell>
);

export interface PlaygroundSection {
    key: string;
    label: string;
    placeholder?: boolean;
    Component: ComponentType;
}

export const sections: PlaygroundSection[] = [
    {key: 'button', label: 'Button', Component: ButtonSection},
    {key: 'checkbox', label: 'Checkbox', Component: CheckboxSection},
    {key: 'text-input', label: 'Text Input', Component: TextInputSection},
    {key: 'switch', label: 'Switch', Component: SwitchSection},
    {key: 'radio', label: 'Radio', Component: RadioSection},
    {key: 'select', label: 'Select', Component: SelectSection},
    {key: 'number-input', label: 'Number Input', Component: NumberInputSection},
    {key: 'tag', label: 'Tag', Component: TagSection},
    {key: 'pagination', label: 'Pagination', Component: PaginationSection},
    {key: 'drawer', label: 'Drawer', Component: DrawerSection},
    {key: 'modal', label: 'Modal', Component: ModalSection},
    {key: 'message', label: 'Message', Component: MessageSection},
    {key: 'table', label: 'Table', Component: TableSection},
    {key: 'empty', label: 'Empty', Component: EmptySection},
    {key: 'tooltip', label: 'Tooltip', Component: TooltipSection},
    {key: 'searchbox', label: 'SearchBox *', placeholder: true, Component: PlaceholderSection},
    {key: 'breadcrumb', label: 'Breadcrumb', Component: BreadcrumbSection},
    {key: 'collapse-header', label: 'Collapse Header *', placeholder: true, Component: PlaceholderSection},
];

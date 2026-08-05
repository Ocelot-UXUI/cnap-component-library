import {ComponentType} from 'react';

import {PlaceholderText} from '../ComponentPlayground.style';
import {RadioSection} from './RadioSection';
import {ButtonSection} from './ButtonSection';
import {CheckboxSection} from './CheckboxSection';
import {
    BreadcrumbSection,
    EmptySection,
} from './Display';
import {MessageSection} from './MessageSection';
import {NumberInputSection} from './NumberInputSection';
import {LogSearchInputSection} from './LogSearchInputSection';
import {
    DrawerSection,
    ModalSection,
    TableSection,
} from './Overlays';
import {PaginationSection} from './PaginationSection';
import {SectionShell} from './SectionShell';
import {SelectSection} from './SelectSection';
import {SwitchSection} from './SwitchSection';
import {TagSection} from './TagSection';
import {TextInputSection} from './TextInputSection';
import {TooltipSection} from './TooltipSection';

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
    { key: 'button', label: 'Button', Component: ButtonSection },
    { key: 'checkbox', label: 'Checkbox', Component: CheckboxSection },
    { key: 'text-input', label: 'Text Input', Component: TextInputSection },
    { key: 'switch', label: 'Switch', Component: SwitchSection },
    { key: 'radio', label: 'Radio', Component: RadioSection },
    { key: 'select', label: 'Select', Component: SelectSection },
    { key: 'number-input', label: 'Number Input', Component: NumberInputSection },
    { key: 'tag', label: 'Tag', Component: TagSection },
    { key: 'pagination', label: 'Pagination', Component: PaginationSection },
    { key: 'drawer', label: 'Drawer', Component: DrawerSection },
    { key: 'modal', label: 'Modal', Component: ModalSection },
    { key: 'message', label: 'Message', Component: MessageSection },
    { key: 'table', label: 'Table', Component: TableSection },
    { key: 'empty', label: 'Empty', Component: EmptySection },
    { key: 'tooltip', label: 'Tooltip', Component: TooltipSection },
    { key: 'searchbox', label: 'SearchBox *', placeholder: true, Component: PlaceholderSection },
    { key: 'breadcrumb', label: 'Breadcrumb', Component: BreadcrumbSection },
    { key: 'collapse-header', label: 'Collapse Header *', placeholder: true, Component: PlaceholderSection },
    { key: 'log-search-input', label: 'Log Search Input', Component: LogSearchInputSection },
];

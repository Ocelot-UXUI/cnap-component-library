import {Checkbox, Input, Select} from '@/design';

import type {ResourceKind} from '@/domain/workload';
import {isLimitGteRequest, parseQuantity, RESOURCE_UNITS} from '@/domain/workload';
import type {FieldState, PairState} from '../rows';
import {CellLabel, CellRow} from './VerticalScaleModal.style';

interface ResourceCellProps {
    kind: ResourceKind;
    pair: PairState;
    selected: boolean;
    onEdit: (side: 'req' | 'lim', patch: Partial<FieldState>) => void;
    onToggleLimit: () => void;
}

const NUM_WIDTH = { width: 60 };
const UNIT_WIDTH = { width: 64 };

function unitOptions(kind: ResourceKind, unit: string) {
    const units = [...RESOURCE_UNITS[kind]];
    if (unit && !units.includes(unit)) {
        units.push(unit);
    }
    return units.map(value => ({ value, label: value }));
}

export const ResourceCell = ({ kind, pair, selected, onEdit, onToggleLimit }: ResourceCellProps) => {
    const limInvalid = selected && pair.lim.enabled && pair.req.value !== '' && pair.lim.value !== ''
        && !isLimitGteRequest(
            kind,
            parseQuantity(`${pair.req.value}${pair.req.unit}`),
            parseQuantity(`${pair.lim.value}${pair.lim.unit}`),
        );

    return (
        <div>
            <CellRow style={{ paddingLeft: '24px' }}>
                <CellLabel>Req</CellLabel>
                <Input
                    size="small"
                    style={NUM_WIDTH}
                    value={pair.req.value}
                    disabled={!selected}
                    onChange={event => onEdit('req', { value: event.target.value })}
                />
                <Select
                    size="small"
                    style={UNIT_WIDTH}
                    value={pair.req.unit}
                    disabled={!selected}
                    options={unitOptions(kind, pair.req.unit)}
                    onChange={value => onEdit('req', { unit: value })}
                />
            </CellRow>
            <CellRow>
                <Checkbox checked={pair.lim.enabled} disabled={!selected} onChange={onToggleLimit} />
                <CellLabel>Lim</CellLabel>
                <Input
                    size="small"
                    status={limInvalid ? 'error' : undefined}
                    style={NUM_WIDTH}
                    value={pair.lim.value}
                    disabled={!selected || !pair.lim.enabled}
                    onChange={event => onEdit('lim', { value: event.target.value })}
                />
                <Select
                    size="small"
                    status={limInvalid ? 'error' : undefined}
                    style={UNIT_WIDTH}
                    value={pair.lim.unit}
                    disabled={!selected || !pair.lim.enabled}
                    options={unitOptions(kind, pair.lim.unit)}
                    onChange={value => onEdit('lim', { unit: value })}
                />
            </CellRow>
        </div>
    );
};

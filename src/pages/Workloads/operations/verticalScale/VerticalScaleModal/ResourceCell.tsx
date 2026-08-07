import {Checkbox, InputNumber, Select} from '@/design';

import type {ResourceKind} from '@/domain/workload';
import {RESOURCE_UNITS} from '@/domain/workload';
import type {FieldState, PairState} from '../rows';
import {validatePair} from '../rows';
import {CellLabel, CellRow, FieldError} from './VerticalScaleModal.style';

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

function errorStatus(error: string | null): 'error' | undefined {
    return error ? 'error' : undefined;
}

export const ResourceCell = ({ kind, pair, selected, onEdit, onToggleLimit }: ResourceCellProps) => {
    const error = selected ? validatePair(kind, pair) : null;
    const reqError = error?.side === 'req' ? error.message : null;
    const limError = error?.side === 'lim' ? error.message : null;
    const limDisabled = !selected || !pair.lim.enabled;

    return (
        <div>
            <CellRow style={{ paddingLeft: '24px' }}>
                <CellLabel>Req</CellLabel>
                <InputNumber
                    size="small"
                    style={NUM_WIDTH}
                    value={pair.req.value}
                    status={errorStatus(reqError)}
                    disabled={!selected}
                    onChange={value => onEdit('req', { value: value ?? '' })}
                    min='0'
                />
                <Select
                    size="small"
                    style={UNIT_WIDTH}
                    value={pair.req.unit}
                    status={errorStatus(reqError)}
                    disabled={!selected}
                    options={unitOptions(kind, pair.req.unit)}
                    onChange={value => onEdit('req', { unit: value })}
                />
            </CellRow>
            {reqError && <FieldError>{reqError}</FieldError>}
            <CellRow>
                <Checkbox checked={pair.lim.enabled} disabled={!selected} onChange={onToggleLimit} />
                <CellLabel>Lim</CellLabel>
                <InputNumber
                    size="small"
                    status={errorStatus(limError)}
                    style={NUM_WIDTH}
                    value={pair.lim.value}
                    disabled={limDisabled}
                    onChange={value => onEdit('lim', { value: value ?? '' })}
                    min='0'
                />
                <Select
                    size="small"
                    status={errorStatus(limError)}
                    style={UNIT_WIDTH}
                    value={pair.lim.unit}
                    disabled={limDisabled}
                    options={unitOptions(kind, pair.lim.unit)}
                    onChange={value => onEdit('lim', { unit: value })}
                />
            </CellRow>
            {limError && <FieldError>{limError}</FieldError>}
        </div>
    );
};

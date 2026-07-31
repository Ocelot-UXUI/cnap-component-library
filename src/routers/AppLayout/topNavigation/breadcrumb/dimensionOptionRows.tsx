import {
    ApartmentOutlined,
    AppstoreOutlined,
    DatabaseOutlined,
    MoreOutlined,
    StarFilled,
    StarOutlined,
} from '@ant-design/icons';
import {css} from '@emotion/css';

import {
    AvatarCircle,
    EnvIcon,
    EnvTag,
    OptionIdentifier,
    OptionMain,
    OptionName,
    OptionRow,
    OptionText,
    RowActions,
} from './dimensionDropdown.styles';

import type {MouseEvent} from 'react';
import type {BreadcrumbSelectorOption} from './types';

const favoriteStarClass = css`color: #faad14;`;

interface OptionRowProps {
    option: BreadcrumbSelectorOption;
    selected: boolean;
    onSelect: (id: string) => void;
}

export function AvatarOptionRow({ option, selected, onSelect }: OptionRowProps) {
    const handleApartment = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=apartment`);
    };

    const handleDatabase = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=database`);
    };

    const handleAppstore = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=appstore`);
    };

    const handleMore = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=more`);
    };

    const handleFavorite = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=favorite`);
    };

    const handleUnfavorite = (event: MouseEvent) => {
        event.stopPropagation();
        console.log(`[RowAction] option=${option.id} action=unfavorite`);
    };

    return (
        <OptionRow selected={selected} onClick={() => onSelect(option.id)}>
            <OptionMain>
                <AvatarCircle color={option.type}>{option.icon ?? option.avatarText}</AvatarCircle>
                <OptionText>
                    <OptionName>{option.name}</OptionName>
                    {option.identifier && <OptionIdentifier>{option.identifier}</OptionIdentifier>}
                </OptionText>
            </OptionMain>
            <RowActions className="breadcrumb-row-actions" aria-label="快捷入口占位">
                <ApartmentOutlined onClick={handleApartment} />
                <DatabaseOutlined onClick={handleDatabase} />
                <AppstoreOutlined onClick={handleAppstore} />
                <MoreOutlined onClick={handleMore} />
                {selected || option.favorite
                    ? <StarFilled className={favoriteStarClass} onClick={handleUnfavorite} />
                    : <StarOutlined onClick={handleFavorite} />}
            </RowActions>
        </OptionRow>
    );
}

export function EnvOptionRow({ option, selected, onSelect }: OptionRowProps) {
    return (
        <OptionRow selected={selected} onClick={() => onSelect(option.id)}>
            <OptionMain>
                <EnvIcon>{option.icon}</EnvIcon>
                <OptionText>
                    <OptionName>
                        {option.name}
                        {option.typeLabel && <EnvTag>{option.typeLabel}</EnvTag>}
                    </OptionName>
                </OptionText>
            </OptionMain>
        </OptionRow>
    );
}

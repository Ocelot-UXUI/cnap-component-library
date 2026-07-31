import {useEffect, useMemo, useState} from 'react';

import type {BreadcrumbSelectorOption} from './types';

const SEARCH_DEBOUNCE_MS = 200;

function normalizeKeyword(value: string): string {
    return value.trim().toLowerCase();
}

function matches(option: BreadcrumbSelectorOption, keyword: string, matchIdentifier: boolean): boolean {
    const nameMatched = option.name.toLowerCase().includes(keyword);
    const identifierMatched = matchIdentifier
        && Boolean(option.identifier?.toLowerCase().includes(keyword));
    return nameMatched || identifierMatched;
}

export function useDimensionSearch(options: BreadcrumbSelectorOption[], matchIdentifier = false) {
    const [keyword, setKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedKeyword(keyword), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [keyword]);

    const filteredOptions = useMemo(() => {
        const normalized = normalizeKeyword(debouncedKeyword);
        if (!normalized) {
            return options;
        }
        return options.filter(option => matches(option, normalized, matchIdentifier));
    }, [debouncedKeyword, matchIdentifier, options]);

    return { filteredOptions, keyword, setKeyword };
}

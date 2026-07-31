import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {GpuUsageCard} from '.';

describe('GpuUsageCard', () => {
    it('renders model and profile before the right-side count', () => {
        const markup = renderToStaticMarkup(
            <GpuUsageCard gpu={{ vendor: 'NVIDIA', model: 'A100', profile: '80G', count: 8 }} />,
        );

        expect(markup).toMatch(/A100.*80G.*x8/);
    });
});

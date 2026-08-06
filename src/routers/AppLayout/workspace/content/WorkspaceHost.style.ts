import styled from '@emotion/styled';
import {motion} from 'framer-motion';

interface PaneFrameProps {
    $active: boolean;
}

const paneFrameStyleProps = new Set(['$active']);

export const PaneFrame = styled(motion.div, {
    shouldForwardProp: prop => !paneFrameStyleProps.has(prop),
})<PaneFrameProps>`
    height: 100%;
    min-height: 100%;
`;

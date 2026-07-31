import {palette} from '@/constants/colors';
import {shadow} from '@/constants/shadow';
import styled from '@emotion/styled';

export const SectionCard = styled.div`
    padding: 24px;
    border-radius: 6px;
    background-color: ${palette.gray[0]};
    box-shadow: ${shadow.s};
`;

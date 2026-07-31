import styled from '@emotion/styled';
import {Typography} from 'antd';
import {ReactNode} from 'react';

const { Text } = Typography;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
        font-size: 20px;
        width: 20px;
        height: 20px;
        top: 0;
    }
`;

interface Props {
    title: ReactNode;
    icon?: ReactNode;
    subTitle?: ReactNode;
}

export const ModalTitle = ({ title, icon, subTitle }: Props) => {
    return (
        <>
            <TitleContainer>{title}{icon}</TitleContainer>
            <Text type="secondary" style={{ fontWeight: 'normal' }}>{subTitle}</Text>
        </>
    );
};

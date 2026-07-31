import styled from '@emotion/styled';
import {Spin} from 'antd';

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

interface Props {
    className?: string;
}

function LoadingFillContent({ className }: Props) {
    return (
        <LoadingContainer className={className}>
            <Spin />
        </LoadingContainer>
    );
}

export default LoadingFillContent;

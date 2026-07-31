import styled from '@emotion/styled';
import {Button, Result, ResultProps, Space} from 'antd';
import {ReactNode, useReducer} from 'react';
import {ErrorStack} from './ErrorStack';

const Container = styled.div`
    margin: 0 auto;
`;

const resetErrorBoundary = () => {
    window.location.reload();
};

interface Props {
    status?: ResultProps['status'];
    title?: ReactNode;
    error: Error & {
        cause?: {
            code?: number;
            desc?: string;
        };
        message: string;
    };
}

export const PageFallback = ({ status = 'error', title = '不！发生了未知的错误!', error }: Props) => {
    const [showDetail, open] = useReducer(() => true, false);

    return (
        <Container>
            <Result
                status={status}
                title={title}
                subTitle={
                    <>
                        {error.cause?.code === 500 ? error.cause?.desc : error.message}
                        {showDetail && <ErrorStack error={error} />}
                    </>
                }
                extra={
                    <Space>
                        {!showDetail && <Button onClick={open}>显示错误详情</Button>}
                        <Button type="primary" onClick={resetErrorBoundary}>重置页面</Button>
                    </Space>
                }
            />
        </Container>
    );
};

export default PageFallback;

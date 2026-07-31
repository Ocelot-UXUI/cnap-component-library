import {Alert, Button, Space} from 'antd';
import {useState} from 'react';
import {FallbackProps} from 'react-error-boundary';
import {ErrorStack} from './ErrorStack';

export const AlertFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const [showDetail, setShowDetail] = useState(false);
    return (
        <>
            <Alert
                type="error"
                message={error.message}
                action={
                    <Space>
                        <Button
                            size="small"
                            onClick={() => setShowDetail(!showDetail)}
                        >
                            {showDetail ? '隐藏' : '显示'}详情
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            onClick={resetErrorBoundary}
                        >
                            重试
                        </Button>
                    </Space>
                }
            />
            {showDetail && <ErrorStack error={error} />}
        </>
    );
};

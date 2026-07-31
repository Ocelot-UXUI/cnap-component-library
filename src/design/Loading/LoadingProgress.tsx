import styled from '@emotion/styled';
import {Progress} from 'antd';
import {useEffect, useReducer, useRef} from 'react';
import img from './loading.gif';

const strokeColor = {
    '0%': '#0073ff',
    '100%': '#8ffeda',
};

const Container = styled.div`
    position: relative;
    width: 315px;
`;

const LoadingPic = styled.img`
    width: 315px;
`;

const ProgressBar = styled.div`
    position: absolute;
    top: 193.5px;
    left: 23px;
    width: 264px;
    font-size: 14px;
`;

interface ProgressStyleProps {
    immediate?: boolean;
}

const StyledProgress = styled(Progress)<ProgressStyleProps>`
    .ant-5-progress-bg {
        ${props => (props.immediate ? 'transition: none' : 'transition: all 1s linear !important;')}
    }
`;

interface Params {
    timeStartRef: {
        current: number;
    };
    estimate: number;
    start: boolean;
    end: boolean;
}

// See note.png
const formulaTimeToPercent = (x: number) => Math.min(x, 0.95);

const getPercent = ({ start, end, timeStartRef, estimate }: Params) => {
    if (end) {
        return 100;
    }
    if (!start) {
        return 0;
    }
    const now = performance.now();
    const performanceDiff = now - timeStartRef.current;
    const estimateScale = performanceDiff / estimate / 1000;
    return formulaTimeToPercent(estimateScale) * 100;
};

interface LoadingProgressProps {
    className?: string;
    estimate?: number;
    start?: boolean;
    end?: boolean;
}

function LoadingProgress({ className, start = true, end = false, estimate = 60 }: LoadingProgressProps) {
    const timeStartRef = useRef(0);
    const startedRef = useRef(false);
    const [, forceUpdate] = useReducer(v => v + 1, 0);
    const percent = getPercent({ start: startedRef.current, end, timeStartRef, estimate });

    useEffect(
        () => {
            let timer: any = null;
            startedRef.current = start;
            if (start) {
                timeStartRef.current = performance.now();
                timer = setInterval(() => {
                    forceUpdate();
                }, 1000);
            } else {
                clearInterval(timer);
                forceUpdate();
            }
            return () => clearInterval(timer);
        },
        [start],
    );

    return (
        <Container className={className}>
            <LoadingPic src={img} />
            <ProgressBar>
                <StyledProgress
                    immediate={end || !startedRef.current}
                    status={end ? undefined : 'active'}
                    strokeColor={strokeColor}
                    percent={percent}
                    showInfo={false}
                />
            </ProgressBar>
        </Container>
    );
}

export default LoadingProgress;

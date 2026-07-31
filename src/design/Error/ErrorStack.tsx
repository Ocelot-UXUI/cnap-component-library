import {css} from '@emotion/css';
import {Alert} from 'antd';

const detailCss = css`
    margin-top: 10px;
`;

const preCss = css`
    margin: 0 !important;
    overflow-x: auto;
    text-align: left;
    white-space: pre-wrap;
`;

interface Props {
    error: Error;
}

export const ErrorStack = ({ error }: Props) => {
    return (
        <Alert
            className={detailCss}
            type="error"
            message={
                <pre className={preCss}>
                    <code>
                        {error.stack}
                    </code>
                </pre>
            }
        />
    );
};

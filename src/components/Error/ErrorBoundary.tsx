import {ReactNode} from 'react';
import {ErrorBoundary as ReactErrorBoundary} from 'react-error-boundary';
import PageFallback from './PageFallback';

interface Props {
    children?: ReactNode;
}

function ErrorBoundary({ children }: Props) {
    return (
        <ReactErrorBoundary FallbackComponent={PageFallback}>
            {children}
        </ReactErrorBoundary>
    );
}

export default ErrorBoundary;

import PageFallback from './PageFallback';

interface Props {
    title?: string;
    error: Error;
}

function EmptyErrorComponent({ title = '接口错误', error }: Props) {
    return <PageFallback status="500" title={title} error={error as Parameters<typeof PageFallback>[0]['error']} />;
}

export default EmptyErrorComponent;

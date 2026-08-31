import styled from '@emotion/styled';
import {Layout} from '@/design';
import {motion} from 'framer-motion';

import {WorkspaceHost} from '../content/WorkspaceHost';

const { Content } = Layout;

interface ContentAreaProps {
    $background: string;
    $borderColor: string;
    $isLiquidGlass: boolean;
}

interface MainLayoutFrameProps {
    $background: string;
}

const contentAreaStyleProps = new Set(['$background', '$borderColor', '$isLiquidGlass']);
const mainLayoutFrameStyleProps = new Set(['$background']);

const ContentArea = styled(Content, {
    shouldForwardProp: prop => !contentAreaStyleProps.has(prop),
})<ContentAreaProps>`
    box-sizing: border-box;
    background: ${({ $background }: ContentAreaProps) => $background};
    height: 100%;
    overflow: hidden;

    ${({ $borderColor, $isLiquidGlass }: ContentAreaProps) =>
    $isLiquidGlass
        ? `
        .ant-5-card {
            backdrop-filter: blur(16px) saturate(160%);
            -webkit-backdrop-filter: blur(16px) saturate(160%);
        }
        .ant-5-card-bordered {
            border-color: ${$borderColor} !important;
        }
    `
        : ''}
`;

const MainLayoutFrame = styled(motion.div, {
    shouldForwardProp: prop => !mainLayoutFrameStyleProps.has(prop),
})<MainLayoutFrameProps>`
    box-sizing: border-box;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    background: ${({ $background }: MainLayoutFrameProps) => $background};
    overflow: hidden;
`;

interface WorkspaceContentLayoutProps {
    background: string;
    borderColor: string;
    isLiquidGlass: boolean;
}

export function WorkspaceContentLayout({
    background,
    borderColor,
    isLiquidGlass,
}: WorkspaceContentLayoutProps) {
    return (
        <MainLayoutFrame
            $background={background}
        >
            <ContentArea
                id="pageContent"
                $background={background}
                $borderColor={borderColor}
                $isLiquidGlass={isLiquidGlass}
            >
                <WorkspaceHost />
            </ContentArea>
        </MainLayoutFrame>
    );
}

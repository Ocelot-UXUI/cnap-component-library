import styled from '@emotion/styled';
import {Layout} from '@/design';
import {motion} from 'framer-motion';
import {Outlet} from 'react-router-dom';

import {radius} from '@/constants/radius';
import {shadow} from '@/constants/shadow';
import {spacing} from '@/constants/spacing';

const { Content } = Layout;

interface ContentAreaProps {
    $background: string;
    $borderColor: string;
    $isFullBleed: boolean;
    $isLiquidGlass: boolean;
}

interface MainLayoutFrameProps {
    $background: string;
    $borderColor: string;
}

const contentAreaStyleProps = new Set(['$background', '$borderColor', '$isFullBleed', '$isLiquidGlass']);
const mainLayoutFrameStyleProps = new Set(['$background', '$borderColor']);

const ContentArea = styled(Content, {
    shouldForwardProp: prop => !contentAreaStyleProps.has(prop),
})<ContentAreaProps>`
    box-sizing: border-box;
    padding: ${({ $isFullBleed }: ContentAreaProps) => $isFullBleed ? 0 : `${spacing.xl2}px ${spacing.xl4}px`};
    background: ${({ $background }: ContentAreaProps) => $background};
    height: 100%;
    overflow-x: hidden;
    overflow-y: ${({ $isFullBleed }: ContentAreaProps) => ($isFullBleed ? 'hidden' : 'auto')};

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

const FULL_BLEED_PATHS = new Set(['/ai-chat']);

const RoutedContent = styled(motion.div)`
    height: 100%;
    min-height: 100%;
`;

const MainLayoutFrame = styled(motion.div, {
    shouldForwardProp: prop => !mainLayoutFrameStyleProps.has(prop),
})<MainLayoutFrameProps>`
    box-sizing: border-box;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    background: ${({ $background }: MainLayoutFrameProps) => $background};
    border: 1px solid ${({ $borderColor }: MainLayoutFrameProps) => $borderColor};
    border-radius: ${radius.xl}px;
    box-shadow: ${shadow.s};
    overflow: hidden;
`;

interface WorkspaceContentLayoutProps {
    background: string;
    borderColor: string;
    isLiquidGlass: boolean;
    pathname: string;
}

export function WorkspaceContentLayout({
    background,
    borderColor,
    isLiquidGlass,
    pathname,
}: WorkspaceContentLayoutProps) {
    const isFullBleed = FULL_BLEED_PATHS.has(pathname);

    return (
        <MainLayoutFrame
            $background={background}
            $borderColor={borderColor}
        >
            <ContentArea
                id="pageContent"
                $background={background}
                $borderColor={borderColor}
                $isFullBleed={isFullBleed}
                $isLiquidGlass={isLiquidGlass}
            >
                <RoutedContent
                    key={pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                >
                    <Outlet />
                </RoutedContent>
            </ContentArea>
        </MainLayoutFrame>
    );
}

/**
 * AI 助手页面入口
 */
import {theme} from 'antd';

import LightPillar from '@/components/LightPillar';
import {AIChatProvider, useAIChat} from '@/contexts/AIChatContext';

import {ChatPanel} from './ChatPanel';
import {InputBar} from './InputBar';
import {centeredPanelCss, pageContainerCss} from './styles';
import {WelcomeScreen} from './WelcomeScreen';

const AIChatContent = () => {
    const { messages } = useAIChat();
    const { token } = theme.useToken();
    const hasMessages = messages.length > 0;

    return (
        <div className={pageContainerCss}>
            <LightPillar
                topColor={token.colorPrimary}
                bottomColor={token.colorInfo}
                intensity={1.0}
                glowAmount={0.002}
                pillarWidth={3.0}
                pillarHeight={0.4}
                pillarRotation={25}
                noiseIntensity={0.5}
                rotationSpeed={0.3}
                interactive={false}
                quality="high"
                mixBlendMode="screen"
            />
            {hasMessages
                ? (
                    <>
                        <ChatPanel />
                        <InputBar />
                    </>
                )
                : (
                    <div className={centeredPanelCss}>
                        <WelcomeScreen />
                        <InputBar />
                    </div>
                )}
        </div>
    );
};

const AIChat = () => (
    <AIChatProvider>
        <AIChatContent />
    </AIChatProvider>
);

export default AIChat;

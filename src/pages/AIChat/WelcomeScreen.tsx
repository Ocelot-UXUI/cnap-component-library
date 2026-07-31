/**
 * 欢迎屏：无消息时展示（仅 Welcome 欢迎语）
 */
import {RobotOutlined} from '@ant-design/icons';
import {Welcome} from '@ant-design/x';

import {welcomeIconCss, welcomeWrapCss} from './styles';

export const WelcomeScreen = () => (
    <div className={welcomeWrapCss}>
        <Welcome
            icon={<RobotOutlined className={welcomeIconCss} />}
            title="AI 助手"
            description="你好！我可以帮你管理应用、环境、集群，也可以回答关于平台的问题。"
        />
    </div>
);

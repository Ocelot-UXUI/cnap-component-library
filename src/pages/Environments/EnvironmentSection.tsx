/**
 * 环境分组展示组件
 */
import {Environment, EnvironmentLevel} from '@/types/environment';
import {Collapse} from '@/design';
import {EnvironmentsTable} from './EnvironmentsTable';
import {envSectionClass, envSectionDescClass, envSectionTitleClass, transparentBgClass} from './styles';

interface EnvironmentSectionProps {
    level: EnvironmentLevel;
    title: string;
    description: string;
    environments: Environment[];
    defaultOpen?: boolean;
}

export const EnvironmentSection = ({
    level,
    title,
    description,
    environments,
    defaultOpen = true,
}: EnvironmentSectionProps) => {
    if (environments.length === 0) {
        return null;
    }

    const items = [
        {
            key: level,
            label: (
                <div>
                    <div className={envSectionTitleClass}>{title}</div>
                    <div className={envSectionDescClass}>{description}</div>
                </div>
            ),
            children: <EnvironmentsTable environments={environments} />,
        },
    ];

    return (
        <div
            className={envSectionClass}
            data-ai-role="card"
            data-ai-entity="environment"
            data-ai-desc={`${title}环境分组`}
        >
            <Collapse
                defaultActiveKey={defaultOpen ? [level] : []}
                items={items}
                bordered={false}
                className={transparentBgClass}
            />
        </div>
    );
};

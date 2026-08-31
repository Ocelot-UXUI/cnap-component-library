/**
 * 环境分组展示组件
 */
import {Environment} from '@/types/environment';
import {EnvironmentsTable} from './EnvironmentsTable';
import {envSectionClass, envSectionDescClass, envSectionHeaderClass, envSectionTitleClass} from './styles';

interface EnvironmentSectionProps {
    title: string;
    description: string;
    environments: Environment[];
}

export const EnvironmentSection = ({
    title,
    description,
    environments,
}: EnvironmentSectionProps) => {
    if (environments.length === 0) {
        return null;
    }

    return (
        <div
            className={envSectionClass}
            data-ai-role="group"
            data-ai-entity="environment"
            data-ai-desc={`${title}环境分组`}
        >
            <div className={envSectionHeaderClass}>
                <div className={envSectionTitleClass}>{title}</div>
                <div className={envSectionDescClass}>{description}</div>
            </div>
            <EnvironmentsTable environments={environments} />
        </div>
    );
};

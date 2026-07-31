import {LeftOutlined} from '@ant-design/icons';
import {css} from '@emotion/css';
import styled from '@emotion/styled';
import {Button, Typography} from 'antd';
import {ReactNode, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';

import {spacing} from '@/constants/spacing';

const HeaderContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.m}px;
    margin-bottom: ${spacing.xl}px;
`;

const iconNewCss = css`
    font-size: 20px !important;
`;

const Flex1 = styled.div`
    flex: 1;
`;

interface HeaderProps {
    className?: string;
    title?: ReactNode;
    extra?: ReactNode;
    enableCommonGoBack?: boolean;
    onBack?: () => void;
}

export const PageLayoutHeader = ({ className, title, extra, enableCommonGoBack, onBack }: HeaderProps) => {
    const navigate = useNavigate();
    const commonGoBack = useCallback(
        () => {
            navigate(-1);
        },
        [navigate],
    );
    const showGoBack = enableCommonGoBack || onBack;
    return (
        <HeaderContainer className={className}>
            {showGoBack && (
                <Button
                    onClick={onBack ?? commonGoBack}
                    icon={<LeftOutlined className={iconNewCss} />}
                />
            )}
            {typeof title === 'string' ? <Typography.Title level={3}>{title}</Typography.Title> : title}
            <Flex1 />
            {extra}
        </HeaderContainer>
    );
};

export const PageLayoutActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: ${spacing.xl}px;
    margin-bottom: ${spacing.xl}px;
`;

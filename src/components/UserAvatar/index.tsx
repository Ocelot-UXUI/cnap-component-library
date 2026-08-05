import {Avatar, Tooltip} from '@/design';

const makeAvatarUrl = (username: string): string => `https://eefe.baidu-int.com/avatars/${username}`;

interface UserAvatarProps {
    username: string;
    size?: number;
    showName?: boolean;
}

export const UserAvatar = ({ username, size = 28, showName = true }: UserAvatarProps) => {
    if (!username) {
        return null;
    }

    return (
        <Tooltip title={username} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'default' }}>
                <Avatar size={size} src={makeAvatarUrl(username)} style={{ flexShrink: 0 }} />
                {showName && (
                    <span
                        style={{
                            fontSize: 13,
                            color: '#595959',
                            maxWidth: 100,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {username}
                    </span>
                )}
            </div>
        </Tooltip>
    );
};

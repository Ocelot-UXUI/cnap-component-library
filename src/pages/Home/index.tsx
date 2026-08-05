import {PageLayoutHeader} from '@/design/Layouts/PageLayout';
import {css} from '@emotion/css';
import {Flex} from '@/design';
import {AlertsSection} from './AlertsSection';
import {DashboardStats} from './DashboardStats';
import {FavoriteApps} from './FavoriteApps';
import {RecentActivity} from './RecentActivity';

const noDividerClass = css`
    .ant-5-card-head {
        border-bottom: none !important;
    }
`;

function HomePage() {
    return (
        <div>
            <PageLayoutHeader title="仪表盘" />
            <div className={noDividerClass}>
                <Flex vertical gap={24}>
                    <DashboardStats />
                    <AlertsSection />
                    <FavoriteApps />
                    <RecentActivity />
                </Flex>
            </div>
        </div>
    );
}

export default HomePage;

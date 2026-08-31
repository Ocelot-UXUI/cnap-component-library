import {PageLayoutHeader} from '@/components/Layouts/PageLayout';
import {Flex} from '@/design';
import {AlertsSection} from './AlertsSection';
import {DashboardStats} from './DashboardStats';
import {FavoriteApps} from './FavoriteApps';
import {RecentActivity} from './RecentActivity';

function HomePage() {
    return (
        <div>
            <PageLayoutHeader title="仪表盘" />
            <Flex vertical gap={24}>
                <DashboardStats />
                <AlertsSection />
                <FavoriteApps />
                <RecentActivity />
            </Flex>
        </div>
    );
}

export default HomePage;

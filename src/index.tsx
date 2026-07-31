import {XProvider} from '@ant-design/x';
import {ConfigProvider} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import {createRoot, Root} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';
import '@fontsource-variable/inter';
import {APP_BASENAME} from '@/constants/app';
import {NavigationProvider} from '@/contexts/NavigationContext';
import {ThemeProvider} from '@/contexts/ThemeContext';
import {UserProvider} from '@/contexts/UserContext';
import ErrorBoundary from '@/design/Error/ErrorBoundary';
import {AIExecutorProvider} from '@/executor';
import {router} from '@/routers';
import {exportQiankunLifeCycles, qiankunWindow} from '@tiny-codes/vite-plugin-qiankun';
import '@/styles/common';
import '@/styles/reset.css';

let root: Root | null = null;

function render(container?: Element) {
    const mountNode = container?.querySelector('#root') ?? document.getElementById('root')!;
    root = createRoot(mountNode);
    root.render(
        <ErrorBoundary>
            <ConfigProvider locale={zhCN}>
                <XProvider>
                    <ThemeProvider>
                        <UserProvider>
                            <NavigationProvider>
                                <AIExecutorProvider>
                                    <RouterProvider router={router} />
                                </AIExecutorProvider>
                            </NavigationProvider>
                        </UserProvider>
                    </ThemeProvider>
                </XProvider>
            </ConfigProvider>
        </ErrorBoundary>,
    );
}

if (qiankunWindow.__POWERED_BY_QIANKUN__) {
    exportQiankunLifeCycles({
        name: 'cnap',
        bootstrap() {},
        mount(props) {
            render(props.container);
        },
        unmount() {
            root?.unmount();
            root = null;
        },
        update() {},
    });
} else {
    if (!window.location.pathname.startsWith(APP_BASENAME)) {
        window.location.pathname = APP_BASENAME;
    }
    render();
}

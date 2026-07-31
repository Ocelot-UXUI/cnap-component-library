interface CommonOptions {
    headers: Record<string, string>;
    withCredentials: boolean;
}

export const getCommonOptionsForAppspace = (setUrlencodedContentType?: boolean): CommonOptions => {
    const serverInfo = localStorage.getItem('cnap/server');
    const mesh = localStorage.getItem('cnap/mesh');
    const accountId = localStorage.getItem('accountId') || '';

    const headers: Record<string, string> = {};

    if (serverInfo) {
        headers['x-region'] = serverInfo;
    }
    if (mesh) {
        headers.baggage = `x-mesh-traffic-lane=${mesh}`;
    }
    if (accountId) {
        headers['x-account-id'] = accountId;
    }
    if (setUrlencodedContentType) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    return { headers, withCredentials: !!(serverInfo || mesh) };
};

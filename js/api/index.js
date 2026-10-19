const BASE_URL = 'https://spider.lynli.me';

async function request(endpoint, options = {}) {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    return res.json();
}

export const api = {
    getStats: () => request('/api/admin/stats'),
    getOrders: () => request('/api/shop/orders'),
    shipOrder: (trade_no, tracking_no) => request('/api/shop/ship', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ trade_no, tracking_no }) }),
    getProducts: () => request('/api/shop/products'),
    getUsers: () => request('/api/admin/users'),
    updateUserProfile: (data) => request('/api/user/profile', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }),
    getSpiderDrafts: () => request('/api/spider/list'),
    startCrawl: (keyword) => request('/api/spider/start', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ keyword }) }),
    publishProduct: (id, price) => request('/api/shop/publish', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, price }) })
};

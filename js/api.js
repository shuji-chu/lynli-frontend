const BASE_URL = '';
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
};
export const api = {
    login: async (u, p) => (await fetch(`${BASE_URL}/api/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({username: u, password: p}) })).json(),
    getProducts: async () => (await fetch(`${BASE_URL}/api/shop/products`, { headers: getHeaders() })).json(),
    getOrders: async () => (await fetch(`${BASE_URL}/api/shop/orders`, { headers: getHeaders() })).json(),
    startSpider: async (kw) => (await fetch(`${BASE_URL}/api/spider/start`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({keyword: kw}) })).json(),
    updateProfile: async (nickname, avatar) => (await fetch(`${BASE_URL}/api/user/update`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({nickname, avatar}) })).json()
};

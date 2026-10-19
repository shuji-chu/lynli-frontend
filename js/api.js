const BASE_URL = 'https://spider.lynli.me';
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
};
export const api = {
    getProducts: async () => (await fetch(`${BASE_URL}/api/shop/products`, { headers: getHeaders() })).json(),
    getOrders: async () => (await fetch(`${BASE_URL}/api/shop/orders`, { headers: getHeaders() })).json(),
    updateProfile: async (nickname, avatar) => (await fetch(`${BASE_URL}/api/user/update`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({nickname, avatar}) })).json()
};

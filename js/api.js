const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };
};
export const api = {
    getProducts: async () => (await fetch('/api/shop/products', { headers: getHeaders() })).json(),
    getOrders: async () => (await fetch('/api/shop/orders', { headers: getHeaders() })).json(),
    updateProfile: async (nickname, avatar) => (await fetch('/api/user/update', { method: 'POST', headers: getHeaders(), body: JSON.stringify({nickname, avatar}) })).json()
};

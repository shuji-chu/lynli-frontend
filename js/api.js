// 删除了域名，走 Vercel 代理
const BASE_URL = ''; 

const getHeaders = () => {
    const token = localStorage.getItem('lynli_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    login: async (username, password) => {
        const res = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },
    startSpider: async (keyword) => {
        const res = await fetch(`${BASE_URL}/api/spider/start`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify({ keyword })
        });
        return await res.json();
    },
    getSpiderList: async () => {
        const res = await fetch(`${BASE_URL}/api/spider/list`, { headers: getHeaders() });
        return await res.json();
    },
    publishProduct: async (id) => {
        const res = await fetch(`${BASE_URL}/api/shop/publish`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify({ id })
        });
        return await res.json();
    },
    getProducts: async () => {
        const res = await fetch(`${BASE_URL}/api/shop/products`, { headers: getHeaders() });
        return await res.json();
    },
    getOrders: async () => {
        const res = await fetch(`${BASE_URL}/api/shop/orders`, { headers: getHeaders() });
        return await res.json();
    },
    shipOrder: async (orderId, trackingNo) => {
        const res = await fetch(`${BASE_URL}/api/shop/ship`, {
            method: 'POST', headers: getHeaders(), body: JSON.stringify({ order_id: orderId, tracking_no: trackingNo })
        });
        return await res.json();
    }
};

const BASE_URL = '';
export const api = {
    login: async (u, p) => (await fetch(`${BASE_URL}/api/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username: u, password: p}) })).json(),
    getProducts: async () => (await fetch(`${BASE_URL}/api/shop/products`)).json(),
    getOrders: async () => (await fetch(`${BASE_URL}/api/shop/orders`)).json(),
    startSpider: async (kw) => (await fetch(`${BASE_URL}/api/spider/start`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({keyword: kw}) })).json()
};

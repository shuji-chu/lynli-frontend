const BASE = 'https://spider.lynli.me';
export const api = {
    getStats: () => fetch(`${BASE}/api/admin/stats`).then(r=>r.json()),
    getOrders: () => fetch(`${BASE}/api/shop/orders`).then(r=>r.json()),
    getProducts: () => fetch(`${BASE}/api/shop/products`).then(r=>r.json()),
    getUsers: () => fetch(`${BASE}/api/admin/users`).then(r=>r.json()),
    getDrafts: () => fetch(`${BASE}/api/spider/list`).then(r=>r.json()),
    shipOrder: (trade_no, tracking_no) => fetch(`${BASE}/api/shop/ship`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({trade_no, tracking_no}) }).then(r=>r.json()),
    startCrawl: (keyword) => fetch(`${BASE}/api/spider/start`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({keyword}) }).then(r=>r.json()),
    publishProduct: (id, price) => fetch(`${BASE}/api/shop/publish`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id, price}) }).then(r=>r.json()),
    broadcastEmail: (subject, content) => fetch(`${BASE}/api/admin/email/broadcast`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({subject, content}) }).then(r=>r.json())
};

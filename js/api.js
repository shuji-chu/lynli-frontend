const BASE_URL = 'https://spider.lynli.me';

export async function fetchOrders() {
    const res = await fetch(`${BASE_URL}/api/shop/orders`);
    return res.json();
}

export async function fetchProducts() {
    const res = await fetch(`${BASE_URL}/api/shop/products`);
    return res.json();
}

export async function fetchDrafts() {
    const res = await fetch(`${BASE_URL}/api/spider/list`);
    return res.json();
}

export async function shipOrder(trade_no, tracking_no) {
    const res = await fetch(`${BASE_URL}/api/shop/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade_no, tracking_no })
    });
    return res.json();
}

export async function startCrawl(keyword) {
    const res = await fetch(`${BASE_URL}/api/spider/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword })
    });
    return res.json();
}

export async function publishProduct(id, price) {
    const res = await fetch(`${BASE_URL}/api/shop/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price })
    });
    return res.json();
}

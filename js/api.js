const BASE = 'https://spider.lynli.me';

async function request(path, options = {}) {
    try {
        const res = await fetch(`${BASE}${path}`, {
            ...options,
            mode: 'cors', // 强制跨域
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error(`接口请求失败 [${path}]:`, err);
        throw err;
    }
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};

const BASE = 'https://spider.lynli.me';

export const api = {
    get: (path) => fetch(`${BASE}${path}`).then(r => r.json()),
    post: (path, body) => fetch(`${BASE}${path}`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body) 
    }).then(r => r.json())
};

// 如果以后你的服务器绑定了域名，把这里换成你的真实 API 地址
// 比如: const BASE_URL = "https://api.lynli.me";
const BASE_URL = "https://api.lynli.me/api"; 

export const api = {
  async get(endpoint) {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error("网络请求失败");
    return await res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("网络请求失败");
    return await res.json();
  }
};

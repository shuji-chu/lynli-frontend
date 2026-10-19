import { CONFIG } from "../config.js";
import { storage } from "../utils/storage.js";

export async function request(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = storage.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });
    
    // 模拟网络延迟，如果是 Mock 模式直接返回
    if (CONFIG.API_BASE === "mock") {
      await new Promise(r => setTimeout(r, 500));
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401) {
        storage.clear();
        location.reload();
      }
      throw new Error(data.message || `请求失败: ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}`, err);
    throw err;
  }
}

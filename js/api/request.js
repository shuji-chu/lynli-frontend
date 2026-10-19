import { CONFIG } from "../config.js";
import { storage } from "../utils/storage.js";
export async function request(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = storage.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    await new Promise(r => setTimeout(r, 400)); // 模拟网络延迟
    // 接入真实接口时解开下面注释，删掉 mock 返回
    // const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });
    // if (!res.ok) throw new Error("网络请求失败");
    // return await res.json();
    return { code: 200, data: "mock_success" };
  } catch (err) {
    if (err.message === "401") { storage.clear(); location.reload(); }
    throw err;
  }
}

import { request } from "./request.js";

export async function loginApi(account, password) {
  // 如果后端准备好了，把下面这行注释解开，把 Mock 删掉：
  // return request("/api/auth/login", { method: "POST", body: JSON.stringify({ account, password }) });

  // 前端 Mock 测试逻辑
  await new Promise(r => setTimeout(r, 600));
  if (account === "admin" && password === "123456") {
    return { token: "mock_token_admin", user: { email: "admin@lynli.me", role: "super_admin", nickname: "最高指挥官" } };
  }
  if (account === "yunying" && password === "123456") {
    return { token: "mock_token_op", user: { email: "yunying@lynli.me", role: "operator", nickname: "运营专员" } };
  }
  throw new Error("账号或密码错误");
}

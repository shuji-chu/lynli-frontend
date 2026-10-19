import { CONFIG } from "../config.js";
export const storage = {
  getToken: () => localStorage.getItem(CONFIG.TOKEN_KEY),
  setToken: (t) => localStorage.setItem(CONFIG.TOKEN_KEY, t),
  getUser: () => { try { return JSON.parse(localStorage.getItem(CONFIG.USER_KEY)); } catch { return null; } },
  setUser: (u) => localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(u)),
  clear: () => { localStorage.removeItem(CONFIG.TOKEN_KEY); localStorage.removeItem(CONFIG.USER_KEY); }
};

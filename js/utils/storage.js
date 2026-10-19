import { CONFIG } from "../config.js";
export const storage = {
  getToken: () => localStorage.getItem(CONFIG.TOKEN_KEY),
  setToken: (token) => localStorage.setItem(CONFIG.TOKEN_KEY, token),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(CONFIG.USER_KEY)); } catch { return null; }
  },
  setUser: (user) => localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
  }
};

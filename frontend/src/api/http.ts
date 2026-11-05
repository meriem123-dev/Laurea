import axios from "axios";
import { serverWaking } from "./server-status";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _wakeTimer?: number;
    _slow?: boolean;
  }
}

export const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const SLOW_AFTER_MS = 4000;
let slowCount = 0;

function endTracking(config?: { _wakeTimer?: number; _slow?: boolean }) {
  if (!config) return;
  clearTimeout(config._wakeTimer);
  if (config._slow) {
    config._slow = false;
    slowCount--;
    if (slowCount <= 0) {
      slowCount = 0;
      serverWaking.value = false;
    }
  }
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  config._wakeTimer = window.setTimeout(() => {
    config._slow = true;
    slowCount++;
    serverWaking.value = true;
  }, SLOW_AFTER_MS);

  return config;
});

http.interceptors.response.use(
  (r) => {
    endTracking(r.config);
    return r;
  },
  (err) => {
    endTracking(err.config);

    const isLogin = err.config?.url?.includes("/auth/login");
    const hadToken = !!err.config?.headers?.Authorization;
    if (err.response?.status === 401 && !isLogin && hadToken) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(err);
  },
);

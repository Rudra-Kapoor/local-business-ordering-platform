import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export function setAuthToken(token: string | null) {
  if (!token) {
    delete api.defaults.headers.common.Authorization;
    return;
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(message));
  }
);


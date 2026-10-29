import axios from "axios";



const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    }
})

api.interceptors.request.use((config)=>{
   if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      originalRequest._retry = true;

      if (typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {
              token: refreshToken,
            });

            // 1. Update storage
            localStorage.setItem("accessToken", data.accessToken);

            // 2. Retry the original request
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            }
            return api(originalRequest);
          } catch (refreshError) {
            // Refresh token invalid or expired -> force logout
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);



export default api
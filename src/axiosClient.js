import axios from "axios";
import { toast } from "sonner";
import useUserStore from "@/stores/useUserStore";

const axiosClient = axios.create({
  baseURL: `${window.location.protocol}//${import.meta.env.VITE_BACKEND}/api`,
});

axiosClient.interceptors.request.use((config) => {
  const { token, tokenExpiresAt, logout } = useUserStore.getState();

  // Skip token expiration check for public auth endpoints
  const publicEndpoints = ["/login", "/register", "/verify-otp", "/resend-otp"];
  if (publicEndpoints.some((ep) => config.url.includes(ep))) {
    return config;
  }

  if (tokenExpiresAt && new Date() > new Date(tokenExpiresAt)) {
    toast.info("Session expired, logging out...");
    setTimeout(() => {
      logout();
      window.location.href = "/guest/login";
    }, 100);
    return Promise.reject(new Error("Session expired. Please login again."));
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    const { logout } = useUserStore.getState();

    if (!response) {
      toast.error("Network error. Please check your connection.");
      return Promise.reject(error);
    }

    if (response.status === 401) {
      toast.info("Session expired, logging out...");
      setTimeout(() => {
        logout();
        window.location.href = "/guest/login";
      }, 3000);
    } else if (response.status === 403) {
      toast.error("You don't have permission.");
    } else if (response.status === 404) {
      toast.error("Resource not found.");
    } else if (response.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else {
      const message = response.data?.message || "An unexpected error occurred.";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

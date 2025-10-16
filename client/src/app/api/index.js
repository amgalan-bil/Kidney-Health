import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors specifically
    if (error.response?.status === 401) {
      console.error("Authentication Error: The request was not authorized.");
      // Here you could trigger a logout or redirect to the login page.
      // For example: window.location.href = '/login';
    } else {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("API Error:", errorMessage);
    }
    return Promise.reject(error);
  }
);

export const get = async (url, config = {}) => {
  const response = await api.get(url, config);
  return response.data;
};

export const post = async (url, data, config = {}) => {
  const response = await api.post(url, data, config);
  return response.data;
};

export const postWithFiles = async (url, formData) => {
  const response = await api.post(url, formData);
  return response.data;
};

export const put = async (url, data, config = {}) => {
  const response = await api.put(url, data, config);
  return response.data;
};

export const del = async (url, config = {}) => {
  const response = await api.delete(url, config);
  return response.data;
};

export const patch = async (url, data, config = {}) => {
  const response = await api.patch(url, data, config);
  return response.data;
};

export default api;

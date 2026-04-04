import axios from "axios";
import API from "./services/api";

const API = axios.create({
  baseURL: `${API}/api`
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
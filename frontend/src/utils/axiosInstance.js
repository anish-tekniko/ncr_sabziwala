const BASE_URL = import.meta.env.VITE_BASE_URL;
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" }
});

// Add auth token automatically if exists
axiosInstance.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem('adminToken');
    const vendorToken = localStorage.getItem('vendorToken');
    

    if (config.url.includes("/api/admin")) {
        // console.log("Admin Token on axios :".adminToken)
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
    } else if (config.url.includes("api/vendor")) {
        if (vendorToken) {
            config.headers.Authorization = `Bearer ${vendorToken}`;
        }
    }

    // const token = localStorage.getItem("token");
    // if (token) {
    //     config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
});

export default axiosInstance;
import axios from 'axios';
const axiosInstance = axios.create({
    baseURL: import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const access_token = localStorage.getItem('access_token');
        if (access_token) {
            config.headers['Authorization'] = `Bearer ${access_token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        return Promise.reject(error.response);
    },
);

export default axiosInstance;

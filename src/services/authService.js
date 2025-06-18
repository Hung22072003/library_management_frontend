import axios from './axiosInstance';

const login = (email, password) => {
    return axios.post('/login', { email, password });
};

const register = (email, full_name, password) => {
    return axios.post('/register', { email, full_name, password });
};

const requestOtp = (email) => {
    return axios.post('/forgot-password/request', { email });
};

const verifyOtp = (email, otp) => {
    return axios.post('/forgot-password/verify', { email, otp });
};

const resetPassword = (email, password) => {
    return axios.post('/forgot-password/reset', { email, password });
};
export { login, register, requestOtp, verifyOtp, resetPassword };

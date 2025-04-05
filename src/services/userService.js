import axios from './axiosInstance';

const getUserFromToken = () => {
    return axios.get('api/profile/me');
};

export { getUserFromToken };

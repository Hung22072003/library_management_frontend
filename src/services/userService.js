import axios from './axiosInstance';

const getUserFromToken = () => {
    return axios.get('api/profile/me');
};

const getAllUsers = (page, size, query) => {
    return axios.get(`api/users?page=${page}&size=${size}&q=${query}`);
};

const importUsers = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('api/users/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export { getUserFromToken, getAllUsers, importUsers };

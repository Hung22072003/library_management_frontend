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

const createUser = async (userData) => {
    return axios.post('api/users', userData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

const updateUser = async (id, data) => {
    return axios.put(`api/users/${id}`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export { getUserFromToken, getAllUsers, importUsers, createUser, updateUser };

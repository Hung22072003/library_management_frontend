import axios from './axiosInstance';

const getAllNotifications = (page, size) => {
    return axios.get(`api/notifications?page=${page}&size=${size}`);
};

const updateNotification = (id) => {
    return axios.put(`api/notifications/${id}`);
};
export { getAllNotifications, updateNotification };
